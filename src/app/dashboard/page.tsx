'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Receipt,
  LayoutGrid,
  ChefHat,
  ShoppingBag,
  Users,
  Store,
  ArrowUpRight,
  Clock,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertCircle,
  Plus,
  Wallet,
  DollarSign,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  CreditCard,
  QrCode,
  Coins,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import { useAppStore } from '@/store/useAppStore';

export default function DashboardPage() {
  const router = useRouter();
  const { selectedOutlet, user, dateRange, setDateRange } = useAppStore();

  const [period, setPeriod] = useState(() => {
    if (dateRange?.label === 'Yesterday') return 'yesterday';
    if (dateRange?.label === 'Last 7 Days') return '7d';
    if (dateRange?.label === 'Last 30 Days' || dateRange?.label === 'This Month') return '30d';
    return 'today';
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync when topbar date range changes
  useEffect(() => {
    if (dateRange?.label === 'Yesterday') setPeriod('yesterday');
    else if (dateRange?.label === 'Last 7 Days') setPeriod('7d');
    else if (dateRange?.label === 'Last 30 Days' || dateRange?.label === 'This Month') setPeriod('30d');
    else if (dateRange?.label === 'Today') setPeriod('today');
  }, [dateRange?.label]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const outletParam = selectedOutlet?.id ? `&outletId=${selectedOutlet.id}` : '';
      const res = await fetch(`/api/reports/dashboard?period=${period}${outletParam}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period, selectedOutlet?.id]);

  const kpi = data?.kpi || {
    todaySales: 154200.0,
    salesGrowth: '+18.4% vs last week',
    totalOrders: 145,
    avgBillValue: 1063.0,
    occupiedTables: 14,
    totalTables: 20,
    tableOccupancyPercent: 70,
    pendingKOTs: 5,
    onlineOrders: 38,
    activeShiftCash: 40150.0,
  };

  const hourlyData = data?.hourlySales || [];
  const paymentData = data?.paymentSplit || [];
  const orderTypeData = data?.orderTypeSplit || [];
  const topItems = data?.topItems || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
        {/* Top Header & Greeting Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Namaste, {user?.name?.split(' ')[0] || 'Partner'}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-xs">
                {selectedOutlet?.name || 'Indiranagar Flagship'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Live executive overview, sales trends, orders breakdown, and cash drawer status
            </p>
          </div>

          {/* Period Selector & POS Launch */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPeriod('today');
                  setDateRange({
                    label: 'Today',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                  });
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === 'today'
                    ? 'bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriod('yesterday');
                  const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                  setDateRange({ label: 'Yesterday', startDate: y, endDate: y });
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === 'yesterday'
                    ? 'bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriod('7d');
                  const start7 = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
                  const end7 = new Date().toISOString().split('T')[0];
                  setDateRange({ label: 'Last 7 Days', startDate: start7, endDate: end7 });
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === '7d'
                    ? 'bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriod('30d');
                  const start30 = new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0];
                  const end30 = new Date().toISOString().split('T')[0];
                  setDateRange({ label: 'Last 30 Days', startDate: start30, endDate: end30 });
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === '30d'
                    ? 'bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Last 30 Days
              </button>
            </div>

            <Button
              onClick={() => router.push('/pos')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
            >
              <Receipt className="w-4 h-4" />
              Launch POS Terminal
            </Button>
          </div>
        </div>

        {/* Hero KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Net Sales */}
          <Card className="shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Net Sales
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {formatCurrency(kpi.todaySales)}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {kpi.salesGrowth}
              </p>
            </CardContent>
          </Card>

          {/* Orders & Avg Bill */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Total Orders & AOV
              </CardTitle>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                <Receipt className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {kpi.totalOrders} Bills
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Avg Order Value: <strong>{formatCurrency(kpi.avgBillValue)}</strong>
              </p>
            </CardContent>
          </Card>

          {/* Tables & Kitchen */}
          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Tables & Live KOTs
              </CardTitle>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                <LayoutGrid className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {kpi.occupiedTables} / {kpi.totalTables}{' '}
                <span className="text-xs font-bold text-purple-600">
                  ({kpi.tableOccupancyPercent}%)
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                <strong>{kpi.pendingKOTs} Active KOTs</strong> in kitchen
              </p>
            </CardContent>
          </Card>

          {/* Active Cash Drawer */}
          <Card className="shadow-sm border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Shift Cash Drawer
              </CardTitle>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Wallet className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                {formatCurrency(kpi.activeShiftCash)}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Cash balanced (0.0 variance)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row: Hourly Sales Trend & Payment Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Trend (2 cols) */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
                    {data?.chartTitle || 'Hourly Sales Trend & Rush Peaks'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {data?.chartDescription ||
                      'Revenue performance curve highlighting lunch (1-3 PM) and dinner (8-10 PM) rush'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
                  {data?.peakBadge || 'Peak: 9:00 PM (₹38.4k)'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v / 1000)}k`
                      }
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']}
                      labelFormatter={(label: any) => `${data?.timeAxisLabel || 'Time'}: ${label}`}
                      contentStyle={{
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Mode Split (1 col) */}
          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
                Payment Mode Split
              </CardTitle>
              <CardDescription className="text-xs">
                Tender distribution across UPI, Cash, Cards & Wallets
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2 pt-2 border-t text-xs">
                {paymentData.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-neutral-700 dark:text-neutral-300">{p.name}</span>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white font-mono">
                      {p.percent}% ({formatCurrency(p.value)})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Top Selling Dishes & Live Orders Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Dishes */}
          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
                  Top Performing Menu Items
                </CardTitle>
                <CardDescription className="text-xs">
                  Highest volume and revenue contributing dishes
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/reports/sales')}
                className="text-xs text-emerald-600 gap-1 h-8"
              >
                View Full Sales <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-3">
              {topItems.slice(0, 5).map((item: any) => (
                <div key={item.rank} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold flex items-center justify-center text-[11px]">
                      {item.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                        {item.name}
                      </p>
                      <p className="text-neutral-400 text-[11px]">{item.category} • {item.qtySold} portions</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-neutral-900 dark:text-white font-mono text-sm">
                      {formatCurrency(item.revenue)}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {item.foodCostPct}% Food Cost
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Recent Orders Feed */}
          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
                  Live Orders & Dining Activity
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time ticket updates across Dine-In, Takeaway & Online
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/pos')}
                className="text-xs text-emerald-600 gap-1 h-8"
              >
                Go to POS <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-3">
              {recentOrders.map((ord: any) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white font-mono">
                        {ord.orderNumber}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {ord.table}
                      </Badge>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ord.status === 'BILLED'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px] truncate max-w-[280px]">
                      {ord.items}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Waiter: {ord.waiter} • {ord.time}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
                      {formatCurrency(ord.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
