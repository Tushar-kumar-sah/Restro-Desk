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
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  TrendingDown,
  Scale,
  Trash2,
  Edit,
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface RawMaterialItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minAlertStock: number;
  costPerUnit: number;
}

interface WastageItemRecord {
  id: string;
  wastageNumber: string;
  date: string;
  reason: string;
  totalCost: number;
  recordedBy: string;
  items: Array<{
    rawMaterialName: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<RawMaterialItem[]>([]);
  const [wastageList, setWastageList] = useState<WastageItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValuation: 0,
    lowStockCount: 0,
    criticalCount: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterialItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Material Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Produce & Veg',
    unit: 'KG',
    currentStock: 10,
    minAlertStock: 5,
    costPerUnit: 120,
  });

  // Quick Stock Adjust State
  const [adjustData, setAdjustData] = useState({
    delta: 5,
    type: 'ADD', // 'ADD' | 'SUBTRACT'
    reason: 'Stock count correction',
  });

  // Wastage Form State
  const [wastageData, setWastageData] = useState({
    rawMaterialId: '',
    quantity: 2,
    reason: 'Spoilage',
    notes: 'Discarded during morning prep',
  });

  // Audit Form State
  const [auditCounts, setAuditCounts] = useState<{ [id: string]: number }>({});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/inventory/raw-materials?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials || []);
        if (data.metrics) setMetrics(data.metrics);
      }

      // Also fetch wastage
      const wstRes = await fetch('/api/inventory/wastage');
      const wstData = await wstRes.json();
      if (wstData.success) {
        setWastageList(wstData.wastageRecords || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, categoryFilter, statusFilter]);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Please provide an ingredient name', 'error');
      return;
    }

    try {
      const res = await fetch('/api/inventory/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentStock: Number(formData.currentStock),
          minAlertStock: Number(formData.minAlertStock),
          costPerUnit: Number(formData.costPerUnit),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          sku: '',
          category: 'Produce & Veg',
          unit: 'KG',
          currentStock: 10,
          minAlertStock: 5,
          costPerUnit: 120,
        });
        fetchInventory();
      } else {
        showToast(data.message || 'Failed to add ingredient', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleQuickAdjust = async () => {
    if (!selectedMaterial) return;
    try {
      const deltaQty = adjustData.type === 'ADD' ? adjustData.delta : -adjustData.delta;
      const newStock = Math.max(0, Math.round((selectedMaterial.currentStock + deltaQty) * 100) / 100);

      const res = await fetch(`/api/inventory/raw-materials/${selectedMaterial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stock updated to ${newStock} ${selectedMaterial.unit}`);
        setIsAdjustModalOpen(false);
        fetchInventory();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRecordWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wastageData.rawMaterialId) {
      showToast('Select an ingredient to log wastage', 'error');
      return;
    }

    try {
      const res = await fetch('/api/inventory/wastage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: wastageData.reason,
          recordedBy: 'Executive Chef',
          items: [
            {
              rawMaterialId: wastageData.rawMaterialId,
              quantity: Number(wastageData.quantity),
              notes: wastageData.notes,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsWastageModalOpen(false);
        fetchInventory();
      } else {
        showToast(data.message || 'Failed to log wastage', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAuditSubmit = async () => {
    const auditItems = Object.entries(auditCounts).map(([rawMaterialId, physicalCount]) => ({
      rawMaterialId,
      physicalCount: Number(physicalCount),
    }));

    if (auditItems.length === 0) {
      showToast('Enter counted stock for at least one item', 'error');
      return;
    }

    try {
      const res = await fetch('/api/inventory/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditedBy: 'Store Supervisor',
          items: auditItems,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsAuditModalOpen(false);
        setAuditCounts({});
        fetchInventory();
      } else {
        showToast(data.message || 'Audit reconciliation failed', 'error');
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
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            {notification.message}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Raw Materials & Stock Inventory
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Real-time ingredient levels, automatic recipe deductions, reorder alerts & physical
              audits
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => {
                const initialMap: { [id: string]: number } = {};
                materials.forEach((m) => {
                  initialMap[m.id] = m.currentStock;
                });
                setAuditCounts(initialMap);
                setIsAuditModalOpen(true);
              }}
              className="gap-2 text-xs text-neutral-700 dark:text-neutral-300"
            >
              <ClipboardList className="w-4 h-4" />
              Physical Audit
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (materials.length > 0) {
                  setWastageData({ ...wastageData, rawMaterialId: materials[0].id });
                }
                setIsWastageModalOpen(true);
              }}
              className="gap-2 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              <Trash2 className="w-4 h-4" />
              Log Wastage
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Valuation
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(metrics.totalValuation)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Low-Stock Alerts
                </p>
                <p className="text-xl font-bold text-amber-600">
                  {metrics.lowStockCount} items below min
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tracked SKUs
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {metrics.totalItems} Ingredients
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 rounded-xl">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Wastage Losses
                </p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(wastageList.reduce((acc, w) => acc + w.totalCost, 0))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="stock" className="space-y-4">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="stock">All Ingredients ({materials.length})</TabsTrigger>
            <TabsTrigger value="alerts">
              Low-Stock Alerts ({metrics.lowStockCount})
            </TabsTrigger>
            <TabsTrigger value="wastage">
              Kitchen Wastage Logs ({wastageList.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ALL STOCK INGREDIENTS */}
          <TabsContent value="stock" className="space-y-4">
            {/* Filter Bar */}
            <Card className="shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                  <Input
                    placeholder="Search by ingredient name or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-neutral-50 dark:bg-neutral-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Poultry & Meat">Poultry & Meat</option>
                    <option value="Produce & Veg">Produce & Vegetables</option>
                    <option value="Spices & Seasonings">Spices & Seasonings</option>
                    <option value="Grains & Staples">Grains & Staples</option>
                    <option value="Beverages & Syrups">Beverages & Syrups</option>
                    <option value="Packaging">Packaging</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                  >
                    <option value="ALL">All Stock Levels</option>
                    <option value="LOW_STOCK">Low Stock (≤ Reorder Level)</option>
                    <option value="CRITICAL">Critical Low (&lt; 50% Reorder)</option>
                  </select>

                  {(search || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setCategoryFilter('ALL');
                        setStatusFilter('ALL');
                      }}
                      className="text-xs text-neutral-500 h-9"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Materials Table */}
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Raw Material & SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Current Stock vs Min Alert</th>
                      <th className="py-3 px-4">Stock Health Status</th>
                      <th className="py-3 px-4">Cost / Unit</th>
                      <th className="py-3 px-4">Asset Value</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-500">
                          Loading inventory materials...
                        </td>
                      </tr>
                    ) : materials.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          No matching raw materials found.
                        </td>
                      </tr>
                    ) : (
                      materials.map((m) => {
                        const isLow = m.currentStock <= m.minAlertStock;
                        const isCritical = m.currentStock <= m.minAlertStock * 0.5;

                        return (
                          <tr
                            key={m.id}
                            className={`hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors ${
                              isCritical ? 'bg-red-50/20 dark:bg-red-950/20' : isLow ? 'bg-amber-50/20 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                {m.name}
                              </p>
                              <span className="font-mono text-xs text-neutral-400">{m.sku}</span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <Badge variant="outline" className="text-[11px] font-medium">
                                {m.category}
                              </Badge>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900 dark:text-white text-base">
                                  {m.currentStock} {m.unit}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  / Min: {m.minAlertStock}
                                </span>
                              </div>
                              <div className="w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    isCritical
                                      ? 'bg-red-600'
                                      : isLow
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round((m.currentStock / (m.minAlertStock * 2 || 1)) * 100)
                                    )}%`,
                                  }}
                                />
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {isCritical ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                  <ShieldAlert className="w-3 h-3 text-red-600" />
                                  Critical Low
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Reorder Soon
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Optimal Stock
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap font-medium text-neutral-700 dark:text-neutral-300">
                              {formatCurrency(m.costPerUnit)} / {m.unit}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap font-bold text-neutral-900 dark:text-white">
                              {formatCurrency(m.currentStock * m.costPerUnit)}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMaterial(m);
                                  setIsAdjustModalOpen(true);
                                }}
                                className="h-8 text-xs gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              >
                                Adjust
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: LOW STOCK ALERTS */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials
                .filter((m) => m.currentStock <= m.minAlertStock)
                .map((m) => (
                  <Card key={m.id} className="border-amber-200 dark:border-amber-900/50 shadow-sm p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          Reorder Alert
                        </span>
                        <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                          {m.name}
                        </h4>
                        <p className="text-xs text-neutral-400">{m.sku} • {m.category}</p>
                      </div>

                      <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded">
                        Deficit: {(m.minAlertStock - m.currentStock).toFixed(1)} {m.unit}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                      <div>
                        <span className="text-neutral-500">Current Stock:</span>{' '}
                        <strong className="text-neutral-900 dark:text-white">
                          {m.currentStock} {m.unit}
                        </strong>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedMaterial(m);
                          setIsAdjustModalOpen(true);
                        }}
                        className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Replenish
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* TAB 3: WASTAGE HISTORY */}
          <TabsContent value="wastage" className="space-y-4">
            <Card className="shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">Wastage ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Reason Category</th>
                      <th className="py-3 px-4">Wasted Ingredients</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4 text-right">Financial Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {wastageList.map((w) => (
                      <tr key={w.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {w.wastageNumber}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {formatIndianDate(w.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                            {w.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {w.items.map((it, idx) => (
                            <div key={idx} className="font-medium text-neutral-800 dark:text-neutral-200">
                              {it.rawMaterialName} ({it.quantity} {it.unit})
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">{w.recordedBy}</td>
                        <td className="py-3 px-4 text-right font-bold text-red-600">
                          {formatCurrency(w.totalCost)}
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
        {/* ADD INGREDIENT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" />
                Add New Raw Material
              </DialogTitle>
              <DialogDescription>
                Define new recipe ingredient, category, unit of measure and cost benchmark.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateMaterial} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="mName">Ingredient Name *</Label>
                  <Input
                    id="mName"
                    required
                    placeholder="e.g. Kashmiri Saffron Grade A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mCategory">Category *</Label>
                  <select
                    id="mCategory"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Poultry & Meat">Poultry & Meat</option>
                    <option value="Produce & Veg">Produce & Vegetables</option>
                    <option value="Spices & Seasonings">Spices & Seasonings</option>
                    <option value="Grains & Staples">Grains & Staples</option>
                    <option value="Beverages & Syrups">Beverages & Syrups</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mUnit">Inventory Unit *</Label>
                  <select
                    id="mUnit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <option value="KG">Kilogram (KG)</option>
                    <option value="GRAM">Gram (GRAM)</option>
                    <option value="LITER">Liter (LITER)</option>
                    <option value="ML">Milliliter (ML)</option>
                    <option value="PIECE">Piece / Count (PCS)</option>
                    <option value="PACKET">Packet / Tin (PACK)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mCurrent">Opening Stock Quantity</Label>
                  <Input
                    id="mCurrent"
                    type="number"
                    step="0.1"
                    value={formData.currentStock}
                    onChange={(e) =>
                      setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mMin">Reorder Alert Level</Label>
                  <Input
                    id="mMin"
                    type="number"
                    step="0.1"
                    value={formData.minAlertStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minAlertStock: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="mCost">Estimated Cost Per Unit (₹)</Label>
                  <Input
                    id="mCost"
                    type="number"
                    step="0.5"
                    value={formData.costPerUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Add to Inventory
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* QUICK STOCK ADJUST MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                Quick Stock Adjustment
              </DialogTitle>
              <DialogDescription>
                Correct or adjust stock for {selectedMaterial?.name} (Current:{' '}
                {selectedMaterial?.currentStock} {selectedMaterial?.unit}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={adjustData.type === 'ADD' ? 'default' : 'outline'}
                  onClick={() => setAdjustData({ ...adjustData, type: 'ADD' })}
                  className={adjustData.type === 'ADD' ? 'bg-emerald-600 text-white' : ''}
                >
                  + Increase Stock
                </Button>
                <Button
                  type="button"
                  variant={adjustData.type === 'SUBTRACT' ? 'default' : 'outline'}
                  onClick={() => setAdjustData({ ...adjustData, type: 'SUBTRACT' })}
                  className={adjustData.type === 'SUBTRACT' ? 'bg-red-600 text-white' : ''}
                >
                  - Decrease Stock
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjQty">Quantity ({selectedMaterial?.unit})</Label>
                <Input
                  id="adjQty"
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={adjustData.delta}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, delta: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjReason">Adjustment Reason</Label>
                <Input
                  id="adjReason"
                  placeholder="e.g. Counter count discrepancy, Chef intake"
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuickAdjust} className="bg-emerald-600 text-white">
                Save Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* LOG KITCHEN WASTAGE MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isWastageModalOpen} onOpenChange={setIsWastageModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5 text-red-600" />
                Record Kitchen Wastage
              </DialogTitle>
              <DialogDescription>
                Deduct damaged, expired, or spoiled ingredients and track financial losses.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordWastage} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="wMat">Ingredient *</Label>
                <select
                  id="wMat"
                  value={wastageData.rawMaterialId}
                  onChange={(e) => setWastageData({ ...wastageData, rawMaterialId: e.target.value })}
                  className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currentStock} {m.unit} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wReason">Wastage Reason *</Label>
                <select
                  id="wReason"
                  value={wastageData.reason}
                  onChange={(e) => setWastageData({ ...wastageData, reason: e.target.value })}
                  className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                >
                  <option value="Spoilage">Spoilage / Rotten</option>
                  <option value="Preparation Error">Preparation / Cooking Error</option>
                  <option value="Burning">Burning on Tandoor / Pan</option>
                  <option value="Expiry">Expired Shelf Life</option>
                  <option value="Spillage">Spillage / Dropped</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wQty">Wasted Quantity</Label>
                <Input
                  id="wQty"
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={wastageData.quantity}
                  onChange={(e) =>
                    setWastageData({ ...wastageData, quantity: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wNotes">Chef Prep Notes</Label>
                <Input
                  id="wNotes"
                  placeholder="e.g. High room temperature overnight"
                  value={wastageData.notes}
                  onChange={(e) => setWastageData({ ...wastageData, notes: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsWastageModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                  Deduct & Log Loss
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* PHYSICAL STOCK AUDIT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                Physical Stock Count & Variance Audit
              </DialogTitle>
              <DialogDescription>
                Input actual physical shelf counts. The system computes variance (+ / -) and aligns
                the ledger automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Ingredient</th>
                      <th className="py-2.5 px-3">System Stock</th>
                      <th className="py-2.5 px-3">Physical Shelf Count</th>
                      <th className="py-2.5 px-3 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {materials.slice(0, 10).map((m) => {
                      const count = auditCounts[m.id] ?? m.currentStock;
                      const diff = Math.round((count - m.currentStock) * 10) / 10;

                      return (
                        <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                          <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">
                            {m.name} ({m.unit})
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {m.currentStock} {m.unit}
                          </td>
                          <td className="py-2.5 px-3">
                            <Input
                              type="number"
                              step="0.1"
                              className="w-28 h-8 text-xs font-mono"
                              value={count}
                              onChange={(e) =>
                                setAuditCounts({
                                  ...auditCounts,
                                  [m.id]: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-bold ${
                              diff === 0
                                ? 'text-neutral-400'
                                : diff > 0
                                ? 'text-emerald-600'
                                : 'text-red-500'
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff} {m.unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button variant="outline" onClick={() => setIsAuditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAuditSubmit} className="bg-emerald-600 text-white">
                Reconcile & Save Audit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
