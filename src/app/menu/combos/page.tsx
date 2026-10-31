'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

export default function CombosPage() {
  const [combos, setCombos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(499);
  const [originalPrice, setOriginalPrice] = useState(650);

  const fetchCombos = async () => {
    try {
      const res = await fetch('/api/menu/combos');
      const data = await res.json();
      if (data.success) setCombos(data.combos);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error('Enter combo name and price');
      return;
    }

    try {
      const res = await fetch('/api/menu/combos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          itemIds: ['itm-01', 'itm-02'], // sample bundled items
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Combo deal created!');
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setPrice(499);
        setOriginalPrice(650);
        fetchCombos();
      } else {
        toast.error(data.message || 'Failed to create combo');
      }
    } catch (err) {
      toast.error('Failed to create combo');
    }
  };

  const handleDeleteCombo = async () => {
    if (!comboToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/menu/combos?id=${comboToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Combo "${comboToDelete.name}" removed successfully`);
        setCombos((prev) => prev.filter((c) => c.id !== comboToDelete.id));
        setComboToDelete(null);
      } else {
        toast.error(data.message || 'Failed to remove combo');
      }
    } catch (err) {
      toast.error('Failed to remove combo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-600" />
            Combos &amp; Value Meal Deals
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bundle high-margin items, thalis and party packs with discounted combo pricing.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create New Combo
        </Button>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combos.map((combo) => {
          const savings = combo.originalPrice ? combo.originalPrice - combo.price : 0;
          return (
            <Card key={combo.id} className="rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between border">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground">{combo.name}</CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="brand" className="text-[10px] uppercase font-bold">
                      Value Deal
                    </Badge>

                    {/* Delete Combo Button */}
                    <button
                      type="button"
                      onClick={() => setComboToDelete(combo)}
                      title={`Delete "${combo.name}" combo`}
                      className="p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {combo.description && (
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {combo.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-black text-foreground">
                      {formatCurrency(combo.price)}
                    </span>
                    {combo.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through ml-2">
                        {formatCurrency(combo.originalPrice)}
                      </span>
                    )}
                  </div>

                  {savings > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      Save {formatCurrency(savings)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                  <span>Bundled Items: {combo.itemCount || 3}</span>
                  <Badge variant="success" className="text-[10px]">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!comboToDelete} onOpenChange={(open) => !open && setComboToDelete(null)}>
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete Combo Deal?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently remove &quot;<strong>{comboToDelete?.name}</strong>&quot; from your active menu deals?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setComboToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteCombo}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Combo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Combo Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Combo Value Pack</DialogTitle>
            <DialogDescription>
              Bundle menu items into a special meal deal with custom combo pricing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCombo} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Combo Title *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maharaja Thali / Couple Biryani Feast"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Included Items Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 1 Chicken Biryani + 1 Paneer Tikka + 2 Soft Drinks"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Combo Offer Price (₹) *</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Regular Total Price (₹)</Label>
                <Input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Publish Combo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
