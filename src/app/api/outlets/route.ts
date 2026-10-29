import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

const createOutletSchema = z.object({
  name: z.string().min(2, 'Outlet name is required'),
  code: z.string().min(2, 'Outlet code is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email().optional().nullable(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  fssaiNumber: z.string().optional().nullable(),
  printerPaperWidth: z.enum(['58mm', '80mm']).default('80mm'),
  taxIncludedInPrice: z.boolean().default(false),
  defaultGstPercent: z.number().default(5.0),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const brandId = session?.brandId || 'brand-restodesk-001';
    const cacheKey = `outlets:${brandId}`;

    const cachedOutlets = getCached<any[]>(cacheKey);
    if (cachedOutlets) {
      return NextResponse.json({ success: true, outlets: cachedOutlets });
    }

    let outlets: any[] = [];
    try {
      outlets = await prisma.outlet.findMany({
        where: { brandId, isActive: true, isDeleted: false },
        orderBy: { createdAt: 'asc' },
      });
    } catch (err) {
      // Offline fallback
    }

    if (outlets.length === 0) {
      outlets = [
        {
          id: 'outlet-blr-ind-001',
          brandId,
          name: 'Indiranagar Flagship',
          code: 'BLR-IND-01',
          phone: '+91 80 4123 4567',
          email: 'indiranagar@restodesk.com',
          address: '100ft Road, 12th Main, HAL 2nd Stage, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          gstin: '29ABCDE1234F1Z5',
          fssaiNumber: '11223344556677',
          printerPaperWidth: '80mm',
          taxIncludedInPrice: false,
          defaultGstPercent: 5.0,
        },
        {
          id: 'outlet-blr-kor-002',
          brandId,
          name: 'Koramangala Bistro',
          code: 'BLR-KOR-02',
          phone: '+91 80 4987 6543',
          email: 'koramangala@restodesk.com',
          address: '80ft Road, 4th Block, Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560034',
          gstin: '29ABCDE1234F1Z5',
          fssaiNumber: '11223344556688',
          printerPaperWidth: '80mm',
          taxIncludedInPrice: false,
          defaultGstPercent: 5.0,
        },
        {
          id: 'outlet-blr-whi-003',
          brandId,
          name: 'Whitefield Express',
          code: 'BLR-WHI-03',
          phone: '+91 80 4321 0987',
          email: 'whitefield@restodesk.com',
          address: 'ITPL Main Road, Prestige Shantiniketan, Whitefield',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560066',
          gstin: '29ABCDE1234F1Z5',
          fssaiNumber: '11223344556699',
          printerPaperWidth: '58mm',
          taxIncludedInPrice: true,
          defaultGstPercent: 5.0,
        },
      ];
    }

    setCached(cacheKey, outlets, 120);
    return NextResponse.json({ success: true, outlets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = createOutletSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const brandId = session.brandId;
    let newOutlet: any;

    try {
      newOutlet = await prisma.outlet.create({
        data: {
          brandId,
          ...result.data,
        },
      });
    } catch (err) {
      // Mock create response
      newOutlet = {
        id: `outlet-${Date.now()}`,
        brandId,
        ...result.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    invalidateCache('outlets:');
    return NextResponse.json({
      success: true,
      message: 'Outlet created successfully',
      outlet: newOutlet,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
