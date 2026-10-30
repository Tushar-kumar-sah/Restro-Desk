'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  Printer,
  Receipt,
  UserPlus,
  Tag,
  Percent,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Bike,
  Store,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePosStore, CartItem } from '@/store/usePosStore';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatPhone } from '@/lib/formatters';
import { BillPrintModal } from '@/components/pos/bill-print-modal';
import { KOTPrintModal } from '@/components/pos/kot-print-modal';
import { SettleModal } from '@/components/pos/settle-modal';
import { toast } from 'sonner';

export default function PosBillingPage() {
  const router = useRouter();
  const { selectedOutlet } = useAppStore();
  const {
    orderType,
    setOrderType,
    selectedTableNumber,
    setTable,
    cart,
    addItem,
    updateQuantity,
    removeItem,
    setItemNotes,
    customer,
    setCustomer,
    discountType,
    discountValue,
    discountReason,
    setDiscount,
    clearCart,
    loadOrder,
    getTotals,
  } = usePosStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [foodFilter, setFoodFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isBillPrintOpen, setIsBillPrintOpen] = useState(false);
  const [isKotPrintOpen, setIsKotPrintOpen] = useState(false);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  // Active printed order data
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);
  const [heldBills, setHeldBills] = useState<any[]>([]);

  // Customer search input
  const [custPhoneInput, setCustPhoneInput] = useState('');
  const [custNameInput, setCustNameInput] = useState('');

  // Discount input
  const [discTypeInput, setDiscTypeInput] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [discValInput, setDiscValInput] = useState<number>(0);
  const [discReasonInput, setDiscReasonInput] = useState('Festive Offer');

  // Void password & reason
  const [voidPassword, setVoidPassword] = useState('');
  const [voidReason, setVoidReason] = useState('Customer changed mind');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch Menu Categories & Items
  useEffect(() => {
    async function fetchMenu() {
      setIsLoading(true);
      try {
        const [catRes, itemRes] = await Promise.all([
          fetch('/api/menu/categories'),
          fetch('/api/menu/items?limit=100'),
        ]);

        const catData = await catRes.json();
        const itemData = await itemRes.json();

        if (catData.success) setCategories(catData.categories);
        if (itemData.success) setItems(itemData.items);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, []);

  // Keyboard Shortcuts (F2: Search, F4: Hold, F8: Discount, F9: Settle, Esc: Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setIsDiscountModalOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) setIsSettleOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesFood = foodFilter === 'ALL' || item.foodType === foodFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.shortCode && item.shortCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesFood && matchesSearch;
  });

  const totals = getTotals();

  // Attach Customer
  const handleLookupCustomer = async () => {
    if (!custPhoneInput || custPhoneInput.length < 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }

    try {
      const res = await fetch(`/api/pos/customers/lookup?phone=${custPhoneInput}`);
      const data = await res.json();
      if (data.success && data.customer) {
        const cust = {
          name: custNameInput || data.customer.name,
          phone: custPhoneInput,
          points: data.customer.points,
          walletBalance: data.customer.walletBalance,
          tier: data.customer.tier,
          visits: data.customer.visits,
        };
        setCustomer(cust);
        setIsCustomerModalOpen(false);
        toast.success(`Attached customer: ${cust.name} (${cust.tier})`);
      }
    } catch (err) {
      toast.error('Failed to attach customer');
    }
  };

  // Hold Current Bill
  const handleHoldBill = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Nothing to hold.');
      return;
    }

    const billPayload = {
      cart,
      customer,
      orderType,
      selectedTableNumber,
      discountType,
      discountValue,
      discountReason,
      totals,
    };

    try {
      const res = await fetch('/api/pos/orders/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'HOLD', billData: billPayload }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Bill held for Table ${selectedTableNumber}`);
        clearCart();
        fetchHeldBills();
      }
    } catch (err) {
      toast.error('Failed to hold bill');
    }
  };

  const fetchHeldBills = async () => {
    try {
      const res = await fetch('/api/pos/orders/hold');
      const data = await res.json();
      if (data.success) setHeldBills(data.heldBills);
    } catch (err) {}
  };

  const handleResumeBill = async (holdId: string) => {
    try {
      const res = await fetch('/api/pos/orders/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESUME', holdId }),
      });
      const data = await res.json();
      if (data.success && data.billData) {
        const b = data.billData;
        usePosStore.setState({
          cart: b.cart,
          customer: b.customer,
          orderType: b.orderType,
          selectedTableNumber: b.selectedTableNumber,
          discountType: b.discountType,
          discountValue: b.discountValue,
          discountReason: b.discountReason,
        });
        setIsHeldBillsOpen(false);
        fetchHeldBills();
        toast.success(`Resumed bill for ${b.selectedTableNumber}`);
      }
    } catch (err) {
      toast.error('Failed to resume bill');
    }
  };

  // Generate KOT Only
  const handlePunchKOT = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Select items to send KOT.');
      return;
    }

    try {
      const res = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: selectedOutlet?.id || 'outlet-blr-ind-001',
          orderType,
          tableNumber: selectedTableNumber,
          customerName: customer?.name,
          customerPhone: customer?.phone,
          items: cart,
          discountPercent: discountType === 'PERCENT' ? discountValue : 0,
          discountAmount: discountType === 'FLAT' ? discountValue : 0,
          discountReason,
          autoKOT: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCurrentOrderData(data.order);
        setIsKotPrintOpen(true);
        clearCart();
        toast.success(`KOT ${data.order.kotNumber} sent to Kitchen Display`);
      }
    } catch (err) {
      toast.error('Failed to send KOT');
    }
  };

  // Settlement Callback
  const handlePaymentSettled = async (settleData: any) => {
    try {
      // 1. Create Order
      const res = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: selectedOutlet?.id || 'outlet-blr-ind-001',
          orderType,
          tableNumber: selectedTableNumber,
          customerName: customer?.name,
          customerPhone: customer?.phone,
          items: cart,
          discountPercent: discountType === 'PERCENT' ? discountValue : 0,
          discountAmount: discountType === 'FLAT' ? discountValue : 0,
          discountReason,
          autoKOT: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        // 2. Settle Order
        const settleRes = await fetch(`/api/pos/orders/${data.order.id}/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settleData),
        });
        const settleResData = await settleRes.json();

        setCurrentOrderData(settleResData.order || data.order);
        setIsBillPrintOpen(true);
        clearCart();
        toast.success('Bill successfully settled and closed!');
      }
    } catch (err) {
      toast.error('Failed to settle bill');
    }
  };

  // Apply Discount Modal Submit
  const handleApplyDiscount = () => {
    setDiscount(discTypeInput, discValInput, discReasonInput);
    setIsDiscountModalOpen(false);
    toast.success(`Applied ${discValInput}${discTypeInput === 'PERCENT' ? '%' : '₹'} discount`);
  };

  // Void Bill Submit
  const handleVoidBill = async () => {
    if (!voidPassword) {
      toast.error('Enter manager password');
      return;
    }
    if (voidPassword !== 'Password@123' && voidPassword !== 'admin') {
      toast.error('Incorrect manager password');
      return;
    }

    clearCart();
    setIsVoidModalOpen(false);
    toast.success(`Active bill voided (Reason: ${voidReason})`);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background select-none overflow-hidden">
      {/* POS Top Navigation Header */}
      <header className="flex h-14 w-full items-center justify-between border-b bg-card px-3 md:px-4 shrink-0 shadow-xs">
        {/* Left: Brand, Tables & Order Types */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="rounded-xl text-xs font-bold gap-1 text-orange-600 hover:bg-orange-50"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">RestoDesk</span>
          </Button>

          {/* Table Selector */}
          {orderType === 'DINE_IN' && (
            <div className="flex items-center gap-1.5 rounded-xl border border-input bg-background px-2.5 py-1 text-xs font-semibold shadow-xs">
              <span className="text-muted-foreground">Table:</span>
              <select
                value={selectedTableNumber}
                onChange={(e) => setTable(e.target.value)}
                className="bg-transparent font-black text-foreground outline-none cursor-pointer"
              >
                {Array.from({ length: 20 }, (_, i) => {
                  const num = `T-${String(i + 1).padStart(2, '0')}`;
                  return (
                    <option key={num} value={num} className="bg-card text-foreground">
                      {num} {i < 10 ? '(AC Dining)' : i < 16 ? '(Rooftop)' : '(Patio)'}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Order Types Pills */}
          <div className="flex items-center rounded-xl bg-muted p-0.5">
            {[
              { type: 'DINE_IN' as const, label: 'Dine-In', icon: LayoutGrid },
              { type: 'TAKEAWAY' as const, label: 'Takeaway', icon: ShoppingBag },
              { type: 'DELIVERY' as const, label: 'Delivery', icon: Bike },
            ].map((ot) => {
              const Icon = ot.icon;
              const isActive = orderType === ot.type;
              return (
                <button
                  key={ot.type}
                  onClick={() => setOrderType(ot.type)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{ot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Search & Hold Drawer */}
        <div className="flex items-center gap-2">
          {/* Quick Item Search */}
          <div className="relative w-44 sm:w-64">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search / item code (F2)..."
              className="h-8 pl-8 text-xs rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Held Bills Counter */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchHeldBills();
              setIsHeldBillsOpen(true);
            }}
            className="h-8 rounded-xl text-xs font-semibold relative"
          >
            <PauseCircle className="h-3.5 w-3.5 mr-1 text-amber-600" />
            <span>Hold</span>
            {heldBills.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {heldBills.length}
              </span>
            )}
          </Button>

          {/* Exit POS */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            Exit
          </Button>
        </div>
      </header>

      {/* Main Screen Layout (2 Columns: Catalog Grid + Cart Panel) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left / Center: Category Tabs + Food Filter + Items Touch Grid */}
        <div className="flex flex-1 flex-col overflow-hidden border-r">
          {/* Category Tabs & Veg/Non-Veg Filter Bar */}
          <div className="flex items-center justify-between border-b bg-card/60 px-4 py-2 gap-3 overflow-x-auto no-scrollbar">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                All ({items.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Food Type Toggle (Pure Veg / Non-Veg) */}
            <div className="flex items-center rounded-xl bg-muted p-0.5 shrink-0">
              <button
                onClick={() => setFoodFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  foodFilter === 'ALL' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFoodFilter('VEG')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  foodFilter === 'VEG' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-600'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 border border-white" />
                Veg
              </button>
              <button
                onClick={() => setFoodFilter('NON_VEG')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  foodFilter === 'NON_VEG' ? 'bg-red-600 text-white shadow-xs' : 'text-red-600'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-red-500 border border-white" />
                Non-Veg
              </button>
            </div>
          </div>

          {/* Items Touch Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-muted/60 animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
                <Receipt className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <span className="text-sm font-semibold">No menu items found</span>
                <span className="text-xs">Try clearing search or filters</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredItems.map((item) => {
                  const isVeg = item.foodType === 'VEG';
                  const inCartCount = cart
                    .filter((c) => c.itemId === item.id)
                    .reduce((sum, c) => sum + c.quantity, 0);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        addItem(item);
                        toast.success(`Added ${item.name}`, { duration: 1200 });
                      }}
                      className={`relative flex flex-col justify-between p-3.5 rounded-2xl border text-left bg-card hover:border-orange-500/60 hover:shadow-md active:scale-95 transition-all group overflow-hidden ${
                        inCartCount > 0 ? 'border-orange-500 ring-2 ring-orange-500/10' : ''
                      }`}
                    >
                      {/* Veg / Non-Veg Indicator Dot & ShortCode */}
                      <div className="flex items-center justify-between w-full mb-1">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border ${
                            isVeg ? 'border-emerald-600' : 'border-red-600'
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </div>

                        {item.shortCode && (
                          <span className="text-[10px] font-mono font-bold text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
                            {item.shortCode}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="my-1.5 flex-1">
                        <div className="font-bold text-xs leading-snug text-foreground line-clamp-2">
                          {item.name}
                        </div>
                      </div>

                      {/* Price & Prep Time */}
                      <div className="flex items-center justify-between w-full pt-1 border-t border-border/50">
                        <span className="text-sm font-black text-foreground">
                          {formatCurrency(item.basePrice, false)}
                        </span>

                        {inCartCount > 0 ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-white text-xs font-black shadow-xs">
                            {inCartCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {item.preparationTime}m
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart, Customer & Settlement Panel (fixed 380px) */}
        <aside className="w-96 flex flex-col bg-card border-l h-full shadow-lg shrink-0">
          {/* Cart Header & Customer Bar */}
          <div className="p-3 border-b space-y-2 bg-muted/20">
            {/* Customer Attachment Bar */}
            <div className="flex items-center justify-between">
              {customer ? (
                <div className="flex items-center justify-between w-full bg-orange-50 dark:bg-orange-950/40 p-2 rounded-xl border border-orange-200/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-orange-950 dark:text-orange-200">
                      {customer.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatPhone(customer.phone)} • {customer.points} Pts (
                      {customer.tier})
                    </span>
                  </div>
                  <button
                    onClick={() => setCustomer(null)}
                    className="p-1 text-muted-foreground hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="w-full h-8 text-xs rounded-xl border-dashed hover:bg-orange-50 hover:text-orange-700"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5 text-orange-600" />
                  Attach Customer (+91)
                </Button>
              )}
            </div>

            {/* Cart Items Title */}
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              <span>Current Cart ({totals.totalItems})</span>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-red-600 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Cart Items Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-border/60">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Receipt className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <span className="text-xs font-semibold">Cart is currently empty</span>
                <span className="text-[11px]">Click items from the catalog to add</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.cartItemId} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-xs text-foreground leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatCurrency(item.unitPrice)} each
                      </div>
                    </div>

                    <span className="font-bold text-xs text-foreground">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>

                  {/* Quantity & Item Note Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const note = prompt('Add kitchen cooking note:', item.notes || '');
                          if (note !== null) setItemNotes(item.cartItemId, note);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border ${
                          item.notes
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {item.notes ? `Note: ${item.notes}` : '+ Note'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-background text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-background text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Calculation Totals Section */}
          <div className="p-3.5 border-t bg-muted/10 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Sub Total</span>
              <span className="font-semibold text-foreground">{formatCurrency(totals.subtotal)}</span>
            </div>

            {/* Discount Row */}
            <div className="flex justify-between items-center text-muted-foreground">
              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="text-xs text-orange-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Tag className="h-3 w-3" />
                {totals.discountAmount > 0
                  ? `Discount (${discountReason || 'Promo'})`
                  : '+ Add Discount (F8)'}
              </button>
              <span className="font-semibold text-foreground">
                {totals.discountAmount > 0 ? `- ${formatCurrency(totals.discountAmount)}` : '₹0.00'}
              </span>
            </div>

            {/* Indian GST Breakdown */}
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>CGST (2.5%) + SGST (2.5%)</span>
              <span>{formatCurrency(totals.totalTax)}</span>
            </div>

            {totals.packagingCharge > 0 && (
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Packaging Charge</span>
                <span>{formatCurrency(totals.packagingCharge)}</span>
              </div>
            )}

            {totals.deliveryCharge > 0 && (
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Delivery Charge</span>
                <span>{formatCurrency(totals.deliveryCharge)}</span>
              </div>
            )}

            {totals.roundOff !== 0 && (
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Round Off</span>
                <span>{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
              </div>
            )}

            {/* Grand Total Bar */}
            <div className="flex justify-between items-center pt-2 border-t font-black text-base text-foreground">
              <span>Payable Total:</span>
              <span className="text-xl text-orange-600 font-black">
                {formatCurrency(totals.grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="p-3 border-t bg-card space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleHoldBill}
                className="rounded-xl text-xs font-semibold"
              >
                <PauseCircle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                Hold (F4)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePunchKOT}
                className="rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                KOT Only
              </Button>
            </div>

            <Button
              size="lg"
              onClick={() => {
                if (cart.length === 0) {
                  toast.error('Add items to cart before settling bill');
                  return;
                }
                setIsSettleOpen(true);
              }}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl shadow-md shadow-orange-600/30 text-base"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Settle &amp; Pay (F9) • {formatCurrency(totals.grandTotal)}
            </Button>
          </div>
        </aside>
      </div>

      {/* MODAL 1: Settle Payment Modal */}
      <SettleModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        orderTotal={totals.grandTotal}
        customer={customer}
        onSettled={handlePaymentSettled}
      />

      {/* MODAL 2: Bill Thermal Print Modal */}
      <BillPrintModal
        isOpen={isBillPrintOpen}
        onClose={() => setIsBillPrintOpen(false)}
        order={currentOrderData}
      />

      {/* MODAL 3: KOT Print Modal */}
      <KOTPrintModal
        isOpen={isKotPrintOpen}
        onClose={() => setIsKotPrintOpen(false)}
        kotData={currentOrderData}
      />

      {/* MODAL 4: Customer Lookup & Attach */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Attach Customer to Bill</DialogTitle>
            <DialogDescription>
              Enter customer mobile number to apply loyalty rewards and wallet credits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">10-Digit Mobile Number (+91)</Label>
              <Input
                id="cust-phone"
                maxLength={10}
                placeholder="9876543210"
                value={custPhoneInput}
                onChange={(e) => setCustPhoneInput(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Customer Name (Optional)</Label>
              <Input
                id="cust-name"
                placeholder="e.g. Rajesh Mehta"
                value={custNameInput}
                onChange={(e) => setCustNameInput(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLookupCustomer} className="bg-orange-600 hover:bg-orange-700">
                Search &amp; Attach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: Apply Discount Modal */}
      <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Apply Order Discount</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={discTypeInput === 'PERCENT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDiscTypeInput('PERCENT')}
                className="flex-1 text-xs"
              >
                Percentage (%)
              </Button>
              <Button
                type="button"
                variant={discTypeInput === 'FLAT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDiscTypeInput('FLAT')}
                className="flex-1 text-xs"
              >
                Flat Amount (₹)
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label>Discount Value</Label>
              <Input
                type="number"
                value={discValInput}
                onChange={(e) => setDiscValInput(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Reason / Coupon Note</Label>
              <Input
                value={discReasonInput}
                onChange={(e) => setDiscReasonInput(e.target.value)}
                placeholder="e.g. VIP Guest, Festival, Owner Approval"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyDiscount} className="bg-orange-600 hover:bg-orange-700">
                Apply Discount
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: Held Bills Queue */}
      <Dialog open={isHeldBillsOpen} onOpenChange={setIsHeldBillsOpen}>
        <DialogContent className="max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Held Bills Queue</span>
              <Badge variant="brand">{heldBills.length} Held</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-72 overflow-y-auto pt-2">
            {heldBills.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No orders are currently on hold.
              </div>
            ) : (
              heldBills.map((b) => (
                <div
                  key={b.holdId}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      Table {b.selectedTableNumber} • {b.orderType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.cart?.length || 0} items • Total: {formatCurrency(b.totals?.grandTotal || 0)}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleResumeBill(b.holdId)}
                    className="bg-orange-600 hover:bg-orange-700 text-xs rounded-xl"
                  >
                    Resume Bill
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
