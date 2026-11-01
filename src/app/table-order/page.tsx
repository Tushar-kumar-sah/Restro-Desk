'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Bell,
  Receipt,
  Droplets,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  UtensilsCrossed,
  Search,
  Sparkles,
  Flame,
  ChefHat,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { MOCK_ITEMS, MOCK_CATEGORIES, ItemItem } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function TableOrderPage({
  params,
  searchParams,
}: {
  params?: { tableId?: string };
  searchParams?: { table?: string; outlet?: string };
}) {
  const tableId = searchParams?.table || params?.tableId || 'T-04';
  const outletName = searchParams?.outlet || 'Indiranagar Flagship';

  const [items, setItems] = useState<ItemItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart: Record<itemId, qty>
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderFired, setOrderFired] = useState(false);

  // Calling waiter service alert state
  const [callingService, setCallingService] = useState<string | null>(null);

  useEffect(() => {
    setItems(MOCK_ITEMS);
  }, []);

  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    toast.success('Added to table order');
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find((i) => i.id === id);
      return item ? { item, qty } : null;
    })
    .filter(Boolean) as { item: ItemItem; qty: number }[];

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const subtotal = cartEntries.reduce((acc, e) => acc + e.item.basePrice * e.qty, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = subtotal + tax;

  const handleServiceAlert = async (type: 'CALL_WAITER' | 'REQUEST_BILL' | 'WATER_REFILL') => {
    try {
      setCallingService(type);
      const res = await fetch('/api/qr-menu/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'outlet-01',
          tableId,
          tableName: `Table ${tableId}`,
          requestType: type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      }
    } catch (err) {
      toast.error('Failed to dispatch alert to staff');
    } finally {
      setCallingService(null);
    }
  };

  const handleFireToKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartEntries.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'outlet-01',
          customerName: guestName || `Guest at Table ${tableId}`,
          customerPhone: '9876543210',
          orderType: 'DINE_IN',
          tableId,
          items: cartEntries.map((e) => ({
            itemId: e.item.id,
            itemName: e.item.name,
            qty: e.qty,
            price: e.item.basePrice,
          })),
          subtotal,
          tax,
          deliveryFee: 0,
          packagingFee: 0,
          discount: 0,
          total,
          paymentMethod: 'UPI_QR',
          kitchenNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderFired(true);
        setCart({});
        setIsCartOpen(false);
        toast.success('Order sent directly to Kitchen KDS!');
      } else {
        toast.error(data.error || 'Failed to place table order');
      }
    } catch (err) {
      toast.error('Error sending order to kitchen');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((it) => {
    const matchesCategory = selectedCategory === 'all' || it.categoryId === selectedCategory;
    const matchesFoodType =
      foodTypeFilter === 'ALL' ||
      (foodTypeFilter === 'VEG' && it.foodType === 'VEG') ||
      (foodTypeFilter === 'NON_VEG' && it.foodType === 'NON_VEG');
    const matchesSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (it.description && it.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesFoodType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="RestoDesk Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-slate-900 text-white text-xs font-mono px-2 py-0">
                  Table {tableId}
                </Badge>
                <span className="font-extrabold text-sm text-slate-900">RestoDesk Dine-In</span>
              </div>
              <p className="text-[11px] text-slate-500">{outletName}</p>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs rounded-xl relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Table Order</span>
            {cartCount > 0 && (
              <span className="bg-white text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* HOSPITALITY QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            disabled={callingService === 'CALL_WAITER'}
            className="h-16 flex flex-col items-center justify-center p-2 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm"
            onClick={() => handleServiceAlert('CALL_WAITER')}
          >
            <Bell className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-[11px] font-bold">Call Waiter</span>
          </Button>

          <Button
            variant="outline"
            disabled={callingService === 'REQUEST_BILL'}
            className="h-16 flex flex-col items-center justify-center p-2 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm"
            onClick={() => handleServiceAlert('REQUEST_BILL')}
          >
            <Receipt className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-[11px] font-bold">Request Bill</span>
          </Button>

          <Button
            variant="outline"
            disabled={callingService === 'WATER_REFILL'}
            className="h-16 flex flex-col items-center justify-center p-2 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm"
            onClick={() => handleServiceAlert('WATER_REFILL')}
          >
            <Droplets className="h-5 w-5 text-cyan-500 mb-1" />
            <span className="text-[11px] font-bold">Water Refill</span>
          </Button>
        </div>

        {/* Search & Food Type Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search dishes..."
              className="pl-9 bg-white text-xs h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant={foodTypeFilter === 'ALL' ? 'default' : 'outline'}
              className={`text-xs h-8 ${foodTypeFilter === 'ALL' ? 'bg-slate-900 text-white' : ''}`}
              onClick={() => setFoodTypeFilter('ALL')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={foodTypeFilter === 'VEG' ? 'default' : 'outline'}
              className={`text-xs h-8 gap-1 ${foodTypeFilter === 'VEG' ? 'bg-emerald-600 text-white' : 'text-emerald-700'}`}
              onClick={() => setFoodTypeFilter('VEG')}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Veg
            </Button>
            <Button
              size="sm"
              variant={foodTypeFilter === 'NON_VEG' ? 'default' : 'outline'}
              className={`text-xs h-8 gap-1 ${foodTypeFilter === 'NON_VEG' ? 'bg-red-600 text-white' : 'text-red-700'}`}
              onClick={() => setFoodTypeFilter('NON_VEG')}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg
            </Button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            All Menu
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const inCartQty = cart[item.id] || 0;
            const isVeg = item.foodType === 'VEG';

            return (
              <Card key={item.id} className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center ${
                          isVeg ? 'border-emerald-600' : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {item.description || 'Deliciously prepared with authentic Indian spices.'}
                    </p>

                    <p className="font-extrabold text-xs text-slate-900 font-mono">
                      {formatCurrency(item.basePrice)}
                    </p>
                  </div>

                  <div>
                    {inCartQty === 0 ? (
                      <Button
                        size="sm"
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs h-7 px-3 rounded-lg border border-emerald-200"
                        onClick={() => addToCart(item.id)}
                      >
                        + ADD
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-lg px-2 py-1 shadow-sm">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-0.5"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-1">{inCartQty}</span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="p-0.5"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* FLOATING ACTION PILL */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom">
          <div>
            <span className="text-[11px] text-emerald-400 font-semibold">{cartCount} items selected</span>
            <p className="font-extrabold text-sm">{formatCurrency(total)}</p>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1"
            onClick={() => setIsCartOpen(true)}
          >
            Review & Fire <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Table {tableId} Order</h3>
                <p className="text-xs text-slate-400">Order will fire directly to kitchen KDS</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 flex-1">
              <div className="space-y-2">
                {cartEntries.map(({ item, qty }) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">
                      {qty}x {item.name}
                    </span>
                    <span className="font-mono text-slate-900">{formatCurrency(item.basePrice * qty)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Special Instructions for Chef</label>
                <Input
                  placeholder="e.g. Extra spicy, no onions in raita"
                  className="text-xs"
                  value={kitchenNotes}
                  onChange={(e) => setKitchenNotes(e.target.value)}
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5%):</span>
                  <span className="font-mono">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t">
                  <span>Total Amount:</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <Button
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-xl shadow text-sm gap-2"
              onClick={handleFireToKitchen}
            >
              <ChefHat className="h-4 w-4" />
              {submitting ? 'Firing to Kitchen...' : `Send Order to Kitchen • ${formatCurrency(total)}`}
            </Button>
          </div>
        </div>
      )}

      {/* CONFIRMATION */}
      {orderFired && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ChefHat className="h-8 w-8 text-emerald-600" />
            </div>

            <h3 className="font-extrabold text-lg text-slate-900">Order Sent to Kitchen!</h3>
            <p className="text-xs text-slate-500">
              Your items have been printed to our kitchen stations. Our chefs are preparing your hot meal.
            </p>

            <Button
              className="w-full bg-slate-900 text-white text-xs font-semibold"
              onClick={() => setOrderFired(false)}
            >
              Order More Items
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
