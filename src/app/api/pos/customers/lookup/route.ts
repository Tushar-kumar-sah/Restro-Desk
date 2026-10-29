import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cleanIndianPhone } from '@/lib/formatters';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number required' }, { status: 400 });
    }

    const clean = cleanIndianPhone(phone);
    let customer: any = null;

    try {
      customer = await prisma.customer.findFirst({
        where: { phone: { contains: clean } },
        include: { tier: true, wallet: true },
      });
    } catch (err) {
      // offline fallback
    }

    if (!customer) {
      customer = MOCK_CUSTOMERS.find((c) => c.phone.includes(clean) || clean.includes(c.phone));
    }

    if (!customer) {
      // Return fresh new guest template
      return NextResponse.json({
        success: true,
        isNew: true,
        customer: {
          name: 'New Guest',
          phone: clean,
          points: 0,
          walletBalance: 0,
          tier: 'Silver (New)',
          visits: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isNew: false,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        points: customer.points || customer.totalPoints || 0,
        walletBalance: customer.walletBalance || customer.wallet?.balance || 0,
        tier: customer.tier?.name || customer.tier || 'Silver Member',
        visits: customer.visits || customer.visitCount || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
