import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_TABLES, MOCK_ORDERS } from '@/lib/mock-data';

const mergeSchema = z.object({
  table1: z.string().min(1),
  table2: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = mergeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Invalid tables' }, { status: 400 });
    }

    const { table1, table2 } = result.data;

    const t1Idx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === table1);
    const t2Idx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === table2);

    if (t1Idx === -1 || t2Idx === -1) {
      return NextResponse.json({ success: false, message: 'One or both tables not found' }, { status: 404 });
    }

    // Merge running amounts
    const combinedAmount = (MOCK_TABLES[t1Idx].runningAmount || 0) + (MOCK_TABLES[t2Idx].runningAmount || 0);
    MOCK_TABLES[t1Idx].runningAmount = combinedAmount;
    MOCK_TABLES[t1Idx].tableNumber = `${table1} + ${table2}`;

    // Free table 2
    MOCK_TABLES[t2Idx].status = 'VACANT';
    MOCK_TABLES[t2Idx].runningAmount = 0;
    MOCK_TABLES[t2Idx].currentOrderId = null;

    return NextResponse.json({
      success: true,
      message: `Merged ${table1} and ${table2} into single running bill (${combinedAmount})`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
