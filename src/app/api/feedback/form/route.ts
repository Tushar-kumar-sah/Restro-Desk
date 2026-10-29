import { NextResponse } from 'next/server';
import { MOCK_FEEDBACK_FORM } from '@/lib/mock-data';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: MOCK_FEEDBACK_FORM,
    });
  } catch (error) {
    console.error('Failed to get feedback form:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
