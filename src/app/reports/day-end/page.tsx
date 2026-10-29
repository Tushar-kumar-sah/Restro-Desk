'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import {
  FileText,
  Printer,
  Lock,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Receipt,
  Calculator,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ZReportData {
  id: string;
  zReportNumber: string;
  businessDate: string;
  generatedAt: string;
  generatedBy: string;
  outletName: string;
  grossSales: number;
  itemDiscounts: number;
  billDiscounts: number;
  netSales: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  packagingCharge: number;
  deliveryCharge: number;
  roundOff: number;
  finalTotal: number;
  paymentBreakdown: {
    cash: number;
    cashOrders: number;
    upi: number;
    upiOrders: number;
    card: number;
    cardOrders: number;
    wallet: number;
    walletOrders: number;
    loyaltyPoints: number;
  };
  orderTypeBreakdown: {
    dineInSales: number;
    dineInOrders: number;
    takeawaySales: number;
    takeawayOrders: number;
    onlineSales: number;
    onlineOrders: number;
  };
  totalOrders: number;
  voidedOrdersCount: number;
  voidedTotalAmount: number;
  cashReconciliation: {
    openingFloat: number;
    cashSales: number;
    cashExpenses: number;
    expectedCash: number;
    actualCash: number;
    variance: number;
  };
}

export default function DayEndPage() {
  const [currentZ, setCurrentZ] = useState<ZReportData | null>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // Cash Denominations
  const [denoms, setDenoms] = useState<{ [key: number]: number }>({
    500: 60, // 30,000
    200: 35, // 7,000
    100: 25, // 2,500
    50: 10,  // 500
    20: 5,   // 100
    10: 5,   // 50
  });

  // Expense Form
  const [expenseAmount, setExpenseAmount] = useState(450);
  const [expenseNote, setExpenseNote] = useState('Emergency dairy & ice bags purchase');

  const calculatedDenomTotal = Object.entries(denoms).reduce(
    (acc, [val, count]) => acc + Number(val) * (Number(count) || 0),
    0
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [zRes, shiftRes] = await Promise.all([
        fetch('/api/reports/day-end'),
        fetch('/api/reports/shifts'),
      ]);
      const [zData, shiftData] = await Promise.all([zRes.json(), shiftRes.json()]);

      if (zData.success) setCurrentZ(zData.currentZReport);
      if (shiftData.success) setActiveShift(shiftData.activeShift);
    } catch (err) {
      console.error(err);
      showToast('Failed to load Day-End data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reports/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EXPENSE',
          amount: Number(expenseAmount),
          note: expenseNote,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setIsExpenseModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleLockDayEnd = async () => {
    try {
      const res = await fetch('/api/reports/day-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualCashInDrawer: calculatedDenomTotal,
          closingNotes: 'Night audit verified and locked',
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setIsLockModalOpen(false);
        setCurrentZ(json.zReport);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const expectedCash = activeShift?.expectedCash || currentZ?.cashReconciliation.expectedCash || 40150.0;
  const cashVariance = Math.round((calculatedDenomTotal - expectedCash) * 100) / 100;

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Toast Alert */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 border animate-in fade-in slide-in-from-top-4 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {notification.message}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Day-End Settlement & Z-Report
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              PetPooja-standard nightly register lock, cash drawer reconciliation and thermal Z-Report print
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setIsExpenseModalOpen(true)}
              className="gap-2 text-xs text-neutral-700 dark:text-neutral-300"
            >
              <DollarSign className="w-4 h-4 text-amber-600" />
              Cash Out / Expense
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsPrintModalOpen(true)}
              className="gap-2 text-xs text-neutral-700 dark:text-neutral-300"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              Print Thermal Z-Slip
            </Button>

            <Button
              onClick={() => setIsLockModalOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
            >
              <Lock className="w-4 h-4" />
              Lock Day-End
            </Button>
          </div>
        </div>

        {/* Top Split: Active Shift Reconciliation & Cash Denominations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Shift Card */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  Active Cash Drawer Shift (#1)
                </CardTitle>
                <CardDescription className="text-xs">
                  Cashier on duty: {activeShift?.cashierName || 'Kavita Sen'} • Started at 11:00 AM
                </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 font-bold text-xs">
                {activeShift?.status || 'ACTIVE'}
              </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border">
                  <p className="text-[11px] text-neutral-400 uppercase font-medium">Opening Float</p>
                  <p className="text-base font-bold font-mono mt-0.5">
                    {formatCurrency(activeShift?.openingCash || 5000)}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border">
                  <p className="text-[11px] text-neutral-400 uppercase font-medium">Cash Sales In</p>
                  <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                    +{formatCurrency(activeShift?.cashSales || 34850)}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border">
                  <p className="text-[11px] text-neutral-400 uppercase font-medium">Cash Expenses</p>
                  <p className="text-base font-bold text-red-500 font-mono mt-0.5">
                    -{formatCurrency(activeShift?.cashExpenses || 1200)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 uppercase font-bold">
                    Expected in Drawer
                  </p>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                    {formatCurrency(expectedCash)}
                  </p>
                </div>
              </div>

              {/* Recent Drawer Transactions */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase text-neutral-400 mb-2">
                  Shift Cash Log Entries
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500">
                      <tr>
                        <th className="py-2 px-3">Time</th>
                        <th className="py-2 px-3">Entry Type</th>
                        <th className="py-2 px-3">Note / Reference</th>
                        <th className="py-2 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(activeShift?.cashDrawerEntries || []).map((e: any) => (
                        <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                          <td className="py-2 px-3 text-neutral-500">{e.time}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                e.type === 'FLOAT_IN'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {e.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-neutral-700 dark:text-neutral-300">
                            {e.note}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-bold font-mono ${
                              e.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {e.amount >= 0 ? `+${formatCurrency(e.amount)}` : formatCurrency(e.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Denominations Calculator */}
          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-3 border-b">
              <CardTitle className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                Physical Cash Denominations
              </CardTitle>
              <CardDescription className="text-xs">
                Count notes in drawer to verify register balance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {[500, 200, 100, 50, 20, 10].map((note) => (
                <div key={note} className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold w-16 text-neutral-800 dark:text-neutral-200">
                    ₹{note} x
                  </span>
                  <Input
                    type="number"
                    min={0}
                    className="w-20 h-7 text-xs font-mono text-center"
                    value={denoms[note] ?? 0}
                    onChange={(e) =>
                      setDenoms({ ...denoms, [note]: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                  <span className="font-mono font-bold text-neutral-900 dark:text-white w-20 text-right">
                    = ₹{(note * (denoms[note] || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Physical Counted:</span>
                  <strong className="font-mono text-sm text-neutral-900 dark:text-white">
                    {formatCurrency(calculatedDenomTotal)}
                  </strong>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Expected Cash:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {formatCurrency(expectedCash)}
                  </span>
                </div>

                <div className="flex justify-between text-xs pt-1 border-t">
                  <span className="font-semibold">Cash Variance:</span>
                  <span
                    className={`font-mono font-bold ${
                      cashVariance === 0
                        ? 'text-emerald-600'
                        : cashVariance > 0
                        ? 'text-blue-600'
                        : 'text-red-500'
                    }`}
                  >
                    {cashVariance === 0
                      ? '₹0.00 (Balanced)'
                      : cashVariance > 0
                      ? `+${formatCurrency(cashVariance)} (Excess)`
                      : `${formatCurrency(cashVariance)} (Shortage)`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Z-Report Summary Slip Card */}
        {currentZ && (
          <Card className="shadow-sm border">
            <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Day-End Z-Report ({currentZ.zReportNumber})
                </CardTitle>
                <CardDescription className="text-xs">
                  Business Date: {formatIndianDate(currentZ.businessDate)} • Generated by {currentZ.generatedBy}
                </CardDescription>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPrintModalOpen(true)}
                className="gap-1.5 text-xs text-emerald-600"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Z-Report
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* 3 Column Financial Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Col 1: Sales Figures */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border space-y-2">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">
                    Sales Breakdown
                  </h4>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">Gross Sales:</span>
                    <span className="font-mono font-semibold">{formatCurrency(currentZ.grossSales)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">Item Discounts:</span>
                    <span className="font-mono text-amber-600">-{formatCurrency(currentZ.itemDiscounts)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">Bill Discounts:</span>
                    <span className="font-mono text-amber-600">-{formatCurrency(currentZ.billDiscounts)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">Net Taxable Sales:</span>
                    <span className="font-mono font-bold">{formatCurrency(currentZ.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">CGST (2.5%):</span>
                    <span className="font-mono text-blue-600">{formatCurrency(currentZ.cgst)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">SGST (2.5%):</span>
                    <span className="font-mono text-blue-600">{formatCurrency(currentZ.sgst)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">Packaging & Delivery:</span>
                    <span className="font-mono">
                      {formatCurrency(currentZ.packagingCharge + currentZ.deliveryCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 font-bold text-sm text-emerald-600 border-t">
                    <span>Final Day Total:</span>
                    <span className="font-mono">{formatCurrency(currentZ.finalTotal)}</span>
                  </div>
                </div>

                {/* Col 2: Payment Tenders */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border space-y-2">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">
                    Payment Settlements
                  </h4>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">
                      UPI QR ({currentZ.paymentBreakdown.upiOrders} orders):
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      {formatCurrency(currentZ.paymentBreakdown.upi)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">
                      Cash ({currentZ.paymentBreakdown.cashOrders} orders):
                    </span>
                    <span className="font-mono font-bold text-amber-600">
                      {formatCurrency(currentZ.paymentBreakdown.cash)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">
                      Card ({currentZ.paymentBreakdown.cardOrders} orders):
                    </span>
                    <span className="font-mono font-bold text-indigo-600">
                      {formatCurrency(currentZ.paymentBreakdown.card)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">
                      Pre-paid Wallet ({currentZ.paymentBreakdown.walletOrders} orders):
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrency(currentZ.paymentBreakdown.wallet)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">Loyalty Points Settled:</span>
                    <span className="font-mono font-bold text-pink-600">
                      {formatCurrency(currentZ.paymentBreakdown.loyaltyPoints)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 font-bold text-sm text-neutral-900 dark:text-white border-t">
                    <span>Total Tenders Succeeded:</span>
                    <span className="font-mono">{formatCurrency(currentZ.finalTotal)}</span>
                  </div>
                </div>

                {/* Col 3: Channel Orders & Voids */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border space-y-2">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">
                    Order Channel Volumes
                  </h4>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">
                      Dine-In ({currentZ.orderTypeBreakdown.dineInOrders} orders):
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrency(currentZ.orderTypeBreakdown.dineInSales)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">
                      Takeaway ({currentZ.orderTypeBreakdown.takeawayOrders} orders):
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrency(currentZ.orderTypeBreakdown.takeawaySales)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">
                      Online Delivery ({currentZ.orderTypeBreakdown.onlineOrders} orders):
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrency(currentZ.orderTypeBreakdown.onlineSales)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-neutral-500">Total Bills Issued:</span>
                    <span className="font-mono font-bold">{currentZ.totalOrders}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b text-red-500">
                    <span>Voided / Cancelled Bills:</span>
                    <span className="font-mono font-bold">
                      {currentZ.voidedOrdersCount} ({formatCurrency(currentZ.voidedTotalAmount)})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* RECORD CASH EXPENSE MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                Record Cash Payout / Expense
              </DialogTitle>
              <DialogDescription>
                Record petty cash expenses paid directly from the counter cash drawer.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordExpense} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="eAmt">Expense Amount (₹) *</Label>
                <Input
                  id="eAmt"
                  type="number"
                  required
                  min={1}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  className="font-mono text-base font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eNote">Expense Reason / Description *</Label>
                <Input
                  id="eNote"
                  required
                  placeholder="e.g. Local ice bags, emergency lemons, courier"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Record Cash Payout
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* LOCK DAY-END MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Confirm Night Day-End Lock
              </DialogTitle>
              <DialogDescription>
                Locking the day-end will freeze all sales, close active shifts, and finalize the
                accounting Z-Report.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Net Sales:</span>
                  <strong className="font-mono">{formatCurrency(currentZ?.netSales || 154200)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Physical Cash Count:</span>
                  <strong className="font-mono">{formatCurrency(calculatedDenomTotal)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cash Variance:</span>
                  <strong className={cashVariance === 0 ? 'text-emerald-600' : 'text-red-500'}>
                    {cashVariance === 0 ? '₹0.00 (Balanced)' : formatCurrency(cashVariance)}
                  </strong>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLockModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLockDayEnd} className="bg-emerald-600 text-white">
                Finalize & Lock Z-Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* THERMAL Z-REPORT PRINT SLIP MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2 border-b">
              <DialogTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                Thermal Z-Report Slip (80mm / 58mm)
              </DialogTitle>
            </DialogHeader>

            {/* Thermal Monospaced Paper Container */}
            <div className="p-6 bg-white text-black font-mono text-xs border rounded-lg shadow-inner max-w-xs mx-auto leading-relaxed">
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-black">
                <p className="font-bold text-sm tracking-wider">RESTODESK RESTAURANT</p>
                <p className="text-[11px]">Indiranagar Flagship</p>
                <p className="text-[10px]">GSTIN: 29AABCU9603R1ZM</p>
                <p className="text-[10px]">FSSAI: 11223334000551</p>
                <p className="font-bold text-xs pt-1 uppercase">*** DAY-END Z-REPORT ***</p>
                <p className="text-[10px]">{currentZ?.zReportNumber}</p>
                <p className="text-[10px]">{new Date().toLocaleString('en-IN')}</p>
              </div>

              <div className="py-2 border-b border-dashed border-black space-y-1">
                <div className="flex justify-between">
                  <span>Gross Sales:</span>
                  <span>{formatCurrency(currentZ?.grossSales || 161200)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency((currentZ?.itemDiscounts || 0) + (currentZ?.billDiscounts || 0))}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Taxable Sales:</span>
                  <span>{formatCurrency(currentZ?.taxableAmount || 146857)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (2.5%):</span>
                  <span>{formatCurrency(currentZ?.cgst || 3671.5)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%):</span>
                  <span>{formatCurrency(currentZ?.sgst || 3671.5)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                  <span>NET SALES:</span>
                  <span>{formatCurrency(currentZ?.finalTotal || 164493)}</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-black space-y-1">
                <p className="font-bold text-[11px] uppercase">-- TENDER BREAKDOWN --</p>
                <div className="flex justify-between">
                  <span>UPI / QR:</span>
                  <span>{formatCurrency(currentZ?.paymentBreakdown.upi || 74600)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Tender:</span>
                  <span>{formatCurrency(currentZ?.paymentBreakdown.cash || 42800)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cards:</span>
                  <span>{formatCurrency(currentZ?.paymentBreakdown.card || 31200)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wallet:</span>
                  <span>{formatCurrency(currentZ?.paymentBreakdown.wallet || 5400)}</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-black space-y-1">
                <p className="font-bold text-[11px] uppercase">-- CASH RECONCILIATION --</p>
                <div className="flex justify-between">
                  <span>Opening Float:</span>
                  <span>{formatCurrency(5000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span>{formatCurrency(34850)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenses Paid:</span>
                  <span>-{formatCurrency(1200)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Expected Cash:</span>
                  <span>{formatCurrency(40150)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Actual Cash:</span>
                  <span>{formatCurrency(calculatedDenomTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-[11px]">
                  <span>VARIANCE:</span>
                  <span>{cashVariance === 0 ? 'BALANCED' : formatCurrency(cashVariance)}</span>
                </div>
              </div>

              <div className="pt-3 text-center space-y-0.5 text-[10px]">
                <p>Audited By: {currentZ?.generatedBy}</p>
                <p>Closed register officially locked.</p>
                <p>*** END OF Z-REPORT ***</p>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t flex justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  window.print();
                }}
                className="gap-2 text-xs"
              >
                <Printer className="w-4 h-4" />
                Print to Receipt Printer
              </Button>
              <Button onClick={() => setIsPrintModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
