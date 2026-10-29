import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  MOCK_ONLINE_ORDERS,
  acceptOnlineOrder,
  rejectOnlineOrder,
  updateOnlineOrderStatus,
} from '@/lib/mock-data';

const patchOrderSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT', 'STATUS_CHANGE']),
  prepTimeMinutes: z.number().int().min(5).max(120).optional(),
  rejectReason: z.string().optional(),
  status: z.enum(['NEW', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = MOCK_ONLINE_ORDERS.find((o) => o.id === params.id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Failed to get order:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = patchOrderSchema.parse(body);

    if (validated.action === 'ACCEPT') {
      const updated = acceptOnlineOrder(params.id, validated.prepTimeMinutes || 25);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Order accepted. Kitchen prep time set to ${validated.prepTimeMinutes || 25} mins. KOT dispatched.`,
        data: updated,
      });
    }

    if (validated.action === 'REJECT') {
      const updated = rejectOnlineOrder(params.id, validated.rejectReason || 'Kitchen at full capacity');
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: 'Order rejected and aggregator notified',
        data: updated,
      });
    }

    if (validated.action === 'STATUS_CHANGE' && validated.status) {
      const updated = updateOnlineOrderStatus(params.id, validated.status);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Order status updated to ${validated.status}`,
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to update online order:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
