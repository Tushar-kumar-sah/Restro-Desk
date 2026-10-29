import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_PURCHASE_ORDERS } from '@/lib/mock-data';

const UpdatePOStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === id);
    if (!po) {
      return NextResponse.json({ success: false, message: 'Purchase order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order: po });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = UpdatePOStatusSchema.parse(body);

    const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === id);
    if (!po) {
      return NextResponse.json({ success: false, message: 'Purchase order not found' }, { status: 404 });
    }

    po.status = validated.status;
    if (validated.notes !== undefined) po.notes = validated.notes;

    return NextResponse.json({
      success: true,
      message: `Purchase order ${po.poNumber} status updated to ${po.status}`,
      order: po,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const index = MOCK_PURCHASE_ORDERS.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Purchase order not found' }, { status: 404 });
    }

    MOCK_PURCHASE_ORDERS.splice(index, 1);
    return NextResponse.json({ success: true, message: 'Purchase order removed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
