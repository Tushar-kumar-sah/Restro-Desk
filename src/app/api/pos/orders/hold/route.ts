import { NextRequest, NextResponse } from 'next/server';
import { HELD_BILLS } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    heldBills: HELD_BILLS,
    count: HELD_BILLS.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, billData, holdId } = body;

    if (action === 'HOLD') {
      const newHold = {
        holdId: `hold-${Date.now()}`,
        heldAt: new Date(),
        ...billData,
      };
      HELD_BILLS.unshift(newHold);
      return NextResponse.json({
        success: true,
        message: 'Bill placed on hold',
        holdId: newHold.holdId,
        count: HELD_BILLS.length,
      });
    }

    if (action === 'RESUME') {
      const idx = HELD_BILLS.findIndex((b: any) => b.holdId === holdId);
      if (idx === -1) {
        return NextResponse.json({ success: false, message: 'Held bill not found' }, { status: 404 });
      }
      const resumed = HELD_BILLS.splice(idx, 1)[0];
      return NextResponse.json({
        success: true,
        message: 'Bill resumed',
        billData: resumed,
        count: HELD_BILLS.length,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
