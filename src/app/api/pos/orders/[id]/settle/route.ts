import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_ORDERS, MOCK_TABLES } from '@/lib/mock-data';
import { invalidateCache } from '@/lib/cache';
import { autoSyncCustomerFromBill } from '@/lib/crm';

const settleSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI_QR', 'WALLET', 'DUE_CREDIT', 'SPLIT', 'OTHER']),
  amountPaid: z.number().positive(),
  tenderedCash: z.number().optional(),
  referenceNumber: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
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

    const { paymentMethod, amountPaid, tenderedCash, referenceNumber, notes, customerName, customerPhone } = result.data;
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
        ...(customerPhone ? { customerPhone } : {}),
        ...(customerName ? { customerName } : {}),
      };
      settledOrder = MOCK_ORDERS[idx];
    }

    // Automatically sync customer visit, spend & loyalty on settlement
    const custPhone = customerPhone || settledOrder?.customerPhone;
    const custName = customerName || settledOrder?.customerName;
    if (custPhone) {
      await autoSyncCustomerFromBill({
        phone: custPhone,
        name: custName,
        billAmount: amountPaid,
        orderNumber: settledOrder?.orderNumber || `BILL-${id}`,
        orderId: settledOrder?.id || id,
        isSettled: true,
        paymentMode: paymentMethod,
      }).catch(() => null);
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

      // Free the table in DB if associated
      const dbOrder = await prisma.order.findUnique({
        where: { id },
        select: { tableId: true },
      });
      if (dbOrder?.tableId) {
        await prisma.table.update({
          where: { id: dbOrder.tableId },
          data: { status: 'VACANT', currentOrderId: null },
        });
        invalidateCache('tables:');
      }
    } catch (err) {
      // offline fallback was updated in mock store
    }

    if (settledOrder?.tableNumber || settledOrder?.tableId) {
      const tblNum = settledOrder.tableNumber;
      const tIdx = MOCK_TABLES.findIndex(
        (t) => (tblNum && t.tableNumber === tblNum) || (settledOrder.tableId && t.id === settledOrder.tableId)
      );
      if (tIdx !== -1) {
        MOCK_TABLES[tIdx].status = 'VACANT';
        MOCK_TABLES[tIdx].runningAmount = 0;
        MOCK_TABLES[tIdx].currentOrderId = null;
        MOCK_TABLES[tIdx].seatedAt = null;
      }
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
