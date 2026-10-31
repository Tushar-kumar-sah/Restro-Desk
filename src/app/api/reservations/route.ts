import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_RESERVATIONS, MOCK_TABLES } from '@/lib/mock-data';
import { invalidateCache } from '@/lib/cache';

const createReservationSchema = z.object({
  customerName: z.string().min(2, 'Guest name is required'),
  customerPhone: z.string().min(10, 'Valid 10-digit phone required'),
  guestCount: z.coerce.number().int().positive().default(2),
  tableNumber: z.string().optional(),
  reservedAt: z.string(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    let reservations: any[] = [];
    try {
      const dbReservations = await prisma.reservation.findMany({
        where: { isDeleted: false },
        include: { table: true },
        orderBy: { reservedAt: 'asc' },
      });

      if (dbReservations.length > 0) {
        reservations = dbReservations.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          guestCount: r.guestCount,
          tableNumber: r.table?.tableNumber || '',
          reservedAt: r.reservedAt,
          status: r.status,
          notes: r.notes,
        }));
      }
    } catch (dbErr) {
      console.warn('DB query for reservations failed:', dbErr);
    }

    if (reservations.length === 0) {
      reservations = [...MOCK_RESERVATIONS];
    }

    return NextResponse.json({ success: true, reservations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
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

    const { customerName, customerPhone, guestCount, tableNumber, reservedAt, notes } = result.data;
    const reservedDate = new Date(reservedAt);

    let dbReservation: any = null;

    try {
      // Look up primary outlet and table if tableNumber provided
      const primaryOutlet = await prisma.outlet.findFirst({ orderBy: { createdAt: 'asc' } });
      const outletId = primaryOutlet?.id || '543126cb-76fb-4f78-a00c-6f4eb524467c';

      let tableId: string | null = null;
      if (tableNumber) {
        const tbl = await prisma.table.findFirst({
          where: { tableNumber, isDeleted: false },
        });
        if (tbl) {
          tableId = tbl.id;
          // Mark table as RESERVED in DB
          await prisma.table.update({
            where: { id: tbl.id },
            data: { status: 'RESERVED' },
          });
        }
      }

      dbReservation = await prisma.reservation.create({
        data: {
          outletId,
          tableId,
          customerName,
          customerPhone,
          guestCount,
          reservedAt: reservedDate,
          status: 'CONFIRMED',
          notes: notes || null,
        },
        include: { table: true },
      });
    } catch (dbErr) {
      console.warn('DB reservation creation failed:', dbErr);
    }

    const newRes = {
      id: dbReservation?.id || `res-${Date.now()}`,
      customerName,
      customerPhone,
      guestCount,
      tableNumber: tableNumber || dbReservation?.table?.tableNumber || '',
      reservedAt: reservedDate,
      status: 'CONFIRMED',
      notes: notes || '',
    };

    MOCK_RESERVATIONS.unshift(newRes);

    // If table assigned, mark table RESERVED in MOCK_TABLES
    if (tableNumber) {
      const tIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === tableNumber);
      if (tIdx !== -1) {
        MOCK_TABLES[tIdx].status = 'RESERVED';
        MOCK_TABLES[tIdx].guestName = customerName;
        MOCK_TABLES[tIdx].reservationTime = formatResTime(reservedDate);
      }
    }

    invalidateCache('tables:');

    return NextResponse.json({
      success: true,
      message: `Reservation confirmed for ${customerName} at Table ${tableNumber || 'Assigned'}`,
      reservation: newRes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function formatResTime(date: Date) {
  try {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (e) {
    return 'Tonight';
  }
}
