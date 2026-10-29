import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exportMode = searchParams.get('export');

    const taxSlabs = [
      {
        rateSlab: '5% GST (Restaurant Dining & Takeaway)',
        sacCode: '996331',
        taxableValue: 4285714.28,
        cgstRate: '2.5%',
        cgstAmount: 107142.86,
        sgstRate: '2.5%',
        sgstAmount: 107142.86,
        igstAmount: 0.0,
        totalTax: 214285.72,
        invoiceCount: 4120,
      },
      {
        rateSlab: '12% GST (Packaged Confections & Drinks)',
        sacCode: '210690',
        taxableValue: 142857.14,
        cgstRate: '6.0%',
        cgstAmount: 8571.43,
        sgstRate: '6.0%',
        sgstAmount: 8571.43,
        igstAmount: 0.0,
        totalTax: 17142.86,
        invoiceCount: 285,
      },
      {
        rateSlab: '18% GST (Catering & Banquet Hall Events)',
        sacCode: '996334',
        taxableValue: 185000.0,
        cgstRate: '9.0%',
        cgstAmount: 16650.0,
        sgstRate: '9.0%',
        sgstAmount: 16650.0,
        igstAmount: 0.0,
        totalTax: 33300.0,
        invoiceCount: 8,
      },
    ];

    const b2bInvoices = [
      {
        invoiceNumber: 'INV-202610-0082',
        date: '24/10/2026',
        customerName: 'TechCorp Solutions Pvt Ltd',
        customerGstin: '29AABCT1234F1Z8',
        taxableValue: 18400.0,
        cgst: 460.0,
        sgst: 460.0,
        totalInvoiceValue: 19320.0,
      },
      {
        invoiceNumber: 'INV-202610-0114',
        date: '26/10/2026',
        customerName: 'Indiranagar Realty Consultants',
        customerGstin: '29BBBCB5421N1ZT',
        taxableValue: 12500.0,
        cgst: 312.5,
        sgst: 312.5,
        totalInvoiceValue: 13125.0,
      },
    ];

    if (exportMode === 'csv') {
      const headers = [
        'Tax Rate Slab',
        'SAC / HSN Code',
        'Taxable Value (INR)',
        'CGST (INR)',
        'SGST (INR)',
        'Total GST (INR)',
        'Invoices Count',
      ];
      const rows = taxSlabs.map((s) => [
        `"${s.rateSlab}"`,
        s.sacCode,
        s.taxableValue.toFixed(2),
        s.cgstAmount.toFixed(2),
        s.sgstAmount.toFixed(2),
        s.totalTax.toFixed(2),
        s.invoiceCount,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="RestoDesk_GSTR_Summary_${Date.now()}.csv"`,
        },
      });
    }

    const totalTaxable = taxSlabs.reduce((acc, s) => acc + s.taxableValue, 0);
    const totalCgst = taxSlabs.reduce((acc, s) => acc + s.cgstAmount, 0);
    const totalSgst = taxSlabs.reduce((acc, s) => acc + s.sgstAmount, 0);
    const totalTax = taxSlabs.reduce((acc, s) => acc + s.totalTax, 0);

    return NextResponse.json({
      success: true,
      taxSlabs,
      b2bInvoices,
      totals: {
        totalTaxable,
        totalCgst,
        totalSgst,
        totalTax,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
