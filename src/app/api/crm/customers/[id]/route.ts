import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_CUSTOMERS, MockCustomer } from '@/lib/mock-data';

const CustomerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().nullable(),
  birthday: z.string().optional().nullable(),
  anniversary: z.string().optional().nullable(),
  tierId: z.string().optional(),
  isBlocked: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  address: z
    .object({
      addressLine1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    let customer: any = null;

    try {
      customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          tier: true,
          wallet: true,
          tags: { include: { tag: true } },
          addresses: true,
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { item: true } } },
          },
          loyaltyTransactions: { take: 15, orderBy: { createdAt: 'desc' } },
          walletTransactions: { take: 15, orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (dbErr) {
      // fallback
    }

    if (customer) {
      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          brandId: customer.brandId,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          birthday: customer.birthday ? customer.birthday.toISOString().split('T')[0] : null,
          anniversary: customer.anniversary ? customer.anniversary.toISOString().split('T')[0] : null,
          tierId: customer.tierId,
          tierName: customer.tier?.name || 'Silver Member',
          walletBalance: customer.wallet?.balance || customer.walletBalance,
          totalPoints: customer.totalPoints,
          totalSpend: customer.totalSpend,
          visitCount: customer.visitCount,
          lastVisit: customer.lastVisit?.toISOString() || customer.createdAt.toISOString(),
          isBlocked: customer.isBlocked,
          notes: '',
          tags: customer.tags.map((t: any) => t.tag.name),
          address: {
            addressLine1: customer.addresses[0]?.addressLine1 || '',
            city: customer.addresses[0]?.city || '',
            state: customer.addresses[0]?.state || '',
            postalCode: customer.addresses[0]?.postalCode || '',
          },
          favoriteItems: [],
          recentOrders: customer.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            date: new Date(o.createdAt).toLocaleDateString('en-IN'),
            billAmount: o.totalAmount,
            status: o.status,
            paymentMode: 'CARD',
            itemsSummary: o.items.map((oi: any) => `${oi.item?.name || 'Item'} x${oi.quantity}`).join(', '),
          })),
          loyaltyLedger: customer.loyaltyTransactions.map((lt: any) => ({
            id: lt.id,
            date: new Date(lt.createdAt).toLocaleDateString('en-IN'),
            type: lt.type,
            points: lt.points,
            balanceAfter: lt.balanceAfter,
            reason: lt.reason || 'Loyalty activity',
          })),
          walletLedger: customer.walletTransactions.map((wt: any) => ({
            id: wt.id,
            date: new Date(wt.createdAt).toLocaleDateString('en-IN'),
            type: wt.type,
            amount: wt.amount,
            balanceAfter: wt.balanceAfter,
            referenceNote: wt.referenceNote || 'Wallet activity',
          })),
        },
      });
    }

    const mockCustomer = MOCK_CUSTOMERS.find((c) => c.id === id);
    if (!mockCustomer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: mockCustomer,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = CustomerUpdateSchema.parse(body);

    const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    if (validated.name !== undefined) customer.name = validated.name;
    if (validated.phone !== undefined) customer.phone = validated.phone;
    if (validated.email !== undefined) customer.email = validated.email;
    if (validated.birthday !== undefined) customer.birthday = validated.birthday;
    if (validated.anniversary !== undefined) customer.anniversary = validated.anniversary;
    if (validated.isBlocked !== undefined) customer.isBlocked = validated.isBlocked;
    if (validated.notes !== undefined) customer.notes = validated.notes;
    if (validated.tags !== undefined) customer.tags = validated.tags;
    if (validated.address !== undefined) {
      customer.address = {
        ...customer.address,
        ...validated.address,
      };
    }
    if (validated.tierId !== undefined) {
      customer.tierId = validated.tierId;
      customer.tierName =
        validated.tierId === 'tier-platinum'
          ? 'Platinum VIP'
          : validated.tierId === 'tier-gold'
          ? 'Gold Member'
          : 'Silver Member';
    }

    try {
      await prisma.customer.update({
        where: { id },
        data: {
          name: validated.name,
          phone: validated.phone,
          email: validated.email,
          birthday: validated.birthday ? new Date(validated.birthday) : undefined,
          anniversary: validated.anniversary ? new Date(validated.anniversary) : undefined,
          isBlocked: validated.isBlocked,
          tierId: validated.tierId,
        },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer,
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
    const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    MOCK_CUSTOMERS.splice(index, 1);

    try {
      await prisma.customer.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Customer removed successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
