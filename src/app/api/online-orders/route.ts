import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getOnlineOrders,
  createDirectOnlineOrder,
  MOCK_ONLINE_ORDERS,
  MOCK_AGGREGATOR_STATUS,
} from '@/lib/mock-data';

const createOrderSchema = z.object({
  outletId: z.string().default('outlet-01'),
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  deliveryAddress: z.string().optional(),
  orderType: z.enum(['DELIVERY', 'TAKEAWAY', 'DINE_IN']).default('DELIVERY'),
  items: z.array(
    z.object({
      itemId: z.string(),
      itemName: z.string(),
      qty: z.number().int().min(1),
      price: z.number().min(0),
      variant: z.string().optional(),
      addOns: z.array(z.string()).optional(),
    })
  ).min(1, 'Order must contain at least one item'),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  deliveryFee: z.number().min(0).default(0),
  packagingFee: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
  paymentMethod: z.enum(['ONLINE_PREPAID', 'CASH_ON_DELIVERY', 'UPI_QR']).default('ONLINE_PREPAID'),
  kitchenNotes: z.string().optional(),
  tableId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || undefined;
    const status = searchParams.get('status') || undefined;
    const outletId = searchParams.get('outletId') || undefined;

    const orders = getOnlineOrders(channel, status, outletId);

    // Summary counts
    const newCount = MOCK_ONLINE_ORDERS.filter((o) => o.status === 'NEW').length;
    const preparingCount = MOCK_ONLINE_ORDERS.filter((o) => o.status === 'PREPARING').length;
    const readyCount = MOCK_ONLINE_ORDERS.filter((o) => o.status === 'READY').length;
    const outForDeliveryCount = MOCK_ONLINE_ORDERS.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
    const deliveredCount = MOCK_ONLINE_ORDERS.filter((o) => o.status === 'DELIVERED').length;

    const totalRevenue = MOCK_ONLINE_ORDERS.filter((o) => o.status !== 'CANCELLED').reduce(
      (acc, o) => acc + o.total,
      0
    );

    return NextResponse.json({
      success: true,
      data: orders,
      counts: {
        new: newCount,
        preparing: preparingCount,
        ready: readyCount,
        outForDelivery: outForDeliveryCount,
        delivered: deliveredCount,
        totalRevenue,
      },
      aggregatorStatus: MOCK_AGGREGATOR_STATUS,
    });
  } catch (error) {
    console.error('Failed to get online orders:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const newOrder = createDirectOnlineOrder({
      outletId: validated.outletId,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      deliveryAddress: validated.deliveryAddress,
      orderType: validated.orderType,
      items: validated.items,
      subtotal: validated.subtotal,
      tax: validated.tax,
      deliveryFee: validated.deliveryFee,
      packagingFee: validated.packagingFee,
      discount: validated.discount,
      total: validated.total,
      paymentMethod: validated.paymentMethod,
      kitchenNotes: validated.kitchenNotes,
      tableId: validated.tableId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully and routed to kitchen KDS',
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create online order:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
