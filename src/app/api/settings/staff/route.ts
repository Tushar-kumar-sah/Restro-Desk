import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStaff, createStaff } from '@/lib/mock-data';

const createStaffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  role: z.enum(['OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'MARKETING']).default('CASHIER'),
  outletId: z.string().default('outlet-01'),
  pinCode: z.string().optional().default('1234'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId') || undefined;
    const role = searchParams.get('role') || undefined;

    const staff = getStaff(outletId, role);
    return NextResponse.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error('Failed to get staff:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createStaffSchema.parse(body);

    const newStaff = createStaff(validated);
    return NextResponse.json(
      {
        success: true,
        message: 'Employee onboarded successfully with assigned role permissions',
        data: newStaff,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create staff:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
