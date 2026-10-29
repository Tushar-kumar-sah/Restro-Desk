import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { toggleAggregatorStore, syncAggregatorMenu } from '@/lib/mock-data';

const syncSchema = z.object({
  action: z.enum(['SYNC_MENU', 'TOGGLE_STATUS']),
  channel: z.enum(['ZOMATO', 'SWIGGY', 'ALL']),
  isOpen: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = syncSchema.parse(body);

    if (validated.action === 'SYNC_MENU') {
      const result = syncAggregatorMenu(validated.channel);
      return NextResponse.json({
        success: true,
        message: `Catalog and pricing pushed to ${validated.channel} successfully (${result.syncedItemsCount} items)`,
        data: result,
      });
    }

    if (validated.action === 'TOGGLE_STATUS' && validated.channel !== 'ALL' && validated.isOpen !== undefined) {
      const updated = toggleAggregatorStore(validated.channel, validated.isOpen);
      return NextResponse.json({
        success: true,
        message: `${validated.channel} store status switched to ${validated.isOpen ? 'ONLINE' : 'OFFLINE'}`,
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid sync parameters' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed aggregator sync:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
