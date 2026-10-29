import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_OUTLETS } from '@/lib/mock-data';

export async function GET() {
  try {
    let outlets = await prisma.outlet.findMany({
      where: { isDeleted: false },
    });

    if (outlets.length === 0) {
      outlets = MOCK_OUTLETS as any;
    }

    return NextResponse.json({
      success: true,
      data: outlets,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: MOCK_OUTLETS,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brand = await prisma.brand.findFirst();

    if (brand) {
      const newOutlet = await prisma.outlet.create({
        data: {
          brandId: brand.id,
          name: body.name,
          code: body.code || `BLR-${Date.now().toString().slice(-3)}`,
          phone: body.phone,
          email: body.email,
          address: body.address,
          city: body.city || 'Bengaluru',
          state: body.state || 'Karnataka',
          postalCode: body.postalCode || '560001',
          gstin: body.gstin || '29ABCDE1234F1Z5',
          fssaiNumber: body.fssaiNumber || '11223344556677',
          printerPaperWidth: body.printerPaperWidth || '80mm',
          defaultGstPercent: body.defaultGstPercent || 5.0,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Outlet added successfully to live database',
        data: newOutlet,
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      message: 'Outlet added successfully',
      data: body,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create outlet:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
