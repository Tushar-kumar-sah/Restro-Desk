import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDeliveryZones, createDeliveryZone } from '@/lib/mock-data';

const createZoneSchema = z.object({
  outletId: z.string().default('outlet-01'),
  name: z.string().min(2, 'Zone name is required'),
  minOrderAmount: z.number().min(0).default(200),
  deliveryFee: z.number().min(0).default(30),
  estimatedMinutes: z.number().int().min(10).default(35),
  coverageRadiusKm: z.number().min(0.5).default(5),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId') || undefined;

    const zones = getDeliveryZones(outletId);
    return NextResponse.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    console.error('Failed to get delivery zones:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createZoneSchema.parse(body);

    const newZone = createDeliveryZone(validated);
    return NextResponse.json(
      {
        success: true,
        message: 'Delivery zone created successfully',
        data: newZone,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create delivery zone:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
