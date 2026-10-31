import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  MOCK_GRNS,
  MOCK_PURCHASE_ORDERS,
  MOCK_RAW_MATERIALS,
  MOCK_SUPPLIERS,
  MockGRN,
  MockGRNItem,
  recordStockMovement,
} from '@/lib/mock-data';

const GRNItemInputSchema = z.object({
  rawMaterialId: z.string(),
  receivedQty: z.number().positive(),
  acceptedQty: z.number().min(0).optional(),
  rejectedQty: z.number().min(0).default(0),
  unitPrice: z.number().positive(),
}).transform((item) => ({
  ...item,
  acceptedQty: item.acceptedQty ?? (item.receivedQty - item.rejectedQty),
}));

const CreateGRNSchema = z.object({
  outletId: z.string().default('outlet-01'),
  supplierId: z.string().min(1, 'Supplier is required'),
  purchaseOrderId: z.string().optional().nullable(),
  invoiceNumber: z.string().min(1, 'Supplier invoice number is required'),
  notes: z.string().optional().default(''),
  items: z.array(GRNItemInputSchema).min(1, 'At least one received item is required'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    let grns = [...MOCK_GRNS];

    if (search) {
      grns = grns.filter(
        (g) =>
          g.grnNumber.toLowerCase().includes(search) ||
          g.invoiceNumber.toLowerCase().includes(search) ||
          g.supplierName.toLowerCase().includes(search)
      );
    }

    const totalGRNValue = grns.reduce((acc, g) => acc + g.totalAmount, 0);

    return NextResponse.json({
      success: true,
      grns,
      totalCount: grns.length,
      metrics: {
        totalGRNs: grns.length,
        totalGRNValue,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateGRNSchema.parse(body);

    const supplier = MOCK_SUPPLIERS.find((s) => s.id === validated.supplierId);
    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });
    }

    let po = null;
    if (validated.purchaseOrderId) {
      po = MOCK_PURCHASE_ORDERS.find((p) => p.id === validated.purchaseOrderId);
    }

    const grnSeq = MOCK_GRNS.length + 1;
    const grnNumber = `GRN-202610-${String(grnSeq).padStart(3, '0')}`;

    const items: MockGRNItem[] = [];
    let totalAmount = 0;

    for (const line of validated.items) {
      const rm = MOCK_RAW_MATERIALS.find((m) => m.id === line.rawMaterialId);
      if (!rm) continue;

      const lineTotal = line.acceptedQty * line.unitPrice;
      totalAmount += lineTotal;

      items.push({
        id: `gi-${Date.now()}-${Math.random().toString().slice(2, 5)}`,
        rawMaterialId: rm.id,
        rawMaterialName: rm.name,
        unit: rm.unit,
        receivedQty: line.receivedQty,
        acceptedQty: line.acceptedQty,
        rejectedQty: line.rejectedQty,
        unitPrice: line.unitPrice,
        totalAmount: lineTotal,
      });

      // AUTOMATIC STOCK INCREMENT IN REAL TIME
      rm.currentStock = Math.round((rm.currentStock + line.acceptedQty) * 100) / 100;
      // Weighted average cost update
      rm.costPerUnit = line.unitPrice;

      // Record in Stock Movement Ledger
      recordStockMovement({
        outletId: validated.outletId,
        date: new Date().toISOString(),
        rawMaterialId: rm.id,
        rawMaterialName: rm.name,
        sku: rm.sku,
        category: rm.category,
        unit: rm.unit,
        type: 'STOCK_IN',
        changeQty: line.acceptedQty,
        balanceAfter: rm.currentStock,
        costPerUnit: line.unitPrice,
        totalCostImpact: lineTotal,
        reference: `GRN #${grnNumber} (${supplier.name})`,
        recordedBy: 'Store Supervisor',
        notes: `PO: ${po?.poNumber || 'Direct GRN'} • Invoice: ${validated.invoiceNumber}`,
      });
    }

    // Update supplier ledger balance
    supplier.outstandingBalance = Math.round((supplier.outstandingBalance + totalAmount) * 100) / 100;
    supplier.totalPurchasesYtd += totalAmount;

    // Mark PO as received if applicable
    if (po) {
      po.status = 'RECEIVED';
    }

    const newGRN: MockGRN = {
      id: `grn-${Date.now()}`,
      brandId: 'brand-restodesk-001',
      outletId: validated.outletId,
      outletName: validated.outletId === 'outlet-02' ? 'Whitefield Tech Park' : 'Indiranagar Flagship',
      supplierId: supplier.id,
      supplierName: supplier.name,
      purchaseOrderId: po?.id,
      poNumber: po?.poNumber,
      grnNumber,
      invoiceNumber: validated.invoiceNumber,
      receivedDate: new Date().toISOString().split('T')[0],
      totalAmount,
      status: 'VERIFIED',
      notes: validated.notes,
      items,
    };

    MOCK_GRNS.unshift(newGRN);

    return NextResponse.json({
      success: true,
      message: `GRN ${grnNumber} verified and stock updated automatically!`,
      grn: newGRN,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'GRN ID is required' }, { status: 400 });
    }

    const index = MOCK_GRNS.findIndex((g) => g.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'GRN record not found' }, { status: 404 });
    }

    const grn = MOCK_GRNS[index];

    // Revert stock increments
    for (const item of grn.items) {
      const rm = MOCK_RAW_MATERIALS.find((m) => m.id === item.rawMaterialId || m.name === item.rawMaterialName);
      if (rm) {
        rm.currentStock = Math.max(0, Math.round((rm.currentStock - item.acceptedQty) * 100) / 100);
      }
    }

    // Revert supplier liability
    const supplier = MOCK_SUPPLIERS.find((s) => s.id === grn.supplierId);
    if (supplier) {
      supplier.outstandingBalance = Math.max(0, Math.round((supplier.outstandingBalance - grn.totalAmount) * 100) / 100);
      supplier.totalPurchasesYtd = Math.max(0, supplier.totalPurchasesYtd - grn.totalAmount);
    }

    // Revert PO status if attached
    if (grn.purchaseOrderId) {
      const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === grn.purchaseOrderId);
      if (po) po.status = 'ISSUED';
    }

    MOCK_GRNS.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: `GRN ${grn.grnNumber} deleted and stock adjusted.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
