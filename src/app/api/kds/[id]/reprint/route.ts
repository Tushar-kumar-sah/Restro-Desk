import { NextRequest, NextResponse } from 'next/server';
import { MOCK_KOTS } from '@/lib/mock-data';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const kot = MOCK_KOTS.find((k: any) => k.id === id || k.kotNumber === id);
    if (!kot) {
      return NextResponse.json({ success: false, message: 'KOT ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `KOT ${kot.kotNumber} sent for duplicate reprint on ${kot.station} printer`,
      kot,
      isReprint: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
