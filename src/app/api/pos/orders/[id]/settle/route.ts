import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_ORDERS } from '@/lib/mock-data';

const settleSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI_QR', 'WALLET', 'DUE_CREDIT', 'SPLIT', 'OTHER']),
  amountPaid: z.number().positive(),
  tenderedCash: z.number().optional(),
  referenceNumber: z.string().optional().nullable(),
  splitPayments: z
    .array(
      z.object({
        method: z.string(),
        amount: z.number(),
      })
    )
    .optional(),
  notes: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const result = settleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { paymentMethod, amountPaid, tenderedCash, referenceNumber, notes } = result.data;
    const changeDue = tenderedCash && tenderedCash > amountPaid ? tenderedCash - amountPaid : 0;

    let settledOrder: any = null;

    // 1. Update mock store
    const idx = MOCK_ORDERS.findIndex((o: any) => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      MOCK_ORDERS[idx] = {
        ...MOCK_ORDERS[idx],
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paidAmount: amountPaid,
        balanceAmount: 0.0,
        paymentMethod,
        referenceNumber,
        tenderedCash,
        changeDue,
        settledAt: new Date(),
      };
      settledOrder = MOCK_ORDERS[idx];
    }

    // 2. Update live DB if connected
    try {
      await prisma.order.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          paidAmount: amountPaid,
          balanceAmount: 0.0,
          payments: {
            create: {
              method: paymentMethod,
              amount: amountPaid,
              referenceNumber,
              notes,
              status: 'PAID',
            },
          },
        },
      });
    } catch (err) {
      // offline fallback was updated in mock store
    }

    return NextResponse.json({
      success: true,
      message: `Bill settled successfully via ${paymentMethod}! Change due: ₹${changeDue.toFixed(2)}`,
      order: settledOrder || { id, status: 'COMPLETED', paymentStatus: 'PAID', amountPaid, changeDue },
      changeDue,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
