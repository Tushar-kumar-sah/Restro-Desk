import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_RESERVATIONS, MOCK_TABLES } from '@/lib/mock-data';
import { invalidateCache } from '@/lib/cache';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    let tableNum: string | null = null;

    // 1. Update in DB if found
    try {
      const dbRes = await prisma.reservation.findUnique({
        where: { id },
        include: { table: true },
      });

      if (dbRes) {
        tableNum = dbRes.table?.tableNumber || null;
        await prisma.reservation.update({
          where: { id },
          data: { status: status as any },
        });

        if (dbRes.tableId) {
          if (status === 'SEATED') {
            await prisma.table.update({
              where: { id: dbRes.tableId },
              data: { status: 'RUNNING' },
            });
          } else if (status === 'CANCELLED' || status === 'NO_SHOW') {
            await prisma.table.update({
              where: { id: dbRes.tableId },
              data: { status: 'VACANT' },
            });
          }
        }
      }
    } catch (dbErr) {
      console.warn('DB update reservation failed:', dbErr);
    }

    // 2. Update in-memory MOCK_RESERVATIONS
    const resIdx = MOCK_RESERVATIONS.findIndex((r: any) => r.id === id);
    if (resIdx !== -1) {
      MOCK_RESERVATIONS[resIdx].status = status;
      if (!tableNum) {
        tableNum = MOCK_RESERVATIONS[resIdx].tableNumber;
      }
    }

    // 3. Update table in MOCK_TABLES
    if (tableNum) {
      const tIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === tableNum);
      if (tIdx !== -1) {
        if (status === 'SEATED') {
          MOCK_TABLES[tIdx].status = 'RUNNING';
          MOCK_TABLES[tIdx].seatedAt = new Date();
        } else if (status === 'CANCELLED' || status === 'NO_SHOW') {
          MOCK_TABLES[tIdx].status = 'VACANT';
          MOCK_TABLES[tIdx].guestName = undefined;
          MOCK_TABLES[tIdx].reservationTime = undefined;
        }
      }
    }

    invalidateCache('tables:');

    return NextResponse.json({
      success: true,
      message: `Reservation marked as ${status}`,
      reservation: resIdx !== -1 ? MOCK_RESERVATIONS[resIdx] : { id, status },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
