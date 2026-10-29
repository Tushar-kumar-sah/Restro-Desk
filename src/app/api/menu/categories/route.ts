import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
  imageUrl: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';
    const cacheKey = `categories:${brandId}`;

    const cachedCats = getCached<any[]>(cacheKey);
    if (cachedCats) {
      return NextResponse.json({ success: true, categories: cachedCats });
    }

    let categories: any[] = [];
    try {
      const dbCategories = await prisma.category.findMany({
        where: { brandId, isDeleted: false },
        include: {
          _count: {
            select: { items: { where: { isDeleted: false } } },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      if (dbCategories.length > 0) {
        categories = dbCategories.map((c) => ({
          id: c.id,
          brandId: c.brandId,
          name: c.name,
          description: c.description,
          sortOrder: c.sortOrder,
          imageUrl: c.imageUrl,
          isActive: c.isActive,
          itemCount: c._count.items,
        }));
      }
    } catch (err) {
      // Prisma offline fallback
    }

    if (categories.length === 0) {
      categories = MOCK_CATEGORIES;
    }

    setCached(cacheKey, categories, 180);
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';

    const body = await req.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    let createdCategory: any;
    try {
      createdCategory = await prisma.category.create({
        data: {
          brandId,
          ...result.data,
        },
      });
    } catch (err) {
      createdCategory = {
        id: `cat-${Date.now()}`,
        brandId,
        ...result.data,
        isActive: true,
        itemCount: 0,
      };
      MOCK_CATEGORIES.push(createdCategory);
    }

    invalidateCache('categories:');
    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: createdCategory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
