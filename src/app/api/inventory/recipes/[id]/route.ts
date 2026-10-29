import { NextRequest, NextResponse } from 'next/server';
import { MOCK_RECIPES } from '@/lib/mock-data';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const recipe = MOCK_RECIPES.find((r) => r.id === id);
    if (!recipe) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, recipe });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const index = MOCK_RECIPES.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }
    MOCK_RECIPES.splice(index, 1);
    return NextResponse.json({ success: true, message: 'Recipe removed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
