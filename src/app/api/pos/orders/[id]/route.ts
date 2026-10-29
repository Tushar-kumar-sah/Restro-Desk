import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_ORDERS } from '@/lib/mock-data';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let order: any = null;

    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: { include: { addons: true } },
          kots: true,
          table: true,
          customer: true,
          payments: true,
        },
      });
    } catch (err) {}

    if (!order) {
      order = MOCK_ORDERS.find((o: any) => o.id === id || o.orderNumber === id);
    }

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    let updatedOrder: any;
    try {
      updatedOrder = await prisma.order.update({
        where: { id },
        data: body,
      });
    } catch (err) {
      const idx = MOCK_ORDERS.findIndex((o: any) => o.id === id || o.orderNumber === id);
      if (idx !== -1) {
        MOCK_ORDERS[idx] = { ...MOCK_ORDERS[idx], ...body, updatedAt: new Date() };
        updatedOrder = MOCK_ORDERS[idx];
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
