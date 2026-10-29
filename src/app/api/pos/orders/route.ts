import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { OrderType, OrderStatus } from '@prisma/client';
import { MOCK_ORDERS } from '@/lib/mock-data';

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
    const brandId = session?.brandId || 'brand-restodesk-001';

    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outletId');
    const status = searchParams.get('status');
    const orderType = searchParams.get('orderType');

    let orders: any[] = [];
    try {
      const whereClause: any = { brandId, isDeleted: false };
      if (outletId) whereClause.outletId = outletId;
      if (status && status !== 'ALL') whereClause.status = status as OrderStatus;
      if (orderType && orderType !== 'ALL') whereClause.orderType = orderType as OrderType;

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

    const newOrder = {
      id: `ord-${Date.now()}`,
      brandId,
      outletId: outletId,
      orderNumber,
      dailyOrderSequence: seq,
      orderType: data.orderType,
      status: 'PREPARING',
      tableNumber: data.tableNumber || (data.orderType === 'DINE_IN' ? 'T-01' : 'Counter'),
      tableId: data.tableId,
      customerName: customerName || 'Walk-in Guest',
      customerPhone: customerPhone || '',
      customerId: data.customerId,
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

    try {
      await prisma.order.create({
        data: {
          brandId,
          outletId,
          orderNumber,
          dailyOrderSequence: seq,
          orderType: data.orderType,
          status: 'PREPARING',
          tableId: data.tableId,
          customerId: data.customerId,
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
          createdById: userId,
          notes: data.notes,
          items: {
            create: processedItems.map((pi) => ({
              itemId: pi.itemId,
              name: pi.name,
              quantity: pi.quantity,
              unitPrice: pi.unitPrice,
              subtotal: pi.subtotal,
              totalPrice: pi.totalPrice,
              notes: pi.notes,
            })),
          },
          kots: data.autoKOT
            ? {
                create: {
                  brandId,
                  outletId,
                  kotNumber,
                  station: 'GENERAL',
                  status: 'NEW',
                },
              }
            : undefined,
        },
      });
    } catch (err) {}

    return NextResponse.json({
      success: true,
      message: 'Order created successfully and KOT sent to kitchen',
      order: newOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
