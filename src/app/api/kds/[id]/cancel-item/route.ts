import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_KOTS } from '@/lib/mock-data';

const cancelItemSchema = z.object({
  itemId: z.string().min(1),
  reason: z.string().min(2, 'Cancellation reason is required'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const result = cancelItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { itemId, reason } = result.data;
    const kot = MOCK_KOTS.find((k: any) => k.id === id || k.kotNumber === id);
    if (!kot) {
      return NextResponse.json({ success: false, message: 'KOT ticket not found' }, { status: 404 });
    }

    const item = kot.items.find((i: any) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Item not found in KOT' }, { status: 404 });
    }

    item.status = 'CANCELLED';
    item.cancelReason = reason;

    return NextResponse.json({
      success: true,
      message: `Cancelled ${item.name} on KOT (${reason})`,
      kot,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
