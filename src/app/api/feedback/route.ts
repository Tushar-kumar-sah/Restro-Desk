import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFeedbackMetrics, getFeedbackResponses, submitFeedback } from '@/lib/mock-data';

const submitFeedbackSchema = z.object({
  outletId: z.string().default('outlet-01'),
  customerName: z.string().optional().default('Anonymous Guest'),
  customerPhone: z.string().optional().default(''),
  overallRating: z.number().min(1).max(5),
  foodRating: z.number().min(1).max(5).default(5),
  serviceRating: z.number().min(1).max(5).default(5),
  ambianceRating: z.number().min(1).max(5).default(5),
  npsScore: z.number().min(0).max(10).default(10),
  comments: z.string().optional(),
  tableNumber: z.string().optional(),
  billNumber: z.string().optional(),
  redirectedToGoogle: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId') || undefined;
    const ratingFilter = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;
    const unresolvedOnly = searchParams.get('unresolved') === 'true';

    const metrics = getFeedbackMetrics();
    const responses = getFeedbackResponses(outletId, ratingFilter, unresolvedOnly);

    return NextResponse.json({
      success: true,
      metrics,
      data: responses,
    });
  } catch (error) {
    console.error('Failed to get feedback data:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = submitFeedbackSchema.parse(body);

    const saved = submitFeedback({
      outletId: validated.outletId,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      overallRating: validated.overallRating,
      foodRating: validated.foodRating,
      serviceRating: validated.serviceRating,
      ambianceRating: validated.ambianceRating,
      npsScore: validated.npsScore,
      comments: validated.comments,
      tableNumber: validated.tableNumber,
      billNumber: validated.billNumber,
      redirectedToGoogle: validated.redirectedToGoogle,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          validated.overallRating >= 4
            ? 'Thank you for your wonderful review!'
            : 'Thank you for your feedback. Our manager has been alerted to review your dining concerns.',
        data: saved,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to submit feedback:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
