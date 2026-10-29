import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';

const WalletAdjustmentSchema = z.object({
  type: z.enum(['TOPUP', 'DEBIT_BILL', 'CASHBACK', 'REFUND', 'ADJUSTMENT']),
  amount: z.number().positive('Amount must be positive'),
  referenceNote: z.string().min(2, 'Reference note is required'),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = WalletAdjustmentSchema.parse(body);

    const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    const isDebit = validated.type === 'DEBIT_BILL';
    if (isDebit && customer.walletBalance < validated.amount) {
      return NextResponse.json(
        { success: false, message: 'Insufficient wallet balance for debit' },
        { status: 400 }
      );
    }

    const delta = isDebit ? -validated.amount : validated.amount;
    const newBalance = Math.round((customer.walletBalance + delta) * 100) / 100;

    customer.walletBalance = newBalance;

    const newTxn = {
      id: `wt-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      type: validated.type,
      amount: delta,
      balanceAfter: newBalance,
      referenceNote: validated.referenceNote,
    };

    customer.walletLedger.unshift(newTxn);

    try {
      await prisma.walletTransaction.create({
        data: {
          customerId: id,
          type: validated.type,
          amount: delta,
          balanceAfter: newBalance,
          referenceNote: validated.referenceNote,
        },
      });

      await prisma.customer.update({
        where: { id },
        data: { walletBalance: newBalance },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: `Wallet updated successfully. New balance: ₹${newBalance.toFixed(2)}`,
      walletBalance: newBalance,
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
