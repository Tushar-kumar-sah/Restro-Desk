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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, newAddon } = body;

    if (!groupId || !newAddon || !newAddon.name) {
      return NextResponse.json(
        { success: false, message: 'groupId and valid addon name required' },
        { status: 400 }
      );
    }

    let createdAddon: any = null;
    try {
      createdAddon = await prisma.addon.create({
        data: {
          addonGroupId: groupId,
          name: newAddon.name.trim(),
          price: Number(newAddon.price) || 0,
          isVeg: newAddon.isVeg ?? true,
        },
      });
    } catch (err) {
      createdAddon = {
        id: `add-${Date.now()}`,
        addonGroupId: groupId,
        name: newAddon.name.trim(),
        price: Number(newAddon.price) || 0,
        isVeg: newAddon.isVeg ?? true,
      };
    }

    // Update in-memory MOCK_ADDON_GROUPS
    const grp = MOCK_ADDON_GROUPS.find((g: any) => g.id === groupId);
    if (grp) {
      if (!grp.addons) grp.addons = [];
      grp.addons.push(createdAddon);
    }

    return NextResponse.json({
      success: true,
      message: `Option "${newAddon.name}" added successfully`,
      addon: createdAddon,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let addonId = searchParams.get('addonId');
    let groupId = searchParams.get('groupId');

    if (!addonId && !groupId) {
      try {
        const body = await req.json();
        addonId = body.addonId;
        groupId = body.groupId;
      } catch (e) {}
    }

    if (!addonId && !groupId) {
      return NextResponse.json(
        { success: false, message: 'addonId or groupId required' },
        { status: 400 }
      );
    }

    // 1. Delete individual addon item
    if (addonId) {
      try {
        await prisma.addon.update({
          where: { id: addonId },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      } catch (err) {
        // DB fallback
      }

      // Update in-memory MOCK_ADDON_GROUPS
      for (const grp of MOCK_ADDON_GROUPS) {
        if (grp.addons) {
          grp.addons = grp.addons.filter((a: any) => a.id !== addonId);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Modifier option removed successfully',
      });
    }

    // 2. Delete entire modifier group
    if (groupId) {
      try {
        await prisma.addonGroup.update({
          where: { id: groupId },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      } catch (err) {
        // DB fallback
      }

      // Update in-memory MOCK_ADDON_GROUPS
      const idx = MOCK_ADDON_GROUPS.findIndex((g: any) => g.id === groupId);
      if (idx !== -1) {
        MOCK_ADDON_GROUPS.splice(idx, 1);
      }

      return NextResponse.json({
        success: true,
        message: 'Modifier group deleted successfully',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
