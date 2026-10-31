import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_TABLES } from '@/lib/mock-data';
import { invalidateCache } from '@/lib/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tables: layoutUpdates } = body;

    if (!Array.isArray(layoutUpdates)) {
      return NextResponse.json(
        { success: false, message: 'Invalid layout data: expected tables array' },
        { status: 400 }
      );
    }

    // 1. Update in-memory MOCK_TABLES
    for (const update of layoutUpdates) {
      const idx = MOCK_TABLES.findIndex(
        (t: any) => t.id === update.id || t.tableNumber === update.tableNumber
      );
      if (idx !== -1) {
        if (typeof update.posX === 'number') MOCK_TABLES[idx].posX = update.posX;
        if (typeof update.posY === 'number') MOCK_TABLES[idx].posY = update.posY;
      }
    }

    // 2. Update in DB if records exist
    try {
      for (const update of layoutUpdates) {
        if (update.id && !update.id.startsWith('tbl-')) {
          await prisma.table.update({
            where: { id: update.id },
            data: {
              posX: typeof update.posX === 'number' ? update.posX : 0,
              posY: typeof update.posY === 'number' ? update.posY : 0,
            },
          });
        } else if (update.tableNumber) {
          await prisma.table.updateMany({
            where: { tableNumber: update.tableNumber, isDeleted: false },
            data: {
              posX: typeof update.posX === 'number' ? update.posX : 0,
              posY: typeof update.posY === 'number' ? update.posY : 0,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Batch table layout update in DB failed:', dbErr);
    }

    invalidateCache('tables:');
    return NextResponse.json({
      success: true,
      message: 'Floor layout positions saved successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
