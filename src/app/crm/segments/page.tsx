'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, formatIndianPhone, formatIndianDate } from '@/lib/formatters';
import {
  Target,
  Plus,
  Users,
  Sparkles,
  ArrowRight,
  Trash2,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Download,
  Share2,
  ChevronRight,
  ShieldCheck,
  Send,
  Layers,
} from 'lucide-react';

interface SegmentRule {
  field: 'spend' | 'visits' | 'daysSinceLastVisit' | 'tier' | 'birthdayMonth' | 'tag';
  operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface SegmentItem {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  customerCount: number;
  rules: SegmentRule[];
}

export default function AudienceSegmentsPage() {
  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<SegmentItem | null>(null);
  const [segmentCustomers, setSegmentCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Segment Builder State
  const [builderName, setBuilderName] = useState('');
  const [builderDesc, setBuilderDesc] = useState('');
  const [builderRules, setBuilderRules] = useState<SegmentRule[]>([
    { field: 'spend', operator: 'GREATER_THAN', value: '5000', logicalOperator: 'AND' },
  ]);
  const [liveMatchCount, setLiveMatchCount] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/segments');
      const data = await res.json();
      if (data.success) {
        setSegments(data.segments || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load segments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const openSegmentAudience = async (segment: SegmentItem) => {
    setSelectedSegment(segment);
    try {
      setLoadingCustomers(true);
      const res = await fetch(`/api/crm/segments/${segment.id}`);
      const data = await res.json();
      if (data.success) {
        setSegmentCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to inspect audience', 'error');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const addRuleRow = () => {
    setBuilderRules([
      ...builderRules,
      { field: 'visits', operator: 'GREATER_THAN', value: '3', logicalOperator: 'AND' },
    ]);
  };

  const removeRuleRow = (index: number) => {
    if (builderRules.length <= 1) return;
    setBuilderRules(builderRules.filter((_, i) => i !== index));
  };

  const updateRuleRow = (index: number, updates: Partial<SegmentRule>) => {
    const updated = [...builderRules];
    updated[index] = { ...updated[index], ...updates };
    setBuilderRules(updated);
  };

  const handleSaveSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderName.trim()) {
      showToast('Please provide a segment name', 'error');
      return;
    }

    try {
      const res = await fetch('/api/crm/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: builderName.trim(),
          description: builderDesc.trim(),
          rules: builderRules,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Segment "${builderName}" created successfully!`);
        setIsCreateModalOpen(false);
        setBuilderName('');
        setBuilderDesc('');
        setBuilderRules([
          { field: 'spend', operator: 'GREATER_THAN', value: '5000', logicalOperator: 'AND' },
        ]);
        fetchSegments();
      } else {
        showToast(data.message || 'Failed to create segment', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSegment = async (segmentId: string, segmentName: string) => {
    if (!confirm(`Are you sure you want to delete segment "${segmentName}"?`)) return;

    try {
      const res = await fetch(`/api/crm/segments/${segmentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Segment deleted');
        fetchSegments();
      } else {
        showToast(data.message || 'Cannot delete segment', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Audience Segments & Targeting
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Dynamic customer cohorts built with rule triggers for hyper-targeted marketing
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Custom Segment
          </Button>
        </div>

        {/* Segments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {segments.map((seg) => {
            const isCelebration = seg.id === 'seg-06';
            const isVip = seg.id === 'seg-03';
            const isAtRisk = seg.id === 'seg-04' || seg.id === 'seg-05';

            return (
              <Card
                key={seg.id}
                className="shadow-sm hover:shadow-md transition-shadow border flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isVip
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : isCelebration
                              ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                              : isAtRisk
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                            {seg.name}
                          </h3>
                          <span className="text-[11px] font-medium text-neutral-400">
                            {seg.isSystem ? 'System Smart Segment' : 'Custom User Segment'}
                          </span>
                        </div>
                      </div>

                      {!seg.isSystem && (
                        <button
                          onClick={() => handleDeleteSegment(seg.id, seg.name)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                          title="Delete segment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
                      {seg.description}
                    </p>

                    {/* Rules Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {seg.rules.map((r, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono font-medium"
                        >
                          {r.field}{' '}
                          {r.operator === 'GREATER_THAN'
                            ? '≥'
                            : r.operator === 'LESS_THAN'
                            ? '≤'
                            : '='}{' '}
                          {r.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {seg.customerCount}
                    </span>
                    <span className="text-xs text-neutral-500">guests</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openSegmentAudience(seg)}
                      className="text-xs h-8 px-2.5 gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    >
                      View List
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* CUSTOM SEGMENT BUILDER MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Custom Audience Segment Builder
              </DialogTitle>
              <DialogDescription>
                Define criteria using dining spend, visit frequency, tiers and occasions to group
                your guests.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveSegment} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="sName">Segment Name *</Label>
                <Input
                  id="sName"
                  required
                  placeholder="e.g. Weekend Big Spenders"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sDesc">Audience Description</Label>
                <Input
                  id="sDesc"
                  placeholder="e.g. Patrons with spend over ₹5,000 who visited in the last 30 days"
                  value={builderDesc}
                  onChange={(e) => setBuilderDesc(e.target.value)}
                />
              </div>

              {/* Dynamic Rules Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                    Condition Criteria
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addRuleRow}
                    className="h-7 text-xs text-emerald-600 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Rule
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {builderRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-900 rounded-lg border text-xs"
                    >
                      {idx > 0 && (
                        <select
                          value={rule.logicalOperator || 'AND'}
                          onChange={(e) =>
                            updateRuleRow(idx, { logicalOperator: e.target.value as any })
                          }
                          className="font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-1.5 rounded border border-emerald-200"
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                      )}

                      <select
                        value={rule.field}
                        onChange={(e) => updateRuleRow(idx, { field: e.target.value as any })}
                        className="px-2 py-1.5 rounded border bg-white dark:bg-neutral-800 flex-1"
                      >
                        <option value="spend">Total Spend (₹)</option>
                        <option value="visits">Total Visits Count</option>
                        <option value="daysSinceLastVisit">Days Since Last Visit</option>
                        <option value="tier">Loyalty Tier</option>
                        <option value="birthdayMonth">Birthday Month</option>
                        <option value="tag">Customer Tag</option>
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) => updateRuleRow(idx, { operator: e.target.value as any })}
                        className="px-2 py-1.5 rounded border bg-white dark:bg-neutral-800"
                      >
                        <option value="GREATER_THAN">Greater Than / Equals (≥)</option>
                        <option value="LESS_THAN">Less Than / Equals (≤)</option>
                        <option value="EQUALS">Is Exactly (=)</option>
                      </select>

                      <Input
                        className="w-32 h-8 text-xs bg-white dark:bg-neutral-800"
                        placeholder="Value"
                        value={rule.value}
                        onChange={(e) => updateRuleRow(idx, { value: e.target.value })}
                      />

                      {builderRules.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRuleRow(idx)}
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Audience Segment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* SEGMENT AUDIENCE INSPECTOR MODAL */}
        {/* ========================================================================= */}
        <Dialog open={!!selectedSegment} onOpenChange={(open) => !open && setSelectedSegment(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            {selectedSegment && (
              <div>
                <DialogHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        {selectedSegment.name}
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-1">
                        {selectedSegment.description}
                      </DialogDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1">
                        {segmentCustomers.length} Matched Patrons
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  {/* Matching customer table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-500">
                        <tr>
                          <th className="py-3 px-3">Customer</th>
                          <th className="py-3 px-3">Tier</th>
                          <th className="py-3 px-3">Total Spend</th>
                          <th className="py-3 px-3">Visits</th>
                          <th className="py-3 px-3">Last Visit</th>
                          <th className="py-3 px-3">Points & Wallet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {loadingCustomers ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-neutral-400">
                              Matching segment patrons...
                            </td>
                          </tr>
                        ) : segmentCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-neutral-400">
                              No guests match these specific segment rules currently.
                            </td>
                          </tr>
                        ) : (
                          segmentCustomers.map((c) => (
                            <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                              <td className="py-3 px-3 font-semibold">
                                <p className="text-neutral-900 dark:text-white">{c.name}</p>
                                <p className="text-neutral-400 text-[11px]">
                                  {formatIndianPhone(c.phone)}
                                </p>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800">
                                  {c.tierName}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                                {formatCurrency(c.totalSpend)}
                              </td>
                              <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                                {c.visitCount} orders
                              </td>
                              <td className="py-3 px-3 text-neutral-500">
                                {formatIndianDate(c.lastVisit)}
                              </td>
                              <td className="py-3 px-3">
                                <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                                  {c.totalPoints} pts
                                </div>
                                <div className="text-[11px] text-neutral-400">
                                  ₹{c.walletBalance.toFixed(2)} wallet
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <DialogFooter className="pt-2 border-t flex justify-between sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open('/api/crm/customers?export=csv', '_blank');
                      }}
                      className="text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Segment CSV
                    </Button>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedSegment(null)}
                    className="bg-neutral-900 text-white"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
