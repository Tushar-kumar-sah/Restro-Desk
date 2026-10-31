import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_RAW_MATERIALS } from '@/lib/mock-data';

const RawMaterialUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.enum([
    'Dairy',
    'Poultry & Meat',
    'Produce & Veg',
    'Spices & Seasonings',
    'Grains & Staples',
    'Beverages & Syrups',
    'Packaging',
  ]).optional(),
  unit: z.enum(['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'PACKET']).optional(),
  currentStock: z.number().min(0).optional(),
  minAlertStock: z.number().min(0).optional(),
  costPerUnit: z.number().min(0).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const material = MOCK_RAW_MATERIALS.find((m) => m.id === id);
    if (!material) {
      return NextResponse.json({ success: false, message: 'Raw material not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = RawMaterialUpdateSchema.parse(body);

    const material = MOCK_RAW_MATERIALS.find((m) => m.id === id);
    if (!material) {
      return NextResponse.json({ success: false, message: 'Raw material not found' }, { status: 404 });
    }

    if (validated.name !== undefined) material.name = validated.name;
    if (validated.category !== undefined) material.category = validated.category;
    if (validated.unit !== undefined) material.unit = validated.unit;
    if (validated.currentStock !== undefined) material.currentStock = validated.currentStock;
    if (validated.minAlertStock !== undefined) material.minAlertStock = validated.minAlertStock;
    if (validated.costPerUnit !== undefined) material.costPerUnit = validated.costPerUnit;

    try {
      await prisma.rawMaterial.update({
        where: { id },
        data: {
          ...(validated.name !== undefined && { name: validated.name }),
          ...(validated.unit !== undefined && { unit: validated.unit as any }),
          ...(validated.currentStock !== undefined && { currentStock: validated.currentStock }),
          ...(validated.minAlertStock !== undefined && { minAlertStock: validated.minAlertStock }),
          ...(validated.costPerUnit !== undefined && { costPerUnit: validated.costPerUnit }),
        },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Stock details updated',
      material,
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const index = MOCK_RAW_MATERIALS.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Raw material not found' }, { status: 404 });
    }

    MOCK_RAW_MATERIALS.splice(index, 1);

    try {
      await prisma.rawMaterial.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Raw material removed from inventory',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
