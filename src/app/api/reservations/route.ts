import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_RESERVATIONS, MOCK_TABLES } from '@/lib/mock-data';

const createReservationSchema = z.object({
  customerName: z.string().min(2, 'Guest name is required'),
  customerPhone: z.string().min(10, 'Valid 10-digit phone required'),
  guestCount: z.number().int().positive().default(2),
  tableNumber: z.string().optional(),
  reservedAt: z.string(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  return NextResponse.json({ success: true, reservations: MOCK_RESERVATIONS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createReservationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const newRes = {
      id: `res-${Date.now()}`,
      ...result.data,
      reservedAt: new Date(result.data.reservedAt),
      status: 'CONFIRMED',
    };

    MOCK_RESERVATIONS.unshift(newRes);

    // If table assigned, mark table RESERVED
    if (result.data.tableNumber) {
      const tIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === result.data.tableNumber);
      if (tIdx !== -1) {
        MOCK_TABLES[tIdx].status = 'RESERVED';
        MOCK_TABLES[tIdx].guestName = result.data.customerName;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reservation confirmed for ${result.data.customerName}`,
      reservation: newRes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
