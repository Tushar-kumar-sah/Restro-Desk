import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_COUPONS } from '@/lib/mock-data';

const CouponUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  couponType: z.enum(['FLAT_DISCOUNT', 'PERCENTAGE', 'FREE_ITEM', 'BOGO', 'COMBO']).optional(),
  discountValue: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional().nullable(),
  minBillAmount: z.number().min(0).optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  usageLimitTotal: z.number().int().positive().optional().nullable(),
  usageLimitPerCustomer: z.number().int().positive().optional(),
  isStackable: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = CouponUpdateSchema.parse(body);

    const coupon = MOCK_COUPONS.find((c) => c.id === id);
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    if (validated.title !== undefined) coupon.title = validated.title;
    if (validated.description !== undefined) coupon.description = validated.description;
    if (validated.couponType !== undefined) coupon.couponType = validated.couponType;
    if (validated.discountValue !== undefined) coupon.discountValue = validated.discountValue;
    if (validated.maxDiscount !== undefined) coupon.maxDiscount = validated.maxDiscount || undefined;
    if (validated.minBillAmount !== undefined) coupon.minBillAmount = validated.minBillAmount;
    if (validated.validFrom !== undefined) coupon.validFrom = validated.validFrom;
    if (validated.validTo !== undefined) coupon.validTo = validated.validTo;
    if (validated.usageLimitTotal !== undefined)
      coupon.usageLimitTotal = validated.usageLimitTotal || undefined;
    if (validated.usageLimitPerCustomer !== undefined)
      coupon.usageLimitPerCustomer = validated.usageLimitPerCustomer;
    if (validated.isStackable !== undefined) coupon.isStackable = validated.isStackable;
    if (validated.isActive !== undefined) coupon.isActive = validated.isActive;

    try {
      await prisma.coupon.update({
        where: { id },
        data: {
          title: validated.title,
          description: validated.description,
          couponType: validated.couponType,
          discountValue: validated.discountValue,
          maxDiscount: validated.maxDiscount,
          minBillAmount: validated.minBillAmount,
          validFrom: validated.validFrom ? new Date(validated.validFrom) : undefined,
          validTo: validated.validTo ? new Date(validated.validTo) : undefined,
          usageLimitTotal: validated.usageLimitTotal,
          usageLimitPerCustomer: validated.usageLimitPerCustomer,
          isStackable: validated.isStackable,
          isActive: validated.isActive,
        },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const index = MOCK_COUPONS.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    MOCK_COUPONS.splice(index, 1);

    try {
      await prisma.coupon.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
