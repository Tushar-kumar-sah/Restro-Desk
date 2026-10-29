import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_Z_REPORTS, MOCK_ACTIVE_SHIFT, MockZReport } from '@/lib/mock-data';

const GenerateZReportSchema = z.object({
  businessDate: z.string().optional(),
  generatedBy: z.string().default('Ramesh Patel (General Manager)'),
  actualCashInDrawer: z.number().min(0),
  closingNotes: z.string().optional().default('Day-End Z-Report audited and locked'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (date) {
      const match = MOCK_Z_REPORTS.find((z) => z.businessDate === date);
      if (match) {
        return NextResponse.json({ success: true, zReport: match });
      }
    }

    // Active Day Z-Report Preview (Today's live numbers before night lock)
    const todayPreview: MockZReport = {
      id: `z-preview-${Date.now()}`,
      zReportNumber: `Z-20261028-PREVIEW`,
      businessDate: '2026-10-28',
      generatedAt: new Date().toISOString(),
      generatedBy: 'System Live Preview',
      outletId: 'outlet-01',
      outletName: 'Indiranagar Flagship',
      grossSales: 161200.0,
      itemDiscounts: 3800.0,
      billDiscounts: 3200.0,
      netSales: 154200.0,
      taxableAmount: 146857.0,
      cgst: 3671.5,
      sgst: 3671.5,
      totalGst: 7343.0,
      packagingCharge: 2100.0,
      deliveryCharge: 850.0,
      roundOff: 0.0,
      finalTotal: 164493.0,
      paymentBreakdown: {
        cash: 42800.0,
        cashOrders: 44,
        upi: 74600.0,
        upiOrders: 78,
        card: 31200.0,
        cardOrders: 28,
        wallet: 5400.0,
        walletOrders: 7,
        loyaltyPoints: 2493.0,
      },
      orderTypeBreakdown: {
        dineInSales: 104200.0,
        dineInOrders: 88,
        takeawaySales: 26400.0,
        takeawayOrders: 34,
        onlineSales: 25781.0,
        onlineOrders: 35,
      },
      totalOrders: 157,
      voidedOrdersCount: 2,
      voidedTotalAmount: 1480.0,
      cashReconciliation: {
        openingFloat: 5000.0,
        cashSales: 34850.0,
        cashExpenses: 1200.0,
        expectedCash: 40150.0,
        actualCash: 40150.0,
        variance: 0.0,
      },
    };

    return NextResponse.json({
      success: true,
      currentZReport: todayPreview,
      historicalZReports: MOCK_Z_REPORTS,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = GenerateZReportSchema.parse(body);

    const todayDate = validated.businessDate || new Date().toISOString().split('T')[0];
    const zSeq = MOCK_Z_REPORTS.length + 1;
    const zReportNumber = `Z-${todayDate.replace(/-/g, '')}-${String(zSeq).padStart(3, '0')}`;

    const expectedCash = 40150.0;
    const variance = Math.round((validated.actualCashInDrawer - expectedCash) * 100) / 100;

    const newZReport: MockZReport = {
      id: `z-${Date.now()}`,
      zReportNumber,
      businessDate: todayDate,
      generatedAt: new Date().toISOString(),
      generatedBy: validated.generatedBy,
      outletId: 'outlet-01',
      outletName: 'Indiranagar Flagship',
      grossSales: 161200.0,
      itemDiscounts: 3800.0,
      billDiscounts: 3200.0,
      netSales: 154200.0,
      taxableAmount: 146857.0,
      cgst: 3671.5,
      sgst: 3671.5,
      totalGst: 7343.0,
      packagingCharge: 2100.0,
      deliveryCharge: 850.0,
      roundOff: 0.0,
      finalTotal: 164493.0,
      paymentBreakdown: {
        cash: 42800.0,
        cashOrders: 44,
        upi: 74600.0,
        upiOrders: 78,
        card: 31200.0,
        cardOrders: 28,
        wallet: 5400.0,
        walletOrders: 7,
        loyaltyPoints: 2493.0,
      },
      orderTypeBreakdown: {
        dineInSales: 104200.0,
        dineInOrders: 88,
        takeawaySales: 26400.0,
        takeawayOrders: 34,
        onlineSales: 25781.0,
        onlineOrders: 35,
      },
      totalOrders: 157,
      voidedOrdersCount: 2,
      voidedTotalAmount: 1480.0,
      cashReconciliation: {
        openingFloat: 5000.0,
        cashSales: 34850.0,
        cashExpenses: 1200.0,
        expectedCash,
        actualCash: validated.actualCashInDrawer,
        variance,
      },
    };

    MOCK_Z_REPORTS.unshift(newZReport);

    return NextResponse.json({
      success: true,
      message: `Day-End Z-Report ${zReportNumber} generated and locked successfully!`,
      zReport: newZReport,
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
