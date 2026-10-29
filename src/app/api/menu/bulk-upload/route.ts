import { NextRequest, NextResponse } from 'next/server';
import { MOCK_MENU_ITEMS } from '@/lib/mock-data';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty item list provided' },
        { status: 400 }
      );
    }

    let importedCount = 0;
    for (const raw of items) {
      if (!raw.name || !raw.basePrice) continue;

      const newItem = {
        id: `itm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        categoryId: raw.categoryId || 'cat-01',
        categoryName: raw.categoryName || 'Tandoori & Starters',
        name: raw.name,
        shortCode: raw.shortCode || `ITM${Math.floor(Math.random() * 900 + 100)}`,
        basePrice: parseFloat(raw.basePrice) || 100,
        foodType: raw.foodType?.toUpperCase() === 'NON_VEG' ? 'NON_VEG' : 'VEG',
        isAvailable: true,
        preparationTime: parseInt(raw.preparationTime) || 15,
        hsnCode: raw.hsnCode || '2106',
        description: raw.description || '',
      };

      MOCK_MENU_ITEMS.unshift(newItem);
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} items into menu catalog`,
      importedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
