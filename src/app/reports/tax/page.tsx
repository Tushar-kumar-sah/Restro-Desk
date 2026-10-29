'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Percent,
  CheckCircle2,
  Building2,
  Info,
  ShieldCheck,
  Receipt,
  FileText,
} from 'lucide-react';

export default function TaxReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/tax');
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
    fetchTaxData();
  }, []);

  const handleExportGSTR1 = () => {
    window.open('/api/reports/tax?export=csv', '_blank');
  };

  const taxSlabs = data?.taxSlabs || [];
  const b2bInvoices = data?.b2bInvoices || [];
  const totals = data?.totals || {
    totalTaxable: 4613571.42,
    totalCgst: 132364.29,
    totalSgst: 132364.29,
    totalTax: 264728.58,
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                GST & Tax Compliance Filings
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Indian Goods & Services Tax (GST) reports, rate slabs, SAC 9963 classification and
              GSTR-1 exports
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleExportGSTR1}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export GSTR-1 File (CSV)
            </Button>
          </div>
        </div>

        {/* GST Liability KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total Taxable Turnover
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                {formatCurrency(totals.totalTaxable)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                CGST (Central Tax)
              </p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {formatCurrency(totals.totalCgst)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                SGST (State Tax)
              </p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {formatCurrency(totals.totalSgst)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total GST Liability
              </p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {formatCurrency(totals.totalTax)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tax Slabs Rate Table */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b">
            <CardTitle className="text-base font-bold">GST Rate Slab Classification</CardTitle>
            <CardDescription className="text-xs">
              Breakdown of food services under SAC 9963 at standard 5% GST (2.5% CGST + 2.5% SGST)
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Rate Slab Description</th>
                  <th className="py-3 px-4">SAC / HSN</th>
                  <th className="py-3 px-4">Taxable Value (₹)</th>
                  <th className="py-3 px-4">CGST (₹)</th>
                  <th className="py-3 px-4">SGST (₹)</th>
                  <th className="py-3 px-4">Total Tax (₹)</th>
                  <th className="py-3 px-4 text-right">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {taxSlabs.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                      {s.rateSlab}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">{s.sacCode}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {formatCurrency(s.taxableValue)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-600">
                      {formatCurrency(s.cgstAmount)}{' '}
                      <span className="text-[10px] text-neutral-400">({s.cgstRate})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-600">
                      {formatCurrency(s.sgstAmount)}{' '}
                      <span className="text-[10px] text-neutral-400">({s.sgstRate})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {formatCurrency(s.totalTax)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium">
                      {s.invoiceCount.toLocaleString('en-IN')} bills
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* B2B Invoices with Customer GSTIN */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">
                B2B Tax Invoices (With Corporate GSTIN)
              </CardTitle>
              <CardDescription className="text-xs">
                Invoices where corporate guests claimed Input Tax Credit (ITC)
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {b2bInvoices.length} Registered Buyers
            </Badge>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Corporate Customer</th>
                  <th className="py-3 px-4">Buyer GSTIN</th>
                  <th className="py-3 px-4">Taxable Value (₹)</th>
                  <th className="py-3 px-4">CGST (2.5%)</th>
                  <th className="py-3 px-4">SGST (2.5%)</th>
                  <th className="py-3 px-4 text-right">Total Invoice (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {b2bInvoices.map((inv: any, idx: number) => (
                  <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{inv.date}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      {inv.customerGstin}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {formatCurrency(inv.taxableValue)}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600">{formatCurrency(inv.cgst)}</td>
                    <td className="py-3 px-4 font-mono text-blue-600">{formatCurrency(inv.sgst)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(inv.totalInvoiceValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* GST Filing Compliance Advisory */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border flex items-start gap-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <Info className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-neutral-900 dark:text-white">
              Indian Restaurant GST Statutory Guidelines (Notification No. 46/2017):
            </p>
            <p>
              Standalone restaurants charge <strong>5% GST (2.5% CGST + 2.5% SGST)</strong> without
              claiming Input Tax Credit (ITC) on inward supplies. B2B invoices containing corporate
              GSTINs are declared in Table 4A of <strong>GSTR-1</strong>, while consumer dining is
              reported under Table 7 (B2C Small).
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
