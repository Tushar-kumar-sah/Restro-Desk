import { NextRequest, NextResponse } from 'next/server';
import {
  MOCK_TOP_ITEMS_SALES,
  MOCK_PAYMENT_SPLIT,
  MOCK_ORDER_TYPE_SPLIT,
  MOCK_Z_REPORTS,
} from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';
    const exportMode = searchParams.get('export');

    const dailySales = [
      { date: '28/10/2026', orders: 154, grossSales: 161200, discount: 7000, taxable: 146857, tax: 7343, netSales: 154200 },
      { date: '27/10/2026', orders: 157, grossSales: 154200, discount: 7600, taxable: 139619, tax: 6981, netSales: 146600 },
      { date: '26/10/2026', orders: 139, grossSales: 138900, discount: 6300, taxable: 126285, tax: 6314, netSales: 132600 },
      { date: '25/10/2026', orders: 172, grossSales: 184500, discount: 9200, taxable: 166952, tax: 8348, netSales: 175300 },
      { date: '24/10/2026', orders: 188, grossSales: 202400, discount: 10500, taxable: 182761, tax: 9139, netSales: 191900 },
      { date: '23/10/2026', orders: 145, grossSales: 149000, discount: 6800, taxable: 135428, tax: 6772, netSales: 142200 },
      { date: '22/10/2026', orders: 132, grossSales: 132400, discount: 5900, taxable: 120476, tax: 6024, netSales: 126500 },
    ];

    const categorySales = [
      { category: 'Main Course (Curries)', itemsSold: 284, totalSales: 98400, sharePercent: 42.5 },
      { category: 'Tandoori & Starters', itemsSold: 242, totalSales: 64200, sharePercent: 27.7 },
      { category: 'Biryani & Rice Bowls', itemsSold: 185, totalSales: 48900, sharePercent: 21.1 },
      { category: 'Tandoori Breads & Naans', itemsSold: 420, totalSales: 21500, sharePercent: 9.3 },
      { category: 'Beverages & Mocktails', itemsSold: 110, totalSales: 14200, sharePercent: 6.1 },
      { category: 'Desserts & Sweets', itemsSold: 85, totalSales: 9800, sharePercent: 4.2 },
    ];

    const voidedBills = [
      {
        orderNumber: 'ORD-20261028-044',
        time: '01:45 PM',
        amount: 850.0,
        waiter: 'Karthik Gowda',
        voidedBy: 'Ramesh Patel (Manager)',
        reason: 'Guest had emergency train departure before kitchen fired main course',
        items: 'Paneer Butter Masala x2, Roti x4',
      },
      {
        orderNumber: 'ORD-20261028-089',
        time: '08:30 PM',
        amount: 630.0,
        waiter: 'Rahul Nair',
        voidedBy: 'Ramesh Patel (Manager)',
        reason: 'Duplicate punching error at counter',
        items: 'Chilli Chicken Hakka x1, Fried Rice x1',
      },
    ];

    // CSV Export
    if (exportMode === 'csv') {
      const headers = ['Dish Name', 'Category', 'Quantity Sold', 'Total Revenue (INR)', 'Food Cost %'];
      const rows = MOCK_TOP_ITEMS_SALES.map((it) => [
        `"${it.name}"`,
        `"${it.category}"`,
        it.qtySold,
        it.revenue.toFixed(2),
        `${it.foodCostPct}%`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="RestoDesk_Item_Sales_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      period,
      dailySales,
      itemSales: MOCK_TOP_ITEMS_SALES,
      categorySales,
      paymentSplit: MOCK_PAYMENT_SPLIT,
      orderTypeSplit: MOCK_ORDER_TYPE_SPLIT,
      voidedBills,
      summary: {
        totalNetSales: dailySales.reduce((acc, d) => acc + d.netSales, 0),
        totalOrders: dailySales.reduce((acc, d) => acc + d.orders, 0),
        totalTaxesCollected: dailySales.reduce((acc, d) => acc + d.tax, 0),
        totalDiscountsGiven: dailySales.reduce((acc, d) => acc + d.discount, 0),
        avgTicketSize: Math.round(
          dailySales.reduce((acc, d) => acc + d.netSales, 0) /
            dailySales.reduce((acc, d) => acc + d.orders, 0)
        ),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
