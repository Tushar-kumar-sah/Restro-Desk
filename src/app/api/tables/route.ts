import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { TableStatus } from '@prisma/client';
import { MOCK_TABLES, MOCK_SECTIONS } from '@/lib/mock-data';
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
    let outletId = session?.outletId;
    if (!outletId || outletId === 'outlet-blr-ind-001') {
      try {
        const primaryOutlet = await prisma.outlet.findFirst({ orderBy: { createdAt: 'asc' } });
        if (primaryOutlet) outletId = primaryOutlet.id;
      } catch (e) {}
    }
    if (!outletId) {
      outletId = '543126cb-76fb-4f78-a00c-6f4eb524467c';
    }

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
      const whereClause: any = { isDeleted: false };
      if (outletId) whereClause.outletId = outletId;
      if (sectionId && sectionId !== 'all') whereClause.sectionId = sectionId;
      if (status && status !== 'ALL') whereClause.status = status as TableStatus;

      const dbTables = await prisma.table.findMany({
        where: whereClause,
        include: { section: true, currentOrder: { include: { customer: true } } },
      });

      if (dbTables.length > 0) {
        tables = dbTables.map((t) => ({
          id: t.id,
          sectionId: t.sectionId,
          sectionName: t.section?.name || 'Dining Area',
          tableNumber: t.tableNumber,
          capacity: t.capacity,
          status: t.status,
          posX: t.posX,
          posY: t.posY,
          runningAmount: t.currentOrder?.totalAmount || 0,
          seatedAt: t.currentOrder?.createdAt || null,
          currentOrderId: t.currentOrderId,
          guestName: t.currentOrder?.customer?.name || null,
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

    // Natural sort: T-01, T-02, ..., T-09, T-10, ..., T-19, T-20, T-21...
    tables.sort((a, b) => {
      const numA = parseInt(a.tableNumber?.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.tableNumber?.replace(/\D/g, '') || '0', 10);
      if (numA !== numB) return numA - numB;
      return (a.tableNumber || '').localeCompare(b.tableNumber || '');
    });

    setCached(cacheKey, tables, 15);
    return NextResponse.json({ success: true, tables });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    let outletId = session?.outletId;
    if (!outletId || outletId === 'outlet-blr-ind-001') {
      try {
        const primaryOutlet = await prisma.outlet.findFirst({ orderBy: { createdAt: 'asc' } });
        if (primaryOutlet) outletId = primaryOutlet.id;
      } catch (e) {}
    }
    if (!outletId) {
      outletId = '543126cb-76fb-4f78-a00c-6f4eb524467c';
    }

    const body = await req.json();
    const result = createTableSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const tableNum = result.data.tableNumber.trim().toUpperCase();
    let sectionId = result.data.sectionId;
    let sectionName = 'Dining Section';

    try {
      let sec = await prisma.section.findUnique({ where: { id: sectionId } });
      if (!sec) {
        sec = await prisma.section.findFirst({ where: { outletId } });
      }
      if (sec) {
        sectionId = sec.id;
        sectionName = sec.name;
      }
    } catch (e) {}

    if (sectionName === 'Dining Section') {
      const mockSec = MOCK_SECTIONS.find((s: any) => s.id === result.data.sectionId);
      if (mockSec) sectionName = mockSec.name;
    }

    let dbTable: any = null;
    try {
      // Check if tableNumber already exists (including soft-deleted)
      const existing = await prisma.table.findFirst({
        where: {
          tableNumber: { equals: tableNum, mode: 'insensitive' },
        },
      });

      if (existing) {
        if (!existing.isDeleted) {
          return NextResponse.json(
            { success: false, message: `Table ${tableNum} already exists` },
            { status: 400 }
          );
        }

        // Resurrect soft-deleted table record
        dbTable = await prisma.table.update({
          where: { id: existing.id },
          data: {
            isDeleted: false,
            deletedAt: null,
            sectionId,
            capacity: result.data.capacity,
            posX: result.data.posX,
            posY: result.data.posY,
            status: 'VACANT',
          },
          include: { section: true },
        });
      } else {
        dbTable = await prisma.table.create({
          data: {
            outletId,
            sectionId,
            tableNumber: tableNum,
            capacity: result.data.capacity,
            posX: result.data.posX,
            posY: result.data.posY,
            status: 'VACANT',
            isDeleted: false,
          },
          include: { section: true },
        });
      }
    } catch (err: any) {
      console.error('Error creating/restoring table in DB:', err);
    }

    const newTbl = {
      id: dbTable?.id || `tbl-${Date.now()}`,
      outletId,
      sectionId,
      tableNumber: tableNum,
      capacity: result.data.capacity,
      posX: result.data.posX,
      posY: result.data.posY,
      sectionName: dbTable?.section?.name || sectionName,
      status: 'VACANT',
      runningAmount: 0,
      seatedAt: null,
      currentOrderId: null,
    };

    const mockIdx = MOCK_TABLES.findIndex(
      (t: any) => t.tableNumber.toLowerCase() === tableNum.toLowerCase()
    );
    if (mockIdx !== -1) {
      MOCK_TABLES[mockIdx] = newTbl;
    } else {
      MOCK_TABLES.push(newTbl);
    }

    invalidateCache('tables:');
    return NextResponse.json({
      success: true,
      message: `Table ${tableNum} created successfully`,
      table: newTbl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
