import { NextRequest, NextResponse } from 'next/server';
import { MOCK_STOCK_MOVEMENTS, StockMovementType, recordStockMovement, MOCK_RAW_MATERIALS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const type = searchParams.get('type') || 'ALL';
    const rawMaterialId = searchParams.get('rawMaterialId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let movements = [...MOCK_STOCK_MOVEMENTS];

    if (rawMaterialId) {
      movements = movements.filter((m) => m.rawMaterialId === rawMaterialId);
    }

    if (type !== 'ALL') {
      movements = movements.filter((m) => m.type === type);
    }

    if (search) {
      movements = movements.filter(
        (m) =>
          m.rawMaterialName.toLowerCase().includes(search) ||
          m.sku.toLowerCase().includes(search) ||
          m.reference.toLowerCase().includes(search) ||
          (m.notes && m.notes.toLowerCase().includes(search)) ||
          m.recordedBy.toLowerCase().includes(search)
      );
    }

    // Sort descending by date
    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Aggregate statistics
    let totalStockInCount = 0;
    let totalStockOutCount = 0;
    let totalAddedQty = 0;
    let totalDeductedQty = 0;

    for (const m of movements) {
      if (m.changeQty > 0) {
        totalStockInCount++;
        totalAddedQty += m.changeQty;
      } else {
        totalStockOutCount++;
        totalDeductedQty += Math.abs(m.changeQty);
      }
    }

    return NextResponse.json({
      success: true,
      movements: movements.slice(0, limit),
      totalCount: movements.length,
      metrics: {
        totalMovements: movements.length,
        totalStockInCount,
        totalStockOutCount,
        totalAddedQty: Math.round(totalAddedQty * 100) / 100,
        totalDeductedQty: Math.round(totalDeductedQty * 100) / 100,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawMaterialId, type, changeQty, reference, recordedBy, notes } = body;

    if (!rawMaterialId) {
      return NextResponse.json({ success: false, message: 'rawMaterialId is required' }, { status: 400 });
    }

    const rm = MOCK_RAW_MATERIALS.find((m) => m.id === rawMaterialId);
    if (!rm) {
      return NextResponse.json({ success: false, message: 'Raw material not found' }, { status: 404 });
    }

    const qty = Number(changeQty);
    if (isNaN(qty)) {
      return NextResponse.json({ success: false, message: 'Valid changeQty is required' }, { status: 400 });
    }

    const newStock = Math.max(0, Math.round((rm.currentStock + qty) * 100) / 100);
    rm.currentStock = newStock;

    const movement = recordStockMovement({
      date: new Date().toISOString(),
      rawMaterialId: rm.id,
      rawMaterialName: rm.name,
      sku: rm.sku,
      category: rm.category,
      unit: rm.unit,
      type: (type as StockMovementType) || (qty >= 0 ? 'STOCK_IN' : 'MANUAL_ADJUSTMENT'),
      changeQty: qty,
      balanceAfter: newStock,
      costPerUnit: rm.costPerUnit,
      totalCostImpact: Math.round(qty * rm.costPerUnit * 100) / 100,
      reference: reference || 'Manual Adjustment',
      recordedBy: recordedBy || 'System User',
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: `Stock movement recorded. Balance is now ${newStock} ${rm.unit}`,
      movement,
      currentStock: newStock,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
