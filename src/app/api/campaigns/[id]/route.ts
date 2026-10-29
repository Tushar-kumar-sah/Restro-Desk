import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CAMPAIGNS, MOCK_CAMPAIGN_RECIPIENTS, cancelCampaign } from '@/lib/mock-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = MOCK_CAMPAIGNS.find((c) => c.id === params.id);
    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const recipients = MOCK_CAMPAIGN_RECIPIENTS.filter((r) => r.campaignId === params.id);

    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        recipients,
      },
    });
  } catch (error) {
    console.error('Failed to get campaign detail:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cancelled = cancelCampaign(params.id);
    if (!cancelled) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign has been cancelled',
      data: cancelled,
    });
  } catch (error) {
    console.error('Failed to cancel campaign:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
