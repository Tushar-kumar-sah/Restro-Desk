import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dispatchMessage, interpolateTemplate } from '@/lib/messaging';

const testSendSchema = z.object({
  recipient: z.string().min(5, 'Valid recipient phone or email required'),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']),
  content: z.string().min(1, 'Message content cannot be empty'),
  variables: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = testSendSchema.parse(body);

    const defaultVars = {
      name: 'Test Guest',
      outlet: 'Indiranagar Flagship',
      brand: 'RestoDesk',
      coupon: 'TEST50',
      points: '250',
      review_link: 'https://restodesk.in/review/demo',
    };

    const mergedVars = { ...defaultVars, ...(validated.variables || {}) };
    const interpolated = interpolateTemplate(validated.content, mergedVars);

    const result = await dispatchMessage({
      to: validated.recipient,
      channel: validated.channel,
      content: interpolated,
    });

    return NextResponse.json({
      success: true,
      message: `Test message dispatched successfully to ${validated.recipient}`,
      renderedContent: interpolated,
      dispatchResult: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to dispatch test message:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
