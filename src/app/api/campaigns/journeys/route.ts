import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getJourneys, toggleJourney } from '@/lib/mock-data';

const toggleJourneySchema = z.object({
  id: z.string().min(1, 'Journey ID is required'),
});

export async function GET() {
  try {
    const journeys = getJourneys();
    return NextResponse.json({
      success: true,
      data: journeys,
    });
  } catch (error) {
    console.error('Failed to get journeys:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = toggleJourneySchema.parse(body);

    const updated = toggleJourney(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Journey not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Journey '${updated.name}' is now ${updated.isActive ? 'Active' : 'Paused'}`,
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to update journey:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
