import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_ORDERS } from '@/lib/mock-data';
import { formatCurrency, formatDateTime } from '@/lib/formatters';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const phone = body.phone || '';

    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    if (cleaned.length === 11 && cleaned.startsWith('0')) cleaned = '91' + cleaned.slice(1);

    if (cleaned.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // 1. Fetch order
    let order = MOCK_ORDERS.find((o: any) => o.id === id || o.orderNumber === id);
    if (!order) {
      try {
        order = await prisma.order.findUnique({
          where: { id },
          include: { items: true, outlet: true },
        }) as any;
      } catch (e) {}
    }

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const outletName = (order.outlet?.name || 'Indiranagar Flagship').toUpperCase();
    const dateStr = formatDateTime(order.createdAt || new Date());
    let itemsList = '';
    (order.items || []).forEach((item: any, i: number) => {
      const total = item.totalPrice || item.subtotal || item.unitPrice * item.quantity;
      itemsList += `${i + 1}. *${item.name}* x ${item.quantity} = ₹${total}\n`;
    });

    const messageText = `🧾 *RESTODESK - ${outletName}*
━━━━━━━━━━━━━━━━━━━━
*DIGITAL TAX INVOICE*
*Bill No:* ${order.orderNumber}
*Date:* ${dateStr}
*Table:* ${order.tableNumber || 'Takeaway'} | *Type:* ${order.orderType || 'Dine-In'}
*Guest:* ${order.customerName || 'Valued Guest'}
━━━━━━━━━━━━━━━━━━━━
*ITEMS ORDERED:*
${itemsList}━━━━━━━━━━━━━━━━━━━━
*Sub Total:* ${formatCurrency(order.subtotal)}
*CGST (2.5%):* ${formatCurrency(order.cgstAmount)}
*SGST (2.5%):* ${formatCurrency(order.sgstAmount)}
*NET PAYABLE: ${formatCurrency(order.totalAmount)}*
*Payment Mode:* ${order.paymentMethod || 'CASH'}
━━━━━━━━━━━━━━━━━━━━
🙏 *Thank You for dining with us!*

⭐ *Rate your dining experience:*
https://restro-desk.vercel.app/review/${order.orderNumber || ''}`;

    // 2. Check if Official Meta WhatsApp Cloud API credentials exist
    const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_CLOUD_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    let apiDelivered = false;
    let providerResponse = 'wa.me deep-link prepared';

    if (token && phoneId) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleaned,
            type: 'text',
            text: { preview_url: true, body: messageText },
          }),
        });

        const metaData = await metaRes.json();
        if (metaRes.ok && metaData.messages) {
          apiDelivered = true;
          providerResponse = `Meta Cloud API ID: ${metaData.messages[0]?.id}`;
        } else {
          providerResponse = `Meta API error: ${JSON.stringify(metaData.error || metaData)}`;
        }
      } catch (err: any) {
        providerResponse = `Meta API call failed: ${err.message}`;
      }
    }

    const waMeUrl = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(messageText)}`;

    return NextResponse.json({
      success: true,
      message: apiDelivered
        ? `WhatsApp e-bill dispatched automatically via Cloud API to +${cleaned}`
        : `WhatsApp e-bill ready for +${cleaned}`,
      deliveredViaApi: apiDelivered,
      providerResponse,
      waMeUrl,
      recipient: `+${cleaned}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
