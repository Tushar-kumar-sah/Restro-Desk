'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Upload,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

export default function MenuCatalogPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [foodFilter, setFoodFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    categoryId: '',
    foodType: 'VEG' as 'VEG' | 'NON_VEG' | 'BEVERAGE',
    basePrice: 0,
    preparationTime: 15,
    hsnCode: '2106',
    description: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('/api/menu/categories'),
        fetch('/api/menu/items?limit=100'),
      ]);
      const catData = await catRes.json();
      const itemData = await itemRes.json();

      if (catData.success) {
        setCategories(catData.categories);
        if (catData.categories.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catData.categories[0].id }));
        }
      }
      if (itemData.success) setItems(itemData.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async (item: any) => {
    const newStatus = !item.isAvailable;
    // optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isAvailable: newStatus } : i))
    );

    try {
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${item.name} is now ${newStatus ? 'Available' : 'Sold Out'}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/menu/items/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Item "${itemToDelete.name}" deleted successfully`);
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        setItemToDelete(null);
      } else {
        toast.error(data.message || 'Failed to delete item');
      }
    } catch (err) {
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.basePrice) {
      toast.error('Please enter item name and price');
      return;
    }

    try {
      const url = editingItem ? `/api/menu/items/${editingItem.id}` : '/api/menu/items';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? 'Item updated!' : 'Item created!');
        setIsAddModalOpen(false);
        setEditingItem(null);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to save item');
    }
  };

  const handleBulkUpload = async () => {
    if (!csvContent.trim()) {
      toast.error('Paste CSV rows to import');
      return;
    }

    try {
      const rows = csvContent.trim().split('\n');
      const parsedItems = rows.slice(1).map((row) => {
        const [name, categoryName, foodType, price, code, hsn] = row.split(',').map((s) => s.trim());
        return {
          name,
          categoryName,
          foodType,
          basePrice: parseFloat(price) || 100,
          shortCode: code,
          hsnCode: hsn,
        };
      });

      const res = await fetch('/api/menu/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedItems }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsBulkModalOpen(false);
        setCsvContent('');
        fetchData();
      }
    } catch (err) {
      toast.error('Bulk upload failed');
    }
  };

  const filtered = items.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesFood = foodFilter === 'ALL' || item.foodType === foodFilter;
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.shortCode && item.shortCode.toLowerCase().includes(search.toLowerCase()));

    return matchesCat && matchesFood && matchesSearch;
  });

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-orange-600" />
            Menu Catalog &amp; Master Pricing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage categories, HSN tax groups, items, variants, and real-time 86/Sold-Out toggles.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkModalOpen(true)}
            className="rounded-xl text-xs"
          >
            <Upload className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Bulk CSV Upload
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setFormData({
                name: '',
                shortCode: '',
                categoryId: categories[0]?.id || '',
                foodType: 'VEG',
                basePrice: 0,
                preparationTime: 15,
                hsnCode: '2106',
                description: '',
              });
              setIsAddModalOpen(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-2xl shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Search item name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground outline-none"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Food Type */}
            <div className="flex items-center rounded-xl bg-muted p-0.5">
              <button
                onClick={() => setFoodFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  foodFilter === 'ALL' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFoodFilter('VEG')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  foodFilter === 'VEG' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-600'
                }`}
              >
                Veg
              </button>
              <button
                onClick={() => setFoodFilter('NON_VEG')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  foodFilter === 'NON_VEG' ? 'bg-red-600 text-white shadow-xs' : 'text-red-600'
                }`}
              >
                Non-Veg
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Data Table */}
      <Card className="rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
              <tr>
                <th className="p-3.5 pl-4">TYPE</th>
                <th className="p-3.5">ITEM NAME</th>
                <th className="p-3.5">CATEGORY</th>
                <th className="p-3.5">SHORT CODE</th>
                <th className="p-3.5">BASE PRICE</th>
                <th className="p-3.5">HSN CODE</th>
                <th className="p-3.5">PREP TIME</th>
                <th className="p-3.5">AVAILABILITY</th>
                <th className="p-3.5 pr-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 pl-4">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        item.foodType === 'VEG' ? 'border-emerald-600' : 'border-red-600'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          item.foodType === 'VEG' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-foreground">
                    {item.name}
                    {item.description && (
                      <span className="block text-[11px] text-muted-foreground font-normal line-clamp-1">
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-muted-foreground">{item.categoryName}</td>
                  <td className="p-3.5 font-mono font-bold text-muted-foreground">
                    {item.shortCode || '-'}
                  </td>
                  <td className="p-3.5 font-bold text-foreground">
                    {formatCurrency(item.basePrice)}
                  </td>
                  <td className="p-3.5 text-muted-foreground">{item.hsnCode || '2106'}</td>
                  <td className="p-3.5 text-muted-foreground flex items-center gap-1 pt-4">
                    <Clock className="h-3 w-3" />
                    {item.preparationTime || 15}m
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> In Stock
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> Sold Out (86)
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingItem(item);
                          setFormData({
                            name: item.name,
                            shortCode: item.shortCode || '',
                            categoryId: item.categoryId,
                            foodType: item.foodType,
                            basePrice: item.basePrice,
                            preparationTime: item.preparationTime || 15,
                            hsnCode: item.hsnCode || '2106',
                            description: item.description || '',
                          });
                          setIsAddModalOpen(true);
                        }}
                        title={`Edit ${item.name}`}
                        className="rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setItemToDelete(item)}
                        title={`Delete ${item.name}`}
                        className="rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Item Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit: ${editingItem.name}` : 'Add New Menu Item'}
            </DialogTitle>
            <DialogDescription>
              Configure menu item details, pricing, HSN code and kitchen preparation timing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Item Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kadai Paneer Special"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Short Code (POS Punch Code)</Label>
                <Input
                  value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. CUR13"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium outline-none"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Dietary Food Type</Label>
                <select
                  value={formData.foodType}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value as any })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium outline-none"
                >
                  <option value="VEG">Vegetarian (Green)</option>
                  <option value="NON_VEG">Non-Vegetarian (Red)</option>
                  <option value="BEVERAGE">Beverage (Blue)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Base Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>HSN / SAC Code</Label>
                <Input
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Prep Time (Mins)</Label>
                <Input
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 15 })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description / Ingredients</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief recipe or taste description..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk CSV Upload Modal */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Menu Items (CSV)</DialogTitle>
            <DialogDescription>
              Format: <code>Item Name, Category, FoodType, Price, ShortCode, HSN</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`Item Name, Category, FoodType, Price, ShortCode, HSN\nPaneer Lababdar, Main Course (Curries), VEG, 360, CUR14, 2106\nChicken Chettinad, Main Course (Curries), NON_VEG, 410, CUR15, 2106`}
              className="w-full rounded-xl border border-input bg-muted/20 p-3 font-mono text-xs outline-none"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkUpload} className="bg-orange-600 hover:bg-orange-700">
                Import CSV Rows
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete Menu Item?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;<strong>{itemToDelete?.name}</strong>&quot; from your menu?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteItem}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
