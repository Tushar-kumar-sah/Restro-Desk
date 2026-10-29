'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Search,
  Tag,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  CreditCard,
  Banknote,
  X,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatters';
import { MOCK_ITEMS, MOCK_CATEGORIES, ItemItem } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function ConsumerOrderingPage() {
  const [items, setItems] = useState<ItemItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state: Record<itemId, quantity>
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout inputs
  const [orderType, setOrderType] = useState<'DELIVERY' | 'TAKEAWAY'>('DELIVERY');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_PREPAID' | 'CASH_ON_DELIVERY'>('ONLINE_PREPAID');

  // Order placed confirmation state
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load mock menu items
    setItems(MOCK_ITEMS);
  }, []);

  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    toast.success('Item added to cart');
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

  const cartItemEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find((i) => i.id === id);
      return item ? { item, qty } : null;
    })
    .filter(Boolean) as { item: ItemItem; qty: number }[];

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const subtotal = cartItemEntries.reduce(
    (acc, entry) => acc + entry.item.basePrice * entry.qty,
    0
  );

  const gst = Number((subtotal * 0.05).toFixed(2));
  const packagingFee = subtotal > 0 ? 25.0 : 0;
  const deliveryFee = orderType === 'DELIVERY' && subtotal > 0 ? 35.0 : 0;
  const total = Math.max(0, subtotal + gst + packagingFee + deliveryFee - appliedDiscount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'WEEKEND20') {
      const disc = Math.round(subtotal * 0.2);
      setAppliedDiscount(disc);
      toast.success(`Coupon WEEKEND20 applied! Saved ₹${disc}`);
    } else if (code === 'WELCOME150') {
      setAppliedDiscount(150);
      toast.success('Coupon WELCOME150 applied! Saved ₹150');
    } else {
      toast.error('Invalid coupon code. Try WEEKEND20 or WELCOME150');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItemEntries.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!customerName || !customerPhone || customerPhone.length < 10) {
      toast.error('Please enter your full name and valid 10-digit mobile number');
      return;
    }
    if (orderType === 'DELIVERY' && !deliveryAddress) {
      toast.error('Please enter your delivery address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'outlet-01',
          customerName,
          customerPhone,
          deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
          orderType,
          items: cartItemEntries.map((e) => ({
            itemId: e.item.id,
            itemName: e.item.name,
            qty: e.qty,
            price: e.item.basePrice,
          })),
          subtotal,
          tax: gst,
          deliveryFee,
          packagingFee,
          discount: appliedDiscount,
          total,
          paymentMethod,
          kitchenNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlacedOrder(data.data);
        setCart({});
        setIsCartOpen(false);
        toast.success('Order placed successfully!');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (err) {
      toast.error('Error placing order');
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
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                RestoDesk Online
              </h1>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="h-3 w-3 text-emerald-600" /> Indiranagar Flagship • 30-40 min ETA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Delivery / Takeaway toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold">
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`px-3 py-1 rounded-md transition-all ${
                  orderType === 'DELIVERY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setOrderType('TAKEAWAY')}
                className={`px-3 py-1 rounded-md transition-all ${
                  orderType === 'TAKEAWAY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Takeaway
              </button>
            </div>

            {/* Cart trigger button */}
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold text-xs rounded-xl shadow-sm relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Special Weekend Offer
            </span>
            <h2 className="text-xl font-extrabold">Flat 20% OFF on all signature dishes!</h2>
            <p className="text-xs text-emerald-100">Use code WEEKEND20 during checkout. Minimum order ₹500.</p>
          </div>
          <Badge className="bg-white text-emerald-800 font-mono text-xs px-3 py-1.5 font-bold shadow">
            WEEKEND20
          </Badge>
        </div>

        {/* Search & Veg/Non-Veg Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search dishes, curries, breads..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant={foodTypeFilter === 'ALL' ? 'default' : 'outline'}
              className={`text-xs ${foodTypeFilter === 'ALL' ? 'bg-slate-900 text-white' : ''}`}
              onClick={() => setFoodTypeFilter('ALL')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={foodTypeFilter === 'VEG' ? 'default' : 'outline'}
              className={`text-xs gap-1.5 ${foodTypeFilter === 'VEG' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-emerald-700'}`}
              onClick={() => setFoodTypeFilter('VEG')}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pure Veg
            </Button>
            <Button
              size="sm"
              variant={foodTypeFilter === 'NON_VEG' ? 'default' : 'outline'}
              className={`text-xs gap-1.5 ${foodTypeFilter === 'NON_VEG' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-700'}`}
              onClick={() => setFoodTypeFilter('NON_VEG')}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Items ({items.length})
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const inCartQty = cart[item.id] || 0;
            const isVeg = item.foodType === 'VEG';

            return (
              <Card key={item.id} className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      {/* Veg / Non-Veg Icon */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                            isVeg ? 'border-emerald-600' : 'border-red-600'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {item.foodType}
                        </span>
                      </div>

                      <span className="font-extrabold text-base text-slate-900 font-mono">
                        {formatCurrency(item.basePrice)}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-2">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Prepared fresh with royal spices and authentic traditional techniques.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Chef&apos;s Special
                    </span>

                    {inCartQty === 0 ? (
                      <Button
                        size="sm"
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs h-8 px-4 rounded-lg border border-emerald-200"
                        onClick={() => addToCart(item.id)}
                      >
                        + ADD
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-lg px-2 py-1 shadow-sm">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-0.5 hover:opacity-80"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold px-1">{inCartQty}</span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="p-0.5 hover:opacity-80"
                        >
                          <Plus className="h-3.5 w-3.5" />
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

      {/* FLOATING CART SUMMARY BAR (MOBILE STICKY BOTTOM) */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom">
          <div>
            <p className="text-xs font-semibold text-emerald-400">
              {cartCount} item{cartCount > 1 ? 's' : ''} added
            </p>
            <p className="font-extrabold text-sm text-white">{formatCurrency(total)}</p>
          </div>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs gap-1 px-4 py-2 rounded-xl"
            onClick={() => setIsCartOpen(true)}
          >
            View Cart & Checkout <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* SLIDE-OVER CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Your Dining Cart</h3>
                <Badge variant="outline" className="text-xs">
                  {cartCount} items
                </Badge>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 space-y-4 flex-1">
              <div className="space-y-3">
                {cartItemEntries.map(({ item, qty }) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-slate-500 font-mono">{formatCurrency(item.basePrice)} each</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-white rounded"
                        >
                          <Minus className="h-3 w-3 text-slate-600" />
                        </button>
                        <span className="font-bold px-1 text-slate-800">{qty}</span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="p-1 hover:bg-white rounded"
                        >
                          <Plus className="h-3 w-3 text-slate-600" />
                        </button>
                      </div>
                      <span className="font-bold font-mono text-slate-900 w-16 text-right">
                        {formatCurrency(item.basePrice * qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="pt-2">
                <Label className="text-xs font-semibold text-slate-700">Apply Voucher Coupon</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="e.g. WEEKEND20"
                    className="text-xs uppercase font-mono"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5%):</span>
                  <span className="font-mono">{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Eco Packaging:</span>
                  <span className="font-mono">{formatCurrency(packagingFee)}</span>
                </div>
                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span className="font-mono">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Coupon:</span>
                    <span className="font-mono">-{formatCurrency(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customer & Delivery Info
                </p>

                <div className="space-y-1">
                  <Label className="text-xs">Your Full Name</Label>
                  <Input
                    placeholder="e.g. Vikram Malhotra"
                    className="text-xs"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Mobile Number (+91)</Label>
                  <Input
                    placeholder="+919876543210"
                    className="text-xs"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                {orderType === 'DELIVERY' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Complete Delivery Address</Label>
                    <textarea
                      aria-label="Complete delivery address"
                      rows={2}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800"
                      placeholder="Flat, Wing, Building Name, Street, Landmark"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs">Cooking Notes (Optional)</Label>
                  <Input
                    placeholder="e.g. Less spicy, send extra mint chutney"
                    className="text-xs"
                    value={kitchenNotes}
                    onChange={(e) => setKitchenNotes(e.target.value)}
                  />
                </div>

                {/* Payment method selector */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs">Select Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ONLINE_PREPAID')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'ONLINE_PREPAID'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" /> UPI / Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Banknote className="h-4 w-4" /> Cash on Delivery
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-xl shadow-md text-sm gap-2 mt-4"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {submitting ? 'Placing Order...' : `Pay & Place Order • ${formatCurrency(total)}`}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PLACED ORDER CONFIRMATION MODAL */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-emerald-600 stroke-[3]" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Order ID: {placedOrder.orderNumber}
              </p>
            </div>

            {/* Tracking Progress Ribbon */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center text-slate-700 font-semibold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <Flame className="h-4 w-4" /> Kitchen Preparing
                </span>
                <span className="font-mono text-slate-500">ETA: ~30 mins</span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 w-1/2 animate-pulse" />
              </div>

              <p className="text-[11px] text-slate-500 text-left">
                Your order has been routed to our live KDS kitchen display. We will notify you when our rider departs!
              </p>
            </div>

            <Button
              className="w-full bg-slate-900 text-white text-xs font-semibold"
              onClick={() => setPlacedOrder(null)}
            >
              Back to Menu
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
