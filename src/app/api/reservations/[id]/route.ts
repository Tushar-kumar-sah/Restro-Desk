import { NextRequest, NextResponse } from 'next/server';
import { MOCK_RESERVATIONS, MOCK_TABLES } from '@/lib/mock-data';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    const resIdx = MOCK_RESERVATIONS.findIndex((r: any) => r.id === id);
    if (resIdx === -1) {
      return NextResponse.json({ success: false, message: 'Reservation not found' }, { status: 404 });
    }

    MOCK_RESERVATIONS[resIdx].status = status;
    const tableNum = MOCK_RESERVATIONS[resIdx].tableNumber;

    if (tableNum) {
      const tIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === tableNum);
      if (tIdx !== -1) {
        if (status === 'SEATED') {
          MOCK_TABLES[tIdx].status = 'RUNNING';
          MOCK_TABLES[tIdx].seatedAt = new Date();
        } else if (status === 'CANCELLED' || status === 'NO_SHOW') {
          MOCK_TABLES[tIdx].status = 'VACANT';
          MOCK_TABLES[tIdx].guestName = undefined;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      reservation: MOCK_RESERVATIONS[resIdx],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
