'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

export default function ModifiersPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Group Form
  const [groupName, setGroupName] = useState('');
  const [minSelect, setMinSelect] = useState(0);
  const [maxSelect, setMaxSelect] = useState(1);
  const [isRequired, setIsRequired] = useState(false);
  const [addons, setAddons] = useState<Array<{ name: string; price: number; isVeg: boolean }>>([
    { name: '', price: 0, isVeg: true },
  ]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/menu/modifiers');
      const data = await res.json();
      if (data.success) setGroups(data.groups);
    } catch (err) {
      console.error(err);
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

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) {
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
          name: groupName,
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
      }
    } catch (err) {
      toast.error('Failed to create group');
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
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Modifier Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">{group.name}</CardTitle>
                <Badge variant={group.isRequired ? 'brand' : 'secondary'} className="text-[10px]">
                  {group.isRequired ? 'Compulsory' : 'Optional'}
                </Badge>
              </div>
              <CardDescription className="text-[11px]">
                Min: {group.minSelect} • Max: {group.maxSelect} selection(s)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Available Options ({group.addons?.length || 0})
              </span>
              <div className="divide-y divide-border/60">
                {(group.addons || []).map((addon: any) => (
                  <div key={addon.id} className="py-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{addon.name}</span>
                    <span className="font-bold text-muted-foreground">
                      {addon.price > 0 ? `+ ${formatCurrency(addon.price)}` : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Group Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>New Modifier / Addon Group</DialogTitle>
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
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Save Modifier Group
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
