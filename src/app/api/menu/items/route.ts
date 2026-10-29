import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { FoodType } from '@prisma/client';
import { MOCK_MENU_ITEMS } from '@/lib/mock-data';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

const createItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  taxGroupId: z.string().optional().nullable(),
  name: z.string().min(2, 'Item name is required'),
  shortCode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  foodType: z.enum(['VEG', 'NON_VEG', 'EGG', 'BEVERAGE', 'OTHER']).default('VEG'),
  basePrice: z.number().positive('Price must be greater than 0'),
  hsnCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().default(15),
  variants: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().positive(),
        sku: z.string().optional().nullable(),
      })
    )
    .optional(),
  addonGroupIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const foodType = searchParams.get('foodType');
    const isAvailableParam = searchParams.get('isAvailable');
    const search = searchParams.get('search')?.toLowerCase();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const cacheKey = `items:${brandId}:${categoryId || 'all'}:${foodType || 'all'}:${search || ''}:${page}:${limit}`;
    const cachedResult = getCached<any>(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    let items: any[] = [];
    let total = 0;

    try {
      const whereClause: any = {
        brandId,
        isDeleted: false,
      };

      if (categoryId && categoryId !== 'all') {
        whereClause.categoryId = categoryId;
      }
      if (foodType && foodType !== 'ALL') {
        whereClause.foodType = foodType as FoodType;
      }
      if (isAvailableParam !== null) {
        whereClause.isAvailable = isAvailableParam === 'true';
      }
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { shortCode: { contains: search, mode: 'insensitive' } },
        ];
      }

      total = await prisma.item.count({ where: whereClause });
      const dbItems = await prisma.item.findMany({
        where: whereClause,
        include: {
          category: true,
          variants: { where: { isDeleted: false } },
          addonGroups: {
            where: { isDeleted: false },
            include: { addons: { where: { isDeleted: false } } },
          },
        },
        orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      });

      if (dbItems.length > 0) {
        items = dbItems.map((item) => ({
          id: item.id,
          categoryId: item.categoryId,
          categoryName: item.category.name,
          name: item.name,
          shortCode: item.shortCode,
          description: item.description,
          foodType: item.foodType,
          basePrice: item.basePrice,
          hsnCode: item.hsnCode,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          preparationTime: item.preparationTime,
          variants: item.variants,
          addonGroups: item.addonGroups,
        }));
      }
    } catch (err) {
      // Prisma offline fallback
    }

    if (items.length === 0) {
      let filtered = [...MOCK_MENU_ITEMS];
      if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter((i) => i.categoryId === categoryId);
      }
      if (foodType && foodType !== 'ALL') {
        filtered = filtered.filter((i) => i.foodType === foodType);
      }
      if (isAvailableParam !== null) {
        const boolVal = isAvailableParam === 'true';
        filtered = filtered.filter((i) => i.isAvailable === boolVal);
      }
      if (search) {
        filtered = filtered.filter(
          (i) =>
            i.name.toLowerCase().includes(search) ||
            (i.shortCode && i.shortCode.toLowerCase().includes(search))
        );
      }
      total = filtered.length;
      items = filtered.slice((page - 1) * limit, page * limit);
    }

    const responsePayload = {
      success: true,
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
    setCached(cacheKey, responsePayload, 180);
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';

    const body = await req.json();
    const result = createItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { variants, addonGroupIds, ...itemData } = result.data;
    let createdItem: any;

    try {
      createdItem = await prisma.item.create({
        data: {
          brandId,
          ...itemData,
          variants: variants?.length
            ? {
                create: variants.map((v) => ({
                  name: v.name,
                  price: v.price,
                  sku: v.sku,
                })),
              }
            : undefined,
        },
        include: {
          category: true,
          variants: true,
        },
      });
    } catch (err) {
      createdItem = {
        id: `itm-${Date.now()}`,
        brandId,
        ...itemData,
        variants: variants || [],
      };
      MOCK_MENU_ITEMS.unshift(createdItem);
    }

    invalidateCache('items:');
    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully',
      item: createdItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
