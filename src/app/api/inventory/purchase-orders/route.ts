import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  MOCK_PURCHASE_ORDERS,
  MOCK_SUPPLIERS,
  MOCK_RAW_MATERIALS,
  MockPurchaseOrder,
  MockPurchaseOrderItem,
} from '@/lib/mock-data';

const POItemInputSchema = z.object({
  rawMaterialId: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
});

const CreatePOSchema = z.object({
  outletId: z.string().default('outlet-01'),
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  notes: z.string().optional().default(''),
  items: z.array(POItemInputSchema).min(1, 'At least one line item is required'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const status = searchParams.get('status') || 'ALL';
    const supplierId = searchParams.get('supplierId') || 'ALL';

    let orders = [...MOCK_PURCHASE_ORDERS];

    const filtered = orders.filter((po) => {
      if (search) {
        const matchPo = po.poNumber.toLowerCase().includes(search);
        const matchSup = po.supplierName.toLowerCase().includes(search);
        if (!matchPo && !matchSup) return false;
      }
      if (status !== 'ALL' && po.status !== status) return false;
      if (supplierId !== 'ALL' && po.supplierId !== supplierId) return false;
      return true;
    });

    const totalPOValue = orders.reduce((acc, po) => acc + po.totalAmount, 0);
    const activePOCount = orders.filter((po) => po.status === 'ISSUED' || po.status === 'DRAFT').length;

    return NextResponse.json({
      success: true,
      orders: filtered,
      totalCount: filtered.length,
      metrics: {
        totalOrders: orders.length,
        totalPOValue,
        activePOCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreatePOSchema.parse(body);

    const supplier = MOCK_SUPPLIERS.find((s) => s.id === validated.supplierId);
    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });
    }

    const poSeq = MOCK_PURCHASE_ORDERS.length + 1;
    const poNumber = `PO-202610-${String(poSeq).padStart(3, '0')}`;

    const lineItems: MockPurchaseOrderItem[] = [];
    let grandTotal = 0;

    for (const itm of validated.items) {
      const rm = MOCK_RAW_MATERIALS.find((m) => m.id === itm.rawMaterialId);
      if (!rm) continue;

      const totalPrice = itm.quantity * itm.unitPrice;
      grandTotal += totalPrice;

      lineItems.push({
        id: `poi-${Date.now()}-${Math.random().toString().slice(2, 5)}`,
        rawMaterialId: rm.id,
        rawMaterialName: rm.name,
        unit: rm.unit,
        quantity: itm.quantity,
        unitPrice: itm.unitPrice,
        totalPrice,
      });
    }

    const newPO: MockPurchaseOrder = {
      id: `po-${Date.now()}`,
      brandId: 'brand-restodesk-001',
      outletId: validated.outletId,
      outletName: validated.outletId === 'outlet-02' ? 'Whitefield Tech Park' : 'Indiranagar Flagship',
      supplierId: supplier.id,
      supplierName: supplier.name,
      poNumber,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: validated.expectedDeliveryDate,
      status: 'ISSUED',
      totalAmount: grandTotal,
      notes: validated.notes,
      items: lineItems,
    };

    MOCK_PURCHASE_ORDERS.unshift(newPO);

    return NextResponse.json({
      success: true,
      message: `Purchase Order ${poNumber} created and issued`,
      order: newPO,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
