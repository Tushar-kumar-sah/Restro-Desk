'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Heart,
  UtensilsCrossed,
  ShieldCheck,
  Send,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PublicReviewPage({
  params,
  searchParams,
}: {
  params?: { id?: string };
  searchParams?: { table?: string; bill?: string; outlet?: string };
}) {
  const table = searchParams?.table || params?.id || 'T-04';
  const bill = searchParams?.bill || 'INV-20261028-001';
  const outlet = searchParams?.outlet || 'Indiranagar Flagship';

  // Form state
  const [overallRating, setOverallRating] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [ambianceRating, setAmbianceRating] = useState<number>(5);
  const [npsScore, setNpsScore] = useState<number>(10);
  const [comments, setComments] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<any>(null);

  const getEmojiForRating = (rating: number) => {
    switch (rating) {
      case 1:
        return { emoji: '😡', label: 'Terrible' };
      case 2:
        return { emoji: '🙁', label: 'Poor' };
      case 3:
        return { emoji: '😐', label: 'Average' };
      case 4:
        return { emoji: '😊', label: 'Good' };
      case 5:
      default:
        return { emoji: '🤩', label: 'Exceptional!' };
    }
  };

  const currentRatingInfo = getEmojiForRating(overallRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: 'outlet-01',
          customerName: customerName || 'Anonymous Foodie',
          customerPhone,
          tableNumber: table,
          billNumber: bill,
          overallRating,
          foodRating,
          serviceRating,
          ambianceRating,
          npsScore,
          comments,
          redirectedToGoogle: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setSubmittedResponse(data.data);
      } else {
        toast.error(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleReviewRedirect = () => {
    // Open Google review link in new tab
    window.open('https://g.page/r/restodesk-indiranagar/review', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 flex flex-col justify-between items-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Restaurant Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">RestoDesk Dining</h1>
            <p className="text-xs text-slate-500 font-medium">
              {outlet} • Table {table}
            </p>
          </div>
        </div>

        {!submitted ? (
          /* FEEDBACK FORM */
          <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-b from-slate-50 to-white pb-2 text-center">
              <CardTitle className="text-base font-bold text-slate-900">
                How was your dining experience?
              </CardTitle>
              <p className="text-xs text-slate-500">
                Your direct ratings help our kitchen & service team continuously improve.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Primary Overall Star Rating */}
                <div className="text-center space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-4xl animate-bounce">{currentRatingInfo.emoji}</div>
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    {currentRatingInfo.label} ({overallRating} / 5)
                  </span>

                  <div className="flex justify-center items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setOverallRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`h-9 w-9 ${
                            star <= overallRating
                              ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sub-Category Star Ratings */}
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rate by Category
                  </p>

                  {/* Food */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-700">Taste & Food Quality</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setFoodRating(s)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              s <= foodRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-700">Staff & Service Speed</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setServiceRating(s)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              s <= serviceRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ambiance */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-slate-700">Ambiance & Cleanliness</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setAmbianceRating(s)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              s <= ambianceRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. NPS 0 to 10 Scale */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800">
                      Would you recommend us to friends?
                    </label>
                    <span className="text-xs font-bold text-emerald-600">{npsScore} / 10</span>
                  </div>

                  <div className="grid grid-cols-11 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = npsScore === num;
                      const isPromoter = num >= 9;
                      const isDetractor = num <= 6;
                      const color = isSelected
                        ? isPromoter
                          ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                          : isDetractor
                          ? 'bg-red-500 text-white font-bold ring-2 ring-red-300'
                          : 'bg-amber-500 text-white font-bold ring-2 ring-amber-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

                      return (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setNpsScore(num)}
                          className={`h-8 rounded text-xs transition-all flex items-center justify-center ${color}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Not likely</span>
                    <span>Extremely likely</span>
                  </div>
                </div>

                {/* 4. Guest Comments */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Tell us what you liked or how we can do better:
                  </label>
                  <textarea
                    aria-label="Guest dining comments and feedback"
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Loved the Butter Chicken, music was great!"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                {/* 5. Optional Guest Details */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Your Name (Optional)</label>
                    <Input
                      placeholder="e.g. Rohan"
                      className="text-xs"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Mobile (For loyalty)</label>
                    <Input
                      placeholder="+91..."
                      className="text-xs"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 rounded-xl shadow-sm text-sm gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Submitting Review...' : 'Submit Feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* POST-SUBMISSION EXPERIENCE */
          <Card className="border-slate-200 shadow-md rounded-2xl bg-white text-center p-6 space-y-6">
            {overallRating >= 4 ? (
              /* POSITIVE RATING -> GOOGLE REVIEW PROMPT */
              <div className="space-y-5">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Heart className="h-8 w-8 fill-emerald-500 text-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">Thank you for the love!</h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    We are thrilled that you enjoyed dining with us at {outlet}.
                  </p>
                </div>

                {/* Google Review Call to Action Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 text-center space-y-3 shadow-sm">
                  <div className="flex justify-center items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    Would you mind sharing your 5-star experience on Google? It takes only 10 seconds and helps local food lovers discover us!
                  </p>

                  <Button
                    onClick={handleGoogleReviewRedirect}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-4 rounded-xl shadow-md gap-2 font-semibold"
                  >
                    <ExternalLink className="h-4 w-4" /> Post Review on Google Maps
                  </Button>
                </div>
              </div>
            ) : (
              /* LOW RATING -> SINCERE APOLOGY & ESCALATION */
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                  <ShieldCheck className="h-8 w-8 text-amber-700" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">We Value Your Feedback</h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    We sincerely apologize that our food or service fell short of your expectations today.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto bg-slate-50 p-3 rounded-lg border border-slate-100">
                    Our General Manager has been directly notified of your feedback and will look into this immediately to ensure your next visit is flawless.
                  </p>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-xs text-slate-500"
              onClick={() => {
                setSubmitted(false);
                setComments('');
              }}
            >
              Submit Another Review
            </Button>
          </Card>
        )}

        {/* Footer branding */}
        <p className="text-center text-[11px] text-slate-400">
          Powered by RestoDesk Guest Experience Engine
        </p>
      </div>
    </div>
  );
}
