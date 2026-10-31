'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  Trash2,
  Edit2,
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  Package,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Info,
  History,
  ArrowUpDown,
  Truck,
  Utensils,
  ChefHat,
  Eye,
  FileText,
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

interface StockMovementRecord {
  id: string;
  date: string;
  rawMaterialId: string;
  rawMaterialName: string;
  sku: string;
  category: string;
  unit: string;
  type: 'STOCK_IN' | 'RECIPE_CONSUMPTION' | 'WASTAGE' | 'MANUAL_ADJUSTMENT' | 'AUDIT_RECONCILIATION';
  changeQty: number;
  balanceAfter: number;
  costPerUnit: number;
  totalCostImpact: number;
  reference: string;
  recordedBy: string;
  notes?: string;
}

interface WastageItemRecord {
  id: string;
  wastageNumber: string;
  date: string;
  reason: string;
  totalCost: number;
  recordedBy: string;
  items: Array<{
    id?: string;
    rawMaterialId: string;
    rawMaterialName: string;
    quantity: number;
    unit: string;
    cost: number;
    notes?: string;
  }>;
}

const CATEGORIES = [
  'Dairy',
  'Poultry & Meat',
  'Produce & Veg',
  'Spices & Seasonings',
  'Grains & Staples',
  'Beverages & Syrups',
  'Packaging',
];

const UNITS = [
  { label: 'Kilogram (KG)', value: 'KG' },
  { label: 'Gram (GRAM)', value: 'GRAM' },
  { label: 'Liter (LITER)', value: 'LITER' },
  { label: 'Milliliter (ML)', value: 'ML' },
  { label: 'Piece / Count (PCS)', value: 'PIECE' },
  { label: 'Packet / Tin (PACK)', value: 'PACKET' },
];

export default function InventoryPage() {
  const [materials, setMaterials] = useState<RawMaterialItem[]>([]);
  const [wastageList, setWastageList] = useState<WastageItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'alerts' | 'movements' | 'wastage'>('stock');

  // Stock Movement Ledger State
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementSearch, setMovementSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL');
  const [movementMetrics, setMovementMetrics] = useState({
    totalMovements: 0,
    totalStockInCount: 0,
    totalStockOutCount: 0,
    totalAddedQty: 0,
    totalDeductedQty: 0,
  });

  // Per-item History modal state
  const [historyMaterial, setHistoryMaterial] = useState<RawMaterialItem | null>(null);
  const [itemMovements, setItemMovements] = useState<StockMovementRecord[]>([]);
  const [itemMovementsLoading, setItemMovementsLoading] = useState(false);

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RawMaterialItem | null>(null);
  const [wastageToDelete, setWastageToDelete] = useState<WastageItemRecord | null>(null);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Selected Material for Adjust or Edit
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterialItem | null>(null);

  // Add Material Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Dairy',
    unit: 'KG',
    currentStock: 10,
    minAlertStock: 5,
    costPerUnit: 120,
  });

  // Edit Material Form State
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    category: 'Dairy',
    unit: 'KG',
    minAlertStock: 5,
    costPerUnit: 120,
  });

  // Quick Stock Adjust State
  const [adjustData, setAdjustData] = useState<{
    delta: number;
    type: 'ADD' | 'SUBTRACT' | 'SET';
    reason: string;
  }>({
    delta: 5,
    type: 'ADD',
    reason: 'Stock replenishment',
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
  const [auditSearch, setAuditSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } else {
        toast.error(data.message || 'Failed to load inventory');
      }

      // Fetch wastage list
      const wstRes = await fetch('/api/inventory/wastage');
      const wstData = await wstRes.json();
      if (wstData.success) {
        setWastageList(wstData.wastageRecords || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to connect to inventory services');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setMovementsLoading(true);
      const params = new URLSearchParams();
      if (movementSearch) params.append('search', movementSearch);
      if (movementTypeFilter !== 'ALL') params.append('type', movementTypeFilter);

      const res = await fetch(`/api/inventory/movements?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMovements(data.movements || []);
        if (data.metrics) setMovementMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMovementsLoading(false);
    }
  };

  const openItemHistory = async (material: RawMaterialItem) => {
    setHistoryMaterial(material);
    setItemMovementsLoading(true);
    try {
      const res = await fetch(`/api/inventory/movements?rawMaterialId=${material.id}`);
      const data = await res.json();
      if (data.success) {
        setItemMovements(data.movements || []);
      } else {
        setItemMovements([]);
      }
    } catch (err) {
      console.error(err);
      setItemMovements([]);
    } finally {
      setItemMovementsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchMovements();
  }, [movementSearch, movementTypeFilter, activeTab]);

  // Handle Add Ingredient
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please provide an ingredient name');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          sku: formData.sku.trim() || undefined,
          category: formData.category,
          unit: formData.unit,
          currentStock: Number(formData.currentStock) || 0,
          minAlertStock: Number(formData.minAlertStock) || 0,
          costPerUnit: Number(formData.costPerUnit) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Ingredient "${formData.name}" added to inventory`);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          sku: '',
          category: 'Dairy',
          unit: 'KG',
          currentStock: 10,
          minAlertStock: 5,
          costPerUnit: 120,
        });
        fetchInventory();
      } else {
        toast.error(data.message || 'Failed to add ingredient');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error adding ingredient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Ingredient
  const handleOpenEdit = (material: RawMaterialItem) => {
    setEditFormData({
      id: material.id,
      name: material.name,
      category: material.category || 'Dairy',
      unit: material.unit || 'KG',
      minAlertStock: material.minAlertStock,
      costPerUnit: material.costPerUnit,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/raw-materials/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          category: editFormData.category,
          unit: editFormData.unit,
          minAlertStock: Number(editFormData.minAlertStock) || 0,
          costPerUnit: Number(editFormData.costPerUnit) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ingredient "${editFormData.name}" updated successfully`);
        setIsEditModalOpen(false);
        fetchInventory();
      } else {
        toast.error(data.message || 'Failed to update ingredient');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error updating ingredient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Ingredient
  const handleDeleteMaterial = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/raw-materials/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ingredient "${itemToDelete.name}" removed from inventory`);
        setMaterials((prev) => prev.filter((m) => m.id !== itemToDelete.id));
        setItemToDelete(null);
        fetchInventory();
      } else {
        toast.error(data.message || 'Failed to remove ingredient');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error removing ingredient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Adjust
  const handleQuickAdjust = async () => {
    if (!selectedMaterial) return;
    setIsSubmitting(true);
    try {
      let newStock = selectedMaterial.currentStock;
      if (adjustData.type === 'ADD') {
        newStock += adjustData.delta;
      } else if (adjustData.type === 'SUBTRACT') {
        newStock = Math.max(0, newStock - adjustData.delta);
      } else {
        newStock = Math.max(0, adjustData.delta);
      }
      newStock = Math.round(newStock * 100) / 100;

      const res = await fetch(`/api/inventory/raw-materials/${selectedMaterial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStock: newStock,
          reason: adjustData.reason,
          notes: `${adjustData.type === 'ADD' ? '+' : adjustData.type === 'SUBTRACT' ? '-' : 'Set to '}${adjustData.delta} ${selectedMaterial.unit} by Store Supervisor`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Stock for ${selectedMaterial.name} updated to ${newStock} ${selectedMaterial.unit}`);
        setIsAdjustModalOpen(false);
        fetchInventory();
        fetchMovements();
      } else {
        toast.error(data.message || 'Failed to update stock');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error adjusting stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Record Wastage
  const handleRecordWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wastageData.rawMaterialId) {
      toast.error('Select an ingredient to log wastage');
      return;
    }

    const qty = Number(wastageData.quantity) || 0;
    if (qty <= 0) {
      toast.error('Wastage quantity must be greater than zero');
      return;
    }

    setIsSubmitting(true);
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
              quantity: qty,
              notes: wastageData.notes,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Kitchen wastage logged and stock deducted');
        setIsWastageModalOpen(false);
        fetchInventory();
        fetchMovements();
      } else {
        toast.error(data.message || 'Failed to log wastage');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error logging wastage');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Wastage Record
  const handleDeleteWastage = async () => {
    if (!wastageToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/wastage?id=${wastageToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Wastage log #${wastageToDelete.wastageNumber} deleted`);
        setWastageToDelete(null);
        fetchInventory();
      } else {
        toast.error(data.message || 'Failed to delete wastage record');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error deleting wastage');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Physical Audit Submit
  const handleAuditSubmit = async () => {
    const auditItems = Object.entries(auditCounts).map(([rawMaterialId, physicalCount]) => ({
      rawMaterialId,
      physicalCount: Number(physicalCount),
    }));

    if (auditItems.length === 0) {
      toast.error('Enter counted stock for at least one item');
      return;
    }

    setIsSubmitting(true);
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
        toast.success(data.message || 'Physical audit reconciled and stock updated');
        setIsAuditModalOpen(false);
        setAuditCounts({});
        fetchInventory();
        fetchMovements();
      } else {
        toast.error(data.message || 'Audit reconciliation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error saving audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered materials for Physical Audit Modal
  const filteredAuditMaterials = useMemo(() => {
    if (!auditSearch.trim()) return materials;
    const term = auditSearch.toLowerCase();
    return materials.filter(
      (m) => m.name.toLowerCase().includes(term) || m.sku.toLowerCase().includes(term)
    );
  }, [materials, auditSearch]);

  // Selected item for wastage live cost calculation
  const selectedWastageMaterial = useMemo(() => {
    return materials.find((m) => m.id === wastageData.rawMaterialId);
  }, [materials, wastageData.rawMaterialId]);

  // Calculated preview for Adjust modal
  const adjustedStockPreview = useMemo(() => {
    if (!selectedMaterial) return 0;
    const current = selectedMaterial.currentStock;
    const val = Number(adjustData.delta) || 0;
    if (adjustData.type === 'ADD') return Math.round((current + val) * 100) / 100;
    if (adjustData.type === 'SUBTRACT') return Math.max(0, Math.round((current - val) * 100) / 100);
    return Math.max(0, Math.round(val * 100) / 100);
  }, [selectedMaterial, adjustData]);

  const totalWastageLoss = useMemo(() => {
    return wastageList.reduce((acc, w) => acc + (w.totalCost || 0), 0);
  }, [wastageList]);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-lg">
                <Boxes className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Raw Materials & Stock Inventory
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Real-time ingredient levels, automatic recipe deductions, reorder alerts & physical audits
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
                setAuditSearch('');
                setIsAuditModalOpen(true);
              }}
              className="gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ClipboardList className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              Physical Audit
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (materials.length > 0 && !wastageData.rawMaterialId) {
                  setWastageData({ ...wastageData, rawMaterialId: materials[0].id });
                }
                setIsWastageModalOpen(true);
              }}
              className="gap-2 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Log Wastage
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            onClick={() => setActiveTab('stock')}
            className="cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Total Valuation
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {formatCurrency(metrics.totalValuation)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab('alerts')}
            className={`cursor-pointer transition-all shadow-sm ${
              metrics.lowStockCount > 0
                ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400 dark:border-amber-800'
                : 'hover:border-neutral-300'
            }`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Low-Stock Alerts
                </p>
                <p className="text-xl font-bold text-amber-600 truncate">
                  {metrics.lowStockCount} items below min
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab('stock')}
            className="cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-700 shadow-sm"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Tracked SKUs
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {metrics.totalItems || materials.length} Ingredients
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setActiveTab('wastage')}
            className="cursor-pointer transition-all hover:border-red-300 dark:hover:border-red-700 shadow-sm"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 rounded-xl shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider truncate">
                  Wastage Losses
                </p>
                <p className="text-xl font-bold text-red-600 truncate">
                  {formatCurrency(totalWastageLoss)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Warning Banner */}
        {metrics.lowStockCount > 0 && (
          <div className="p-4 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50/40 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-orange-950/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5 shadow-sm">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Low Stock Alert: {metrics.lowStockCount} {metrics.lowStockCount === 1 ? 'ingredient is' : 'ingredients are'} below safety reorder threshold!
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Urgent replenishment needed for:{' '}
                  <strong className="text-neutral-800 dark:text-neutral-200">
                    {materials
                      .filter((m) => m.currentStock <= m.minAlertStock)
                      .slice(0, 4)
                      .map((m) => `${m.name} (${m.currentStock} / min ${m.minAlertStock} ${m.unit})`)
                      .join(' • ')}
                  </strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('alerts')}
                className="text-xs font-semibold border-amber-300 text-amber-800 bg-white/90 dark:bg-neutral-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950"
              >
                View Low-Stock Tab
              </Button>
              <Link href="/inventory/purchase">
                <Button
                  size="sm"
                  className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Create Purchase Order
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val: any) => setActiveTab(val)}
          className="space-y-4"
        >
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 flex-wrap h-auto">
            <TabsTrigger value="stock" className="text-xs font-semibold">
              All Ingredients ({metrics.totalItems || materials.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs font-semibold">
              Low-Stock Alerts ({metrics.lowStockCount})
            </TabsTrigger>
            <TabsTrigger value="movements" className="text-xs font-semibold flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              Stock Movements (In/Out Ledger)
            </TabsTrigger>
            <TabsTrigger value="wastage" className="text-xs font-semibold">
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

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
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
                      className="text-xs text-neutral-500 h-9 gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Materials Table */}
            <Card className="shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
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
                        <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                          Loading inventory materials...
                        </td>
                      </tr>
                    ) : materials.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center text-neutral-400">
                          <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            No matching raw materials found
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Try adjusting your search terms or filters
                          </p>
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
                              isCritical
                                ? 'bg-red-50/20 dark:bg-red-950/20'
                                : isLow
                                ? 'bg-amber-50/20 dark:bg-amber-950/20'
                                : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                {m.name}
                              </p>
                              <span className="font-mono text-xs text-neutral-400">{m.sku}</span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className="text-[11px] font-medium bg-neutral-50 dark:bg-neutral-900"
                              >
                                {m.category}
                              </Badge>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900 dark:text-white text-sm">
                                  {m.currentStock} {m.unit}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  / Min: {m.minAlertStock}
                                </span>
                              </div>
                              <div className="w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    isCritical
                                      ? 'bg-red-600'
                                      : isLow
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(
                                        (m.currentStock / (m.minAlertStock * 2 || 1)) * 100
                                      )
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

                            <td className="py-3.5 px-4 whitespace-nowrap font-medium text-neutral-700 dark:text-neutral-300 text-xs">
                              {formatCurrency(m.costPerUnit)} / {m.unit}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap font-bold text-neutral-900 dark:text-white text-xs">
                              {formatCurrency(m.currentStock * m.costPerUnit)}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {isLow && (
                                  <Link href={`/inventory/purchase?reorderSku=${encodeURIComponent(m.sku)}&name=${encodeURIComponent(m.name)}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      title={`Create Purchase Order to reorder ${m.name}`}
                                      className="h-8 text-xs font-semibold gap-1 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50/70 hover:bg-amber-100 dark:hover:bg-amber-950/60"
                                    >
                                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                                      Reorder
                                    </Button>
                                  </Link>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openItemHistory(m)}
                                  title={`View In/Out Movement History for ${m.name}`}
                                  className="h-8 text-xs font-medium gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                >
                                  <History className="h-3.5 w-3.5" />
                                  History
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedMaterial(m);
                                    setAdjustData({
                                      delta: isLow ? Math.max(1, Math.round((m.minAlertStock - m.currentStock) * 10) / 10) : 5,
                                      type: 'ADD',
                                      reason: 'Stock replenishment',
                                    });
                                    setIsAdjustModalOpen(true);
                                  }}
                                  className="h-8 text-xs font-medium gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                >
                                  Adjust
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleOpenEdit(m)}
                                  title={`Edit ${m.name}`}
                                  className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setItemToDelete(m)}
                                  title={`Delete ${m.name}`}
                                  className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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
            {materials.filter((m) => m.currentStock <= m.minAlertStock).length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  All Stock Levels Healthy
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  There are currently 0 ingredients below their safety reorder threshold. Kitchen inventory is optimal.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials
                  .filter((m) => m.currentStock <= m.minAlertStock)
                  .map((m) => {
                    const deficit = Math.max(0, Math.round((m.minAlertStock - m.currentStock) * 10) / 10);
                    const replenishCost = deficit * m.costPerUnit;

                    return (
                      <Card
                        key={m.id}
                        className="border-amber-200 dark:border-amber-900/60 shadow-sm p-4 bg-white dark:bg-neutral-900 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                Reorder Required
                              </span>
                              <h4 className="font-bold text-base text-neutral-900 dark:text-white mt-0.5">
                                {m.name}
                              </h4>
                              <p className="text-xs text-neutral-400 font-mono">
                                {m.sku} • {m.category}
                              </p>
                            </div>

                            <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2.5 py-1 rounded-md shrink-0">
                              Deficit: {deficit} {m.unit}
                            </span>
                          </div>

                          <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs">
                            <div className="flex justify-between text-neutral-500">
                              <span>Current Stock:</span>
                              <strong className="text-neutral-900 dark:text-white font-mono">
                                {m.currentStock} {m.unit}
                              </strong>
                            </div>
                            <div className="flex justify-between text-neutral-500">
                              <span>Min Alert Level:</span>
                              <strong className="text-neutral-900 dark:text-white font-mono">
                                {m.minAlertStock} {m.unit}
                              </strong>
                            </div>
                            <div className="flex justify-between text-neutral-500">
                              <span>Estimated Replenish Cost:</span>
                              <strong className="text-emerald-600 font-bold">
                                {formatCurrency(replenishCost)}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openItemHistory(m)}
                            className="h-8 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                          >
                            <History className="w-3.5 h-3.5" />
                            History
                          </Button>

                          <Link href={`/inventory/purchase?reorderSku=${encodeURIComponent(m.sku)}&name=${encodeURIComponent(m.name)}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-semibold text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 gap-1"
                            >
                              <Truck className="w-3.5 h-3.5 text-amber-600" />
                              Reorder PO
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedMaterial(m);
                              setAdjustData({
                                delta: deficit > 0 ? deficit : 5,
                                type: 'ADD',
                                reason: 'Replenishing low-stock item',
                              });
                              setIsAdjustModalOpen(true);
                            }}
                            className="h-8 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Replenish Stock
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: WASTAGE HISTORY */}
          <TabsContent value="wastage" className="space-y-4">
            <Card className="shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Wastage ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Reason Category</th>
                      <th className="py-3 px-4">Wasted Ingredients</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4">Financial Loss</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {wastageList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            No kitchen wastage logged yet
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Use the &quot;Log Wastage&quot; button above to record spoiled, expired or burnt ingredients.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      wastageList.map((w) => (
                        <tr
                          key={w.id}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {w.wastageNumber}
                          </td>
                          <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                            {formatIndianDate(w.date)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                              {w.reason}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {w.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="font-medium text-neutral-800 dark:text-neutral-200"
                              >
                                {it.rawMaterialName} ({it.quantity} {it.unit})
                                {it.notes && (
                                  <span className="text-neutral-400 text-[10px] ml-1">
                                    - {it.notes}
                                  </span>
                                )}
                              </div>
                            ))}
                          </td>
                          <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                            {w.recordedBy}
                          </td>
                          <td className="py-3 px-4 font-bold text-red-600 whitespace-nowrap">
                            {formatCurrency(w.totalCost)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setWastageToDelete(w)}
                              title="Delete wastage log and restore stock"
                              className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: STOCK MOVEMENTS (IN / OUT LEDGER) */}
          <TabsContent value="movements" className="space-y-4">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 shadow-sm">
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Stock Inflow (+)
                    </p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      +{movementMetrics.totalAddedQty} units
                    </p>
                    <p className="text-[11px] text-emerald-600/80">
                      {movementMetrics.totalStockInCount} receipt events
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm">
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      Stock Outflow / Consumed (-)
                    </p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                      -{movementMetrics.totalDeductedQty} units
                    </p>
                    <p className="text-[11px] text-blue-600/80">
                      {movementMetrics.totalStockOutCount} consumption/waste events
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Total Ledger Records
                    </p>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                      {movementMetrics.totalMovements || movements.length} Events
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Auto-synced with POS & GRN
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <FileText className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Movement Filter Bar */}
            <Card className="shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                  <Input
                    placeholder="Search by ingredient, SKU, PO/GRN number, or POS order..."
                    value={movementSearch}
                    onChange={(e) => setMovementSearch(e.target.value)}
                    className="pl-9 bg-neutral-50 dark:bg-neutral-900 text-xs"
                  />
                  {movementSearch && (
                    <button
                      onClick={() => setMovementSearch('')}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={movementTypeFilter}
                    onChange={(e) => setMovementTypeFilter(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
                  >
                    <option value="ALL">All Movement Types</option>
                    <option value="STOCK_IN">+ Stock Received (GRN / Supplier)</option>
                    <option value="RECIPE_CONSUMPTION">- Recipe Deductions (POS Orders)</option>
                    <option value="WASTAGE">- Kitchen Wastage Logs</option>
                    <option value="MANUAL_ADJUSTMENT">± Manual Quick Adjustments</option>
                    <option value="AUDIT_RECONCILIATION">± Physical Audit Reconciliation</option>
                  </select>

                  {(movementSearch || movementTypeFilter !== 'ALL') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMovementSearch('');
                        setMovementTypeFilter('ALL');
                      }}
                      className="text-xs text-neutral-500 h-9 gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Movements Ledger Table */}
            <Card className="shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Raw Material & SKU</th>
                      <th className="py-3 px-4">Movement Type</th>
                      <th className="py-3 px-4">Quantity Added / Removed</th>
                      <th className="py-3 px-4">Balance After</th>
                      <th className="py-3 px-4">Reference & Reason</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {movementsLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-neutral-500 text-xs">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                          Loading stock movement ledger...
                        </td>
                      </tr>
                    ) : movements.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-neutral-400">
                          <ArrowUpDown className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                            No stock movements found
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Movements are recorded automatically when POs are received, orders are placed, or wastage is logged.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      movements.map((mov) => {
                        const isPositive = mov.changeQty > 0;
                        const targetMaterial = materials.find((m) => m.id === mov.rawMaterialId);

                        return (
                          <tr
                            key={mov.id}
                            className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                              {new Date(mov.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                              <div className="text-[10px] text-neutral-400">
                                {new Date(mov.date).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <p className="font-semibold text-neutral-900 dark:text-white">
                                {mov.rawMaterialName}
                              </p>
                              <span className="font-mono text-[11px] text-neutral-400">
                                {mov.sku} • {mov.category}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {mov.type === 'STOCK_IN' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                  Stock Received (GRN)
                                </span>
                              )}
                              {mov.type === 'RECIPE_CONSUMPTION' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  <ChefHat className="w-3 h-3 text-blue-600" />
                                  Recipe Consumption (POS)
                                </span>
                              )}
                              {mov.type === 'WASTAGE' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                  Kitchen Wastage
                                </span>
                              )}
                              {mov.type === 'MANUAL_ADJUSTMENT' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  <RotateCcw className="w-3 h-3 text-amber-600" />
                                  Manual Adjustment
                                </span>
                              )}
                              {mov.type === 'AUDIT_RECONCILIATION' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                  <ClipboardList className="w-3 h-3 text-purple-600" />
                                  Audit Reconciliation
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`font-bold font-mono text-xs px-2 py-0.5 rounded-md ${
                                  isPositive
                                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60'
                                    : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/60'
                                }`}
                              >
                                {isPositive ? `+${mov.changeQty}` : mov.changeQty} {mov.unit}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                              {mov.balanceAfter} {mov.unit}
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate" title={mov.reference}>
                                {mov.reference}
                              </p>
                              {mov.notes && (
                                <p className="text-[10px] text-neutral-400 truncate" title={mov.notes}>
                                  {mov.notes}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400 text-xs">
                              {mov.recordedBy}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {targetMaterial && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openItemHistory(targetMaterial)}
                                  className="h-7 text-[11px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                                >
                                  <History className="w-3 h-3" />
                                  Item History
                                </Button>
                              )}
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
        </Tabs>

        {/* ========================================================================= */}
        {/* ADD INGREDIENT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-lg sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" />
                Add New Raw Material
              </DialogTitle>
              <DialogDescription>
                Define new recipe ingredient, category, unit of measure, and benchmark cost.
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mUnit">Inventory Unit *</Label>
                  <select
                    id="mUnit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mCurrent">Opening Stock Quantity</Label>
                  <Input
                    id="mCurrent"
                    type="number"
                    step="0.1"
                    min={0}
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
                    min={0}
                    value={formData.minAlertStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minAlertStock: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mCost">Estimated Cost Per Unit (₹)</Label>
                  <Input
                    id="mCost"
                    type="number"
                    step="0.5"
                    min={0}
                    value={formData.costPerUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mSku">Custom SKU (Optional)</Label>
                  <Input
                    id="mSku"
                    placeholder="e.g. RM-SAF-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Inventory'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* EDIT INGREDIENT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-lg sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                Edit Ingredient Details
              </DialogTitle>
              <DialogDescription>
                Update category, unit of measure, reorder threshold, or cost per unit.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateMaterial} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="editName">Ingredient Name *</Label>
                  <Input
                    id="editName"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editCategory">Category *</Label>
                  <select
                    id="editCategory"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editUnit">Inventory Unit *</Label>
                  <select
                    id="editUnit"
                    value={editFormData.unit}
                    onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editMin">Reorder Alert Level</Label>
                  <Input
                    id="editMin"
                    type="number"
                    step="0.1"
                    min={0}
                    value={editFormData.minAlertStock}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        minAlertStock: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editCost">Cost Per Unit (₹)</Label>
                  <Input
                    id="editCost"
                    type="number"
                    step="0.5"
                    min={0}
                    value={editFormData.costPerUnit}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        costPerUnit: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* QUICK STOCK ADJUST MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
          <DialogContent className="max-w-md sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                Quick Stock Adjustment
              </DialogTitle>
              <DialogDescription>
                Correct or adjust stock for <strong>{selectedMaterial?.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500">Current In-Stock:</span>
                  <div className="font-bold text-base text-neutral-900 dark:text-white font-mono">
                    {selectedMaterial?.currentStock} {selectedMaterial?.unit}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500">Resulting Stock:</span>
                  <div className="font-bold text-base text-emerald-600 font-mono">
                    {adjustedStockPreview} {selectedMaterial?.unit}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={adjustData.type === 'ADD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdjustData({ ...adjustData, type: 'ADD' })}
                  className={adjustData.type === 'ADD' ? 'bg-emerald-600 text-white font-semibold' : 'text-xs'}
                >
                  + Add Stock
                </Button>
                <Button
                  type="button"
                  variant={adjustData.type === 'SUBTRACT' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdjustData({ ...adjustData, type: 'SUBTRACT' })}
                  className={adjustData.type === 'SUBTRACT' ? 'bg-red-600 text-white font-semibold' : 'text-xs'}
                >
                  - Deduct
                </Button>
                <Button
                  type="button"
                  variant={adjustData.type === 'SET' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setAdjustData({
                      ...adjustData,
                      type: 'SET',
                      delta: selectedMaterial?.currentStock || 0,
                    })
                  }
                  className={adjustData.type === 'SET' ? 'bg-blue-600 text-white font-semibold' : 'text-xs'}
                >
                  = Set Exact
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjQty">
                  {adjustData.type === 'SET' ? 'Exact New Stock' : 'Quantity to Adjust'} ({selectedMaterial?.unit})
                </Label>
                <Input
                  id="adjQty"
                  type="number"
                  step="0.1"
                  min={0}
                  value={adjustData.delta}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, delta: parseFloat(e.target.value) || 0 })
                  }
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjReason">Adjustment Reason</Label>
                <Input
                  id="adjReason"
                  placeholder="e.g. Stock count recount, Extra intake"
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Count correction', 'Fresh arrival', 'Chef intake', 'Prep discard'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAdjustData({ ...adjustData, reason: chip })}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setIsAdjustModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuickAdjust}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSubmitting ? 'Updating...' : 'Save Adjustment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* LOG KITCHEN WASTAGE MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isWastageModalOpen} onOpenChange={setIsWastageModalOpen}>
          <DialogContent className="max-w-md sm:rounded-2xl">
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
                  className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currentStock} {m.unit} in stock)
                    </option>
                  ))}
                </select>
              </div>

              {selectedWastageMaterial && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-red-700 dark:text-red-300 font-medium">Unit Rate:</span>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(selectedWastageMaterial.costPerUnit)} / {selectedWastageMaterial.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-red-700 dark:text-red-300 font-medium">Calculated Loss:</span>
                    <p className="font-bold text-red-600 text-sm">
                      {formatCurrency(
                        (Number(wastageData.quantity) || 0) * selectedWastageMaterial.costPerUnit
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="wReason">Wastage Reason *</Label>
                <select
                  id="wReason"
                  value={wastageData.reason}
                  onChange={(e) => setWastageData({ ...wastageData, reason: e.target.value })}
                  className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                >
                  <option value="Spoilage">Spoilage / Rotten</option>
                  <option value="Preparation Error">Preparation / Cooking Error</option>
                  <option value="Burning">Burning on Tandoor / Pan</option>
                  <option value="Expiry">Expired Shelf Life</option>
                  <option value="Spillage">Spillage / Dropped</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wQty">
                  Wasted Quantity {selectedWastageMaterial ? `(${selectedWastageMaterial.unit})` : ''} *
                </Label>
                <Input
                  id="wQty"
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={wastageData.quantity}
                  onChange={(e) =>
                    setWastageData({ ...wastageData, quantity: parseFloat(e.target.value) || 0 })
                  }
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wNotes">Chef Prep Notes</Label>
                <Input
                  id="wNotes"
                  placeholder="e.g. High ambient temperature overnight"
                  value={wastageData.notes}
                  onChange={(e) => setWastageData({ ...wastageData, notes: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWastageModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  {isSubmitting ? 'Logging...' : 'Deduct & Log Loss'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* PHYSICAL STOCK AUDIT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                Physical Stock Count & Variance Audit
              </DialogTitle>
              <DialogDescription>
                Input actual physical shelf counts. The system computes variance (+ / -) and aligns the ledger automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <Input
                    placeholder="Filter ingredients to count..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                  {auditSearch && (
                    <button
                      onClick={() => setAuditSearch('')}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const matchMap: { [id: string]: number } = {};
                    materials.forEach((m) => {
                      matchMap[m.id] = m.currentStock;
                    });
                    setAuditCounts(matchMap);
                    toast.success('All physical shelf counts reset to system stock');
                  }}
                  className="h-9 text-xs font-medium gap-1 text-neutral-700 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All to System
                </Button>
              </div>

              <div className="border rounded-xl overflow-y-auto max-h-[50vh] divide-y">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase sticky top-0 font-semibold z-10">
                    <tr>
                      <th className="py-2.5 px-3">Ingredient</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">System Stock</th>
                      <th className="py-2.5 px-3 w-40">Physical Shelf Count</th>
                      <th className="py-2.5 px-3 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAuditMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-400">
                          No ingredients match your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditMaterials.map((m) => {
                        const count = auditCounts[m.id] ?? m.currentStock;
                        const diff = Math.round((count - m.currentStock) * 10) / 10;
                        const varianceValue = Math.round(diff * m.costPerUnit * 100) / 100;

                        return (
                          <tr
                            key={m.id}
                            className={`hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors ${
                              diff !== 0 ? 'bg-amber-50/20 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {m.name}
                              </span>
                              <div className="font-mono text-[10px] text-neutral-400">{m.sku}</div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="text-[10px] text-neutral-500">{m.category}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                              {m.currentStock} {m.unit}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min={0}
                                  className="w-24 h-8 text-xs font-mono"
                                  value={count}
                                  onChange={(e) =>
                                    setAuditCounts({
                                      ...auditCounts,
                                      [m.id]: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                                <span className="text-[10px] text-neutral-500">{m.unit}</span>
                                {diff !== 0 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      setAuditCounts({
                                        ...auditCounts,
                                        [m.id]: m.currentStock,
                                      })
                                    }
                                    title="Reset to system stock"
                                    className="h-6 w-6 text-neutral-400 hover:text-neutral-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                                diff === 0
                                  ? 'text-neutral-400'
                                  : diff > 0
                                  ? 'text-emerald-600'
                                  : 'text-red-500'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : diff} {m.unit}
                              {diff !== 0 && (
                                <div className="text-[10px] font-normal">
                                  {diff > 0 ? '+' : ''}
                                  {formatCurrency(varianceValue)}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t flex items-center justify-between sm:justify-between w-full">
              <span className="text-xs text-neutral-500">
                Auditing {Object.keys(auditCounts).length} of {materials.length} ingredients
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAuditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAuditSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? 'Reconciling...' : 'Reconcile & Save Audit'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE INGREDIENT CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <DialogContent className="max-w-sm sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Delete Ingredient?</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete &quot;<strong>{itemToDelete?.name}</strong>&quot; ({itemToDelete?.sku}) from your inventory?
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItemToDelete(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDeleteMaterial}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Ingredient'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE WASTAGE CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        <Dialog
          open={!!wastageToDelete}
          onOpenChange={(open) => !open && setWastageToDelete(null)}
        >
          <DialogContent className="max-w-sm sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Delete Wastage Log?</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete wastage record &quot;<strong>{wastageToDelete?.wastageNumber}</strong>&quot;?
                This will automatically restore the wasted ingredients back into current inventory stock.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWastageToDelete(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDeleteWastage}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isSubmitting ? 'Restoring...' : 'Yes, Delete & Restore Stock'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* ITEM IN/OUT STOCK MOVEMENT HISTORY MODAL */}
        {/* ========================================================================= */}
        <Dialog
          open={!!historyMaterial}
          onOpenChange={(open) => !open && setHistoryMaterial(null)}
        >
          <DialogContent className="max-w-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            {historyMaterial && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                          <History className="w-5 h-5 text-blue-600" />
                          <span>{historyMaterial.name}</span>
                        </DialogTitle>
                        <Badge variant="outline" className="text-xs">
                          {historyMaterial.category}
                        </Badge>
                      </div>
                      <DialogDescription className="mt-1 font-mono text-xs">
                        SKU: {historyMaterial.sku} • Cost: {formatCurrency(historyMaterial.costPerUnit)} / {historyMaterial.unit}
                      </DialogDescription>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {historyMaterial.currentStock <= historyMaterial.minAlertStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Optimal Level
                        </span>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                {/* Stock KPI Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Current Stock
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                      {historyMaterial.currentStock} {historyMaterial.unit}
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Min Alert Level
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                      {historyMaterial.minAlertStock} {historyMaterial.unit}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                      Total Added (+)
                    </p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      +{itemMovements.filter((m) => m.changeQty > 0).reduce((acc, m) => acc + m.changeQty, 0)} {historyMaterial.unit}
                    </p>
                  </div>

                  <div className="p-3 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
                    <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">
                      Total Deducted (-)
                    </p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-0.5">
                      -{Math.abs(itemMovements.filter((m) => m.changeQty < 0).reduce((acc, m) => acc + m.changeQty, 0))} {historyMaterial.unit}
                    </p>
                  </div>
                </div>

                {/* Movements Ledger for this item */}
                <div className="space-y-2 mt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Movement & Consumption Timeline ({itemMovements.length})
                  </h4>

                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 uppercase font-semibold sticky top-0 border-b">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Quantity</th>
                            <th className="py-2.5 px-3">Balance After</th>
                            <th className="py-2.5 px-3">Reference / Notes</th>
                            <th className="py-2.5 px-3">User</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                          {itemMovementsLoading ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-neutral-400">
                                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-blue-600" />
                                Loading movements...
                              </td>
                            </tr>
                          ) : itemMovements.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-neutral-400">
                                No movements recorded yet for this item.
                              </td>
                            </tr>
                          ) : (
                            itemMovements.map((mov) => {
                              const isPositive = mov.changeQty > 0;
                              return (
                                <tr key={mov.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                                  <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-neutral-500">
                                    {new Date(mov.date).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                    })}
                                    <span className="text-[10px] text-neutral-400 block">
                                      {new Date(mov.date).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    {mov.type === 'STOCK_IN' && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                        Stock In
                                      </span>
                                    )}
                                    {mov.type === 'RECIPE_CONSUMPTION' && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                        <ChefHat className="w-3 h-3 text-blue-600" />
                                        Recipe (POS)
                                      </span>
                                    )}
                                    {mov.type === 'WASTAGE' && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                        <Trash2 className="w-3 h-3 text-red-600" />
                                        Wastage
                                      </span>
                                    )}
                                    {mov.type === 'MANUAL_ADJUSTMENT' && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                        <RotateCcw className="w-3 h-3 text-amber-600" />
                                        Adjusted
                                      </span>
                                    )}
                                    {mov.type === 'AUDIT_RECONCILIATION' && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                        <ClipboardList className="w-3 h-3 text-purple-600" />
                                        Audit
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    <span
                                      className={`font-bold font-mono text-xs ${
                                        isPositive ? 'text-emerald-600' : 'text-red-600'
                                      }`}
                                    >
                                      {isPositive ? `+${mov.changeQty}` : mov.changeQty} {mov.unit}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3 whitespace-nowrap font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                                    {mov.balanceAfter} {mov.unit}
                                  </td>

                                  <td className="py-2.5 px-3 max-w-xs">
                                    <p className="font-medium truncate text-neutral-800 dark:text-neutral-200" title={mov.reference}>
                                      {mov.reference}
                                    </p>
                                    {mov.notes && (
                                      <p className="text-[10px] text-neutral-400 truncate" title={mov.notes}>
                                        {mov.notes}
                                      </p>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap text-[11px]">
                                    {mov.recordedBy}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-row justify-between items-center sm:justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Link href={`/inventory/purchase?reorderSku=${encodeURIComponent(historyMaterial.sku)}&name=${encodeURIComponent(historyMaterial.name)}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-semibold gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        Create Reorder PO
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMaterial(historyMaterial);
                        setAdjustData({
                          delta: 5,
                          type: 'ADD',
                          reason: 'Manual adjustment',
                        });
                        setIsAdjustModalOpen(true);
                      }}
                      className="text-xs font-semibold gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      Adjust Stock
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHistoryMaterial(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
