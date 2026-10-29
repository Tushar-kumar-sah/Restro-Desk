import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_TABLES, MOCK_ORDERS } from '@/lib/mock-data';

const transferSchema = z.object({
  sourceTable: z.string().min(1, 'Source table is required'),
  targetTable: z.string().min(1, 'Target table is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = transferSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { sourceTable, targetTable } = result.data;

    const srcIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === sourceTable);
    const tgtIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === targetTable);

    if (srcIdx === -1) {
      return NextResponse.json({ success: false, message: 'Source table not found' }, { status: 404 });
    }
    if (tgtIdx === -1) {
      return NextResponse.json({ success: false, message: 'Target table not found' }, { status: 404 });
    }
    if (MOCK_TABLES[tgtIdx].status === 'RUNNING' || MOCK_TABLES[tgtIdx].status === 'BILLED') {
      return NextResponse.json(
        { success: false, message: `Target table ${targetTable} is already occupied. Use Merge instead.` },
        { status: 400 }
      );
    }

    // Transfer order
    const orderId = MOCK_TABLES[srcIdx].currentOrderId;
    const runningAmount = MOCK_TABLES[srcIdx].runningAmount;
    const seatedAt = MOCK_TABLES[srcIdx].seatedAt;
    const guestName = MOCK_TABLES[srcIdx].guestName;

    MOCK_TABLES[tgtIdx] = {
      ...MOCK_TABLES[tgtIdx],
      status: MOCK_TABLES[srcIdx].status,
      currentOrderId: orderId,
      runningAmount,
      seatedAt,
      guestName,
    };

    MOCK_TABLES[srcIdx] = {
      ...MOCK_TABLES[srcIdx],
      status: 'VACANT',
      currentOrderId: null,
      runningAmount: 0,
      seatedAt: null,
      guestName: undefined,
    };

    // Update order tableNumber
    if (orderId) {
      const orderIdx = MOCK_ORDERS.findIndex((o: any) => o.id === orderId);
      if (orderIdx !== -1) {
        MOCK_ORDERS[orderIdx].tableNumber = targetTable;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully transferred order from Table ${sourceTable} to Table ${targetTable}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
