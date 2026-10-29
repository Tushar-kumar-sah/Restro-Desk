import { NextRequest, NextResponse } from 'next/server';
import {
  MOCK_ORDERS,
  MOCK_HOURLY_SALES,
  MOCK_PAYMENT_SPLIT,
  MOCK_ORDER_TYPE_SPLIT,
  MOCK_TOP_ITEMS_SALES,
  MOCK_ACTIVE_SHIFT,
} from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outletId') || 'all';
    const period = searchParams.get('period') || 'today';

    // Aggregate metrics based on active dataset
    let salesMultiplier = 1.0;
    if (period === 'yesterday') salesMultiplier = 0.95;
    else if (period === '7d') salesMultiplier = 6.8;
    else if (period === '30d') salesMultiplier = 28.5;

    const baseSales = 154200.0 * salesMultiplier;
    const baseOrders = Math.round(145 * salesMultiplier);
    const avgBill = Math.round(baseSales / baseOrders);

    const kpi = {
      todaySales: baseSales,
      salesGrowth: period === 'today' ? '+18.4% vs last week' : '+12.1% vs prev period',
      totalOrders: baseOrders,
      avgBillValue: avgBill,
      occupiedTables: 14,
      totalTables: 20,
      tableOccupancyPercent: 70,
      pendingKOTs: 5,
      onlineOrders: Math.round(38 * salesMultiplier),
      activeShiftCash: MOCK_ACTIVE_SHIFT.expectedCash,
      cashVariance: MOCK_ACTIVE_SHIFT.variance,
    };

    const recentOrders = [
      {
        id: 'ord-101',
        orderNumber: 'ORD-20261028-101',
        table: 'T-04',
        type: 'DINE_IN',
        items: 'Paneer Butter Masala (x2), Garlic Naan (x4), Mango Lassi (x2)',
        amount: 1417.0,
        status: 'PREPARING',
        time: '5 mins ago',
        waiter: 'Karthik Gowda',
      },
      {
        id: 'ord-102',
        orderNumber: 'ORD-20261028-102',
        table: 'T-09',
        type: 'DINE_IN',
        items: 'Butter Chicken (x2), Dum Biryani (x2), Naan (x4), Gulab Jamun (x1)',
        amount: 1880.0,
        status: 'BILLED',
        time: '18 mins ago',
        waiter: 'Karthik Gowda',
      },
      {
        id: 'ord-103',
        orderNumber: 'ORD-20261028-103',
        table: 'T-01',
        type: 'DINE_IN',
        items: 'Paneer Tikka Angara (x1), Tandoori Roti (x3)',
        amount: 480.0,
        status: 'SERVED',
        time: '28 mins ago',
        waiter: 'Rahul Nair',
      },
      {
        id: 'ord-104',
        orderNumber: 'ORD-20261028-104',
        table: 'Zomato #482',
        type: 'ONLINE',
        items: 'Hyderabadi Chicken Dum Biryani (x2), Raita (x2)',
        amount: 820.0,
        status: 'PREPARING',
        time: '34 mins ago',
        waiter: 'Aggregator API',
      },
    ];

    return NextResponse.json({
      success: true,
      period,
      outletId,
      kpi,
      hourlySales: MOCK_HOURLY_SALES,
      paymentSplit: MOCK_PAYMENT_SPLIT,
      orderTypeSplit: MOCK_ORDER_TYPE_SPLIT,
      topItems: MOCK_TOP_ITEMS_SALES,
      recentOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
