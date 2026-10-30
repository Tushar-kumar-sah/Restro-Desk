'use client';

import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Play,
  Check,
  XCircle,
  RefreshCw,
  Flame,
  Utensils,
  Wine,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { soundAlerts } from '@/lib/audio-alerts';
import { formatTime } from '@/lib/formatters';
import { toast } from 'sonner';
import { KOTPrintModal } from '@/components/pos/kot-print-modal';

export default function KitchenDisplayPage() {
  const [kots, setKots] = useState<any[]>([]);
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Cancel Item Dialog
  const [cancellingItemData, setCancellingItemData] = useState<{ kotId: string; itemId: string; itemName: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('Ingredient unavailable');
  const [selectedKotForPrint, setSelectedKotForPrint] = useState<any | null>(null);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll KDS every 5 seconds for live tickets
  const fetchKDS = async (silent = false) => {
    try {
      const res = await fetch('/api/kds');
      const data = await res.json();
      if (data.success) {
        // If ticket count increased, trigger new KOT chime!
        if (data.kots.length > kots.length && kots.length > 0) {
          soundAlerts.playNewKotChime();
          toast.info('New KOT ticket received in kitchen!');
        }
        setKots(data.kots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKDS();
    const interval = setInterval(() => fetchKDS(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    soundAlerts.isMuted = !isMuted;
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Kitchen sound alerts unmuted' : 'Kitchen sound alerts muted');
  };

  // Update KOT Status (NEW -> PREPARING -> READY -> SERVED)
  const handleUpdateStatus = async (kotId: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/kds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kotId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        if (nextStatus === 'READY') soundAlerts.playReadyPing();
        toast.success(`KOT updated to ${nextStatus}`);
        fetchKDS(true);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Toggle individual item checklist
  const handleToggleItemCheck = async (kotId: string, itemId: string, currentItemStatus: string) => {
    const nextItemStatus = currentItemStatus === 'READY' ? 'COOKING' : 'READY';
    try {
      await fetch('/api/kds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kotId, itemId, itemStatus: nextItemStatus }),
      });
      fetchKDS(true);
    } catch (err) {}
  };

  // Cancel item on KOT
  const handleConfirmCancelItem = async () => {
    if (!cancellingItemData) return;
    try {
      const res = await fetch(`/api/kds/${cancellingItemData.kotId}/cancel-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: cancellingItemData.itemId,
          reason: cancelReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setCancellingItemData(null);
        fetchKDS(true);
      }
    } catch (err) {
      toast.error('Failed to cancel item');
    }
  };

  // Reprint KOT Slip
  const handleReprintKOT = async (kotId: string) => {
    try {
      const res = await fetch(`/api/kds/${kotId}/reprint`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        const targetKot = kots.find((k) => k.id === kotId);
        if (targetKot) {
          setSelectedKotForPrint(targetKot);
        }
      }
    } catch (err) {
      toast.error('Reprint failed');
    }
  };

  // Filter KOTs
  const filteredKots = kots.filter((kot) => {
    const matchesStation =
      stationFilter === 'ALL' || kot.station === stationFilter || kot.station === 'GENERAL';
    const matchesStatus = statusFilter === 'ALL' || kot.status === statusFilter;
    return matchesStation && matchesStatus;
  });

  const getTicketAge = (createdAt: any) => {
    const elapsedSecs = Math.max(0, Math.floor((currentTime - new Date(createdAt).getTime()) / 1000));
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    return {
      formatted: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      mins,
      isDelayed: mins >= 20,
      isWarning: mins >= 10 && mins < 20,
    };
  };

  return (
    <AppShell>
      {/* KDS Header & Station Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-emerald-600" />
            Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live kitchen routing by station, automated delay highlights, and sound alerts.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Mute Audio Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className={`rounded-xl text-xs font-semibold ${
              isMuted ? 'text-red-600 border-red-300' : 'text-emerald-600'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 mr-1.5" /> Muted
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-1.5" /> Chimes Active
              </>
            )}
          </Button>

          {/* Test Chime */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => soundAlerts.playNewKotChime()}
            className="rounded-xl text-xs text-muted-foreground"
            title="Test Audio Chime"
          >
            Test Chime
          </Button>

          {/* Refresh KDS */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchKDS()}
            className="rounded-xl text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Sync Tickets
          </Button>
        </div>
      </div>

      {/* Station Selector Bar */}
      <Card className="rounded-2xl shadow-xs">
        <CardContent className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Station Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Stations', icon: ChefHat },
              { id: 'VEG', label: 'Veg Kitchen', icon: Utensils },
              { id: 'NON_VEG', label: 'Non-Veg Wok', icon: Flame },
              { id: 'TANDOOR', label: 'Tandoor & Breads', icon: Flame },
              { id: 'BAR', label: 'Bar & Beverages', icon: Wine },
            ].map((st) => {
              const Icon = st.icon;
              const isActive = stationFilter === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setStationFilter(st.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Column Filter */}
          <div className="flex items-center rounded-xl bg-muted p-0.5">
            {['ALL', 'NEW', 'PREPARING', 'READY'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  statusFilter === st
                    ? 'bg-background shadow-xs text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'ALL' ? 'All Active' : st}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KDS Live Ticket Cards Grid */}
      <div className="flex-1">
        {filteredKots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-card rounded-3xl border">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2 opacity-80" />
            <h3 className="text-base font-bold text-foreground">Kitchen is All Caught Up!</h3>
            <p className="text-xs text-muted-foreground">
              No pending orders in the {stationFilter} station queue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredKots.map((kot) => {
              const age = getTicketAge(kot.createdAt);
              const isPreparing = kot.status === 'PREPARING';
              const isReady = kot.status === 'READY';
              const isNew = kot.status === 'NEW';

              return (
                <Card
                  key={kot.id}
                  className={`rounded-2xl border-2 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300 ${
                    age.isDelayed
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 ring-2 ring-red-500/20 animate-pulse'
                      : age.isWarning
                      ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20'
                      : 'border-border bg-card'
                  }`}
                >
                  {/* Card Header */}
                  <CardHeader
                    className={`p-3.5 border-b flex flex-row items-center justify-between ${
                      age.isDelayed
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-950 dark:text-red-200'
                        : age.isWarning
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200'
                        : 'bg-muted/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm">{kot.kotNumber}</span>
                        <Badge
                          variant={
                            kot.station === 'VEG'
                              ? 'success'
                              : kot.station === 'NON_VEG'
                              ? 'destructive'
                              : 'brand'
                          }
                          className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0"
                        >
                          {kot.station}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        Table: <strong className="text-foreground text-xs">{kot.tableNumber}</strong> • {kot.orderType}
                      </div>
                    </div>

                    {/* Timer Badge */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono font-black text-xs ${
                        age.isDelayed
                          ? 'bg-red-600 text-white'
                          : age.isWarning
                          ? 'bg-amber-600 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{age.formatted}</span>
                    </div>
                  </CardHeader>

                  {/* Card Items Checklist */}
                  <CardContent className="p-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-56">
                    {(kot.items || []).map((item: any) => {
                      const isItemReady = item.status === 'READY';
                      const isItemCancelled = item.status === 'CANCELLED';

                      return (
                        <div
                          key={item.id}
                          className={`flex items-start justify-between gap-2 p-1.5 rounded-lg transition-colors ${
                            isItemReady ? 'bg-muted/40 opacity-60' : 'hover:bg-muted/30'
                          } ${isItemCancelled ? 'line-through opacity-40 bg-red-50 dark:bg-red-950/30' : ''}`}
                        >
                          {/* Item Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleItemCheck(kot.id, item.id, item.status)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border mt-0.5 transition-colors ${
                              isItemReady
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-input hover:border-emerald-600'
                            }`}
                          >
                            {isItemReady && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>

                          {/* Item Name & Cooking Note */}
                          <div className="flex-1 text-xs">
                            <span
                              className={`font-bold block ${
                                isItemReady ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.notes && (
                              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block uppercase mt-0.5">
                                Note: {item.notes}
                              </span>
                            )}
                          </div>

                          {/* Quantity & Cancel Button */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-black text-sm px-1.5 py-0.5 rounded bg-muted border">
                              x{item.quantity}
                            </span>
                            {!isItemCancelled && !isItemReady && (
                              <button
                                onClick={() =>
                                  setCancellingItemData({
                                    kotId: kot.id,
                                    itemId: item.id,
                                    itemName: item.name,
                                  })
                                }
                                className="text-muted-foreground hover:text-red-600 p-0.5"
                                title="Cancel this item"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>

                  {/* Card Action Controls Footer */}
                  <div className="p-3 border-t bg-muted/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Captain: {kot.waiter || 'Captain'}</span>
                      <button
                        onClick={() => handleReprintKOT(kot.id)}
                        className="hover:underline flex items-center gap-1 text-orange-600 font-semibold"
                      >
                        <Printer className="h-3 w-3" /> Reprint
                      </button>
                    </div>

                    {/* Progression Workflow Button */}
                    {isNew && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(kot.id, 'PREPARING')}
                        className="w-full h-9 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Start Cooking
                      </Button>
                    )}

                    {isPreparing && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(kot.id, 'READY')}
                        className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Mark All Ready
                      </Button>
                    )}

                    {isReady && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(kot.id, 'SERVED')}
                        className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Mark Served to Table
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Item Dialog */}
      <Dialog
        open={!!cancellingItemData}
        onOpenChange={(open) => !open && setCancellingItemData(null)}
      >
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel KOT Item</DialogTitle>
            <DialogDescription>
              Cancel <strong>{cancellingItemData?.itemName}</strong> from ticket.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Chef / Kitchen Reason</Label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold outline-none"
              >
                <option value="Ingredient unavailable">Ingredient unavailable</option>
                <option value="Guest cancelled dish">Guest cancelled dish</option>
                <option value="Preparation error / Spoilage">Preparation error / Spoilage</option>
                <option value="Wrong punch on KOT">Wrong punch on KOT</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setCancellingItemData(null)}>
                Keep Item
              </Button>
              <Button
                onClick={handleConfirmCancelItem}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* KOT Slip Thermal Print / Preview Modal */}
      <KOTPrintModal
        isOpen={!!selectedKotForPrint}
        onClose={() => setSelectedKotForPrint(null)}
        kotData={selectedKotForPrint}
      />
    </AppShell>
  );
}
