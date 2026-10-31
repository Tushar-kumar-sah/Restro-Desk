'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

export default function ModifiersPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion targets
  const [itemToDelete, setItemToDelete] = useState<{ groupId: string; groupName: string; addonId: string; addonName: string } | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string; optionCount: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Add Option into existing group
  const [quickAddGroupId, setQuickAddGroupId] = useState<string | null>(null);
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddPrice, setQuickAddPrice] = useState<number | string>(0);
  const [isAddingOption, setIsAddingOption] = useState(false);

  // New Group Form
  const [groupName, setGroupName] = useState('');
  const [minSelect, setMinSelect] = useState(0);
  const [maxSelect, setMaxSelect] = useState(1);
  const [isRequired, setIsRequired] = useState(false);
  const [addons, setAddons] = useState<Array<{ name: string; price: number; isVeg: boolean }>>([
    { name: '', price: 0, isVeg: true },
  ]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/menu/modifiers');
      const data = await res.json();
      if (data.success) setGroups(data.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddAddonRow = () => {
    setAddons([...addons, { name: '', price: 0, isVeg: true }]);
  };

  const handleRemoveAddonRow = (idx: number) => {
    setAddons(addons.filter((_, i) => i !== idx));
  };

  // Create New Modifier Group
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Enter group name');
      return;
    }
    const validAddons = addons.filter((a) => a.name.trim() !== '');
    if (validAddons.length === 0) {
      toast.error('Add at least one modifier option');
      return;
    }

    try {
      const res = await fetch('/api/menu/modifiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          minSelect,
          maxSelect,
          isRequired,
          addons: validAddons,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Modifier group created!');
        setIsModalOpen(false);
        setGroupName('');
        setAddons([{ name: '', price: 0, isVeg: true }]);
        fetchGroups();
      } else {
        toast.error(data.message || 'Failed to create group');
      }
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  // Remove individual addon item
  const handleConfirmRemoveItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/menu/modifiers?addonId=${itemToDelete.addonId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Removed "${itemToDelete.addonName}" from ${itemToDelete.groupName}`);
        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === itemToDelete.groupId) {
              return {
                ...g,
                addons: (g.addons || []).filter((a: any) => a.id !== itemToDelete.addonId),
              };
            }
            return g;
          })
        );
        setItemToDelete(null);
      } else {
        toast.error(data.message || 'Failed to remove option');
      }
    } catch (err) {
      toast.error('Failed to remove option');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete entire modifier group
  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/menu/modifiers?groupId=${groupToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted modifier group "${groupToDelete.name}"`);
        setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
        setGroupToDelete(null);
      } else {
        toast.error(data.message || 'Failed to delete modifier group');
      }
    } catch (err) {
      toast.error('Failed to delete modifier group');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Add option to existing group
  const handleQuickAddOption = async (groupId: string) => {
    if (!quickAddName.trim()) {
      toast.error('Enter option name');
      return;
    }
    setIsAddingOption(true);
    try {
      const res = await fetch('/api/menu/modifiers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          newAddon: {
            name: quickAddName.trim(),
            price: Number(quickAddPrice) || 0,
            isVeg: true,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.addon) {
        toast.success(data.message || 'Option added!');
        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                addons: [...(g.addons || []), data.addon],
              };
            }
            return g;
          })
        );
        setQuickAddGroupId(null);
        setQuickAddName('');
        setQuickAddPrice(0);
      } else {
        toast.error(data.message || 'Failed to add option');
      }
    } catch (err) {
      toast.error('Failed to add option');
    } finally {
      setIsAddingOption(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-orange-600" />
            Modifier Groups &amp; Addons
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure customizable choices, toppings, portion sizes and spice level rules.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Modifier Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="rounded-2xl shadow-xs overflow-hidden border">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground">{group.name}</CardTitle>
                <div className="flex items-center gap-1.5">
                  <Badge variant={group.isRequired ? 'brand' : 'secondary'} className="text-[10px] font-semibold">
                    {group.isRequired ? 'Compulsory' : 'Optional'}
                  </Badge>

                  {/* Delete Modifier Group Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setGroupToDelete({
                        id: group.id,
                        name: group.name,
                        optionCount: group.addons?.length || 0,
                      })
                    }
                    title={`Delete entire ${group.name} group`}
                    className="p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground">
                Min: {group.minSelect} • Max: {group.maxSelect} selection(s)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Available Options ({group.addons?.length || 0})
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setQuickAddGroupId(quickAddGroupId === group.id ? null : group.id);
                    setQuickAddName('');
                    setQuickAddPrice(0);
                  }}
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Option
                </button>
              </div>

              {/* Quick Add Form inside card */}
              {quickAddGroupId === group.id && (
                <div className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/40 dark:bg-orange-950/20 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Input
                      placeholder="Option name (e.g. Extra Chutney)"
                      value={quickAddName}
                      onChange={(e) => setQuickAddName(e.target.value)}
                      className="h-8 text-xs bg-background"
                      autoFocus
                    />
                    <Input
                      type="number"
                      placeholder="₹"
                      value={quickAddPrice}
                      onChange={(e) => setQuickAddPrice(e.target.value)}
                      className="h-8 w-20 text-xs bg-background shrink-0"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuickAddGroupId(null)}
                      className="h-7 text-xs px-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isAddingOption}
                      onClick={() => handleQuickAddOption(group.id)}
                      className="h-7 text-xs px-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                    >
                      {isAddingOption ? 'Saving...' : 'Save Option'}
                    </Button>
                  </div>
                </div>
              )}

              {/* List of Addon Items */}
              <div className="divide-y divide-border/60">
                {(group.addons || []).length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No options yet. Click &quot;Add Option&quot; above.
                  </div>
                ) : (
                  (group.addons || []).map((addon: any) => (
                    <div
                      key={addon.id}
                      className="py-2 px-1 flex items-center justify-between text-xs group/item hover:bg-muted/40 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-foreground">{addon.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-muted-foreground">
                          {addon.price > 0 ? `+ ${formatCurrency(addon.price)}` : 'Free'}
                        </span>

                        {/* Remove Option / Item Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setItemToDelete({
                              groupId: group.id,
                              groupName: group.name,
                              addonId: addon.id,
                              addonName: addon.name,
                            })
                          }
                          title={`Remove "${addon.name}" from ${group.name}`}
                          className="opacity-70 group-hover/item:opacity-100 p-1 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL 1: Confirm Remove Individual Item Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Remove Option?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;<strong>{itemToDelete?.addonName}</strong>&quot; from the{' '}
              <strong>{itemToDelete?.groupName}</strong> modifier group?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setItemToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmRemoveItem}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isDeleting ? 'Removing...' : 'Yes, Remove Option'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Confirm Delete Entire Group Dialog */}
      <Dialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete Modifier Group?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the &quot;<strong>{groupToDelete?.name}</strong>&quot; group and all{' '}
              <strong>{groupToDelete?.optionCount}</strong> of its options?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setGroupToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDeleteGroup}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Create Group Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>New Modifier / Addon Group</DialogTitle>
            <DialogDescription>
              Create a group of choices (e.g. Spice Level, Extra Toppings, Portion Size).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveGroup} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Group Title *</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Spice Level or Extra Toppings"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min Selection</Label>
                <Input
                  type="number"
                  value={minSelect}
                  onChange={(e) => setMinSelect(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Selection</Label>
                <Input
                  type="number"
                  value={maxSelect}
                  onChange={(e) => setMaxSelect(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="h-4 w-4 rounded text-orange-600"
              />
              Compulsory for guest to choose before adding to cart
            </label>

            {/* Dynamic Options List */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Modifier Options &amp; Addon Prices</span>
                <button
                  type="button"
                  onClick={handleAddAddonRow}
                  className="text-orange-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="h-3 w-3" /> Add Option
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {addons.map((add, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Option name (e.g. Extra Cheese)"
                      value={add.name}
                      onChange={(e) => {
                        const copy = [...addons];
                        copy[idx].name = e.target.value;
                        setAddons(copy);
                      }}
                      className="text-xs h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Price ₹"
                      value={add.price}
                      onChange={(e) => {
                        const copy = [...addons];
                        copy[idx].price = parseFloat(e.target.value) || 0;
                        setAddons(copy);
                      }}
                      className="w-24 text-xs h-9"
                    />
                    {addons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAddonRow(idx)}
                        className="p-1 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Save Modifier Group
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
