import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCampaigns, createCampaign, MOCK_CAMPAIGNS } from '@/lib/mock-data';
import { activeMessagingAdapter } from '@/lib/messaging';

const createCampaignSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']),
  segmentId: z.string().optional(),
  segmentName: z.string().optional(),
  templateId: z.string().optional(),
  templateName: z.string().optional(),
  couponId: z.string().optional(),
  couponCode: z.string().optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'CANCELLED']).default('COMPLETED'),
  totalRecipients: z.number().int().min(1).default(100),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || undefined;
    const status = searchParams.get('status') || undefined;

    const campaigns = getCampaigns(channel, status);
    const credits = await activeMessagingAdapter.getCredits();

    // Summary calculations
    const totalSent = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.sentCount, 0);
    const totalDelivered = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.deliveredCount, 0);
    const totalRead = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.readCount, 0);
    const totalConversions = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.convertedCount, 0);
    const totalRevenueAttributed = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.revenueAttributed, 0);

    const deliveryRate = totalSent > 0 ? Number(((totalDelivered / totalSent) * 100).toFixed(1)) : 0;
    const readRate = totalDelivered > 0 ? Number(((totalRead / totalDelivered) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      data: campaigns,
      summary: {
        totalCampaigns: MOCK_CAMPAIGNS.length,
        totalSent,
        deliveryRate,
        readRate,
        totalConversions,
        totalRevenueAttributed,
        availableCredits: credits,
      },
    });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCampaignSchema.parse(body);

    const newCampaign = createCampaign({
      name: validated.name,
      channel: validated.channel,
      segmentId: validated.segmentId,
      segmentName: validated.segmentName,
      templateId: validated.templateId,
      templateName: validated.templateName,
      couponId: validated.couponId,
      couponCode: validated.couponCode,
      scheduledAt: validated.scheduledAt,
      status: validated.status,
      totalRecipients: validated.totalRecipients,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          validated.status === 'SCHEDULED'
            ? 'Campaign scheduled successfully'
            : 'Campaign dispatched successfully to audience',
        data: newCampaign,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
