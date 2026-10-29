import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_MENU_ITEMS } from '@/lib/mock-data';

const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  shortCode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  foodType: z.enum(['VEG', 'NON_VEG', 'EGG', 'BEVERAGE', 'OTHER']).optional(),
  basePrice: z.number().positive().optional(),
  hsnCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().optional(),
  categoryId: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let item: any = null;

    try {
      item = await prisma.item.findUnique({
        where: { id },
        include: {
          category: true,
          variants: { where: { isDeleted: false } },
          addonGroups: {
            where: { isDeleted: false },
            include: { addons: { where: { isDeleted: false } } },
          },
        },
      });
    } catch (err) {
      item = MOCK_MENU_ITEMS.find((i: any) => i.id === id);
    }

    if (!item) {
      item = MOCK_MENU_ITEMS.find((i: any) => i.id === id);
    }

    if (!item) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const result = updateItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    let updatedItem: any;
    try {
      updatedItem = await prisma.item.update({
        where: { id },
        data: result.data,
      });
    } catch (err) {
      const idx = MOCK_MENU_ITEMS.findIndex((i: any) => i.id === id);
      if (idx !== -1) {
        MOCK_MENU_ITEMS[idx] = { ...MOCK_MENU_ITEMS[idx], ...result.data };
        updatedItem = MOCK_MENU_ITEMS[idx];
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      item: updatedItem,
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
    try {
      await prisma.item.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (err) {
      const idx = MOCK_MENU_ITEMS.findIndex((i: any) => i.id === id);
      if (idx !== -1) {
        MOCK_MENU_ITEMS.splice(idx, 1);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
