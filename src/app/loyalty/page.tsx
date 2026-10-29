'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/formatters';
import {
  Award,
  Wallet,
  Coins,
  ShieldCheck,
  Gift,
  Save,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  Users,
  Info,
} from 'lucide-react';

interface LoyaltyProgramData {
  id: string;
  name: string;
  isActive: boolean;
  earnRulePointsPerRupee: number;
  minBillToEarn: number;
  redeemPointValueInRupees: number;
  minPointsToRedeem: number;
  maxRedeemPercentOfBill: number;
  pointsExpiryDays: number;
  autoCashbackPercent?: number;
  welcomeBonusWallet?: number;
  birthdayBonusWallet?: number;
  referralBonusWallet?: number;
}

interface LoyaltyTierData {
  id: string;
  name: string;
  minSpend: number;
  multiplier: number;
  perksDescription: string;
  color?: string;
  customerCount?: number;
}

export default function LoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [program, setProgram] = useState<LoyaltyProgramData>({
    id: 'lp-001',
    name: 'RestoDesk Delights Loyalty',
    isActive: true,
    earnRulePointsPerRupee: 0.05,
    minBillToEarn: 150,
    redeemPointValueInRupees: 1.0,
    minPointsToRedeem: 50,
    maxRedeemPercentOfBill: 50.0,
    pointsExpiryDays: 365,
    autoCashbackPercent: 2.5,
    welcomeBonusWallet: 100,
    birthdayBonusWallet: 250,
    referralBonusWallet: 150,
  });

  const [tiers, setTiers] = useState<LoyaltyTierData[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPointsOutstanding: 0,
    totalWalletLiability: 0,
    estimatedRedemptionLiabilityInRupees: 0,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchLoyaltyConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/loyalty');
      const data = await res.json();
      if (data.success) {
        if (data.program) setProgram(data.program);
        if (data.tiers) setTiers(data.tiers);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load loyalty configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/crm/loyalty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...program,
          tiers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Loyalty program & wallet rules updated successfully!');
        if (data.program) setProgram(data.program);
        if (data.tiers) setTiers(data.tiers);
      } else {
        showToast(data.message || 'Failed to update rules', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateTierField = (id: string, field: keyof LoyaltyTierData, value: any) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
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
              <Award className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Loyalty & Digital Wallet Engine
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Configure points earn/redeem rates, tier multipliers, cashback, and pre-paid wallet
              perks
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchLoyaltyConfig}
              className="gap-2 text-neutral-700 dark:text-neutral-300"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Configuration'}
            </Button>
          </div>
        </div>

        {/* Financial Liability KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Points Outstanding
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.totalPointsOutstanding.toLocaleString('en-IN')} pts
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Points Liability
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(stats.estimatedRedemptionLiabilityInRupees)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Wallet Liability
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(stats.totalWalletLiability)}
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
                  Active Tiers
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {tiers.length} Tiers Active
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="program" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="program">Program Rules</TabsTrigger>
            <TabsTrigger value="tiers">Tier Hierarchy</TabsTrigger>
            <TabsTrigger value="wallet">Wallet & Bonuses</TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: PROGRAM RULES */}
          {/* ========================================================================= */}
          <TabsContent value="program" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Points Earning & Redemption Policy
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Define the conversion rate for converting bill values to points and points to
                      rupees.
                    </CardDescription>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <span>Program Status:</span>
                    <input
                      type="checkbox"
                      checked={program.isActive}
                      onChange={(e) => setProgram({ ...program, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        program.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {program.isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </label>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Earn Rule */}
                  <div className="p-4 rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-sm">Points Earning Formula</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="earnRate" className="text-xs">
                          Earning Rate (Points earned per ₹1 spent)
                        </Label>
                        <div className="flex items-center gap-3 mt-1">
                          <Input
                            id="earnRate"
                            type="number"
                            step="0.01"
                            value={program.earnRulePointsPerRupee}
                            onChange={(e) =>
                              setProgram({
                                ...program,
                                earnRulePointsPerRupee: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="bg-white dark:bg-neutral-800 font-mono text-sm"
                          />
                          <span className="text-xs text-neutral-500 whitespace-nowrap">
                            = 1 pt per ₹
                            {Math.round(1 / (program.earnRulePointsPerRupee || 0.05))} spent (
                            {(program.earnRulePointsPerRupee * 100).toFixed(0)}% return)
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="minBill" className="text-xs">
                          Minimum Bill Required to Earn Points (₹)
                        </Label>
                        <Input
                          id="minBill"
                          type="number"
                          value={program.minBillToEarn}
                          onChange={(e) =>
                            setProgram({
                              ...program,
                              minBillToEarn: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="bg-white dark:bg-neutral-800 mt-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Redemption Rule */}
                  <div className="p-4 rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-semibold text-sm">Points Redemption Formula</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="pointVal" className="text-xs">
                          Redemption Value (₹ value of 1 point)
                        </Label>
                        <div className="flex items-center gap-3 mt-1">
                          <Input
                            id="pointVal"
                            type="number"
                            step="0.1"
                            value={program.redeemPointValueInRupees}
                            onChange={(e) =>
                              setProgram({
                                ...program,
                                redeemPointValueInRupees: parseFloat(e.target.value) || 1.0,
                              })
                            }
                            className="bg-white dark:bg-neutral-800 font-mono text-sm"
                          />
                          <span className="text-xs text-neutral-500 whitespace-nowrap">
                            1 pt = ₹{program.redeemPointValueInRupees.toFixed(2)} on bill
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="minRedeemPts" className="text-xs">
                            Min Points to Redeem
                          </Label>
                          <Input
                            id="minRedeemPts"
                            type="number"
                            value={program.minPointsToRedeem}
                            onChange={(e) =>
                              setProgram({
                                ...program,
                                minPointsToRedeem: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="bg-white dark:bg-neutral-800 mt-1 font-mono text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="maxBillCap" className="text-xs">
                            Max Bill % Settled
                          </Label>
                          <Input
                            id="maxBillCap"
                            type="number"
                            value={program.maxRedeemPercentOfBill}
                            onChange={(e) =>
                              setProgram({
                                ...program,
                                maxRedeemPercentOfBill: parseFloat(e.target.value) || 50,
                              })
                            }
                            className="bg-white dark:bg-neutral-800 mt-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="expiryDays" className="text-xs">
                          Points Expiry Period (Days)
                        </Label>
                        <Input
                          id="expiryDays"
                          type="number"
                          value={program.pointsExpiryDays}
                          onChange={(e) =>
                            setProgram({
                              ...program,
                              pointsExpiryDays: parseInt(e.target.value, 10) || 365,
                            })
                          }
                          className="bg-white dark:bg-neutral-800 mt-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Walkthrough Banner */}
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                  <Info className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">How PetPooja POS Billing Works with these Rules:</p>
                    <p className="leading-relaxed">
                      If a diner spends <strong>₹2,000</strong>, they earn{' '}
                      <strong>{2000 * program.earnRulePointsPerRupee} points</strong> (worth ₹
                      {(2000 * program.earnRulePointsPerRupee * program.redeemPointValueInRupees).toFixed(2)}
                      ). On their next visit, if they have 500 points, they can redeem up to{' '}
                      <strong>{program.maxRedeemPercentOfBill}% of their new bill</strong> directly
                      at POS with 1 click!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: TIER HIERARCHY */}
          {/* ========================================================================= */}
          <TabsContent value="tiers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tiers.map((t) => (
                <Card key={t.id} className="shadow-sm border overflow-hidden">
                  <div
                    className={`p-4 border-b ${
                      t.name.includes('Platinum')
                        ? 'bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200'
                        : t.name.includes('Gold')
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        {t.name}
                      </h3>
                      <Badge variant="outline" className="font-bold text-[11px]">
                        {t.multiplier}x Points
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Minimum Qualifying Spend (₹)</Label>
                      <Input
                        type="number"
                        value={t.minSpend}
                        onChange={(e) =>
                          updateTierField(t.id, 'minSpend', parseFloat(e.target.value) || 0)
                        }
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Points Earn Multiplier</Label>
                      <Input
                        type="number"
                        step="0.05"
                        value={t.multiplier}
                        onChange={(e) =>
                          updateTierField(t.id, 'multiplier', parseFloat(e.target.value) || 1.0)
                        }
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Exclusive Perks & Privileges</Label>
                      <textarea
                        rows={3}
                        value={t.perksDescription}
                        onChange={(e) => updateTierField(t.id, 'perksDescription', e.target.value)}
                        className="w-full text-xs p-2 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between text-xs text-neutral-500">
                      <span>Enrolled Guests:</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {t.customerCount || 0} patrons
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: DIGITAL WALLET & BONUSES */}
          {/* ========================================================================= */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="p-5 pb-3 border-b">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  Pre-paid Wallet & Automated Cashback Bonuses
                </CardTitle>
                <CardDescription className="text-xs">
                  Automate wallet credits on registration, birthdays, bill settlements, and
                  customer referrals.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
                      <Percent className="w-4 h-4" />
                      Auto-Cashback
                    </div>
                    <Label htmlFor="autoCb" className="text-xs text-neutral-600 dark:text-neutral-300">
                      Cashback on Bill Settlement (%)
                    </Label>
                    <Input
                      id="autoCb"
                      type="number"
                      step="0.5"
                      value={program.autoCashbackPercent || 2.5}
                      onChange={(e) =>
                        setProgram({
                          ...program,
                          autoCashbackPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Credited automatically to guest wallet after payment
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
                      <Users className="w-4 h-4" />
                      Welcome Bonus
                    </div>
                    <Label htmlFor="wBonus" className="text-xs text-neutral-600 dark:text-neutral-300">
                      New Guest Signup Wallet (₹)
                    </Label>
                    <Input
                      id="wBonus"
                      type="number"
                      value={program.welcomeBonusWallet || 100}
                      onChange={(e) =>
                        setProgram({
                          ...program,
                          welcomeBonusWallet: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Given on first time phone registration
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-pink-600 font-semibold text-xs uppercase tracking-wider">
                      <Gift className="w-4 h-4" />
                      Birthday Gift
                    </div>
                    <Label htmlFor="bBonus" className="text-xs text-neutral-600 dark:text-neutral-300">
                      Birthday Celebration Wallet (₹)
                    </Label>
                    <Input
                      id="bBonus"
                      type="number"
                      value={program.birthdayBonusWallet || 250}
                      onChange={(e) =>
                        setProgram({
                          ...program,
                          birthdayBonusWallet: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Auto-credited on birthday via scheduled cron
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      Referral Bonus
                    </div>
                    <Label htmlFor="rBonus" className="text-xs text-neutral-600 dark:text-neutral-300">
                      Friend Referral Credit (₹)
                    </Label>
                    <Input
                      id="rBonus"
                      type="number"
                      value={program.referralBonusWallet || 150}
                      onChange={(e) =>
                        setProgram({
                          ...program,
                          referralBonusWallet: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Credited when referred friend completes first order
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border text-xs space-y-2">
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    PetPooja Accounting & Liability Best Practices:
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Digital Pre-paid Wallets act as an unearned revenue liability on the balance
                    sheet until redeemed against dining bills. Cash top-ups taken at the counter
                    reflect in Day-End Z-reports under "Prepaid Wallet Receipts".
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
