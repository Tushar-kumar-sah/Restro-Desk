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
import { formatCurrency } from '@/lib/formatters';
import {
  Scroll,
  Plus,
  Search,
  Scale,
  Percent,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Info,
  ChefHat,
  Sparkles,
} from 'lucide-react';

interface RecipeIngredient {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  ingredientCost: number;
  wastePercentage: number;
}

interface RecipeItem {
  id: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  menuPrice: number;
  yieldQuantity: number;
  instructions: string;
  totalFoodCost: number;
  foodCostPercentage: number;
  grossMarginPercentage: number;
  ingredients: RecipeIngredient[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRecipes: 0,
    avgFoodCostPercent: 0,
    highestMarginDish: '',
    lowestMarginDish: '',
  });

  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formItemId, setFormItemId] = useState('');
  const [formYield, setFormYield] = useState(1);
  const [formInstructions, setFormInstructions] = useState('');
  const [formIngredients, setFormIngredients] = useState<
    Array<{ rawMaterialId: string; quantity: number; unit: string; wastePercentage: number }>
  >([
    { rawMaterialId: 'rm-01', quantity: 200, unit: 'GRAM', wastePercentage: 2 },
  ]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/recipes?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setRecipes(data.recipes || []);
        if (data.metrics) setMetrics(data.metrics);
      }

      // Fetch materials for dropdown
      const matRes = await fetch('/api/inventory/raw-materials');
      const matData = await matRes.json();
      if (matData.success) {
        setRawMaterials(matData.materials || []);
      }

      // Fetch menu items for dropdown
      const itemRes = await fetch('/api/menu/items');
      const itemData = await itemRes.json();
      if (itemData.success) {
        setMenuItems(itemData.items || []);
        if (itemData.items?.length > 0 && !formItemId) {
          setFormItemId(itemData.items[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load recipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [search]);

  const addIngredientRow = () => {
    const defaultRmId = rawMaterials[0]?.id || 'rm-01';
    setFormIngredients([
      ...formIngredients,
      { rawMaterialId: defaultRmId, quantity: 100, unit: 'GRAM', wastePercentage: 0 },
    ]);
  };

  const removeIngredientRow = (idx: number) => {
    if (formIngredients.length <= 1) return;
    setFormIngredients(formIngredients.filter((_, i) => i !== idx));
  };

  const updateIngredientRow = (idx: number, updates: any) => {
    const updated = [...formIngredients];
    updated[idx] = { ...updated[idx], ...updates };
    setFormIngredients(updated);
  };

  // Compute live food cost for the creation modal
  const selectedMenuItem = menuItems.find((m) => m.id === formItemId);
  const liveTotalCost = formIngredients.reduce((acc, ing) => {
    const rm = rawMaterials.find((m) => m.id === ing.rawMaterialId);
    if (!rm) return acc;
    const baseCost =
      ing.unit === 'GRAM' || ing.unit === 'ML'
        ? (ing.quantity / 1000) * rm.costPerUnit
        : ing.quantity * rm.costPerUnit;
    const withWaste = baseCost * (1 + (ing.wastePercentage || 0) / 100);
    return acc + withWaste;
  }, 0);

  const liveFoodCostPct =
    selectedMenuItem && selectedMenuItem.basePrice > 0
      ? Math.round((liveTotalCost / selectedMenuItem.basePrice) * 1000) / 10
      : 0;

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemId) {
      showToast('Please select a menu dish', 'error');
      return;
    }

    try {
      const res = await fetch('/api/inventory/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: formItemId,
          yieldQuantity: Number(formYield),
          instructions: formInstructions,
          ingredients: formIngredients.map((i) => ({
            ...i,
            quantity: Number(i.quantity),
            wastePercentage: Number(i.wastePercentage),
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsCreateModalOpen(false);
        fetchRecipes();
      } else {
        showToast(data.message || 'Failed to save recipe', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRecipe = async (id: string, name: string) => {
    if (!confirm(`Delete recipe BOM for "${name}"?`)) return;
    try {
      const res = await fetch(`/api/inventory/recipes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Recipe BOM deleted');
        fetchRecipes();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getFoodCostBadge = (pct: number) => {
    if (pct <= 28) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {pct}% (Healthy)
        </span>
      );
    }
    if (pct <= 35) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Percent className="w-3 h-3 text-amber-600" />
          {pct}% (Moderate)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
        <AlertTriangle className="w-3 h-3 text-red-600" />
        {pct}% (High Cost)
      </span>
    );
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
              <Scroll className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Recipes & Bill of Materials (BOM)
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Standardized kitchen prep recipes, raw material consumption and real-time food cost %
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Standardize Recipe (BOM)
          </Button>
        </div>

        {/* Food Cost Analytics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Avg Food Cost
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  {metrics.avgFoodCostPercent}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Active Recipes
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {metrics.totalRecipes} Standardized
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
                  Top Margin Dish
                </p>
                <p className="text-sm font-bold text-purple-600 truncate max-w-[140px]">
                  {metrics.highestMarginDish}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Target Food Cost
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">&lt; 30.0%</p>
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
                placeholder="Search recipe by menu dish or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-neutral-50 dark:bg-neutral-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipes Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Menu Dish & Category</th>
                  <th className="py-3 px-4">Selling Price (₹)</th>
                  <th className="py-3 px-4">Raw Material Cost (₹)</th>
                  <th className="py-3 px-4">Food Cost %</th>
                  <th className="py-3 px-4">Gross Margin %</th>
                  <th className="py-3 px-4">Ingredients Count</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      Loading standardized recipes...
                    </td>
                  </tr>
                ) : recipes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      No recipes standardized yet. Click "+ Standardize Recipe" to link ingredients.
                    </td>
                  </tr>
                ) : (
                  recipes.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {r.itemName}
                        </p>
                        <span className="text-xs text-neutral-400">{r.categoryName}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(r.menuPrice)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(r.totalFoodCost)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getFoodCostBadge(r.foodCostPercentage)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {r.grossMarginPercentage}% Margin
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-500">
                        {r.ingredients.length} raw ingredients
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRecipe(r)}
                            className="h-8 text-xs gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          >
                            Inspect BOM
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRecipe(r.id, r.itemName)}
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
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
        {/* RECIPE BOM INSPECTOR MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedRecipe && (
              <div>
                <DialogHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-emerald-600" />
                        {selectedRecipe.itemName}
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-1">
                        {selectedRecipe.categoryName} • Selling Price: {formatCurrency(selectedRecipe.menuPrice)}
                      </DialogDescription>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-neutral-400 uppercase font-medium">Food Cost</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(selectedRecipe.totalFoodCost)} ({selectedRecipe.foodCostPercentage}%)
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  {selectedRecipe.instructions && (
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 border">
                      <span className="font-semibold block mb-1">Chef Prep Instructions:</span>
                      {selectedRecipe.instructions}
                    </div>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Ingredient</th>
                          <th className="py-2.5 px-3">Recipe Qty</th>
                          <th className="py-2.5 px-3">Waste Allowance</th>
                          <th className="py-2.5 px-3 text-right">Cost Contribution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedRecipe.ingredients.map((ing) => (
                          <tr key={ing.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                            <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">
                              {ing.rawMaterialName}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {ing.quantity} {ing.unit}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-500">
                              {ing.wastePercentage}%
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-neutral-900 dark:text-white">
                              {formatCurrency(ing.ingredientCost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <DialogFooter className="pt-2 border-t">
                  <Button variant="default" onClick={() => setSelectedRecipe(null)} className="bg-neutral-900 text-white">
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* CREATE / STANDARDIZE RECIPE MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scroll className="w-5 h-5 text-emerald-600" />
                Standardize Recipe (Bill of Materials)
              </DialogTitle>
              <DialogDescription>
                Map menu dishes to raw ingredients to calculate precise food cost % and enable auto-stock deductions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveRecipe} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="dishSelect">Select Menu Dish *</Label>
                  <select
                    id="dishSelect"
                    value={formItemId}
                    onChange={(e) => setFormItemId(e.target.value)}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    {menuItems.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({formatCurrency(m.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst">Preparation Instructions</Label>
                  <Textarea
                    id="inst"
                    rows={2}
                    placeholder="e.g. Sauté paneer with spices, add makhani gravy and finish with cream."
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic Ingredients Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                    Recipe Ingredients (BOM)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addIngredientRow}
                    className="h-7 text-xs text-emerald-600 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Ingredient
                  </Button>
                </div>

                <div className="space-y-2">
                  {formIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border text-xs"
                    >
                      <select
                        value={ing.rawMaterialId}
                        onChange={(e) => updateIngredientRow(idx, { rawMaterialId: e.target.value })}
                        className="flex-1 px-2 py-1.5 rounded border bg-white dark:bg-neutral-800 text-xs"
                      >
                        {rawMaterials.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name} (₹{rm.costPerUnit}/{rm.unit})
                          </option>
                        ))}
                      </select>

                      <Input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) =>
                          updateIngredientRow(idx, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 h-8 text-xs bg-white dark:bg-neutral-800 font-mono"
                      />

                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredientRow(idx, { unit: e.target.value })}
                        className="w-20 px-2 py-1.5 rounded border bg-white dark:bg-neutral-800 text-xs"
                      >
                        <option value="GRAM">GRAM</option>
                        <option value="ML">ML</option>
                        <option value="PIECE">PCS</option>
                        <option value="KG">KG</option>
                        <option value="LITER">LITER</option>
                      </select>

                      <Input
                        type="number"
                        placeholder="Waste %"
                        value={ing.wastePercentage}
                        onChange={(e) =>
                          updateIngredientRow(idx, {
                            wastePercentage: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 h-8 text-xs bg-white dark:bg-neutral-800 font-mono"
                        title="Waste allowance %"
                      />

                      {formIngredients.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredientRow(idx)}
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Food Cost & Margin Calculator */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500">Total Raw Material Cost:</span>{' '}
                  <strong className="text-neutral-900 dark:text-white font-mono text-sm">
                    {formatCurrency(liveTotalCost)}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Food Cost %:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      liveFoodCostPct <= 28
                        ? 'bg-emerald-100 text-emerald-800'
                        : liveFoodCostPct <= 35
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {liveFoodCostPct}%
                  </span>
                </div>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Recipe (BOM)
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
