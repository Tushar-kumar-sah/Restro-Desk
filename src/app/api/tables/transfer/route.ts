import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_TABLES, MOCK_ORDERS } from '@/lib/mock-data';
import { invalidateCache } from '@/lib/cache';

const transferSchema = z.object({
  sourceTable: z.string().min(1, 'Source table is required'),
  targetTable: z.string().min(1, 'Target table is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = transferSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { sourceTable, targetTable } = result.data;

    if (sourceTable === targetTable) {
      return NextResponse.json(
        { success: false, message: 'Source and target tables cannot be the same' },
        { status: 400 }
      );
    }

    // 1. Check in MOCK_TABLES
    const srcIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === sourceTable);
    const tgtIdx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === targetTable);

    // 2. Try DB lookup if available
    let dbSrc: any = null;
    let dbTgt: any = null;
    try {
      dbSrc = await prisma.table.findFirst({
        where: { tableNumber: sourceTable, isDeleted: false },
        include: { currentOrder: true },
      });
      dbTgt = await prisma.table.findFirst({
        where: { tableNumber: targetTable, isDeleted: false },
        include: { currentOrder: true },
      });
    } catch (dbErr) {
      console.warn('DB lookup during transfer failed:', dbErr);
    }

    const isSrcFound = srcIdx !== -1 || !!dbSrc;
    const isTgtFound = tgtIdx !== -1 || !!dbTgt;

    if (!isSrcFound) {
      return NextResponse.json({ success: false, message: `Source table ${sourceTable} not found` }, { status: 404 });
    }
    if (!isTgtFound) {
      return NextResponse.json({ success: false, message: `Target table ${targetTable} not found` }, { status: 404 });
    }

    const tgtStatus = dbTgt?.status || (tgtIdx !== -1 ? MOCK_TABLES[tgtIdx].status : 'VACANT');
    if (tgtStatus === 'RUNNING' || tgtStatus === 'BILLED') {
      return NextResponse.json(
        { success: false, message: `Target table ${targetTable} is already occupied. Use Merge instead.` },
        { status: 400 }
      );
    }

    // Capture source order data
    const orderId = dbSrc?.currentOrderId || (srcIdx !== -1 ? MOCK_TABLES[srcIdx].currentOrderId : null);
    const runningAmount = dbSrc?.currentOrder?.totalAmount ?? (srcIdx !== -1 ? MOCK_TABLES[srcIdx].runningAmount : 0);
    const seatedAt = dbSrc?.currentOrder?.createdAt || (srcIdx !== -1 ? MOCK_TABLES[srcIdx].seatedAt : null);
    const guestName = srcIdx !== -1 ? MOCK_TABLES[srcIdx].guestName : null;
    const srcStatus = dbSrc?.status || (srcIdx !== -1 ? MOCK_TABLES[srcIdx].status : 'RUNNING');

    // Update in Prisma DB if available
    if (dbSrc && dbTgt) {
      try {
        if (dbSrc.currentOrderId) {
          await prisma.order.update({
            where: { id: dbSrc.currentOrderId },
            data: {
              tableId: dbTgt.id,
            },
          });
        }

        // Set target table to source status & order
        await prisma.table.update({
          where: { id: dbTgt.id },
          data: {
            status: srcStatus,
            currentOrderId: dbSrc.currentOrderId,
          },
        });

        // Set source table to VACANT
        await prisma.table.update({
          where: { id: dbSrc.id },
          data: {
            status: 'VACANT',
            currentOrderId: null,
          },
        });
      } catch (dbErr) {
        console.error('Error updating DB during transfer:', dbErr);
      }
    }

    // Update in memory MOCK_TABLES
    if (tgtIdx !== -1 && srcIdx !== -1) {
      MOCK_TABLES[tgtIdx] = {
        ...MOCK_TABLES[tgtIdx],
        status: srcStatus,
        currentOrderId: orderId,
        runningAmount,
        seatedAt,
        guestName,
      };

      MOCK_TABLES[srcIdx] = {
        ...MOCK_TABLES[srcIdx],
        status: 'VACANT',
        currentOrderId: null,
        runningAmount: 0,
        seatedAt: null,
        guestName: undefined,
      };
    }

    // Update order tableNumber in MOCK_ORDERS
    if (orderId) {
      const orderIdx = MOCK_ORDERS.findIndex((o: any) => o.id === orderId);
      if (orderIdx !== -1) {
        MOCK_ORDERS[orderIdx].tableNumber = targetTable;
      }
    }

    invalidateCache('tables:');
    invalidateCache('pos:');
    invalidateCache('orders:');

    return NextResponse.json({
      success: true,
      message: `Successfully transferred order from Table ${sourceTable} to Table ${targetTable}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
