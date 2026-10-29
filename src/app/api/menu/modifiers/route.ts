import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { MOCK_ADDON_GROUPS } from '@/lib/mock-data';

const createAddonGroupSchema = z.object({
  name: z.string().min(2, 'Group name is required'),
  minSelect: z.number().default(0),
  maxSelect: z.number().default(1),
  isRequired: z.boolean().default(false),
  addons: z.array(
    z.object({
      name: z.string().min(1),
      price: z.number().default(0),
      isVeg: z.boolean().default(true),
    })
  ),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';

    let groups: any[] = [];
    try {
      const dbGroups = await prisma.addonGroup.findMany({
        where: { brandId, isDeleted: false },
        include: { addons: { where: { isDeleted: false } } },
      });
      if (dbGroups.length > 0) groups = dbGroups;
    } catch (err) {
      // offline fallback
    }

    if (groups.length === 0) groups = MOCK_ADDON_GROUPS;

    return NextResponse.json({ success: true, groups });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';

    const body = await req.json();
    const result = createAddonGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { addons, ...groupData } = result.data;
    let createdGroup: any;

    try {
      createdGroup = await prisma.addonGroup.create({
        data: {
          brandId,
          ...groupData,
          addons: {
            create: addons.map((a) => ({
              name: a.name,
              price: a.price,
              isVeg: a.isVeg,
            })),
          },
        },
        include: { addons: true },
      });
    } catch (err) {
      createdGroup = {
        id: `grp-${Date.now()}`,
        brandId,
        ...groupData,
        addons: addons.map((a, i) => ({
          id: `add-${Date.now()}-${i}`,
          ...a,
        })),
      };
      MOCK_ADDON_GROUPS.push(createdGroup);
    }

    return NextResponse.json({
      success: true,
      message: 'Modifier group created successfully',
      group: createdGroup,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
