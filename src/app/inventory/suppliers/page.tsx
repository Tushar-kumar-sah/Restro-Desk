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
import { formatCurrency, formatIndianPhone } from '@/lib/formatters';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SupplierItem {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  paymentTerms: string;
  outstandingBalance: number;
  totalPurchasesYtd: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState({
    totalSuppliers: 0,
    totalPayableLiability: 0,
    totalPurchasesYtd: 0,
  });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [supplierDetails, setSupplierDetails] = useState<{ purchaseOrders: any[]; grns: any[] } | null>(
    null
  );
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Supplier Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    paymentTerms: 'Net 30 Days',
    initialBalance: 0,
  });

  // Record Payment Form State
  const [payAmount, setPayAmount] = useState(5000);
  const [payRef, setPayRef] = useState('HDFC Bank NEFT ref #99812');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/suppliers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const openSupplierLedger = async (sup: SupplierItem) => {
    setSelectedSupplier(sup);
    try {
      const res = await fetch(`/api/inventory/suppliers/${sup.id}`);
      const data = await res.json();
      if (data.success) {
        setSupplierDetails({
          purchaseOrders: data.purchaseOrders || [],
          grns: data.grns || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.phone) {
      showToast('Please provide vendor name, contact person and mobile', 'error');
      return;
    }

    try {
      const res = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          initialBalance: Number(formData.initialBalance),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          contactPerson: '',
          phone: '',
          email: '',
          gstin: '',
          address: '',
          city: 'Bengaluru',
          state: 'Karnataka',
          paymentTerms: 'Net 30 Days',
          initialBalance: 0,
        });
        fetchSuppliers();
      } else {
        showToast(data.message || 'Failed to add supplier', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedSupplier) return;
    try {
      const newBal = Math.max(0, Math.round((selectedSupplier.outstandingBalance - payAmount) * 100) / 100);
      const res = await fetch(`/api/inventory/suppliers/${selectedSupplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outstandingBalance: newBal }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment of ${formatCurrency(payAmount)} recorded. New balance: ${formatCurrency(newBal)}`);
        setIsPayModalOpen(false);
        setSelectedSupplier((prev) => (prev ? { ...prev, outstandingBalance: newBal } : null));
        fetchSuppliers();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

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
              <Building2 className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Suppliers & Vendor Ledger
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Manage authorized suppliers, GST compliance, payment terms, and accounts payable
              ledgers
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </Button>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Active Vendors
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {metrics.totalSuppliers} Suppliers
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Payable Liability
                </p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(metrics.totalPayableLiability)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Purchases YTD
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(metrics.totalPurchasesYtd)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Payment Terms
                </p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  Net 15 / Net 30
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Toolbar */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <Input
                placeholder="Search by vendor name, contact person, mobile, or GSTIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-neutral-50 dark:bg-neutral-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Contact Person & Phone</th>
                  <th className="py-3 px-4">GSTIN & City</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">Total Purchases YTD</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      Loading suppliers...
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      No suppliers registered yet. Click "+ Add Supplier".
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-neutral-900 dark:text-white">{s.name}</p>
                        <span className="text-xs text-neutral-400 truncate max-w-[200px] block">
                          {s.address}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">
                          {s.contactPerson}
                        </p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {formatIndianPhone(s.phone)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {s.gstin || 'GST Unregistered'}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {s.city}, {s.state}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs">
                          {s.paymentTerms}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-neutral-900 dark:text-white">
                        {s.outstandingBalance > 0 ? (
                          <span className="text-red-600 font-mono">
                            {formatCurrency(s.outstandingBalance)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-mono">₹0.00 (Settled)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-neutral-700 dark:text-neutral-300">
                        {formatCurrency(s.totalPurchasesYtd)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.outstandingBalance > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSupplier(s);
                                setPayAmount(s.outstandingBalance);
                                setIsPayModalOpen(true);
                              }}
                              className="h-8 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            >
                              Pay Bill
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openSupplierLedger(s)}
                            className="h-8 text-xs gap-1"
                          >
                            Statement
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* ADD SUPPLIER MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Add New Vendor / Supplier
              </DialogTitle>
              <DialogDescription>
                Register food distributor, farm produce supplier, or packaging vendor.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSupplier} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supName">Vendor Company Name *</Label>
                  <Input
                    id="supName"
                    required
                    placeholder="e.g. Royal Spices & Staples Co."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cpName">Contact Person *</Label>
                  <Input
                    id="cpName"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sPhone">Mobile Phone (+91) *</Label>
                  <Input
                    id="sPhone"
                    required
                    maxLength={10}
                    placeholder="e.g. 9811054321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sGst">GSTIN Number</Label>
                  <Input
                    id="sGst"
                    placeholder="29AAACA2101M1ZQ"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({ ...formData, gstin: e.target.value.toUpperCase() })
                    }
                    className="font-mono uppercase font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sTerms">Payment Terms</Label>
                  <select
                    id="sTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Weekly Settlement">Weekly Settlement (Net 7)</option>
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="Immediate UPI">Immediate UPI / Advance</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="sAddr">Warehouse / Office Address</Label>
                  <Input
                    id="sAddr"
                    placeholder="Plot 44, Industrial Area, Yeshwanthpur"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Register Supplier
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* RECORD PAYMENT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Record Vendor Payment
              </DialogTitle>
              <DialogDescription>
                Settle outstanding invoice balance for {selectedSupplier?.name} (Current liability:{' '}
                {formatCurrency(selectedSupplier?.outstandingBalance || 0)}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="pAmt">Payment Amount (₹)</Label>
                <Input
                  id="pAmt"
                  type="number"
                  min={1}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="font-mono text-base font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pRef">Bank Reference / Cheque #</Label>
                <Input
                  id="pRef"
                  placeholder="e.g. NEFT ref #8812, Cheque 409121"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} className="bg-emerald-600 text-white">
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* VENDOR STATEMENT & LEDGER DRAWER */}
        {/* ========================================================================= */}
        <Dialog open={!!selectedSupplier && !isPayModalOpen} onOpenChange={(open) => !open && setSelectedSupplier(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            {selectedSupplier && (
              <div>
                <DialogHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        {selectedSupplier.name}
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-1">
                        GSTIN: {selectedSupplier.gstin || 'N/A'} • Terms: {selectedSupplier.paymentTerms}
                      </DialogDescription>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-neutral-400 uppercase font-medium">Outstanding Balance</p>
                      <p className="text-lg font-bold text-red-600 font-mono">
                        {formatCurrency(selectedSupplier.outstandingBalance)}
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                    Recent Purchase Invoices & GRNs
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Transaction</th>
                          <th className="py-2.5 px-3">Invoice #</th>
                          <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {supplierDetails?.grns && supplierDetails.grns.length > 0 ? (
                          supplierDetails.grns.map((g: any) => (
                            <tr key={g.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                              <td className="py-2.5 px-3 text-neutral-500">{g.receivedDate}</td>
                              <td className="py-2.5 px-3 font-semibold text-neutral-800 dark:text-neutral-200">
                                GRN Delivery Verified ({g.grnNumber})
                              </td>
                              <td className="py-2.5 px-3 font-mono">{g.invoiceNumber}</td>
                              <td className="py-2.5 px-3 text-right font-bold font-mono">
                                {formatCurrency(g.totalAmount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-neutral-400">
                              No recent GRN deliveries recorded for this vendor.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <DialogFooter className="pt-2 border-t flex justify-between sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPayAmount(selectedSupplier.outstandingBalance);
                      setIsPayModalOpen(true);
                    }}
                    className="text-xs text-emerald-600 border-emerald-200"
                  >
                    Record Payment to Vendor
                  </Button>
                  <Button variant="default" onClick={() => setSelectedSupplier(null)} className="bg-neutral-900 text-white">
                    Close Statement
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
