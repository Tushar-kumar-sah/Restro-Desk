import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { MOCK_SECTIONS } from '@/lib/mock-data';

const createSectionSchema = z.object({
  outletId: z.string().optional(),
  name: z.string().min(2, 'Section name is required'),
  floorNumber: z.number().default(1),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const outletId = session?.outletId || 'outlet-blr-ind-001';

    let sections: any[] = [];
    try {
      const dbSections = await prisma.section.findMany({
        where: { outletId, isDeleted: false },
        include: { _count: { select: { tables: { where: { isDeleted: false } } } } },
      });
      if (dbSections.length > 0) {
        sections = dbSections.map((s) => ({
          id: s.id,
          name: s.name,
          floorNumber: s.floorNumber,
          tableCount: s._count.tables,
        }));
      }
    } catch (err) {}

    if (sections.length === 0) sections = MOCK_SECTIONS;

    return NextResponse.json({ success: true, sections });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const outletId = session?.outletId || 'outlet-blr-ind-001';

    const body = await req.json();
    const result = createSectionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const newSec = {
      id: `sec-${Date.now()}`,
      outletId,
      name: result.data.name,
      floorNumber: result.data.floorNumber,
      tableCount: 0,
    };

    MOCK_SECTIONS.push(newSec);

    try {
      await prisma.section.create({
        data: {
          outletId,
          name: result.data.name,
          floorNumber: result.data.floorNumber,
        },
      });
    } catch (err) {}

    return NextResponse.json({
      success: true,
      message: 'Section created successfully',
      section: newSec,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
