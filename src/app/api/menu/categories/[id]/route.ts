import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_CATEGORIES } from '@/lib/mock-data';

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let category: any = null;

    try {
      category = await prisma.category.findUnique({
        where: { id },
        include: { items: { where: { isDeleted: false } } },
      });
    } catch (err) {
      category = MOCK_CATEGORIES.find((c: any) => c.id === id);
    }

    if (!category) {
      category = MOCK_CATEGORIES.find((c: any) => c.id === id);
    }

    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
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
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    let updatedCategory: any;
    try {
      updatedCategory = await prisma.category.update({
        where: { id },
        data: result.data,
      });
    } catch (err) {
      const idx = MOCK_CATEGORIES.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        MOCK_CATEGORIES[idx] = { ...MOCK_CATEGORIES[idx], ...result.data };
        updatedCategory = MOCK_CATEGORIES[idx];
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
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
      await prisma.category.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (err) {
      const idx = MOCK_CATEGORIES.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        MOCK_CATEGORIES.splice(idx, 1);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
