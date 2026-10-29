import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { MOCK_COMBOS } from '@/lib/mock-data';

const createComboSchema = z.object({
  name: z.string().min(2, 'Combo name is required'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Price must be greater than 0'),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  itemIds: z.array(z.string()).min(1, 'Select at least 1 item for combo'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';

    let combos: any[] = [];
    try {
      const dbCombos = await prisma.combo.findMany({
        where: { brandId, isDeleted: false },
        include: { comboItems: { include: { item: true } } },
      });
      if (dbCombos.length > 0) combos = dbCombos;
    } catch (err) {
      // offline fallback
    }

    if (combos.length === 0) combos = MOCK_COMBOS;

    return NextResponse.json({ success: true, combos });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';

    const body = await req.json();
    const result = createComboSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { itemIds, ...comboData } = result.data;
    let createdCombo: any;

    try {
      createdCombo = await prisma.combo.create({
        data: {
          brandId,
          ...comboData,
          comboItems: {
            create: itemIds.map((itemId) => ({
              itemId,
              quantity: 1,
            })),
          },
        },
      });
    } catch (err) {
      createdCombo = {
        id: `cmb-${Date.now()}`,
        brandId,
        ...comboData,
        itemCount: itemIds.length,
      };
      MOCK_COMBOS.push(createdCombo);
    }

    return NextResponse.json({
      success: true,
      message: 'Combo deal created successfully',
      combo: createdCombo,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
