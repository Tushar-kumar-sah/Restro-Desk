import { NextRequest, NextResponse } from 'next/server';
import { getPrinterConfig, updatePrinterConfig } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId') || 'outlet-01';

    const config = getPrinterConfig(outletId);
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Failed to get printer config:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const outletId = body.outletId || 'outlet-01';

    const updated = updatePrinterConfig(outletId, body);
    return NextResponse.json({
      success: true,
      message: 'Thermal printer configuration saved',
      data: updated,
    });
  } catch (error) {
    console.error('Failed to update printer config:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
