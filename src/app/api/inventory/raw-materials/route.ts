import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_RAW_MATERIALS, MockRawMaterial } from '@/lib/mock-data';

const RawMaterialCreateSchema = z.object({
  name: z.string().min(2, 'Ingredient name is required'),
  sku: z.string().optional(),
  category: z.enum([
    'Dairy',
    'Poultry & Meat',
    'Produce & Veg',
    'Spices & Seasonings',
    'Grains & Staples',
    'Beverages & Syrups',
    'Packaging',
  ]),
  unit: z.enum(['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'PACKET']),
  currentStock: z.number().min(0, 'Current stock must be non-negative'),
  minAlertStock: z.number().min(0, 'Min alert stock must be non-negative'),
  costPerUnit: z.number().min(0, 'Cost per unit must be non-negative'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const category = searchParams.get('category') || 'ALL';
    const status = searchParams.get('status') || 'ALL'; // ALL | LOW_STOCK | CRITICAL

    // Base materials from active in-memory list
    let materials: MockRawMaterial[] = [...MOCK_RAW_MATERIALS.filter((m) => !m.isDeleted)];

    try {
      const dbMaterials = await prisma.rawMaterial.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });

      for (const dbm of dbMaterials) {
        const existing = materials.find((m) => m.id === dbm.id || m.sku === dbm.sku);
        if (existing) {
          existing.currentStock = dbm.currentStock;
          existing.minAlertStock = dbm.minAlertStock;
          existing.costPerUnit = dbm.costPerUnit;
          existing.unit = dbm.unit as any;
          existing.name = dbm.name;
        } else {
          materials.unshift({
            id: dbm.id,
            brandId: dbm.brandId,
            name: dbm.name,
            sku: dbm.sku || `RM-${dbm.id.slice(0, 4)}`,
            category: 'Produce & Veg',
            unit: dbm.unit as any,
            currentStock: dbm.currentStock,
            minAlertStock: dbm.minAlertStock,
            costPerUnit: dbm.costPerUnit,
            isDeleted: dbm.isDeleted,
          });
        }
      }
    } catch (dbErr) {
      // offline fallback
    }

    const filtered = materials.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search) && !m.sku.toLowerCase().includes(search)) {
        return false;
      }
      if (category !== 'ALL' && m.category !== category) {
        return false;
      }
      if (status === 'LOW_STOCK') {
        if (m.currentStock > m.minAlertStock) return false;
      } else if (status === 'CRITICAL') {
        if (m.currentStock > m.minAlertStock * 0.5) return false;
      }
      return true;
    });

    const totalValuation = materials.reduce((acc, m) => acc + m.currentStock * m.costPerUnit, 0);
    const lowStockCount = materials.filter((m) => m.currentStock <= m.minAlertStock).length;
    const criticalCount = materials.filter((m) => m.currentStock <= m.minAlertStock * 0.5).length;

    return NextResponse.json({
      success: true,
      materials: filtered,
      totalCount: filtered.length,
      metrics: {
        totalItems: materials.length,
        totalValuation,
        lowStockCount,
        criticalCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RawMaterialCreateSchema.parse(body);

    const generatedSku = validated.sku
      ? validated.sku.toUpperCase()
      : `RM-${validated.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    let brandId = 'd072c454-2537-4f98-a227-c93f26c9c501';
    try {
      const dbBrand = await prisma.brand.findFirst();
      if (dbBrand) brandId = dbBrand.id;
    } catch (e) {}

    const newMaterial: MockRawMaterial = {
      id: `rm-${Date.now()}`,
      brandId,
      name: validated.name.trim(),
      sku: generatedSku,
      category: validated.category,
      unit: validated.unit,
      currentStock: validated.currentStock,
      minAlertStock: validated.minAlertStock,
      costPerUnit: validated.costPerUnit,
      isDeleted: false,
    };

    try {
      const created = await prisma.rawMaterial.create({
        data: {
          brandId,
          name: newMaterial.name,
          sku: newMaterial.sku,
          unit: newMaterial.unit as any,
          currentStock: newMaterial.currentStock,
          minAlertStock: newMaterial.minAlertStock,
          costPerUnit: newMaterial.costPerUnit,
        },
      });
      newMaterial.id = created.id;
    } catch (dbErr) {
      // offline fallback
    }

    MOCK_RAW_MATERIALS.unshift(newMaterial);

    return NextResponse.json({
      success: true,
      message: `Ingredient "${newMaterial.name}" added to inventory`,
      material: newMaterial,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
