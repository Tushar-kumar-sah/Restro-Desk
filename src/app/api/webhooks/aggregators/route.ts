import { NextRequest, NextResponse } from 'next/server';
import { createDirectOnlineOrder } from '@/lib/mock-data';

/**
 * Universal Inbound Webhook Handler for Zomato, Swiggy, and UrbanPiper orders.
 * Endpoint: POST /api/webhooks/aggregators
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 1. Determine Aggregator Channel & IDs
    const channel = (payload.channel || payload.aggregator || 'ZOMATO').toUpperCase();
    const aggregatorOrderId = payload.order_id || payload.aggregator_order_id || `AGG-${Date.now().toString().slice(-6)}`;
    const outletId = payload.outlet_id || 'outlet-01';

    // 2. Map Aggregator Items into RestoDesk Order Structure
    const items = (payload.items || []).map((it: any) => ({
      itemId: it.item_id || it.id || 'item-01',
      itemName: it.name || it.item_name || 'Special Dish',
      qty: Number(it.quantity || it.qty || 1),
      price: Number(it.price || it.unit_price || 350),
      variant: it.variant_title || it.variant,
      addOns: it.add_ons || [],
    }));

    // Fallback item if testing empty payload
    if (items.length === 0) {
      items.push({
        itemId: 'item-01',
        itemName: 'Butter Chicken Old Delhi Style',
        qty: 1,
        price: 420,
      });
    }

    const subtotal = items.reduce((acc: number, it: any) => acc + it.price * it.qty, 0);
    const tax = Number((subtotal * 0.05).toFixed(2));
    const packagingFee = Number(payload.packaging_fee || 35);
    const total = subtotal + tax + packagingFee;

    // 3. Create the Order in RestoDesk and route to Kitchen KDS
    const newOrder = createDirectOnlineOrder({
      outletId,
      customerName: payload.customer?.name || `${channel} Guest`,
      customerPhone: payload.customer?.phone || '+919876543210',
      deliveryAddress: payload.delivery_address?.full_address || payload.delivery_address || 'Address provided via aggregator',
      orderType: 'DELIVERY',
      items,
      subtotal,
      tax,
      deliveryFee: 0,
      packagingFee,
      discount: 0,
      total,
      paymentMethod: 'ONLINE_PREPAID',
      kitchenNotes: payload.special_instructions || payload.kitchen_notes || `Ingested via ${channel} Webhook`,
    });

    // 4. Return instant acknowledgment to Aggregator (required within 3 seconds)
    return NextResponse.json({
      success: true,
      status: 'acknowledged',
      message: `Order received and dispatched to kitchen KDS`,
      pos_order_id: newOrder.orderNumber,
      estimated_prep_time_minutes: 25,
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to process aggregator webhook:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
