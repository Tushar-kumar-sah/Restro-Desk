'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  Phone,
  QrCode,
  Copy,
  UserCheck,
  TrendingUp,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatIndianDate } from '@/lib/formatters';
import { FeedbackResponseItem } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function FeedbackDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [responses, setResponses] = useState<FeedbackResponseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [outletFilter, setOutletFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution modal
  const [selectedFeedbackForResolution, setSelectedFeedbackForResolution] = useState<FeedbackResponseItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [managerName, setManagerName] = useState('Ramesh Patel (General Manager)');
  const [resolving, setResolving] = useState(false);

  // Public QR link modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (outletFilter !== 'all') params.append('outletId', outletFilter);
      if (ratingFilter) params.append('rating', String(ratingFilter));
      if (unresolvedOnly) params.append('unresolved', 'true');

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setResponses(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load guest feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, [outletFilter, ratingFilter, unresolvedOnly]);

  const handleResolveFeedback = async () => {
    if (!selectedFeedbackForResolution) return;
    if (!resolutionNotes || resolutionNotes.length < 5) {
      toast.error('Please enter detailed resolution notes (at least 5 characters)');
      return;
    }

    try {
      setResolving(true);
      const res = await fetch(`/api/feedback/${selectedFeedbackForResolution.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionNotes,
          resolvedBy: managerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedFeedbackForResolution(null);
        setResolutionNotes('');
        fetchFeedbackData();
      } else {
        toast.error(data.error || 'Failed to resolve feedback');
      }
    } catch (err) {
      toast.error('Error resolving guest complaint');
    } finally {
      setResolving(false);
    }
  };

  const copyPublicReviewLink = () => {
    const url = `${window.location.origin}/review`;
    navigator.clipboard.writeText(url);
    toast.success('Public feedback link copied to clipboard!');
  };

  const filteredResponses = responses.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(q) ||
      (r.comments && r.comments.toLowerCase().includes(q)) ||
      (r.tableNumber && r.tableNumber.toLowerCase().includes(q)) ||
      (r.billNumber && r.billNumber.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell>
      <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guest Feedback & Reputation</h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> Live Dining Reviews
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time diner ratings, escalate negative reviews, and drive 5-star guests to Google Maps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-slate-200"
            onClick={() => setIsQrModalOpen(true)}
          >
            <QrCode className="h-4 w-4 text-slate-600" /> Feedback QR & Link
          </Button>
          <Button
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={copyPublicReviewLink}
          >
            <Copy className="h-4 w-4" /> Copy Review URL
          </Button>
        </div>
      </div>

      {/* Critical Attention Banner (If unresolved negative ratings exist) */}
      {metrics && metrics.unresolvedAlerts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 text-sm">
                Attention: {metrics.unresolvedAlerts} Guest Experience Escalation(s) Pending
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                Diners who submitted ratings below 3.5 stars require immediate manager follow-up to protect customer retention.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => setUnresolvedOnly(true)}
          >
            View Escalations
          </Button>
        </div>
      )}

      {/* KPI Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Overall Rating */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <span className="text-xs font-medium text-slate-500">Overall Rating</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900">{metrics.averageRating}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.round(metrics.averageRating)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-slate-500 ml-1">({metrics.totalResponses} reviews)</span>
              </div>
            </CardContent>
          </Card>

          {/* NPS Score */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <span className="text-xs font-medium text-slate-500">Net Promoter Score (NPS)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-3xl font-extrabold ${metrics.npsScore >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  +{metrics.npsScore}
                </span>
                <span className="text-xs font-medium text-emerald-600">World Class</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-semibold">{metrics.promotersCount} Promoters</span> •{' '}
                <span className="text-amber-600 font-semibold">{metrics.passivesCount} Passive</span> •{' '}
                <span className="text-red-500 font-semibold">{metrics.detractorsCount} Detractors</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Quality Breakdown</span>
              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Food Quality:</span>
                  <span className="font-semibold text-slate-900">{metrics.avgFood} ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Staff Service:</span>
                  <span className="font-semibold text-slate-900">{metrics.avgService} ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ambiance:</span>
                  <span className="font-semibold text-slate-900">{metrics.avgAmbiance} ★</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Review Redirects */}
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-900">Google Reviews Driven</span>
                <ExternalLink className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-blue-700">{metrics.googleRedirects}</span>
                <span className="text-xs text-blue-700">Diners</span>
              </div>
              <p className="text-xs text-blue-800 mt-1">Direct redirects from 5-star diners</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Ribbon */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search reviews, diner name, table..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            aria-label="Filter reviews by outlet"
            className="border border-slate-200 rounded-md text-xs px-2.5 py-2 bg-white text-slate-700"
            value={outletFilter}
            onChange={(e) => setOutletFilter(e.target.value)}
          >
            <option value="all">All Outlets</option>
            <option value="outlet-01">Indiranagar Flagship</option>
            <option value="outlet-02">Koramangala Dine-In</option>
          </select>

          <select
            aria-label="Filter reviews by star rating"
            className="border border-slate-200 rounded-md text-xs px-2.5 py-2 bg-white text-slate-700"
            value={ratingFilter || ''}
            onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
            <option value="2">2 Stars Only</option>
          </select>

          <Button
            size="sm"
            variant={unresolvedOnly ? 'default' : 'outline'}
            className={`text-xs ${unresolvedOnly ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-slate-600'}`}
            onClick={() => setUnresolvedOnly(!unresolvedOnly)}
          >
            {unresolvedOnly ? 'Showing Unresolved Only' : 'Unresolved Issues'}
          </Button>
        </div>
      </div>

      {/* Reviews Feed List */}
      <div className="space-y-3">
        {filteredResponses.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center text-slate-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              No guest reviews found matching current filter selections.
            </CardContent>
          </Card>
        ) : (
          filteredResponses.map((item) => {
            const isNegative = item.overallRating < 3.5;
            const cardBg = isNegative && !item.isResolved ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-white';

            return (
              <Card key={item.id} className={`${cardBg} shadow-sm transition-all hover:shadow`}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Guest Details & Review text */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{item.customerName}</span>
                        {item.customerPhone && (
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.customerPhone}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.outletName}
                        </Badge>
                        {item.tableNumber && (
                          <Badge variant="secondary" className="text-xs">
                            Table {item.tableNumber}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400">
                          {formatIndianDate(item.createdAt)}
                        </span>
                      </div>

                      {/* Stars & Scores */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(item.overallRating)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>

                        <Badge
                          className={`text-[10px] font-semibold ${
                            item.npsCategory === 'PROMOTER'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.npsCategory === 'PASSIVE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          NPS: {item.npsScore}/10 ({item.npsCategory})
                        </Badge>

                        {item.redirectedToGoogle && (
                          <Badge className="bg-blue-100 text-blue-800 text-[10px] gap-1">
                            <ExternalLink className="h-3 w-3" /> Shared on Google
                          </Badge>
                        )}
                      </div>

                      {/* Comment text */}
                      {item.comments && (
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100 italic">
                          &quot;{item.comments}&quot;
                        </p>
                      )}

                      {/* Category rating pills */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span>Food: <strong className="text-slate-800">{item.foodRating}★</strong></span>
                        <span>•</span>
                        <span>Service: <strong className="text-slate-800">{item.serviceRating}★</strong></span>
                        <span>•</span>
                        <span>Ambiance: <strong className="text-slate-800">{item.ambianceRating}★</strong></span>
                      </div>

                      {/* Resolution note display if resolved */}
                      {item.isResolved && item.resolutionNotes && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs space-y-1">
                          <p className="font-semibold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Resolved by {item.resolvedBy || 'Manager'}
                          </p>
                          <p className="text-emerald-800">{item.resolutionNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col items-end justify-between self-stretch gap-2">
                      {!item.isResolved ? (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5 shadow-sm"
                          onClick={() => {
                            setSelectedFeedbackForResolution(item);
                            setResolutionNotes('');
                          }}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" /> Resolve Escalation
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* RESOLUTION DIALOG */}
      <Dialog
        open={!!selectedFeedbackForResolution}
        onOpenChange={() => setSelectedFeedbackForResolution(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Resolve Guest Complaint
            </DialogTitle>
            <DialogDescription>
              Document the manager outreach, compensation, or kitchen corrective actions taken.
            </DialogDescription>
          </DialogHeader>

          {selectedFeedbackForResolution && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-800">
                  Guest: {selectedFeedbackForResolution.customerName} ({selectedFeedbackForResolution.customerPhone || 'No Phone'})
                </p>
                <p className="text-slate-600 italic">
                  &quot;{selectedFeedbackForResolution.comments}&quot;
                </p>
                <p className="text-[11px] text-red-600 font-medium">
                  Rating: {selectedFeedbackForResolution.overallRating} ★ • Table {selectedFeedbackForResolution.tableNumber || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <Label>Manager Name</Label>
                <Input
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Resolution Actions & Notes</Label>
                <textarea
                  aria-label="Resolution actions and notes"
                  className="w-full border border-slate-200 rounded-md p-2 text-xs h-24 bg-white text-slate-800"
                  placeholder="e.g. Called guest on phone, apologized for slow drinks service, issued 250 loyalty points and complimentary dessert voucher for next visit."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFeedbackForResolution(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={resolving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleResolveFeedback}
            >
              <CheckCircle2 className="h-4 w-4" />
              {resolving ? 'Saving...' : 'Mark as Resolved'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR CODE & LINK MODAL */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-base">Dining Table Feedback QR</DialogTitle>
            <DialogDescription>
              Place this QR on dining table acrylic stands or print at the bottom of thermal bills.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 flex flex-col items-center">
            {/* Simulated QR Code card */}
            <div className="w-48 h-48 bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-4 text-white shadow-md">
              <QrCode className="h-28 w-28 text-white mb-2" />
              <span className="text-[11px] font-mono tracking-wider">SCAN TO RATE EXPERIENCE</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800">Direct Feedback URL:</p>
              <p className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/review` : 'https://restodesk.in/review'}
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={copyPublicReviewLink}
            >
              <Copy className="h-4 w-4" /> Copy URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppShell>
  );
}
