import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { TableStatus } from '@prisma/client';
import { MOCK_TABLES } from '@/lib/mock-data';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

const createTableSchema = z.object({
  outletId: z.string().optional(),
  sectionId: z.string().min(1, 'Section is required'),
  tableNumber: z.string().min(1, 'Table number is required'),
  capacity: z.number().int().positive().default(4),
  posX: z.number().default(0),
  posY: z.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const outletId = session?.outletId || 'outlet-blr-ind-001';

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const status = searchParams.get('status');

    const cacheKey = `tables:${outletId}:${sectionId || 'all'}:${status || 'all'}`;
    const cachedTables = getCached<any[]>(cacheKey);
    if (cachedTables) {
      return NextResponse.json({ success: true, tables: cachedTables });
    }

    let tables: any[] = [];
    try {
      const whereClause: any = { outletId, isDeleted: false };
      if (sectionId && sectionId !== 'all') whereClause.sectionId = sectionId;
      if (status && status !== 'ALL') whereClause.status = status as TableStatus;

      const dbTables = await prisma.table.findMany({
        where: whereClause,
        include: { section: true, currentOrder: true },
        orderBy: { tableNumber: 'asc' },
      });

      if (dbTables.length > 0) {
        tables = dbTables.map((t) => ({
          id: t.id,
          sectionId: t.sectionId,
          sectionName: t.section.name,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
          status: t.status,
          posX: t.posX,
          posY: t.posY,
          runningAmount: t.currentOrder?.totalAmount || 0,
          seatedAt: t.currentOrder?.createdAt || null,
          currentOrderId: t.currentOrderId,
        }));
      }
    } catch (err) {}

    if (tables.length === 0) {
      let filtered = [...MOCK_TABLES];
      if (sectionId && sectionId !== 'all') {
        filtered = filtered.filter((t) => t.sectionId === sectionId);
      }
      if (status && status !== 'ALL') {
        filtered = filtered.filter((t) => t.status === status);
      }
      tables = filtered;
    }

    setCached(cacheKey, tables, 15);
    return NextResponse.json({ success: true, tables });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const outletId = session?.outletId || 'outlet-blr-ind-001';

    const body = await req.json();
    const result = createTableSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const newTbl = {
      id: `tbl-${Date.now()}`,
      outletId,
      ...result.data,
      status: 'VACANT',
      runningAmount: 0,
      seatedAt: null,
      currentOrderId: null,
    };

    MOCK_TABLES.push(newTbl);

    try {
      await prisma.table.create({
        data: {
          outletId,
          sectionId: result.data.sectionId,
          tableNumber: result.data.tableNumber,
          capacity: result.data.capacity,
          posX: result.data.posX,
          posY: result.data.posY,
          status: 'VACANT',
        },
      });
    } catch (err) {}

    invalidateCache('tables:');
    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      table: newTbl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
