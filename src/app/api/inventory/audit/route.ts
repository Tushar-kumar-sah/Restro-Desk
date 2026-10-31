import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_RAW_MATERIALS } from '@/lib/mock-data';

const AuditLineItemSchema = z.object({
  rawMaterialId: z.string(),
  physicalCount: z.number().min(0),
  notes: z.string().optional(),
});

const PhysicalAuditSchema = z.object({
  outletId: z.string().default('outlet-01'),
  auditedBy: z.string().default('Store Manager'),
  items: z.array(AuditLineItemSchema).min(1, 'At least one item count required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = PhysicalAuditSchema.parse(body);

    const auditResults = [];
    let totalVarianceCost = 0;

    for (const line of validated.items) {
      const rm = MOCK_RAW_MATERIALS.find((m) => m.id === line.rawMaterialId);
      if (!rm) continue;

      const systemStock = rm.currentStock;
      const physicalStock = line.physicalCount;
      const variance = Math.round((physicalStock - systemStock) * 100) / 100;
      const varianceCost = Math.round(variance * rm.costPerUnit * 100) / 100;

      totalVarianceCost += varianceCost;

      auditResults.push({
        rawMaterialId: rm.id,
        rawMaterialName: rm.name,
        unit: rm.unit,
        systemStock,
        physicalStock,
        variance,
        varianceCost,
        notes: line.notes || (variance === 0 ? 'Match' : variance < 0 ? 'Shortage' : 'Excess'),
      });

      // Update the system stock to match the physical shelf count
      rm.currentStock = physicalStock;

      try {
        await prisma.rawMaterial.update({
          where: { id: rm.id },
          data: { currentStock: physicalStock },
        });
      } catch (dbErr) {
        // offline fallback
      }
    }

    return NextResponse.json({
      success: true,
      message: `Physical stock audit completed for ${auditResults.length} items. Stock levels reconciled.`,
      audit: {
        id: `aud-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        auditedBy: validated.auditedBy,
        totalItemsAudited: auditResults.length,
        totalVarianceCost,
        results: auditResults,
      },
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
