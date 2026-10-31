import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_TABLES, MOCK_ORDERS } from '@/lib/mock-data';
import { invalidateCache } from '@/lib/cache';

const mergeSchema = z.object({
  table1: z.string().min(1, 'Primary table is required'),
  table2: z.string().min(1, 'Secondary table is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = mergeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Invalid tables' },
        { status: 400 }
      );
    }

    const { table1, table2 } = result.data;

    if (table1 === table2) {
      return NextResponse.json(
        { success: false, message: 'Cannot merge a table into itself' },
        { status: 400 }
      );
    }

    const t1Idx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === table1);
    const t2Idx = MOCK_TABLES.findIndex((t: any) => t.tableNumber === table2);

    // Try DB lookup
    let dbT1: any = null;
    let dbT2: any = null;
    try {
      dbT1 = await prisma.table.findFirst({
        where: { tableNumber: table1, isDeleted: false },
        include: { currentOrder: { include: { items: true } } },
      });
      dbT2 = await prisma.table.findFirst({
        where: { tableNumber: table2, isDeleted: false },
        include: { currentOrder: { include: { items: true } } },
      });
    } catch (dbErr) {
      console.warn('DB lookup during merge failed:', dbErr);
    }

    const isT1Found = t1Idx !== -1 || !!dbT1;
    const isT2Found = t2Idx !== -1 || !!dbT2;

    if (!isT1Found || !isT2Found) {
      return NextResponse.json(
        { success: false, message: 'One or both tables not found' },
        { status: 404 }
      );
    }

    const t1Amount = dbT1?.currentOrder?.totalAmount ?? (t1Idx !== -1 ? MOCK_TABLES[t1Idx].runningAmount || 0 : 0);
    const t2Amount = dbT2?.currentOrder?.totalAmount ?? (t2Idx !== -1 ? MOCK_TABLES[t2Idx].runningAmount || 0 : 0);
    const combinedAmount = t1Amount + t2Amount;

    // Handle DB merge if active
    if (dbT1 && dbT2) {
      try {
        const order1Id = dbT1.currentOrderId;
        const order2Id = dbT2.currentOrderId;

        if (order1Id && order2Id && order1Id !== order2Id) {
          // Reassign order items from order2 to order1
          await prisma.orderItem.updateMany({
            where: { orderId: order2Id },
            data: { orderId: order1Id },
          });

          // Reassign KOTs
          await prisma.kOT.updateMany({
            where: { orderId: order2Id },
            data: { orderId: order1Id },
          });

          // Update order1 total
          await prisma.order.update({
            where: { id: order1Id },
            data: {
              totalAmount: combinedAmount,
              subtotal: (dbT1.currentOrder?.subtotal || 0) + (dbT2.currentOrder?.subtotal || 0),
              taxAmount: (dbT1.currentOrder?.taxAmount || 0) + (dbT2.currentOrder?.taxAmount || 0),
            },
          });

          // Cancel/Close order2
          await prisma.order.update({
            where: { id: order2Id },
            data: {
              status: 'COMPLETED',
              notes: `Merged into Table ${table1} (Order ${order1Id})`,
            },
          });
        }

        // Set table 2 to VACANT
        await prisma.table.update({
          where: { id: dbT2.id },
          data: {
            status: 'VACANT',
            currentOrderId: null,
          },
        });

        // Ensure table 1 stays RUNNING
        await prisma.table.update({
          where: { id: dbT1.id },
          data: {
            status: 'RUNNING',
          },
        });
      } catch (dbErr) {
        console.error('Error merging orders in DB:', dbErr);
      }
    }

    // Merge in memory MOCK_TABLES
    if (t1Idx !== -1 && t2Idx !== -1) {
      MOCK_TABLES[t1Idx].runningAmount = combinedAmount;
      MOCK_TABLES[t1Idx].status = 'RUNNING';
      // Keep tableNumber as original table1 (e.g. T-01)

      // Free table 2
      MOCK_TABLES[t2Idx].status = 'VACANT';
      MOCK_TABLES[t2Idx].runningAmount = 0;
      MOCK_TABLES[t2Idx].currentOrderId = null;
      MOCK_TABLES[t2Idx].seatedAt = null;
      MOCK_TABLES[t2Idx].guestName = undefined;

      // Merge mock order items if applicable
      const o1Id = MOCK_TABLES[t1Idx].currentOrderId;
      const o2Id = MOCK_TABLES[t2Idx].currentOrderId;
      if (o1Id && o2Id && o1Id !== o2Id) {
        const o1 = MOCK_ORDERS.find((o: any) => o.id === o1Id);
        const o2 = MOCK_ORDERS.find((o: any) => o.id === o2Id);
        if (o1 && o2) {
          o1.items = [...(o1.items || []), ...(o2.items || [])];
          o1.totalAmount = combinedAmount;
          o2.status = 'COMPLETED';
        }
      }
    }

    invalidateCache('tables:');
    invalidateCache('orders:');
    invalidateCache('pos:');

    return NextResponse.json({
      success: true,
      message: `Merged Table ${table1} and Table ${table2} into single bill (₹${combinedAmount})`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
