import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_COUPONS } from '@/lib/mock-data';

const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
  billAmount: z.number().min(0, 'Bill amount must be positive'),
  customerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ValidateCouponSchema.parse(body);

    let coupon: any = null;

    try {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: validated.code,
          isActive: true,
          isDeleted: false,
        },
        include: { redemptions: true },
      });
    } catch (dbErr) {
      // offline fallback
    }

    if (!coupon) {
      coupon = MOCK_COUPONS.find(
        (c) => c.code.toUpperCase() === validated.code && c.isActive
      );
    }

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: `Invalid coupon code "${validated.code}"` },
        { status: 404 }
      );
    }

    // Check validity dates
    const todayStr = new Date().toISOString().split('T')[0];
    const validFromStr =
      coupon.validFrom instanceof Date
        ? coupon.validFrom.toISOString().split('T')[0]
        : coupon.validFrom;
    const validToStr =
      coupon.validTo instanceof Date
        ? coupon.validTo.toISOString().split('T')[0]
        : coupon.validTo;

    if (todayStr < validFromStr) {
      return NextResponse.json(
        { valid: false, message: `Coupon is not active yet (starts ${validFromStr})` },
        { status: 400 }
      );
    }

    if (todayStr > validToStr) {
      return NextResponse.json(
        { valid: false, message: `Coupon expired on ${validToStr}` },
        { status: 400 }
      );
    }

    // Check minimum bill
    if (validated.billAmount < coupon.minBillAmount) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum bill of ₹${coupon.minBillAmount.toFixed(
            2
          )} required to apply this coupon (Current: ₹${validated.billAmount.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // Check total usage limit
    if (coupon.usageLimitTotal && coupon.timesUsed >= coupon.usageLimitTotal) {
      return NextResponse.json(
        { valid: false, message: 'Coupon maximum total redemption limit reached' },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.couponType === 'FLAT_DISCOUNT') {
      discountAmount = Math.min(coupon.discountValue, validated.billAmount);
    } else if (coupon.couponType === 'PERCENTAGE') {
      const computed = (validated.billAmount * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscount ? Math.min(computed, coupon.maxDiscount) : computed;
    } else if (coupon.couponType === 'BOGO' || coupon.couponType === 'FREE_ITEM' || coupon.couponType === 'COMBO') {
      discountAmount = Math.min(coupon.discountValue, validated.billAmount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      message: `Coupon "${coupon.code}" applied! You save ₹${discountAmount.toFixed(2)}`,
      discountAmount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        couponType: coupon.couponType,
        isStackable: coupon.isStackable,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, message: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json({ valid: false, message: error.message }, { status: 500 });
  }
}
