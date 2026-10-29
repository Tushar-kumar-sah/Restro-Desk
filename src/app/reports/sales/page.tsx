'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import {
  TrendingUp,
  Download,
  Calendar,
  Receipt,
  Percent,
  AlertTriangle,
  Ban,
  FileSpreadsheet,
  PieChart as PieIcon,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function SalesReportPage() {
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/sales?period=${period}`);
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
    fetchSalesReport();
  }, [period]);

  const handleExportCSV = () => {
    window.open(`/api/reports/sales?period=${period}&export=csv`, '_blank');
  };

  const summary = data?.summary || {
    totalNetSales: 1079300,
    totalOrders: 1087,
    totalTaxesCollected: 51433,
    totalDiscountsGiven: 53300,
    avgTicketSize: 993,
  };

  const dailySales = data?.dailySales || [];
  const itemSales = data?.itemSales || [];
  const categorySales = data?.categorySales || [];
  const voidedBills = data?.voidedBills || [];

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Sales & Revenue Analytics
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Daily revenue breakdown, item profitability, category share, and void audits
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPeriod('today')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === 'today'
                    ? 'bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setPeriod('7d')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === '7d'
                    ? 'bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setPeriod('30d')}
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
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2 text-neutral-700 dark:text-neutral-300 text-xs"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total Net Sales
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                {formatCurrency(summary.totalNetSales)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total Orders Billed
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                {summary.totalOrders} Bills
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Avg Order Value
              </p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {formatCurrency(summary.avgTicketSize)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                GST Tax Collected
              </p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {formatCurrency(summary.totalTaxesCollected)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Discounts Availed
              </p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {formatCurrency(summary.totalDiscountsGiven)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Reports */}
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
            <TabsTrigger value="items">Item-wise Sales</TabsTrigger>
            <TabsTrigger value="categories">Category Contribution</TabsTrigger>
            <TabsTrigger value="voids">Void & Cancellation Audit</TabsTrigger>
          </TabsList>

          {/* TAB 1: DAILY BREAKDOWN */}
          <TabsContent value="daily" className="space-y-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Gross Sales (₹)</th>
                      <th className="py-3 px-4">Discounts (₹)</th>
                      <th className="py-3 px-4">Taxable Value (₹)</th>
                      <th className="py-3 px-4">GST Tax (₹)</th>
                      <th className="py-3 px-4 text-right">Net Sales (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {dailySales.map((d: any, idx: number) => (
                      <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                        <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                          {d.date}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{d.orders} bills</td>
                        <td className="py-3.5 px-4 font-mono">{formatCurrency(d.grossSales)}</td>
                        <td className="py-3.5 px-4 font-mono text-amber-600">
                          {formatCurrency(d.discount)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                          {formatCurrency(d.taxable)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-blue-600">
                          {formatCurrency(d.tax)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">
                          {formatCurrency(d.netSales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: ITEM-WISE SALES */}
          <TabsContent value="items" className="space-y-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Rank & Dish Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Portions Sold</th>
                      <th className="py-3 px-4">Total Revenue (₹)</th>
                      <th className="py-3 px-4">Food Cost %</th>
                      <th className="py-3 px-4 text-right">Profit Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {itemSales.map((item: any) => (
                      <tr key={item.rank} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                        <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                          <span className="text-xs text-neutral-400 mr-2 font-mono">#{item.rank}</span>
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">{item.qtySold} portions</td>
                        <td className="py-3.5 px-4 font-bold font-mono text-neutral-900 dark:text-white">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-emerald-600">
                            {item.foodCostPct}% Food Cost
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 font-mono">
                          {formatCurrency(item.revenue * (1 - item.foodCostPct / 100))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: CATEGORY CONTRIBUTION */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorySales.map((cat: any, idx: number) => (
                <Card key={idx} className="shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {cat.category}
                      </h4>
                      <p className="text-xs text-neutral-400">{cat.itemsSold} portions served</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-600 font-mono">
                      {formatCurrency(cat.totalSales)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>Menu Sales Share</span>
                      <span className="font-bold">{cat.sharePercent}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${cat.sharePercent}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: VOID & CANCELLATION AUDIT */}
          <TabsContent value="voids" className="space-y-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Voided Items</th>
                      <th className="py-3 px-4">Waiter</th>
                      <th className="py-3 px-4">Manager Approval</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4 text-right">Void Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {voidedBills.map((v: any, idx: number) => (
                      <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                        <td className="py-3 px-4 font-mono font-bold text-red-600">
                          {v.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">{v.time}</td>
                        <td className="py-3 px-4 font-medium text-neutral-800 dark:text-neutral-200">
                          {v.items}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">{v.waiter}</td>
                        <td className="py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">
                          {v.voidedBy}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">{v.reason}</td>
                        <td className="py-3 px-4 text-right font-bold text-red-600 font-mono">
                          {formatCurrency(v.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
