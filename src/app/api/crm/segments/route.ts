import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  MOCK_SEGMENTS,
  MOCK_CUSTOMERS,
  MockCustomer,
  MockSegment,
  evaluateSegmentMatch,
} from '@/lib/mock-data';

const SegmentRuleSchema = z.object({
  field: z.enum(['spend', 'visits', 'daysSinceLastVisit', 'tier', 'birthdayMonth', 'tag']),
  operator: z.enum(['EQUALS', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN']),
  value: z.string(),
  logicalOperator: z.enum(['AND', 'OR']).default('AND'),
});

const CreateSegmentSchema = z.object({
  name: z.string().min(2, 'Segment name is required'),
  description: z.string().optional().default(''),
  rules: z.array(SegmentRuleSchema).min(1, 'At least one condition rule is required'),
});

export async function GET(req: NextRequest) {
  try {
    let segments: MockSegment[] = [];

    try {
      const dbSegments = await prisma.segment.findMany({
        include: { rules: true },
        orderBy: { createdAt: 'desc' },
      });

      if (dbSegments && dbSegments.length > 0) {
        segments = dbSegments.map((s) => ({
          id: s.id,
          brandId: s.brandId,
          name: s.name,
          description: s.description || '',
          isSystem: s.isSystem,
          customerCount: 0,
          rules: s.rules.map((r) => ({
            field: r.field,
            operator: r.operator as any,
            value: r.value,
            logicalOperator: r.logicalOperator as any,
          })),
        }));
      }
    } catch (dbErr) {
      // offline fallback
    }

    if (segments.length === 0) {
      segments = [...MOCK_SEGMENTS];
    }

    // Dynamically recalculate customerCount for every segment based on live customer list
    const enrichedSegments = segments.map((seg) => {
      const matchedCount = MOCK_CUSTOMERS.filter((c) => evaluateSegmentMatch(c, seg.rules)).length;
      return {
        ...seg,
        customerCount: matchedCount,
      };
    });

    return NextResponse.json({
      success: true,
      segments: enrichedSegments,
      totalCount: enrichedSegments.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateSegmentSchema.parse(body);

    const matchedCount = MOCK_CUSTOMERS.filter((c) => evaluateSegmentMatch(c, validated.rules as any)).length;

    const newSegment: MockSegment = {
      id: `seg-${Date.now()}`,
      brandId: 'brand-restodesk-001',
      name: validated.name.trim(),
      description: validated.description || '',
      isSystem: false,
      customerCount: matchedCount,
      rules: validated.rules as any,
    };

    try {
      await prisma.segment.create({
        data: {
          brandId: 'brand-restodesk-001',
          name: newSegment.name,
          description: newSegment.description,
          isSystem: false,
          customerCount: matchedCount,
          rules: {
            create: validated.rules.map((r) => ({
              field: r.field,
              operator: r.operator,
              value: r.value,
              logicalOperator: r.logicalOperator,
            })),
          },
        },
      });
    } catch (dbErr) {
      // offline fallback
    }

    MOCK_SEGMENTS.push(newSegment);

    return NextResponse.json({
      success: true,
      message: 'Segment created successfully',
      segment: newSegment,
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
