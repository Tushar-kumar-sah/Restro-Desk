import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDeliveryBoys, createDeliveryBoy } from '@/lib/mock-data';

const createDeliveryBoySchema = z.object({
  outletId: z.string().default('outlet-01'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  vehicleNumber: z.string().min(4, 'Vehicle registration number required'),
  vehicleType: z.enum(['BIKE', 'SCOOTER', 'EV']).default('SCOOTER'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId') || undefined;
    const status = searchParams.get('status') || undefined;

    const boys = getDeliveryBoys(outletId, status);
    return NextResponse.json({
      success: true,
      data: boys,
    });
  } catch (error) {
    console.error('Failed to get delivery boys:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createDeliveryBoySchema.parse(body);

    const newBoy = createDeliveryBoy(validated);
    return NextResponse.json(
      {
        success: true,
        message: 'Delivery driver onboarded successfully',
        data: newBoy,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create delivery boy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
