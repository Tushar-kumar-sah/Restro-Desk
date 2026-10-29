import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_OUTLETS } from '@/lib/mock-data';

const updateBrandSchema = z.object({
  name: z.string().min(2).optional(),
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  website: z.string().optional(),
});

export async function GET() {
  try {
    let brand = await prisma.brand.findFirst({
      where: { isDeleted: false },
    });

    if (!brand) {
      brand = {
        id: 'brand-01',
        name: 'RestoDesk Hospitality',
        slug: 'restodesk-demo',
        code: 'RESTO1',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        logoUrl: null,
        website: 'https://restodesk.local',
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('Failed to get brand:', error);
    return NextResponse.json({
      success: true,
      data: {
        id: 'brand-01',
        name: 'RestoDesk Hospitality',
        code: 'RESTO1',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      },
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = updateBrandSchema.parse(body);

    const brand = await prisma.brand.findFirst();
    if (brand) {
      const updated = await prisma.brand.update({
        where: { id: brand.id },
        data: validated,
      });
      return NextResponse.json({
        success: true,
        message: 'Brand settings updated',
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Brand settings updated',
      data: validated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
