import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_TABLES } from '@/lib/mock-data';

const updateTableSchema = z.object({
  tableNumber: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(['VACANT', 'RUNNING', 'BILLED', 'RESERVED']).optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  sectionId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const result = updateTableSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    let updatedTable: any = null;
    const idx = MOCK_TABLES.findIndex((t: any) => t.id === id || t.tableNumber === id);
    if (idx !== -1) {
      MOCK_TABLES[idx] = { ...MOCK_TABLES[idx], ...result.data };
      updatedTable = MOCK_TABLES[idx];
    }

    try {
      await prisma.table.update({
        where: { id },
        data: result.data as any,
      });
    } catch (err) {}

    return NextResponse.json({
      success: true,
      message: 'Table updated successfully',
      table: updatedTable,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const idx = MOCK_TABLES.findIndex((t: any) => t.id === id || t.tableNumber === id);
    if (idx !== -1) {
      MOCK_TABLES.splice(idx, 1);
    }

    try {
      await prisma.table.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (err) {}

    return NextResponse.json({ success: true, message: 'Table removed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
