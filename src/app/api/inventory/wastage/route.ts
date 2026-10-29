import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_WASTAGE, MOCK_RAW_MATERIALS, MockWastage } from '@/lib/mock-data';

const WastageItemSchema = z.object({
  rawMaterialId: z.string(),
  quantity: z.number().positive(),
  notes: z.string().optional(),
});

const RecordWastageSchema = z.object({
  outletId: z.string().default('outlet-01'),
  reason: z.enum(['Spoilage', 'Preparation Error', 'Burning', 'Expiry', 'Spillage']),
  recordedBy: z.string().default('Chef on Duty'),
  items: z.array(WastageItemSchema).min(1, 'At least one item required'),
});

export async function GET(req: NextRequest) {
  try {
    const totalWastageCost = MOCK_WASTAGE.reduce((acc, w) => acc + w.totalCost, 0);
    return NextResponse.json({
      success: true,
      wastageRecords: MOCK_WASTAGE,
      totalCount: MOCK_WASTAGE.length,
      metrics: {
        totalWastageCost,
        totalEntries: MOCK_WASTAGE.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RecordWastageSchema.parse(body);

    const wstSeq = MOCK_WASTAGE.length + 1;
    const wastageNumber = `WST-202610-${String(wstSeq).padStart(3, '0')}`;

    const items = [];
    let totalCost = 0;

    for (const line of validated.items) {
      const rm = MOCK_RAW_MATERIALS.find((m) => m.id === line.rawMaterialId);
      if (!rm) continue;

      const itemCost = Math.round(line.quantity * rm.costPerUnit * 100) / 100;
      totalCost += itemCost;

      items.push({
        id: `wi-${Date.now()}-${Math.random().toString().slice(2, 5)}`,
        rawMaterialId: rm.id,
        rawMaterialName: rm.name,
        unit: rm.unit,
        quantity: line.quantity,
        cost: itemCost,
        notes: line.notes || validated.reason,
      });

      // DEDUCT FROM INVENTORY STOCK
      rm.currentStock = Math.max(0, Math.round((rm.currentStock - line.quantity) * 100) / 100);
    }

    const newWastage: MockWastage = {
      id: `wst-${Date.now()}`,
      outletId: validated.outletId,
      wastageNumber,
      date: new Date().toISOString().split('T')[0],
      reason: validated.reason,
      totalCost,
      recordedBy: validated.recordedBy,
      items,
    };

    MOCK_WASTAGE.unshift(newWastage);

    return NextResponse.json({
      success: true,
      message: `Wastage entry ${wastageNumber} logged. Stock adjusted. Total loss: ₹${totalCost.toFixed(2)}`,
      wastage: newWastage,
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
