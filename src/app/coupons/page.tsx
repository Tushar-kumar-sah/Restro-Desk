'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import { printThermalReceipt } from '@/lib/printer';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  QrCode,
  Printer,
  Trash2,
  TrendingUp,
  Percent,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Scissors,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  title: string;
  description: string;
  couponType: 'FLAT_DISCOUNT' | 'PERCENTAGE' | 'FREE_ITEM' | 'BOGO' | 'COMBO';
  discountValue: number;
  maxDiscount?: number;
  minBillAmount: number;
  validFrom: string;
  validTo: string;
  usageLimitTotal?: number;
  usageLimitPerCustomer: number;
  timesUsed: number;
  revenueInfluenced: number;
  isStackable: boolean;
  isActive: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    totalRevenueInfluenced: 0,
    estimatedTotalDiscountGiven: 0,
    roiMultiplier: '8.4x',
  });

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [qrModalCoupon, setQrModalCoupon] = useState<CouponItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const flyerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    couponType: 'FLAT_DISCOUNT',
    discountValue: 150,
    maxDiscount: 300,
    minBillAmount: 600,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    usageLimitTotal: 500,
    usageLimitPerCustomer: 1,
    isStackable: false,
    isActive: true,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/crm/coupons?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [search, typeFilter, statusFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    showToast(`Code "${code}" copied to clipboard!`);
  };

  const handleToggleActive = async (coupon: CouponItem) => {
    try {
      const newStatus = !coupon.isActive;
      const res = await fetch(`/api/crm/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(newStatus ? `Coupon ${coupon.code} activated` : `Coupon ${coupon.code} paused`);
        fetchCoupons();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/crm/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon ${code} deleted`);
        fetchCoupons();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) {
      showToast('Coupon code and title are required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/crm/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase().trim(),
          discountValue: Number(formData.discountValue),
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
          minBillAmount: Number(formData.minBillAmount),
          usageLimitTotal: formData.usageLimitTotal ? Number(formData.usageLimitTotal) : undefined,
          usageLimitPerCustomer: Number(formData.usageLimitPerCustomer),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Coupon created successfully!');
        setIsCreateModalOpen(false);
        setFormData({
          code: '',
          title: '',
          description: '',
          couponType: 'FLAT_DISCOUNT',
          discountValue: 150,
          maxDiscount: 300,
          minBillAmount: 600,
          validFrom: new Date().toISOString().split('T')[0],
          validTo: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          usageLimitTotal: 500,
          usageLimitPerCustomer: 1,
          isStackable: false,
          isActive: true,
        });
        fetchCoupons();
      } else {
        showToast(data.message || 'Failed to create coupon', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getCouponTypeLabel = (type: string) => {
    switch (type) {
      case 'FLAT_DISCOUNT':
        return 'Flat Discount';
      case 'PERCENTAGE':
        return 'Percentage (%)';
      case 'BOGO':
        return 'Buy 1 Get 1 (BOGO)';
      case 'FREE_ITEM':
        return 'Complimentary Item';
      case 'COMBO':
        return 'Combo Offer';
      default:
        return type;
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {notification.message}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Coupons & Promotional Offers
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Create discount vouchers, QR coupons, BOGO deals and track marketing revenue ROI
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </Button>
        </div>

        {/* Marketing ROI & Analytics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Active Vouchers
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {metrics.activeCoupons} / {metrics.totalCoupons}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Redemptions
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {metrics.totalRedemptions} orders
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
                  Revenue Influenced
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(metrics.totalRevenueInfluenced)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Marketing ROI
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  {metrics.roiMultiplier} Return
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <Input
                placeholder="Search coupon code or offer title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-neutral-50 dark:bg-neutral-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
              >
                <option value="ALL">All Offer Types</option>
                <option value="FLAT_DISCOUNT">Flat Discount (₹)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="BOGO">BOGO</option>
                <option value="FREE_ITEM">Free Item</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active & Valid</option>
                <option value="EXPIRED">Expired / Inactive</option>
              </select>

              {(search || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('ALL');
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

        {/* Coupons Grid - Voucher Cutout Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isExpired = c.validTo < todayStr;

            return (
              <div
                key={c.id}
                className={`relative rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden bg-white dark:bg-neutral-950 flex flex-col justify-between ${
                  !c.isActive || isExpired
                    ? 'border-neutral-200 dark:border-neutral-800 opacity-70'
                    : 'border-emerald-200/80 dark:border-emerald-900/50'
                }`}
              >
                {/* Top Voucher Section */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {getCouponTypeLabel(c.couponType)}
                      </span>
                      <h3 className="font-bold text-lg text-neutral-900 dark:text-white mt-0.5">
                        {c.title}
                      </h3>
                    </div>

                    <Badge
                      className={
                        !c.isActive
                          ? 'bg-neutral-100 text-neutral-600'
                          : isExpired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }
                    >
                      {!c.isActive ? 'Paused' : isExpired ? 'Expired' : 'Active'}
                    </Badge>
                  </div>

                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Discount Value Highlight */}
                  <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-neutral-400 uppercase font-medium">
                        Savings Offer
                      </p>
                      <p className="text-lg font-black text-neutral-900 dark:text-white">
                        {c.couponType === 'PERCENTAGE'
                          ? `${c.discountValue}% OFF`
                          : c.couponType === 'FLAT_DISCOUNT'
                          ? `₹${c.discountValue} FLAT OFF`
                          : c.couponType === 'BOGO'
                          ? 'BUY 1 GET 1 FREE'
                          : 'FREE SPECIAL DISH'}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-neutral-500">Min Bill:</span>{' '}
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {formatCurrency(c.minBillAmount)}
                      </span>
                      {c.maxDiscount && (
                        <p className="text-[11px] text-neutral-400">
                          Max Cap: ₹{c.maxDiscount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Perforated Divider (Voucher cut-out look) */}
                <div className="relative flex items-center my-1 px-4">
                  <div className="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-900 -ml-6 border border-neutral-300 dark:border-neutral-700" />
                  <div className="flex-1 border-b-2 border-dashed border-neutral-200 dark:border-neutral-800" />
                  <div className="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-900 -mr-6 border border-neutral-300 dark:border-neutral-700" />
                </div>

                {/* Voucher Code Box & Redemptions Stats */}
                <div className="p-5 pt-3 space-y-3">
                  <div className="flex items-center justify-between gap-2 p-2 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-800">
                    <span className="font-mono font-bold text-base text-emerald-800 dark:text-emerald-300 px-2 tracking-widest">
                      {c.code}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyCode(c.code)}
                      className="h-8 px-2.5 text-xs text-emerald-700 dark:text-emerald-300 gap-1"
                    >
                      {copiedCode === c.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                    <span>
                      Redeemed: <strong className="text-neutral-800 dark:text-neutral-200">{c.timesUsed} times</strong>
                    </span>
                    <span>
                      Sales: <strong className="text-emerald-600">{formatCurrency(c.revenueInfluenced)}</strong>
                    </span>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <Calendar className="w-3 h-3" />
                      Valid till {formatIndianDate(c.validTo)}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setQrModalCoupon(c)}
                        title="Generate Scannable QR Flyer"
                        className="h-8 w-8 p-0 text-neutral-600 hover:text-emerald-600"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(c)}
                        title={c.isActive ? 'Pause offer' : 'Activate offer'}
                        className="h-8 w-8 p-0 text-neutral-600 hover:text-emerald-600"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        title="Delete voucher"
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* CREATE COUPON MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-600" />
                Create New Promotional Voucher
              </DialogTitle>
              <DialogDescription>
                Configure discount rules, minimum order constraints, validity dates and redemption
                caps.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCoupon} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code">Promo Code *</Label>
                  <Input
                    id="code"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="font-mono uppercase font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type">Offer Type *</Label>
                  <select
                    id="type"
                    value={formData.couponType}
                    onChange={(e) => setFormData({ ...formData, couponType: e.target.value as any })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <option value="FLAT_DISCOUNT">Flat Amount Discount (₹ off)</option>
                    <option value="PERCENTAGE">Percentage Discount (% off)</option>
                    <option value="BOGO">Buy 1 Get 1 Free (BOGO)</option>
                    <option value="FREE_ITEM">Free Dessert / Beverage</option>
                    <option value="COMBO">Combo Savings</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="title">Offer Headline *</Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g. 20% Off Weekend Dining Delight"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="discountVal">
                    {formData.couponType === 'PERCENTAGE'
                      ? 'Discount Percentage (%) *'
                      : 'Discount Value (₹) *'}
                  </Label>
                  <Input
                    id="discountVal"
                    type="number"
                    min={1}
                    required
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="minBill">Min Order Value (₹)</Label>
                  <Input
                    id="minBill"
                    type="number"
                    value={formData.minBillAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minBillAmount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                {formData.couponType === 'PERCENTAGE' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="maxCap">Maximum Discount Cap (₹)</Label>
                    <Input
                      id="maxCap"
                      type="number"
                      placeholder="e.g. 300"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="vFrom">Valid From</Label>
                  <Input
                    id="vFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vTo">Valid Until</Label>
                  <Input
                    id="vTo"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="limitTotal">Total Usage Limit</Label>
                  <Input
                    id="limitTotal"
                    type="number"
                    value={formData.usageLimitTotal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimitTotal: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="limitCust">Limit Per Customer</Label>
                  <Input
                    id="limitCust"
                    type="number"
                    value={formData.usageLimitPerCustomer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimitPerCustomer: parseInt(e.target.value, 10) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Terms & Description</Label>
                <Textarea
                  id="desc"
                  rows={2}
                  placeholder="e.g. Valid on all curries and tandoori items for dine-in and takeaway."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isStackable}
                    onChange={(e) => setFormData({ ...formData, isStackable: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Stackable with Loyalty Points</span>
                </label>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Publish Voucher
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* QR CODE FLYER MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!qrModalCoupon} onOpenChange={(open) => !open && setQrModalCoupon(null)}>
          <DialogContent className="max-w-md print:max-w-none print:p-0 print:border-none print:shadow-none print:bg-white">
            {qrModalCoupon && (
              <div className="text-center space-y-4 py-2">
                <div
                  ref={flyerRef}
                  className="p-6 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl shadow-lg relative overflow-hidden print-only print:p-4 print:text-black print:bg-white print:border print:border-black"
                >
                  <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold mb-1 print:text-black">
                    RestoDesk Exclusive Offer
                  </div>
                  <h3 className="text-xl font-bold">{qrModalCoupon.title}</h3>
                  <p className="text-xs text-white/80 mt-1 print:text-gray-700">{qrModalCoupon.description}</p>

                  {/* Scannable simulated QR Matrix Card */}
                  <div className="my-5 p-4 bg-white rounded-xl inline-block shadow-md print:shadow-none print:border print:border-black">
                    <div className="w-36 h-36 bg-neutral-900 rounded-lg p-2 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-4 border-white bg-black rounded" />
                        <div className="w-8 h-8 border-4 border-white bg-black rounded" />
                      </div>
                      <div className="text-center text-[10px] font-mono font-bold text-white tracking-widest">
                        {qrModalCoupon.code}
                      </div>
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-4 border-white bg-black rounded" />
                        <div className="w-4 h-4 bg-white rounded-full mx-auto" />
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-2xl font-black tracking-widest bg-white/20 py-1.5 px-4 rounded-lg inline-block border border-white/30 backdrop-blur-sm print:bg-gray-100 print:text-black print:border-black">
                    {qrModalCoupon.code}
                  </div>

                  <p className="text-[11px] text-white/70 mt-3 print:text-gray-700">
                    Valid on min order of {formatCurrency(qrModalCoupon.minBillAmount)} till{' '}
                    {formatIndianDate(qrModalCoupon.validTo)}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 no-print">
                  <Button
                    variant="outline"
                    onClick={() => {
                      printThermalReceipt(flyerRef.current, {
                        paperWidth: '80mm',
                        title: `Flyer_${qrModalCoupon.code}`,
                      });
                    }}
                    className="gap-2 text-xs"
                  >
                    <Printer className="w-4 h-4" />
                    Print Table Tent Flyer
                  </Button>
                  <Button
                    onClick={() => handleCopyCode(qrModalCoupon.code)}
                    className="gap-2 bg-emerald-600 text-white text-xs"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
