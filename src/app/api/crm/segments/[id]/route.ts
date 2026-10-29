import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_SEGMENTS, MOCK_CUSTOMERS, evaluateSegmentMatch } from '@/lib/mock-data';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const segment = MOCK_SEGMENTS.find((s) => s.id === id);

    if (!segment) {
      return NextResponse.json({ success: false, message: 'Segment not found' }, { status: 404 });
    }

    const matchedCustomers = MOCK_CUSTOMERS.filter((c) => evaluateSegmentMatch(c, segment.rules));

    return NextResponse.json({
      success: true,
      segment: {
        ...segment,
        customerCount: matchedCustomers.length,
      },
      customers: matchedCustomers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const index = MOCK_SEGMENTS.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Segment not found' }, { status: 404 });
    }

    if (MOCK_SEGMENTS[index].isSystem) {
      return NextResponse.json(
        { success: false, message: 'System segments cannot be deleted' },
        { status: 400 }
      );
    }

    MOCK_SEGMENTS.splice(index, 1);

    try {
      await prisma.segment.delete({ where: { id } });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Segment deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
