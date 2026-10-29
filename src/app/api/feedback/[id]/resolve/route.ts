import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveFeedback } from '@/lib/mock-data';

const resolveSchema = z.object({
  resolutionNotes: z.string().min(5, 'Resolution notes are required'),
  resolvedBy: z.string().default('General Manager'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = resolveSchema.parse(body);

    const updated = resolveFeedback(params.id, validated.resolutionNotes, validated.resolvedBy);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Feedback record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback complaint has been marked as resolved',
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to resolve feedback:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
