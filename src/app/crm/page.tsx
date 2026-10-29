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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatIndianPhone, formatIndianDate } from '@/lib/formatters';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Award,
  Wallet,
  Calendar,
  Gift,
  Cake,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  MoreVertical,
  Plus,
  Coins,
  Receipt,
  FileText,
  ChevronRight,
  Heart,
  History,
} from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  anniversary: string | null;
  tierId: string;
  tierName: string;
  walletBalance: number;
  totalPoints: number;
  totalSpend: number;
  visitCount: number;
  lastVisit: string;
  isBlocked: boolean;
  notes?: string;
  tags: string[];
  address: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  favoriteItems?: string[];
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    date: string;
    billAmount: number;
    status: string;
    paymentMode: string;
    itemsSummary: string;
  }>;
  loyaltyLedger?: Array<{
    id: string;
    date: string;
    type: string;
    points: number;
    balanceAfter: number;
    reason: string;
  }>;
  walletLedger?: Array<{
    id: string;
    date: string;
    type: string;
    amount: number;
    balanceAfter: number;
    referenceNote: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    activeLoyaltyMembers: 0,
    totalWalletLiability: 0,
    avgLifetimeSpend: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [recencyFilter, setRecencyFilter] = useState('ALL');
  const [spendFilter, setSpendFilter] = useState('ALL');
  const [celebrationFilter, setCelebrationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Drawers
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Customer Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    anniversary: '',
    tierId: 'tier-silver',
    addressLine1: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    notes: '',
    tags: 'Regular, Family',
    initialPoints: 50,
    initialWallet: 100,
  });

  // Points adjustment form state
  const [pointsAdjustment, setPointsAdjustment] = useState({
    type: 'EARN',
    points: 100,
    reason: 'Complimentary goodwill reward',
  });

  // Wallet adjustment form state
  const [walletAdjustment, setWalletAdjustment] = useState({
    type: 'TOPUP',
    amount: 500,
    referenceNote: 'In-store cash top-up',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tierFilter !== 'ALL') params.append('tier', tierFilter);
      if (recencyFilter !== 'ALL') params.append('recency', recencyFilter);
      if (celebrationFilter !== 'ALL') params.append('celebration', celebrationFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      if (spendFilter === 'LOW') {
        params.append('minSpend', '0');
        params.append('maxSpend', '5000');
      } else if (spendFilter === 'MID') {
        params.append('minSpend', '5000');
        params.append('maxSpend', '15000');
      } else if (spendFilter === 'HIGH') {
        params.append('minSpend', '15000');
      }

      const res = await fetch(`/api/crm/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, tierFilter, recencyFilter, spendFilter, celebrationFilter, statusFilter]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tierFilter !== 'ALL') params.append('tier', tierFilter);
    if (recencyFilter !== 'ALL') params.append('recency', recencyFilter);
    params.append('export', 'csv');
    window.open(`/api/crm/customers?${params.toString()}`, '_blank');
    showToast('Customer CSV export generated!');
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Please provide both name and 10-digit phone number', 'error');
      return;
    }

    try {
      const res = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          initialPoints: Number(formData.initialPoints),
          initialWallet: Number(formData.initialWallet),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Customer registered successfully!');
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          birthday: '',
          anniversary: '',
          tierId: 'tier-silver',
          addressLine1: '',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          notes: '',
          tags: 'Regular, Family',
          initialPoints: 50,
          initialWallet: 100,
        });
        fetchCustomers();
      } else {
        showToast(data.message || 'Failed to register customer', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/crm/customers/${selectedCustomer.id}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pointsAdjustment),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsPointsModalOpen(false);
        // update local
        setSelectedCustomer((prev) =>
          prev
            ? {
                ...prev,
                totalPoints: data.totalPoints,
                loyaltyLedger: [data.transaction, ...(prev.loyaltyLedger || [])],
              }
            : null
        );
        fetchCustomers();
      } else {
        showToast(data.message || 'Points adjustment failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustWallet = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/crm/customers/${selectedCustomer.id}/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletAdjustment),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setIsWalletModalOpen(false);
        // update local
        setSelectedCustomer((prev) =>
          prev
            ? {
                ...prev,
                walletBalance: data.walletBalance,
                walletLedger: [data.transaction, ...(prev.walletLedger || [])],
              }
            : null
        );
        fetchCustomers();
      } else {
        showToast(data.message || 'Wallet transaction failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleBlock = async (customer: CustomerItem) => {
    try {
      const newStatus = !customer.isBlocked;
      const res = await fetch(`/api/crm/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(newStatus ? 'Customer has been blocked' : 'Customer unblocked successfully');
        if (selectedCustomer?.id === customer.id) {
          setSelectedCustomer((prev) => (prev ? { ...prev, isBlocked: newStatus } : null));
        }
        fetchCustomers();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier.toLowerCase().includes('platinum')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Award className="w-3 h-3 text-purple-600" /> Platinum VIP
        </span>
      );
    }
    if (tier.toLowerCase().includes('gold')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Award className="w-3 h-3 text-amber-500" /> Gold Member
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <Award className="w-3 h-3 text-slate-500" /> Silver Member
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
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            {notification.message}
          </div>
        )}

        {/* Header with Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Customer Database & CRM
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Guest directory, lifetime value tracking, loyalty ledger, and pre-paid wallets
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2 text-neutral-700 dark:text-neutral-300"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <UserPlus className="w-4 h-4" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Guests
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {summary.totalCustomers}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Active Loyalty
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {summary.activeLoyaltyMembers}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Wallet Liability
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(summary.totalWalletLiability)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Avg Lifetime Spend
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(summary.avgLifetimeSpend)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <Input
                  placeholder="Search by phone (+91), name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-neutral-50 dark:bg-neutral-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="Platinum">Platinum VIP</option>
                  <option value="Gold">Gold Member</option>
                  <option value="Silver">Silver Member</option>
                </select>

                {/* Recency Filter */}
                <select
                  value={recencyFilter}
                  onChange={(e) => setRecencyFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Visits</option>
                  <option value="7D">Active (Last 7 Days)</option>
                  <option value="30D">Within 30 Days</option>
                  <option value="60D">At-Risk (30-60 Days)</option>
                  <option value="90D_PLUS">Lapsed (60+ Days)</option>
                </select>

                {/* Spend Filter */}
                <select
                  value={spendFilter}
                  onChange={(e) => setSpendFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Spends</option>
                  <option value="LOW">Under ₹5,000</option>
                  <option value="MID">₹5,000 - ₹15,000</option>
                  <option value="HIGH">₹15,000+ (High Spender)</option>
                </select>

                {/* Celebrations */}
                <select
                  value={celebrationFilter}
                  onChange={(e) => setCelebrationFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Occasions</option>
                  <option value="BIRTHDAY_MONTH">🎂 Birthday This Month</option>
                  <option value="ANNIVERSARY_MONTH">💍 Anniversary This Month</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Guests</option>
                  <option value="BLOCKED">Suspended / Blocked</option>
                </select>

                {(search ||
                  tierFilter !== 'ALL' ||
                  recencyFilter !== 'ALL' ||
                  spendFilter !== 'ALL' ||
                  celebrationFilter !== 'ALL' ||
                  statusFilter !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setTierFilter('ALL');
                      setRecencyFilter('ALL');
                      setSpendFilter('ALL');
                      setCelebrationFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="text-xs text-neutral-500 h-9"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Guest Profile</th>
                  <th className="py-3 px-4">Loyalty Tier</th>
                  <th className="py-3 px-4">Total Spend & Visits</th>
                  <th className="py-3 px-4">Points & Wallet</th>
                  <th className="py-3 px-4">Last Visit & Occasion</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      Loading customer records...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Users className="w-8 h-8 mx-auto text-neutral-400" />
                        <p className="font-medium text-neutral-700 dark:text-neutral-300">
                          No matching guests found
                        </p>
                        <p className="text-xs text-neutral-500">
                          Try modifying search criteria or register a new customer.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const diffDays = Math.round(
                      (Date.now() - new Date(c.lastVisit).getTime()) / 86400000
                    );
                    const isBirthdayMonth =
                      c.birthday &&
                      parseInt(c.birthday.split('-')[1], 10) === new Date().getMonth() + 1;
                    const isAnniversaryMonth =
                      c.anniversary &&
                      parseInt(c.anniversary.split('-')[1], 10) === new Date().getMonth() + 1;

                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors ${
                          c.isBlocked ? 'bg-red-50/30 dark:bg-red-950/20 opacity-75' : ''
                        }`}
                      >
                        {/* Guest Profile */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                              {c.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-900 dark:text-white">
                                  {c.name}
                                </span>
                                {c.isBlocked && (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                                    SUSPENDED
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-neutral-400" />
                                  {formatIndianPhone(c.phone)}
                                </span>
                                {c.email && (
                                  <span className="hidden sm:inline-block truncate max-w-[150px]">
                                    {c.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Loyalty Tier */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getTierBadge(c.tierName)}
                        </td>

                        {/* Spend & Visits */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {formatCurrency(c.totalSpend)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {c.visitCount} visits • Avg {formatCurrency(c.totalSpend / (c.visitCount || 1))}
                          </p>
                        </td>

                        {/* Points & Wallet */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{c.totalPoints} pts</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                            <Wallet className="w-3 h-3 text-neutral-400" />
                            <span>Wallet: {formatCurrency(c.walletBalance)}</span>
                          </div>
                        </td>

                        {/* Last Visit & Occasion */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="text-neutral-800 dark:text-neutral-200">
                            {diffDays === 0
                              ? 'Today'
                              : diffDays === 1
                              ? 'Yesterday'
                              : `${diffDays} days ago`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {isBirthdayMonth && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-600 bg-pink-50 dark:bg-pink-950 px-1.5 py-0.5 rounded">
                                <Cake className="w-3 h-3" /> Birthday Month
                              </span>
                            )}
                            {isAnniversaryMonth && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                                <Gift className="w-3 h-3" /> Anniversary
                              </span>
                            )}
                            {!isBirthdayMonth && !isAnniversaryMonth && (
                              <span className="text-xs text-neutral-400">
                                {formatIndianDate(c.lastVisit)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {c.tags.slice(0, 2).map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                            {c.tags.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 text-neutral-400">
                                +{c.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedCustomer(c)}
                              className="h-8 px-2.5 text-xs gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            >
                              Profile
                              <ChevronRight className="w-3 h-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedCustomer(c);
                                setIsPointsModalOpen(true);
                              }}
                              title="Quick Adjust Points"
                              className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                            >
                              <Coins className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedCustomer(c);
                                setIsWalletModalOpen(true);
                              }}
                              title="Quick Top-up Wallet"
                              className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            >
                              <Wallet className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleBlock(c)}
                              title={c.isBlocked ? 'Unblock customer' : 'Suspend / Block customer'}
                              className={`h-8 w-8 p-0 ${
                                c.isBlocked
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-red-500 hover:bg-red-50'
                              }`}
                            >
                              {c.isBlocked ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
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

        {/* ========================================================================= */}
        {/* CUSTOMER 360 PROFILE MODAL / DRAWER */}
        {/* ========================================================================= */}
        <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            {selectedCustomer && (
              <div>
                {/* Profile Header Banner */}
                <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl text-white border border-white/30 shadow-inner">
                        {selectedCustomer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                          {selectedCustomer.isBlocked && (
                            <span className="text-xs bg-red-500/80 text-white font-bold px-2 py-0.5 rounded">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            +91 {selectedCustomer.phone}
                          </span>
                          {selectedCustomer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {selectedCustomer.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {selectedCustomer.tierName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPointsModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        Adjust Points
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsWalletModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Top-up Wallet
                      </Button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/20 text-center">
                    <div>
                      <p className="text-[11px] text-white/75 uppercase tracking-wider">
                        Lifetime Spend
                      </p>
                      <p className="text-lg font-bold">
                        {formatCurrency(selectedCustomer.totalSpend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-white/75 uppercase tracking-wider">
                        Total Visits
                      </p>
                      <p className="text-lg font-bold">{selectedCustomer.visitCount} orders</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-white/75 uppercase tracking-wider">
                        Loyalty Points
                      </p>
                      <p className="text-lg font-bold">{selectedCustomer.totalPoints} pts</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-white/75 uppercase tracking-wider">
                        Prepaid Wallet
                      </p>
                      <p className="text-lg font-bold">
                        {formatCurrency(selectedCustomer.walletBalance)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Tabs */}
                <div className="p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="overview">Overview & Info</TabsTrigger>
                      <TabsTrigger value="loyalty">Loyalty Ledger</TabsTrigger>
                      <TabsTrigger value="wallet">Wallet Ledger</TabsTrigger>
                      <TabsTrigger value="orders">Past Orders</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personal & Occasions */}
                        <Card className="shadow-none border">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                              Occasions & Demographics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-1 space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b">
                              <span className="text-neutral-500">Birthday:</span>
                              <span className="font-medium">
                                {selectedCustomer.birthday
                                  ? formatIndianDate(selectedCustomer.birthday)
                                  : 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <span className="text-neutral-500">Anniversary:</span>
                              <span className="font-medium">
                                {selectedCustomer.anniversary
                                  ? formatIndianDate(selectedCustomer.anniversary)
                                  : 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <span className="text-neutral-500">Last Visited:</span>
                              <span className="font-medium">
                                {formatIndianDate(selectedCustomer.lastVisit)}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-neutral-500">Tags:</span>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {selectedCustomer.tags.map((t, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px]">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Delivery Address */}
                        <Card className="shadow-none border">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              Primary Address
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-1 text-xs space-y-1">
                            <p className="font-medium text-neutral-800 dark:text-neutral-200">
                              {selectedCustomer.address.addressLine1 || 'No street address provided'}
                            </p>
                            <p className="text-neutral-500">
                              {selectedCustomer.address.city}, {selectedCustomer.address.state} -{' '}
                              {selectedCustomer.address.postalCode}
                            </p>
                            <p className="text-neutral-400 pt-2 text-[11px]">
                              Standard delivery zone: Central Metro (Estimated 25 mins)
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Favorite Dishes & Guest Notes */}
                      <Card className="shadow-none border">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-600" />
                            Favorite Dishes & Dietary Preferences
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {(selectedCustomer.favoriteItems && selectedCustomer.favoriteItems.length > 0
                              ? selectedCustomer.favoriteItems
                              : ['Butter Chicken Old Delhi Style', 'Dal Makhani Special', 'Special Mango Lassi']
                            ).map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                              >
                                {item}
                              </span>
                            ))}
                          </div>

                          {selectedCustomer.notes && (
                            <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 border">
                              <span className="font-semibold block mb-1">Internal Staff Note:</span>
                              {selectedCustomer.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* LOYALTY LEDGER TAB */}
                    <TabsContent value="loyalty" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            Current Loyalty Balance: {selectedCustomer.totalPoints} Points
                          </p>
                          <p className="text-xs text-neutral-500">
                            1 point = ₹1.00 redemption value (Max 50% bill payable via points)
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setIsPointsModalOpen(true)}
                          className="bg-emerald-600 text-white text-xs gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Adjust Points
                        </Button>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500">
                            <tr>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Points Delta</th>
                              <th className="py-2.5 px-3">Balance After</th>
                              <th className="py-2.5 px-3">Reason / Reference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {!selectedCustomer.loyaltyLedger ||
                            selectedCustomer.loyaltyLedger.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-neutral-400">
                                  No loyalty transactions recorded yet
                                </td>
                              </tr>
                            ) : (
                              selectedCustomer.loyaltyLedger.map((lt, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                                  <td className="py-2.5 px-3 font-medium">{lt.date}</td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        lt.type === 'EARN'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : lt.type === 'REDEEM'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {lt.type}
                                    </span>
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 font-semibold ${
                                      lt.points >= 0 ? 'text-emerald-600' : 'text-red-500'
                                    }`}
                                  >
                                    {lt.points >= 0 ? `+${lt.points}` : lt.points}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium">{lt.balanceAfter} pts</td>
                                  <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                                    {lt.reason}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    {/* WALLET LEDGER TAB */}
                    <TabsContent value="wallet" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            Current Wallet Balance:{' '}
                            <span className="text-emerald-600">
                              {formatCurrency(selectedCustomer.walletBalance)}
                            </span>
                          </p>
                          <p className="text-xs text-neutral-500">
                            Digital pre-paid balance applicable for instant cashless settlements
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setIsWalletModalOpen(true)}
                          className="bg-emerald-600 text-white text-xs gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add / Deduct Money
                        </Button>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500">
                            <tr>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Amount</th>
                              <th className="py-2.5 px-3">Balance After</th>
                              <th className="py-2.5 px-3">Reference Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {!selectedCustomer.walletLedger ||
                            selectedCustomer.walletLedger.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-neutral-400">
                                  No wallet transactions recorded yet
                                </td>
                              </tr>
                            ) : (
                              selectedCustomer.walletLedger.map((wt, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                                  <td className="py-2.5 px-3 font-medium">{wt.date}</td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        wt.type === 'TOPUP' || wt.type === 'CASHBACK'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-purple-100 text-purple-800'
                                      }`}
                                    >
                                      {wt.type}
                                    </span>
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 font-semibold ${
                                      wt.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                                    }`}
                                  >
                                    {wt.amount >= 0
                                      ? `+${formatCurrency(wt.amount)}`
                                      : `-${formatCurrency(Math.abs(wt.amount))}`}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium">
                                    {formatCurrency(wt.balanceAfter)}
                                  </td>
                                  <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                                    {wt.referenceNote}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    {/* PAST ORDERS TAB */}
                    <TabsContent value="orders" className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500">
                            <tr>
                              <th className="py-2.5 px-3">Order #</th>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Items Summary</th>
                              <th className="py-2.5 px-3">Payment Mode</th>
                              <th className="py-2.5 px-3 text-right">Bill Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {!selectedCustomer.recentOrders ||
                            selectedCustomer.recentOrders.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-neutral-400">
                                  No previous dining orders found
                                </td>
                              </tr>
                            ) : (
                              selectedCustomer.recentOrders.map((ord, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                                  <td className="py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400">
                                    {ord.orderNumber}
                                  </td>
                                  <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                                    {ord.date}
                                  </td>
                                  <td className="py-2.5 px-3 max-w-[250px] truncate">
                                    {ord.itemsSummary}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-[10px]">
                                      {ord.paymentMode}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-neutral-900 dark:text-white">
                                    {formatCurrency(ord.billAmount)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Profile Footer */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleBlock(selectedCustomer)}
                    className={
                      selectedCustomer.isBlocked
                        ? 'text-emerald-600 border-emerald-300'
                        : 'text-red-600 border-red-300'
                    }
                  >
                    {selectedCustomer.isBlocked ? 'Reactivate Guest Account' : 'Suspend / Block Guest'}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="bg-neutral-800 hover:bg-neutral-900 text-white"
                  >
                    Close Profile
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* ADD CUSTOMER MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Register New Customer
              </DialogTitle>
              <DialogDescription>
                Create a new guest account with loyalty tier, welcome bonuses and preferences.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCustomer} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Vikramaditya Roy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Mobile Number (+91) *</Label>
                  <Input
                    id="phone"
                    required
                    maxLength={10}
                    placeholder="e.g. 9831144556"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="guest@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tier">Loyalty Tier</Label>
                  <select
                    id="tier"
                    value={formData.tierId}
                    onChange={(e) => setFormData({ ...formData, tierId: e.target.value })}
                    className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <option value="tier-silver">Silver Member (Standard)</option>
                    <option value="tier-gold">Gold Member (1.25x Points)</option>
                    <option value="tier-platinum">Platinum VIP (1.5x Points)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="anniversary">Anniversary</Label>
                  <Input
                    id="anniversary"
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pts">Welcome Loyalty Points</Label>
                  <Input
                    id="pts"
                    type="number"
                    value={formData.initialPoints}
                    onChange={(e) =>
                      setFormData({ ...formData, initialPoints: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="wallet">Welcome Wallet Bonus (₹)</Label>
                  <Input
                    id="wallet"
                    type="number"
                    value={formData.initialWallet}
                    onChange={(e) =>
                      setFormData({ ...formData, initialWallet: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Address & City</Label>
                <Input
                  id="address"
                  placeholder="Apartment, Street address, Bengaluru"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="VIP, Family, Wine Lover, Corporate"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Staff Notes / Dietary Preference</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. Loves window table, prefers Jain preparation..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Customer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* POINTS ADJUSTMENT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isPointsModalOpen} onOpenChange={setIsPointsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Adjust Loyalty Points
              </DialogTitle>
              <DialogDescription>
                Credit or debit loyalty points for {selectedCustomer?.name} (+91{' '}
                {selectedCustomer?.phone}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Action Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={pointsAdjustment.type === 'EARN' ? 'default' : 'outline'}
                    onClick={() => setPointsAdjustment({ ...pointsAdjustment, type: 'EARN' })}
                    className={
                      pointsAdjustment.type === 'EARN' ? 'bg-emerald-600 text-white' : ''
                    }
                  >
                    + Credit Points
                  </Button>
                  <Button
                    type="button"
                    variant={pointsAdjustment.type === 'REDEEM' ? 'default' : 'outline'}
                    onClick={() => setPointsAdjustment({ ...pointsAdjustment, type: 'REDEEM' })}
                    className={
                      pointsAdjustment.type === 'REDEEM' ? 'bg-red-600 text-white' : ''
                    }
                  >
                    - Deduct Points
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjPoints">Points Amount</Label>
                <Input
                  id="adjPoints"
                  type="number"
                  min={1}
                  value={pointsAdjustment.points}
                  onChange={(e) =>
                    setPointsAdjustment({
                      ...pointsAdjustment,
                      points: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjReason">Reason for Adjustment</Label>
                <Input
                  id="adjReason"
                  placeholder="e.g. Service recovery, Diwali bonus, Goodwill"
                  value={pointsAdjustment.reason}
                  onChange={(e) =>
                    setPointsAdjustment({ ...pointsAdjustment, reason: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPointsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustPoints} className="bg-amber-600 hover:bg-amber-700 text-white">
                Apply Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* WALLET TOP-UP / ADJUSTMENT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Digital Wallet Management
              </DialogTitle>
              <DialogDescription>
                Top-up or debit pre-paid wallet balance for {selectedCustomer?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Transaction Type</Label>
                <select
                  value={walletAdjustment.type}
                  onChange={(e) =>
                    setWalletAdjustment({ ...walletAdjustment, type: e.target.value })
                  }
                  className="w-full text-sm h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                >
                  <option value="TOPUP">+ Wallet Top-Up (Cash / UPI received)</option>
                  <option value="CASHBACK">+ Promotional Cashback Credit</option>
                  <option value="DEBIT_BILL">- Manual Bill Debit</option>
                  <option value="ADJUSTMENT">~ Balance Correction</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wAmount">Amount (₹)</Label>
                <Input
                  id="wAmount"
                  type="number"
                  min={1}
                  value={walletAdjustment.amount}
                  onChange={(e) =>
                    setWalletAdjustment({
                      ...walletAdjustment,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wNote">Reference Note / Transaction ID</Label>
                <Input
                  id="wNote"
                  placeholder="e.g. Counter Cash, GPay ref #8812, Festival Perk"
                  value={walletAdjustment.referenceNote}
                  onChange={(e) =>
                    setWalletAdjustment({ ...walletAdjustment, referenceNote: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWalletModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustWallet} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Process Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
