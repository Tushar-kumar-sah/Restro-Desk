import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assignDeliveryBoy } from '@/lib/mock-data';

const assignSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  deliveryBoyId: z.string().optional(),
  riderId: z.string().optional(),
  driverId: z.string().optional(),
}).transform((val) => ({
  orderId: val.orderId,
  deliveryBoyId: val.deliveryBoyId || val.riderId || val.driverId || 'db-01',
}));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = assignSchema.parse(body);

    const updatedOrder = assignDeliveryBoy(validated.orderId, validated.deliveryBoyId);
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Could not assign delivery agent. Invalid order or driver ID.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Assigned ${updatedOrder.deliveryBoyName} to Order #${updatedOrder.orderNumber}. Status moved to Out for Delivery.`,
      data: updatedOrder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to assign driver:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
