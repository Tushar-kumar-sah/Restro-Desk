'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  FileText,
  Calendar,
  Clock,
  Building2,
  Eye,
  Check,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  notes: string;
  items: Array<{
    id?: string;
    rawMaterialId: string;
    rawMaterialName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface GRNItemRecord {
  id: string;
  grnNumber: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  poNumber?: string;
  receivedDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'VERIFIED' | 'REJECTED';
  notes: string;
  items: Array<{
    rawMaterialName: string;
    unit: string;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    unitPrice: number;
    totalAmount: number;
  }>;
}

export default function PurchasePage() {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [grns, setGrns] = useState<GRNItemRecord[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderItem | null>(null);
  const [selectedGrn, setSelectedGrn] = useState<GRNItemRecord | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Create PO Form State
  const [poFormSupplierId, setPoFormSupplierId] = useState('');
  const [poFormDeliveryDate, setPoFormDeliveryDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [poFormNotes, setPoFormNotes] = useState('');
  const [poFormItems, setPoFormItems] = useState<
    Array<{ rawMaterialId: string; quantity: number; unitPrice: number }>
  >([
    { rawMaterialId: 'rm-01', quantity: 20, unitPrice: 340 },
  ]);

  // Create GRN Form State
  const [grnSupplierId, setGrnSupplierId] = useState('');
  const [grnInvoiceNumber, setGrnInvoiceNumber] = useState('');
  const [grnPoId, setGrnPoId] = useState('');
  const [grnNotes, setGrnNotes] = useState('Quality check passed');
  const [grnItems, setGrnItems] = useState<
    Array<{
      rawMaterialId: string;
      receivedQty: number;
      acceptedQty: number;
      rejectedQty: number;
      unitPrice: number;
    }>
  >([
    { rawMaterialId: 'rm-01', receivedQty: 25, acceptedQty: 25, rejectedQty: 0, unitPrice: 340 },
  ]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [poRes, grnRes, supRes, matRes] = await Promise.all([
        fetch(`/api/inventory/purchase-orders?search=${encodeURIComponent(search)}&status=${statusFilter}`),
        fetch('/api/inventory/grn'),
        fetch('/api/inventory/suppliers'),
        fetch('/api/inventory/raw-materials'),
      ]);

      const [poData, grnData, supData, matData] = await Promise.all([
        poRes.json(),
        grnRes.json(),
        supRes.json(),
        matRes.json(),
      ]);

      if (poData.success) setOrders(poData.orders || []);
      if (grnData.success) setGrns(grnData.grns || []);
      if (supData.success) {
        setSuppliers(supData.suppliers || []);
        if (supData.suppliers?.length > 0 && !poFormSupplierId) {
          setPoFormSupplierId(supData.suppliers[0].id);
          setGrnSupplierId(supData.suppliers[0].id);
        }
      }
      if (matData.success) setRawMaterials(matData.materials || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load purchase records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const addPoItemRow = () => {
    const defaultRm = rawMaterials[0] || { id: 'rm-01', costPerUnit: 100 };
    setPoFormItems([
      ...poFormItems,
      { rawMaterialId: defaultRm.id, quantity: 10, unitPrice: defaultRm.costPerUnit || 100 },
    ]);
  };

  const removePoItemRow = (idx: number) => {
    if (poFormItems.length <= 1) return;
    setPoFormItems(poFormItems.filter((_, i) => i !== idx));
  };

  const updatePoItemRow = (idx: number, updates: any) => {
    const updated = [...poFormItems];
    updated[idx] = { ...updated[idx], ...updates };
    setPoFormItems(updated);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poFormSupplierId) {
      showToast('Please select a supplier', 'error');
      return;
    }

    try {
      const res = await fetch('/api/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: poFormSupplierId,
          expectedDeliveryDate: poFormDeliveryDate,
          notes: poFormNotes,
          items: poFormItems.map((i) => ({
            rawMaterialId: i.rawMaterialId,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsPoModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to create PO', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const openGrnForPo = (po: PurchaseOrderItem) => {
    setGrnPoId(po.id);
    setGrnSupplierId(po.supplierId);
    setGrnInvoiceNumber(`INV-${po.poNumber.slice(-3)}-${Date.now().toString().slice(-4)}`);
    setGrnItems(
      po.items.map((it) => ({
        rawMaterialId: it.rawMaterialId,
        receivedQty: it.quantity,
        acceptedQty: it.quantity,
        rejectedQty: 0,
        unitPrice: it.unitPrice,
      }))
    );
    setIsGrnModalOpen(true);
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnInvoiceNumber) {
      showToast('Please provide supplier invoice number', 'error');
      return;
    }

    try {
      const res = await fetch('/api/inventory/grn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: grnSupplierId,
          purchaseOrderId: grnPoId || null,
          invoiceNumber: grnInvoiceNumber,
          notes: grnNotes,
          items: grnItems.map((i) => ({
            rawMaterialId: i.rawMaterialId,
            receivedQty: Number(i.receivedQty),
            acceptedQty: Number(i.acceptedQty),
            rejectedQty: Number(i.rejectedQty),
            unitPrice: Number(i.unitPrice),
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsGrnModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to verify GRN', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Received
          </span>
        );
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="w-3 h-3 text-blue-600" /> Issued & Dispatched
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
            Draft
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <Truck className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Purchase Orders & Goods Received (GRN)
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Procurement tracking, supplier delivery checks, and automatic inventory stock receipt
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => {
                setGrnPoId('');
                setIsGrnModalOpen(true);
              }}
              className="gap-2 text-xs text-neutral-700 dark:text-neutral-300"
            >
              <PackageCheck className="w-4 h-4" />
              Direct GRN Entry
            </Button>

            <Button
              onClick={() => setIsPoModalOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Purchase Order
            </Button>
          </div>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Active POs
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {orders.filter((po) => po.status === 'ISSUED').length} In Transit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Verified GRNs
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {grns.length} Received
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total PO Commitments
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(orders.reduce((acc, po) => acc + po.totalAmount, 0))}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Vendors Contracted
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {suppliers.length} Vendors
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for PO vs GRN */}
        <Tabs defaultValue="po" className="space-y-4">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="po">Purchase Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="grn">Goods Received Notes / GRN ({grns.length})</TabsTrigger>
          </TabsList>

          {/* TAB 1: PURCHASE ORDERS */}
          <TabsContent value="po" className="space-y-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">PO Number</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Order Date</th>
                      <th className="py-3 px-4">Delivery Expected</th>
                      <th className="py-3 px-4">Total Amount (₹)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-500">
                          Loading purchase orders...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          No purchase orders recorded yet. Click "+ Create Purchase Order".
                        </td>
                      </tr>
                    ) : (
                      orders.map((po) => (
                        <tr key={po.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {po.poNumber}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                            {po.supplierName}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 text-xs">
                            {formatIndianDate(po.orderDate)}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 text-xs">
                            {formatIndianDate(po.expectedDeliveryDate)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                            {formatCurrency(po.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(po.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {po.status === 'ISSUED' && (
                                <Button
                                  size="sm"
                                  onClick={() => openGrnForPo(po)}
                                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                >
                                  <PackageCheck className="w-3.5 h-3.5" />
                                  Receive GRN
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPo(po)}
                                className="h-8 text-xs gap-1"
                              >
                                View Items
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
          </TabsContent>

          {/* TAB 2: GOODS RECEIVED NOTES */}
          <TabsContent value="grn" className="space-y-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">GRN #</th>
                      <th className="py-3 px-4">Supplier Invoice #</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Associated PO</th>
                      <th className="py-3 px-4">Received Date</th>
                      <th className="py-3 px-4">Total Amount (₹)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {grns.map((g) => (
                      <tr key={g.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {g.grnNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                          {g.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                          {g.supplierName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-neutral-400">
                          {g.poNumber || 'Direct Purchase'}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 text-xs">
                          {formatIndianDate(g.receivedDate)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                          {formatCurrency(g.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedGrn(g)}
                            className="h-8 text-xs"
                          >
                            Inspect Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ========================================================================= */}
        {/* CREATE PURCHASE ORDER MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isPoModalOpen} onOpenChange={setIsPoModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                Issue New Purchase Order (PO)
              </DialogTitle>
              <DialogDescription>
                Generate an official PO to suppliers with items, quantities, and agreed unit prices.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePO} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="poSup">Select Supplier *</Label>
                  <select
                    id="poSup"
                    value={poFormSupplierId}
                    onChange={(e) => setPoFormSupplierId(e.target.value)}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.paymentTerms})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="poDue">Expected Delivery Date *</Label>
                  <Input
                    id="poDue"
                    type="date"
                    required
                    value={poFormDeliveryDate}
                    onChange={(e) => setPoFormDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="poNotes">Delivery Instructions</Label>
                  <Input
                    id="poNotes"
                    placeholder="e.g. Delivery before 9:00 AM gate 2"
                    value={poFormNotes}
                    onChange={(e) => setPoFormNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                    Line Items
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addPoItemRow}
                    className="h-7 text-xs text-emerald-600 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {poFormItems.map((itm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border text-xs"
                    >
                      <select
                        value={itm.rawMaterialId}
                        onChange={(e) => updatePoItemRow(idx, { rawMaterialId: e.target.value })}
                        className="flex-1 px-2 py-1.5 rounded border bg-white dark:bg-neutral-800 text-xs"
                      >
                        {rawMaterials.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name} ({rm.unit})
                          </option>
                        ))}
                      </select>

                      <Input
                        type="number"
                        placeholder="Qty"
                        value={itm.quantity}
                        onChange={(e) =>
                          updatePoItemRow(idx, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 h-8 text-xs font-mono bg-white dark:bg-neutral-800"
                      />

                      <Input
                        type="number"
                        placeholder="Price ₹"
                        value={itm.unitPrice}
                        onChange={(e) =>
                          updatePoItemRow(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-24 h-8 text-xs font-mono bg-white dark:bg-neutral-800"
                      />

                      <span className="w-24 text-right font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(itm.quantity * itm.unitPrice)}
                      </span>

                      {poFormItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePoItemRow(idx)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border flex items-center justify-between text-xs">
                <span className="text-neutral-500">Total Purchase Commitment:</span>
                <span className="font-bold text-base text-neutral-900 dark:text-white font-mono">
                  {formatCurrency(
                    poFormItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
                  )}
                </span>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsPoModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Issue Purchase Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* RECEIVE GOODS (GRN) MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isGrnModalOpen} onOpenChange={setIsGrnModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                Goods Received Note (GRN) Verification
              </DialogTitle>
              <DialogDescription>
                Record received vs accepted quantities. Accepted items are automatically incremented
                in inventory stock.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateGRN} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="grnInv">Supplier Tax Invoice # *</Label>
                  <Input
                    id="grnInv"
                    required
                    placeholder="e.g. INV-AMUL-2026-904"
                    value={grnInvoiceNumber}
                    onChange={(e) => setGrnInvoiceNumber(e.target.value)}
                    className="font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="grnSup">Supplier</Label>
                  <select
                    id="grnSup"
                    value={grnSupplierId}
                    onChange={(e) => setGrnSupplierId(e.target.value)}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Received</th>
                      <th className="py-2.5 px-3">Accepted Qty</th>
                      <th className="py-2.5 px-3">Price ₹</th>
                      <th className="py-2.5 px-3 text-right">Total ₹</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {grnItems.map((itm, idx) => {
                      const rm = rawMaterials.find((m) => m.id === itm.rawMaterialId);
                      return (
                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                          <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">
                            {rm?.name || itm.rawMaterialId} ({rm?.unit})
                          </td>
                          <td className="py-2.5 px-3">
                            <Input
                              type="number"
                              className="w-20 h-7 text-xs font-mono"
                              value={itm.receivedQty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = [...grnItems];
                                updated[idx].receivedQty = val;
                                updated[idx].acceptedQty = val;
                                setGrnItems(updated);
                              }}
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <Input
                              type="number"
                              className="w-20 h-7 text-xs font-mono"
                              value={itm.acceptedQty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = [...grnItems];
                                updated[idx].acceptedQty = val;
                                updated[idx].rejectedQty = Math.max(
                                  0,
                                  updated[idx].receivedQty - val
                                );
                                setGrnItems(updated);
                              }}
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono">₹{itm.unitPrice}</td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono">
                            {formatCurrency(itm.acceptedQty * itm.unitPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsGrnModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Verify GRN & Increment Stock
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* VIEW PO ITEMS MODAL */}
        <Dialog open={!!selectedPo} onOpenChange={(open) => !open && setSelectedPo(null)}>
          <DialogContent className="max-w-xl">
            {selectedPo && (
              <div>
                <DialogHeader className="pb-3 border-b">
                  <DialogTitle>{selectedPo.poNumber} Line Items</DialogTitle>
                  <DialogDescription>
                    Vendor: {selectedPo.supplierName} • Total: {formatCurrency(selectedPo.totalAmount)}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-3 border-b space-y-2">
                  {selectedPo.items.map((it, idx) => (
                    <div key={it.id || idx} className="flex justify-between text-xs py-1">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {it.rawMaterialName} ({it.quantity} {it.unit} @ ₹{it.unitPrice})
                      </span>
                      <span className="font-bold">{formatCurrency(it.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <DialogFooter className="pt-3">
                  <Button onClick={() => setSelectedPo(null)}>Close</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
