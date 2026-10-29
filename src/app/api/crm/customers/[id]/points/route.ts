import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';

const PointsAdjustmentSchema = z.object({
  type: z.enum(['EARN', 'EARNED', 'REDEEM', 'REDEEMED', 'ADJUST', 'EXPIRE']).transform((val) => {
    if (val === 'EARNED') return 'EARN';
    if (val === 'REDEEMED') return 'REDEEM';
    return val;
  }),
  points: z.number().int(),
  reason: z.string().min(2, 'Reason is required for points adjustment'),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = PointsAdjustmentSchema.parse(body);

    const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    const pointsDelta =
      validated.type === 'REDEEM' || validated.type === 'EXPIRE'
        ? -Math.abs(validated.points)
        : validated.points;

    const newPoints = Math.max(0, customer.totalPoints + pointsDelta);

    customer.totalPoints = newPoints;

    const newTxn = {
      id: `lt-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: validated.type,
      points: pointsDelta,
      balanceAfter: newPoints,
      reason: validated.reason,
    };

    customer.loyaltyLedger.unshift(newTxn);

    try {
      await prisma.loyaltyTransaction.create({
        data: {
          customerId: id,
          type: validated.type,
          points: pointsDelta,
          balanceAfter: newPoints,
          reason: validated.reason,
        },
      });

      await prisma.customer.update({
        where: { id },
        data: { totalPoints: newPoints },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: `Points updated successfully. New balance: ${newPoints} pts`,
      totalPoints: newPoints,
      transaction: newTxn,
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
