import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_ACTIVE_SHIFT } from '@/lib/mock-data';

const ShiftActionSchema = z.object({
  action: z.enum(['FLOAT_IN', 'EXPENSE', 'CLOSE_SHIFT']),
  amount: z.number().min(0).optional(),
  note: z.string().optional().default(''),
  actualCash: z.number().min(0).optional(),
});

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      activeShift: MOCK_ACTIVE_SHIFT,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ShiftActionSchema.parse(body);

    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (validated.action === 'EXPENSE') {
      const expenseAmt = validated.amount || 0;
      MOCK_ACTIVE_SHIFT.cashExpenses += expenseAmt;
      MOCK_ACTIVE_SHIFT.expectedCash -= expenseAmt;
      MOCK_ACTIVE_SHIFT.cashDrawerEntries.unshift({
        id: `cde-${Date.now()}`,
        time: nowTime,
        type: 'EXPENSE_OUT',
        amount: -expenseAmt,
        note: validated.note || 'Petty cash expense',
      });

      return NextResponse.json({
        success: true,
        message: `Expense of ₹${expenseAmt} recorded from cash drawer`,
        activeShift: MOCK_ACTIVE_SHIFT,
      });
    }

    if (validated.action === 'FLOAT_IN') {
      const floatAmt = validated.amount || 0;
      MOCK_ACTIVE_SHIFT.cashInFlow += floatAmt;
      MOCK_ACTIVE_SHIFT.expectedCash += floatAmt;
      MOCK_ACTIVE_SHIFT.cashDrawerEntries.unshift({
        id: `cde-${Date.now()}`,
        time: nowTime,
        type: 'FLOAT_IN',
        amount: floatAmt,
        note: validated.note || 'Additional cash float added',
      });

      return NextResponse.json({
        success: true,
        message: `Cash float of ₹${floatAmt} added to drawer`,
        activeShift: MOCK_ACTIVE_SHIFT,
      });
    }

    if (validated.action === 'CLOSE_SHIFT') {
      const actual = validated.actualCash ?? MOCK_ACTIVE_SHIFT.expectedCash;
      const variance = Math.round((actual - MOCK_ACTIVE_SHIFT.expectedCash) * 100) / 100;

      MOCK_ACTIVE_SHIFT.actualCash = actual;
      MOCK_ACTIVE_SHIFT.variance = variance;
      MOCK_ACTIVE_SHIFT.status = 'CLOSED';
      MOCK_ACTIVE_SHIFT.endTime = new Date().toISOString();

      return NextResponse.json({
        success: true,
        message: `Shift closed. Physical count ₹${actual.toFixed(2)}. Variance: ₹${variance.toFixed(2)}`,
        activeShift: MOCK_ACTIVE_SHIFT,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
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
