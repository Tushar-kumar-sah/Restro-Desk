import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { OrderType, OrderStatus } from '@prisma/client';
import {
  MOCK_ORDERS,
  MOCK_KOTS,
  MOCK_TABLES,
  MOCK_RECIPES,
  MOCK_RAW_MATERIALS,
  recordStockMovement,
} from '@/lib/mock-data';
import { invalidateCache } from '@/lib/cache';
import { autoSyncCustomerFromBill } from '@/lib/crm';

const orderItemSchema = z.object({
  itemId: z.string(),
  name: z.string().optional(),
  itemName: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  qty: z.number().int().positive().optional(),
  unitPrice: z.number().positive().optional(),
  price: z.number().positive().optional(),
  variantId: z.string().optional().nullable(),
  variantName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  addons: z
    .array(
      z.object({
        addonId: z.string(),
        name: z.string(),
        price: z.number(),
      })
    )
    .optional(),
});

const createOrderSchema = z.object({
  outletId: z.string().optional(),
  orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'ONLINE']).default('DINE_IN'),
  tableId: z.string().optional().nullable(),
  tableNumber: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customer: z.object({ name: z.string().optional(), phone: z.string().optional() }).optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Cart cannot be empty'),
  discountPercent: z.number().default(0),
  discountAmount: z.number().default(0),
  discountReason: z.string().optional().nullable(),
  serviceCharge: z.number().default(0),
  packagingCharge: z.number().default(0),
  deliveryCharge: z.number().default(0),
  notes: z.string().optional().nullable(),
  autoKOT: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    let brandId = session?.brandId;
    if (!brandId || brandId.startsWith('brand-')) {
      const b = await prisma.brand.findFirst().catch(() => null);
      if (b) brandId = b.id;
    }
    if (!brandId) brandId = 'brand-restodesk-001';

    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');
    const orderType = searchParams.get('orderType');
    const tableNumber = searchParams.get('tableNumber');

    let orders: any[] = [];
    try {
      const whereClause: any = { isDeleted: false };
      if (brandId && !brandId.startsWith('brand-')) whereClause.brandId = brandId;
      if (outletId && !outletId.startsWith('outlet-')) whereClause.outletId = outletId;
      if (status && status !== 'ALL') whereClause.status = status as OrderStatus;
      if (orderType && orderType !== 'ALL') whereClause.orderType = orderType as OrderType;
      if (tableNumber) whereClause.table = { tableNumber };

      const dbOrders = await prisma.order.findMany({
        where: whereClause,
        include: {
          items: { include: { addons: true } },
          kots: true,
          table: true,
          customer: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      if (dbOrders.length > 0) {
        orders = dbOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          dailyOrderSequence: o.dailyOrderSequence,
          orderType: o.orderType,
          status: o.status,
          tableNumber: o.table?.tableNumber || 'Takeaway',
          customerName: o.customer?.name || 'Walk-in Guest',
          customerPhone: o.customer?.phone || '',
          subtotal: o.subtotal,
          discountAmount: o.discountAmount,
          taxAmount: o.taxAmount,
          cgstAmount: o.cgstAmount,
          sgstAmount: o.sgstAmount,
          serviceCharge: o.serviceCharge,
          packagingCharge: o.packagingCharge,
          deliveryCharge: o.deliveryCharge,
          roundOff: o.roundOff,
          totalAmount: o.totalAmount,
          paidAmount: o.paidAmount,
          balanceAmount: o.balanceAmount,
          paymentStatus: o.paymentStatus,
          kotNumber: o.kots[0]?.kotNumber || '',
          createdAt: o.createdAt,
          items: o.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
        }));
      }
    } catch (err) {
      // offline fallback
    }

    if (orders.length === 0) {
      orders = MOCK_ORDERS;
    }

    if (tableNumber) {
      orders = orders.filter((o) => o.tableNumber === tableNumber);
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';
    const userId = session?.userId;

    const body = await req.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;
    const outletId = data.outletId || session?.outletId || 'outlet-blr-ind-001';
    const customerName = data.customerName || data.customer?.name || null;
    const customerPhone = data.customerPhone || data.customer?.phone || null;

    let itemsSubtotal = 0;
    const processedItems = data.items.map((item) => {
      let addonTotal = 0;
      if (item.addons) {
        addonTotal = item.addons.reduce((sum, a) => sum + a.price, 0);
      }
      const rawUnitPrice = item.unitPrice ?? item.price ?? 0;
      const quantity = item.quantity ?? item.qty ?? 1;
      const itemName = item.name ?? item.itemName ?? 'Special Dish';
      const unitRate = rawUnitPrice + addonTotal;
      const lineTotal = unitRate * quantity;
      itemsSubtotal += lineTotal;

      return {
        ...item,
        name: itemName,
        quantity,
        unitPrice: unitRate,
        subtotal: lineTotal,
        totalPrice: lineTotal,
      };
    });

    let calculatedDiscount = data.discountAmount;
    if (data.discountPercent > 0) {
      calculatedDiscount = (itemsSubtotal * data.discountPercent) / 100;
    }
    const discountedSubtotal = Math.max(0, itemsSubtotal - calculatedDiscount);

    const gstRate = 5.0;
    const halfGstRate = gstRate / 2;
    const cgstAmount = Number(((discountedSubtotal * halfGstRate) / 100).toFixed(2));
    const sgstAmount = Number(((discountedSubtotal * halfGstRate) / 100).toFixed(2));
    const taxAmount = cgstAmount + sgstAmount;

    const totalCharges = data.serviceCharge + data.packagingCharge + data.deliveryCharge;
    const rawTotal = discountedSubtotal + taxAmount + totalCharges;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = Number((roundedTotal - rawTotal).toFixed(2));

    const seq = MOCK_ORDERS.length + 101;
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `ORD-${todayStr}-${String(seq).padStart(3, '0')}`;
    const kotNumber = `KOT-${seq + 100}`;
    const orderId = `ord-${Date.now()}`;

    // Automatically check and sync customer (new vs existing)
    let attachedCustomer: any = null;
    let isNewCustomer = false;
    if (customerPhone) {
      const syncResult = await autoSyncCustomerFromBill({
        phone: customerPhone,
        name: customerName,
        billAmount: roundedTotal,
        orderNumber,
        orderId,
        isSettled: false,
      });
      if (syncResult) {
        attachedCustomer = syncResult.customer;
        isNewCustomer = syncResult.isNew;
      }
    }

    const newOrder = {
      id: orderId,
      brandId,
      outletId: outletId,
      orderNumber,
      dailyOrderSequence: seq,
      orderType: data.orderType,
      status: 'PREPARING',
      tableNumber: data.tableNumber || (data.orderType === 'DINE_IN' ? 'T-01' : 'Counter'),
      tableId: data.tableId,
      customerName: attachedCustomer?.name || customerName || 'Walk-in Guest',
      customerPhone: attachedCustomer?.phone || customerPhone || '',
      customerId: attachedCustomer?.id || data.customerId || null,
      subtotal: itemsSubtotal,
      discountAmount: calculatedDiscount,
      discountPercent: data.discountPercent,
      discountReason: data.discountReason,
      cgstAmount,
      sgstAmount,
      taxAmount,
      serviceCharge: data.serviceCharge,
      packagingCharge: data.packagingCharge,
      deliveryCharge: data.deliveryCharge,
      roundOff,
      totalAmount: roundedTotal,
      paidAmount: 0.0,
      balanceAmount: roundedTotal,
      paymentStatus: 'UNPAID',
      notes: data.notes,
      kotNumber,
      createdAt: new Date(),
      items: processedItems,
    };

    MOCK_ORDERS.unshift(newOrder);

    // 0. Auto Recipe (BOM) Stock Deductions
    try {
      for (const pi of processedItems) {
        const recipe = MOCK_RECIPES.find(
          (r) =>
            r.itemId === pi.itemId ||
            (pi as any).id === r.itemId ||
            r.itemName.toLowerCase() === (pi.name || '').toLowerCase()
        );
        if (recipe && recipe.ingredients) {
          for (const ing of recipe.ingredients) {
            const rm = MOCK_RAW_MATERIALS.find((m) => m.id === ing.rawMaterialId);
            if (rm) {
              // Unit conversion factor
              let factor = 1;
              if (ing.unit === 'GRAM' && rm.unit === 'KG') factor = 0.001;
              else if (ing.unit === 'ML' && rm.unit === 'LITER') factor = 0.001;
              else if (ing.unit === 'KG' && rm.unit === 'GRAM') factor = 1000;
              else if (ing.unit === 'LITER' && rm.unit === 'ML') factor = 1000;

              const consumedQty = Math.round(ing.quantity * factor * (pi.quantity || 1) * 1000) / 1000;
              if (consumedQty > 0) {
                rm.currentStock = Math.max(0, Math.round((rm.currentStock - consumedQty) * 100) / 100);
                recordStockMovement({
                  outletId,
                  date: new Date().toISOString(),
                  rawMaterialId: rm.id,
                  rawMaterialName: rm.name,
                  sku: rm.sku,
                  category: rm.category,
                  unit: rm.unit,
                  type: 'RECIPE_CONSUMPTION',
                  changeQty: -consumedQty,
                  balanceAfter: rm.currentStock,
                  costPerUnit: rm.costPerUnit,
                  totalCostImpact: -Math.round(consumedQty * rm.costPerUnit * 100) / 100,
                  reference: `POS Order #${orderNumber} (${pi.quantity}x ${pi.name})`,
                  recordedBy: 'Auto Recipe BOM Engine',
                  notes: `${ing.quantity} ${ing.unit} per dish deducted for kitchen order`,
                });
              }
            }
          }
        }
      }
    } catch (recipeErr) {
      console.warn('Recipe deduction error (non-fatal):', recipeErr);
    }

    // 1. Fire KOT to Kitchen Display System (KDS)
    if (data.autoKOT) {
      const newKot = {
        id: `kot-${Date.now()}`,
        kotNumber,
        orderNumber,
        orderId: newOrder.id,
        tableNumber: newOrder.tableNumber,
        orderType: newOrder.orderType,
        station: 'GENERAL',
        status: 'NEW',
        createdAt: new Date(),
        waiter: customerName || 'Captain',
        items: processedItems.map((pi: any, idx: number) => ({
          id: `ki-${Date.now()}-${idx}`,
          name: pi.name,
          quantity: pi.quantity,
          notes: pi.notes || '',
          status: 'COOKING',
        })),
      };
      MOCK_KOTS.unshift(newKot);
    }

    // 2. Update Table status to RUNNING for Dine-in orders
    if (data.orderType === 'DINE_IN' && (data.tableNumber || data.tableId)) {
      const tblNum = data.tableNumber;
      const tIdx = MOCK_TABLES.findIndex(
        (t) => (tblNum && t.tableNumber === tblNum) || (data.tableId && t.id === data.tableId)
      );
      if (tIdx !== -1) {
        MOCK_TABLES[tIdx].status = 'RUNNING';
        MOCK_TABLES[tIdx].runningAmount = (MOCK_TABLES[tIdx].runningAmount || 0) + roundedTotal;
        MOCK_TABLES[tIdx].seatedAt = MOCK_TABLES[tIdx].seatedAt || new Date();
        MOCK_TABLES[tIdx].currentOrderId = newOrder.id;
        if (customerName) MOCK_TABLES[tIdx].guestName = customerName;
      }
      try {
        await prisma.table.updateMany({
          where: {
            OR: [
              ...(tblNum ? [{ tableNumber: tblNum }] : []),
              ...(data.tableId ? [{ id: data.tableId }] : []),
            ],
          },
          data: {
            status: 'RUNNING',
          },
        });
        invalidateCache('tables:');
      } catch (e) {}
    }

    try {
      let activeBrandId = session?.brandId;
      let activeOutletId = data.outletId || session?.outletId;
      let activeUserId = session?.userId;
      let activeTableId = data.tableId;

      if (!activeBrandId || activeBrandId.startsWith('brand-')) {
        const b = await prisma.brand.findFirst();
        if (b) activeBrandId = b.id;
      }
      if (!activeOutletId || activeOutletId.startsWith('outlet-')) {
        const o = await prisma.outlet.findFirst();
        if (o) activeOutletId = o.id;
      }
      if (!activeUserId) {
        const u = await prisma.user.findFirst();
        if (u) activeUserId = u.id;
      }
      if (data.tableNumber && (!activeTableId || activeTableId.startsWith('tbl-'))) {
        const t = await prisma.table.findFirst({
          where: { tableNumber: data.tableNumber, isDeleted: false },
        });
        if (t) activeTableId = t.id;
      }

      const firstDbItem = await prisma.item.findFirst().catch(() => null);

      const dbItemsToCreate = await Promise.all(
        processedItems.map(async (pi) => {
          let realItemId: string | null = pi.itemId || null;
          if (realItemId && !realItemId.startsWith('m-')) {
            const exists = await prisma.item.findUnique({ where: { id: realItemId } }).catch(() => null);
            if (!exists) realItemId = null;
          } else {
            realItemId = null;
          }

          if (!realItemId) {
            const matchByName = await prisma.item.findFirst({
              where: { name: { contains: pi.name, mode: 'insensitive' } },
            }).catch(() => null);
            realItemId = matchByName?.id || firstDbItem?.id || null;
          }

          return {
            itemId: realItemId,
            name: pi.name,
            quantity: pi.quantity,
            unitPrice: pi.unitPrice,
            subtotal: pi.subtotal,
            totalPrice: pi.totalPrice,
            notes: pi.notes,
          };
        })
      );

      const validDbItems = dbItemsToCreate.filter(
        (i): i is typeof i & { itemId: string } => typeof i.itemId === 'string' && i.itemId.length > 0
      );

      let dbCustomerId: string | undefined = undefined;
      if (attachedCustomer?.id && !attachedCustomer.id.startsWith('cust-')) {
        dbCustomerId = attachedCustomer.id;
      } else if (data.customerId && !data.customerId.startsWith('cust-')) {
        dbCustomerId = data.customerId;
      }

      if (activeBrandId && activeOutletId && activeUserId) {
        const dbCreatedOrder = await prisma.order.create({
          data: {
            brandId: activeBrandId,
            outletId: activeOutletId,
            orderNumber,
            dailyOrderSequence: seq,
            orderType: data.orderType,
            status: 'PREPARING',
            tableId: activeTableId || undefined,
            customerId: dbCustomerId,
            subtotal: itemsSubtotal,
            discountAmount: calculatedDiscount,
            discountPercent: data.discountPercent,
            discountReason: data.discountReason,
            cgstAmount,
            sgstAmount,
            taxAmount,
            serviceCharge: data.serviceCharge,
            packagingCharge: data.packagingCharge,
            deliveryCharge: data.deliveryCharge,
            roundOff,
            totalAmount: roundedTotal,
            balanceAmount: roundedTotal,
            createdById: activeUserId,
            notes: data.notes,
            items: {
              create: validDbItems,
            },
            kots: data.autoKOT
              ? {
                  create: {
                    brandId: activeBrandId,
                    outletId: activeOutletId,
                    kotNumber,
                    station: 'GENERAL',
                    status: 'NEW',
                  },
                }
              : undefined,
          },
          include: {
            kots: true,
            items: true,
          },
        });

        if (dbCreatedOrder) {
          newOrder.id = dbCreatedOrder.id;

          // Link items to KOT in DB
          if (dbCreatedOrder.kots?.[0]?.id) {
            await prisma.orderItem.updateMany({
              where: { orderId: dbCreatedOrder.id },
              data: { kotId: dbCreatedOrder.kots[0].id },
            }).catch(() => {});
          }

          // If dine in, update table in DB
          if (activeTableId) {
            await prisma.table.update({
              where: { id: activeTableId },
              data: {
                status: 'RUNNING',
                currentOrderId: dbCreatedOrder.id,
              },
            }).catch(() => {});
            invalidateCache('tables:');
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to create order in DB:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully and KOT sent to kitchen',
      order: newOrder,
      isNewCustomer,
      customer: attachedCustomer,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
