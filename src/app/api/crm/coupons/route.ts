import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_COUPONS, MockCoupon } from '@/lib/mock-data';

const CouponCreateSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .toUpperCase()
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code must be alphanumeric'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional().default(''),
  couponType: z.enum(['FLAT_DISCOUNT', 'PERCENTAGE', 'FREE_ITEM', 'BOGO', 'COMBO']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  maxDiscount: z.number().positive().optional().nullable(),
  minBillAmount: z.number().min(0).default(0),
  validFrom: z.string(),
  validTo: z.string(),
  usageLimitTotal: z.number().int().positive().optional().nullable(),
  usageLimitPerCustomer: z.number().int().positive().default(1),
  isStackable: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toUpperCase().trim() || '';
    const type = searchParams.get('type') || 'ALL';
    const status = searchParams.get('status') || 'ALL'; // ALL | ACTIVE | EXPIRED

    let coupons: MockCoupon[] = [];

    try {
      const dbCoupons = await prisma.coupon.findMany({
        where: { isDeleted: false },
        include: { redemptions: true },
        orderBy: { createdAt: 'desc' },
      });

      if (dbCoupons && dbCoupons.length > 0) {
        coupons = dbCoupons.map((c) => ({
          id: c.id,
          brandId: c.brandId,
          code: c.code,
          title: c.title,
          description: c.description || '',
          couponType: c.couponType as any,
          discountValue: c.discountValue,
          maxDiscount: c.maxDiscount || undefined,
          minBillAmount: c.minBillAmount,
          validFrom: c.validFrom.toISOString().split('T')[0],
          validTo: c.validTo.toISOString().split('T')[0],
          usageLimitTotal: c.usageLimitTotal || undefined,
          usageLimitPerCustomer: c.usageLimitPerCustomer || 1,
          timesUsed: c.timesUsed || c.redemptions.length,
          revenueInfluenced: c.redemptions.reduce((acc, r) => acc + (r.discountApplied * 4.5), 0),
          isStackable: c.isStackable,
          isActive: c.isActive,
        }));
      }
    } catch (dbErr) {
      // offline fallback
    }

    if (coupons.length === 0) {
      coupons = [...MOCK_COUPONS];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = coupons.filter((c) => {
      if (search && !c.code.includes(search) && !c.title.toUpperCase().includes(search)) {
        return false;
      }
      if (type !== 'ALL' && c.couponType !== type) {
        return false;
      }
      if (status === 'ACTIVE') {
        if (!c.isActive || c.validTo < todayStr) return false;
      } else if (status === 'EXPIRED') {
        if (c.validTo >= todayStr && c.isActive) return false;
      }
      return true;
    });

    // Overview metrics
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.isActive && c.validTo >= todayStr).length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + c.timesUsed, 0);
    const totalRevenueInfluenced = coupons.reduce((acc, c) => acc + c.revenueInfluenced, 0);
    const estimatedTotalDiscountGiven = coupons.reduce(
      (acc, c) => acc + c.timesUsed * (c.couponType === 'PERCENTAGE' ? 180 : c.discountValue),
      0
    );

    return NextResponse.json({
      success: true,
      coupons: filtered,
      totalCount: filtered.length,
      metrics: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalRevenueInfluenced,
        estimatedTotalDiscountGiven,
        roiMultiplier:
          estimatedTotalDiscountGiven > 0
            ? (totalRevenueInfluenced / estimatedTotalDiscountGiven).toFixed(1) + 'x'
            : 'N/A',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CouponCreateSchema.parse(body);

    const existing = MOCK_COUPONS.find((c) => c.code === validated.code);
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Coupon with code "${validated.code}" already exists` },
        { status: 400 }
      );
    }

    const newCoupon: MockCoupon = {
      id: `cpn-${Date.now()}`,
      brandId: 'brand-restodesk-001',
      code: validated.code,
      title: validated.title.trim(),
      description: validated.description || '',
      couponType: validated.couponType,
      discountValue: validated.discountValue,
      maxDiscount: validated.maxDiscount || undefined,
      minBillAmount: validated.minBillAmount,
      validFrom: validated.validFrom,
      validTo: validated.validTo,
      usageLimitTotal: validated.usageLimitTotal || undefined,
      usageLimitPerCustomer: validated.usageLimitPerCustomer,
      timesUsed: 0,
      revenueInfluenced: 0,
      isStackable: validated.isStackable,
      isActive: validated.isActive,
    };

    try {
      await prisma.coupon.create({
        data: {
          brandId: 'brand-restodesk-001',
          code: newCoupon.code,
          title: newCoupon.title,
          description: newCoupon.description,
          couponType: newCoupon.couponType,
          discountValue: newCoupon.discountValue,
          maxDiscount: newCoupon.maxDiscount,
          minBillAmount: newCoupon.minBillAmount,
          validFrom: new Date(newCoupon.validFrom),
          validTo: new Date(newCoupon.validTo),
          usageLimitTotal: newCoupon.usageLimitTotal,
          usageLimitPerCustomer: newCoupon.usageLimitPerCustomer,
          isStackable: newCoupon.isStackable,
          isActive: newCoupon.isActive,
        },
      });
    } catch (dbErr) {
      // offline fallback
    }

    MOCK_COUPONS.unshift(newCoupon);

    return NextResponse.json({
      success: true,
      message: `Coupon ${newCoupon.code} created successfully`,
      coupon: newCoupon,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
