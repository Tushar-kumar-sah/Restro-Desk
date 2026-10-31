'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import { toast } from 'sonner';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  FileText,
  Building2,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
  Trash2,
  X,
  RotateCcw,
  Receipt,
  Eye,
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
  purchaseOrderId?: string;
  receivedDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'VERIFIED' | 'REJECTED';
  notes: string;
  items: Array<{
    id?: string;
    rawMaterialId?: string;
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
  const [activeTab, setActiveTab] = useState<'po' | 'grn'>('po');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderItem | null>(null);
  const [selectedGrn, setSelectedGrn] = useState<GRNItemRecord | null>(null);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrderItem | null>(null);
  const [grnToDelete, setGrnToDelete] = useState<GRNItemRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [poRes, grnRes, supRes, matRes] = await Promise.all([
        fetch(
          `/api/inventory/purchase-orders?search=${encodeURIComponent(search)}&status=${statusFilter}`
        ),
        fetch(`/api/inventory/grn?search=${encodeURIComponent(search)}`),
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
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load purchase records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  // PO Line Items management
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
    if (updates.rawMaterialId) {
      const rm = rawMaterials.find((m) => m.id === updates.rawMaterialId);
      if (rm) {
        updates.unitPrice = rm.costPerUnit || updates.unitPrice || 100;
      }
    }
    updated[idx] = { ...updated[idx], ...updates };
    setPoFormItems(updated);
  };

  // GRN Line Items management
  const addGrnItemRow = () => {
    const defaultRm = rawMaterials[0] || { id: 'rm-01', costPerUnit: 100 };
    setGrnItems([
      ...grnItems,
      {
        rawMaterialId: defaultRm.id,
        receivedQty: 10,
        acceptedQty: 10,
        rejectedQty: 0,
        unitPrice: defaultRm.costPerUnit || 100,
      },
    ]);
  };

  const removeGrnItemRow = (idx: number) => {
    if (grnItems.length <= 1) return;
    setGrnItems(grnItems.filter((_, i) => i !== idx));
  };

  const updateGrnItemRow = (idx: number, updates: any) => {
    const updated = [...grnItems];
    if (updates.rawMaterialId) {
      const rm = rawMaterials.find((m) => m.id === updates.rawMaterialId);
      if (rm) {
        updates.unitPrice = rm.costPerUnit || updates.unitPrice || 100;
      }
    }
    updated[idx] = { ...updated[idx], ...updates };
    setGrnItems(updated);
  };

  // Create PO
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poFormSupplierId) {
      toast.error('Please select a supplier');
      return;
    }

    setIsSubmitting(true);
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
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Purchase Order issued successfully');
        setIsPoModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to create PO');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error creating PO');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open GRN for an existing PO
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

  // Create GRN (Direct or from PO)
  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnInvoiceNumber.trim()) {
      toast.error('Please provide supplier tax invoice number');
      return;
    }

    if (!grnSupplierId) {
      toast.error('Please select a supplier');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory/grn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: grnSupplierId,
          purchaseOrderId: grnPoId || null,
          invoiceNumber: grnInvoiceNumber.trim(),
          notes: grnNotes,
          items: grnItems.map((i) => ({
            rawMaterialId: i.rawMaterialId,
            receivedQty: Number(i.receivedQty) || 0,
            acceptedQty: Number(i.acceptedQty) || 0,
            rejectedQty: Number(i.rejectedQty) || 0,
            unitPrice: Number(i.unitPrice) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'GRN verified and stock incremented successfully');
        setIsGrnModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to verify GRN');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error recording GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Purchase Order
  const handleDeletePO = async () => {
    if (!poToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/purchase-orders/${poToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Purchase Order ${poToDelete.poNumber} removed successfully`);
        setOrders((prev) => prev.filter((p) => p.id !== poToDelete.id));
        setPoToDelete(null);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to delete PO');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error deleting PO');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete GRN Record
  const handleDeleteGRN = async () => {
    if (!grnToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/grn?id=${grnToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `GRN ${grnToDelete.grnNumber} deleted and stock adjusted`);
        setGrns((prev) => prev.filter((g) => g.id !== grnToDelete.id));
        setGrnToDelete(null);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to delete GRN');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error deleting GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Received
          </span>
        );
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Issued & Dispatched
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 whitespace-nowrap">
            Draft
          </span>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {status}
          </Badge>
        );
    }
  };

  const totalPOCommitments = useMemo(() => {
    return orders.reduce((acc, po) => acc + (po.totalAmount || 0), 0);
  }, [orders]);

  const activeInTransitCount = useMemo(() => {
    return orders.filter((po) => po.status === 'ISSUED').length;
  }, [orders]);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-lg">
                <Truck className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Purchase Orders & Goods Received (GRN)
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Procurement tracking, supplier delivery checks, and automatic inventory stock receipt
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => {
                setGrnPoId('');
                setGrnInvoiceNumber(`INV-DIR-${Date.now().toString().slice(-4)}`);
                if (rawMaterials.length > 0) {
                  setGrnItems([
                    {
                      rawMaterialId: rawMaterials[0].id,
                      receivedQty: 10,
                      acceptedQty: 10,
                      rejectedQty: 0,
                      unitPrice: rawMaterials[0].costPerUnit || 100,
                    },
                  ]);
                }
                setIsGrnModalOpen(true);
              }}
              className="gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <PackageCheck className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              Direct GRN Entry
            </Button>

            <Button
              onClick={() => {
                if (suppliers.length > 0 && !poFormSupplierId) {
                  setPoFormSupplierId(suppliers[0].id);
                }
                if (rawMaterials.length > 0) {
                  setPoFormItems([
                    {
                      rawMaterialId: rawMaterials[0].id,
                      quantity: 20,
                      unitPrice: rawMaterials[0].costPerUnit || 100,
                    },
                  ]);
                }
                setIsPoModalOpen(true);
              }}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Purchase Order
            </Button>
          </div>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            onClick={() => setActiveTab('po')}
            className="cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-700 shadow-sm"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Active POs
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {activeInTransitCount} In Transit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab('grn')}
            className="cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Verified GRNs
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {grns.length} Received
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab('po')}
            className="cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-700 shadow-sm"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Total PO Commitments
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {formatCurrency(totalPOCommitments)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Vendors Contracted
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {suppliers.length} Vendors
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for PO vs GRN */}
        <Tabs
          value={activeTab}
          onValueChange={(val: any) => setActiveTab(val)}
          className="space-y-4"
        >
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="po" className="text-xs font-semibold">
              Purchase Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="grn" className="text-xs font-semibold">
              Goods Received Notes / GRN ({grns.length})
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter Bar */}
          <Card className="shadow-sm">
            <CardContent className="p-4 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <Input
                  placeholder={
                    activeTab === 'po'
                      ? 'Search by PO number, supplier name...'
                      : 'Search by GRN #, invoice number, supplier...'
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-neutral-50 dark:bg-neutral-900 text-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {activeTab === 'po' && (
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ISSUED">Issued & Dispatched</option>
                    <option value="RECEIVED">Received</option>
                    <option value="DRAFT">Draft</option>
                  </select>

                  {(search || statusFilter !== 'ALL') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('ALL');
                      }}
                      className="text-xs text-neutral-500 h-9 gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TAB 1: PURCHASE ORDERS */}
          <TabsContent value="po" className="space-y-4">
            <Card className="shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 whitespace-nowrap">PO Number</th>
                      <th className="py-3 px-4 min-w-[200px]">Supplier</th>
                      <th className="py-3 px-4 whitespace-nowrap">Order Date</th>
                      <th className="py-3 px-4 whitespace-nowrap">Delivery Expected</th>
                      <th className="py-3 px-4 whitespace-nowrap">Total Amount (₹)</th>
                      <th className="py-3 px-4 whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                          Loading purchase orders...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          <Truck className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            No purchase orders found
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Click &quot;+ Create Purchase Order&quot; above to issue a new PO.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((po) => (
                        <tr
                          key={po.id}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors align-middle"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                            {po.poNumber}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                            {po.supplierName}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 text-xs whitespace-nowrap font-mono">
                            {formatIndianDate(po.orderDate)}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 text-xs whitespace-nowrap font-mono">
                            {formatIndianDate(po.expectedDeliveryDate)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white whitespace-nowrap font-mono text-sm">
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
                                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 shrink-0"
                                >
                                  <PackageCheck className="w-3.5 h-3.5" />
                                  Receive GRN
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPo(po)}
                                className="h-8 text-xs gap-1 font-medium shrink-0"
                              >
                                View Items
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setPoToDelete(po)}
                                title={`Delete ${po.poNumber}`}
                                className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
            <Card className="shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 whitespace-nowrap">GRN #</th>
                      <th className="py-3 px-4 whitespace-nowrap">Supplier Invoice #</th>
                      <th className="py-3 px-4 min-w-[200px]">Supplier</th>
                      <th className="py-3 px-4 whitespace-nowrap">Associated PO</th>
                      <th className="py-3 px-4 whitespace-nowrap">Received Date</th>
                      <th className="py-3 px-4 whitespace-nowrap">Total Amount (₹)</th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                          Loading goods received notes...
                        </td>
                      </tr>
                    ) : grns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          <PackageCheck className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            No GRN delivery receipts found
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Click &quot;Direct GRN Entry&quot; above to log accepted stock.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      grns.map((g) => (
                        <tr
                          key={g.id}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors align-middle"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                            {g.grnNumber}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-800 dark:text-neutral-200 font-semibold whitespace-nowrap">
                            {g.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                            {g.supplierName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-neutral-400 whitespace-nowrap">
                            {g.poNumber || 'Direct Purchase'}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 text-xs whitespace-nowrap font-mono">
                            {formatIndianDate(g.receivedDate)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white whitespace-nowrap font-mono text-sm">
                            {formatCurrency(g.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedGrn(g)}
                                className="h-8 text-xs font-medium shrink-0"
                              >
                                Inspect Receipt
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setGrnToDelete(g)}
                                title={`Delete ${g.grnNumber}`}
                                className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </Tabs>

        {/* ========================================================================= */}
        {/* CREATE PURCHASE ORDER MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isPoModalOpen} onOpenChange={setIsPoModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:rounded-2xl">
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
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
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
                  <Label htmlFor="poNotes">Delivery Instructions / Notes</Label>
                  <Input
                    id="poNotes"
                    placeholder="e.g. Delivery before 9:00 AM gate 2"
                    value={poFormNotes}
                    onChange={(e) => setPoFormNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                    PO Line Items
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addPoItemRow}
                    className="h-7 text-xs text-emerald-600 gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item Line
                  </Button>
                </div>

                <div className="space-y-2">
                  {poFormItems.map((itm, idx) => {
                    const rm = rawMaterials.find((m) => m.id === itm.rawMaterialId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs"
                      >
                        <select
                          value={itm.rawMaterialId}
                          onChange={(e) => updatePoItemRow(idx, { rawMaterialId: e.target.value })}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs font-medium outline-none"
                        >
                          {rawMaterials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.unit})
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.1"
                            min={0.1}
                            placeholder="Qty"
                            value={itm.quantity}
                            onChange={(e) =>
                              updatePoItemRow(idx, { quantity: parseFloat(e.target.value) || 0 })
                            }
                            className="w-20 h-8 text-xs font-mono bg-white dark:bg-neutral-800"
                          />
                          <span className="text-[10px] text-neutral-400 w-8 truncate">
                            {rm?.unit || 'KG'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-xs text-neutral-400">₹</span>
                          <Input
                            type="number"
                            step="0.5"
                            min={0}
                            placeholder="Rate"
                            value={itm.unitPrice}
                            onChange={(e) =>
                              updatePoItemRow(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                            }
                            className="w-20 h-8 text-xs font-mono bg-white dark:bg-neutral-800"
                          />
                        </div>

                        <span className="w-24 text-right font-bold text-neutral-900 dark:text-white font-mono">
                          {formatCurrency(itm.quantity * itm.unitPrice)}
                        </span>

                        {poFormItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePoItemRow(idx)}
                            className="text-neutral-400 hover:text-red-500 p-1 rounded-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Total Purchase Commitment:</span>
                <span className="font-bold text-base text-emerald-600 font-mono">
                  {formatCurrency(
                    poFormItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
                  )}
                </span>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPoModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Purchase Order'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* RECEIVE GOODS (GRN) MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isGrnModalOpen} onOpenChange={setIsGrnModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:rounded-2xl">
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
                  <Label htmlFor="grnSup">Supplier *</Label>
                  <select
                    id="grnSup"
                    value={grnSupplierId}
                    onChange={(e) => setGrnSupplierId(e.target.value)}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="grnNotes">Inspection Notes</Label>
                  <Input
                    id="grnNotes"
                    placeholder="e.g. Packaging seals intact, cold storage temperature verified"
                    value={grnNotes}
                    onChange={(e) => setGrnNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                    Received Items Breakdown
                  </Label>
                  {!grnPoId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addGrnItemRow}
                      className="h-7 text-xs text-emerald-600 gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item Line
                    </Button>
                  )}
                </div>

                <div className="border rounded-xl overflow-hidden divide-y">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3 w-24">Received</th>
                        <th className="py-2.5 px-3 w-24">Accepted</th>
                        <th className="py-2.5 px-3 w-24">Rate (₹)</th>
                        <th className="py-2.5 px-3 text-right">Total (₹)</th>
                        {!grnPoId && grnItems.length > 1 && <th className="py-2.5 px-2 w-8"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {grnItems.map((itm, idx) => {
                        const rm = rawMaterials.find((m) => m.id === itm.rawMaterialId);
                        return (
                          <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                            <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">
                              {grnPoId ? (
                                <span>
                                  {rm?.name || itm.rawMaterialId} ({rm?.unit || 'KG'})
                                </span>
                              ) : (
                                <select
                                  value={itm.rawMaterialId}
                                  onChange={(e) =>
                                    updateGrnItemRow(idx, { rawMaterialId: e.target.value })
                                  }
                                  className="w-full px-2 py-1 rounded border bg-white dark:bg-neutral-800 text-xs"
                                >
                                  {rawMaterials.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name} ({m.unit})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <Input
                                type="number"
                                step="0.1"
                                min={0}
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
                                step="0.1"
                                min={0}
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
                            <td className="py-2.5 px-3 font-mono">
                              {grnPoId ? (
                                `₹${itm.unitPrice}`
                              ) : (
                                <Input
                                  type="number"
                                  step="0.5"
                                  min={0}
                                  className="w-20 h-7 text-xs font-mono"
                                  value={itm.unitPrice}
                                  onChange={(e) =>
                                    updateGrnItemRow(idx, {
                                      unitPrice: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold font-mono">
                              {formatCurrency(itm.acceptedQty * itm.unitPrice)}
                            </td>
                            {!grnPoId && grnItems.length > 1 && (
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeGrnItemRow(idx)}
                                  className="text-neutral-400 hover:text-red-500"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Total Accepted GRN Value:</span>
                <span className="font-bold text-base text-emerald-600 font-mono">
                  {formatCurrency(
                    grnItems.reduce((acc, it) => acc + it.acceptedQty * it.unitPrice, 0)
                  )}
                </span>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGrnModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify GRN & Increment Stock'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* VIEW PO ITEMS MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!selectedPo} onOpenChange={(open) => !open && setSelectedPo(null)}>
          <DialogContent className="max-w-xl sm:rounded-2xl">
            {selectedPo && (
              <div>
                <DialogHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        {selectedPo.poNumber}
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-1">
                        Supplier: <strong>{selectedPo.supplierName}</strong> • Ordered:{' '}
                        {formatIndianDate(selectedPo.orderDate)}
                      </DialogDescription>
                    </div>
                    <div>{getStatusBadge(selectedPo.status)}</div>
                  </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  <div className="border rounded-xl overflow-hidden divide-y">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3">Qty</th>
                          <th className="py-2.5 px-3">Agreed Rate</th>
                          <th className="py-2.5 px-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedPo.items.map((it, idx) => (
                          <tr key={it.id || idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                            <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">
                              {it.rawMaterialName}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {it.quantity} {it.unit}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {formatCurrency(it.unitPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold font-mono">
                              {formatCurrency(it.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedPo.notes && (
                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-xs text-neutral-600 dark:text-neutral-400">
                      <strong>Delivery Instructions:</strong> {selectedPo.notes}
                    </div>
                  )}

                  <div className="flex justify-between items-center px-1 text-sm font-bold">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-600 text-base">
                      {formatCurrency(selectedPo.totalAmount)}
                    </span>
                  </div>
                </div>

                <DialogFooter className="pt-3 border-t flex items-center justify-between sm:justify-between w-full">
                  {selectedPo.status === 'ISSUED' ? (
                    <Button
                      onClick={() => {
                        const po = selectedPo;
                        setSelectedPo(null);
                        openGrnForPo(po);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      Receive GRN Now
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button variant="outline" onClick={() => setSelectedPo(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* INSPECT GRN RECEIPT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!selectedGrn} onOpenChange={(open) => !open && setSelectedGrn(null)}>
          <DialogContent className="max-w-2xl sm:rounded-2xl">
            {selectedGrn && (
              <div>
                <DialogHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-emerald-600" />
                        {selectedGrn.grnNumber}
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-1">
                        Invoice: <strong>{selectedGrn.invoiceNumber}</strong> • Supplier:{' '}
                        <strong>{selectedGrn.supplierName}</strong>
                      </DialogDescription>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Verified & Stock Updated
                    </span>
                  </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  <div className="border rounded-xl overflow-hidden divide-y">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Item</th>
                          <th className="py-2.5 px-3">Received</th>
                          <th className="py-2.5 px-3">Accepted</th>
                          <th className="py-2.5 px-3">Rejected</th>
                          <th className="py-2.5 px-3">Rate</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedGrn.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                            <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">
                              {it.rawMaterialName}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {it.receivedQty} {it.unit}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                              {it.acceptedQty} {it.unit}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-red-500">
                              {it.rejectedQty} {it.unit}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {formatCurrency(it.unitPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold font-mono">
                              {formatCurrency(it.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center px-1 text-sm font-bold">
                    <span>Verified Delivery Amount:</span>
                    <span className="font-mono text-emerald-600 text-base">
                      {formatCurrency(selectedGrn.totalAmount)}
                    </span>
                  </div>
                </div>

                <DialogFooter className="pt-3 border-t">
                  <Button variant="outline" onClick={() => setSelectedGrn(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE PO CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!poToDelete} onOpenChange={(open) => !open && setPoToDelete(null)}>
          <DialogContent className="max-w-sm sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Cancel / Delete PO?</span>
              </DialogTitle>
              <DialogDescription className="space-y-2 pt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Are you sure you want to delete Purchase Order &quot;<strong>{poToDelete?.poNumber}</strong>&quot; for{' '}
                <strong>{poToDelete?.supplierName}</strong> ({formatCurrency(poToDelete?.totalAmount || 0)})?
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPoToDelete(null)}
                disabled={isSubmitting}
              >
                Keep PO
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDeletePO}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete PO'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE GRN CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!grnToDelete} onOpenChange={(open) => !open && setGrnToDelete(null)}>
          <DialogContent className="max-w-sm sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Delete GRN Receipt?</span>
              </DialogTitle>
              <DialogDescription className="space-y-2 pt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Are you sure you want to delete &quot;<strong>{grnToDelete?.grnNumber}</strong>&quot; (Invoice{' '}
                {grnToDelete?.invoiceNumber})?
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-200 text-xs">
                  ⚠️ This will automatically decrement the accepted stock from your inventory and reverse the vendor liability.
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGrnToDelete(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDeleteGRN}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete & Reverse Stock'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
