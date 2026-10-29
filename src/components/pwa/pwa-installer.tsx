'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { offlineBilling } from '@/lib/offline-sync';
import { toast } from 'sonner';

export function PwaConnectivityBar() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA offline capabilities
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('RestoDesk Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
    }

    // 2. Subscribe to offline billing queue
    const unsubscribe = offlineBilling.subscribe((online, qLen) => {
      setIsOnline(online);
      setQueueLength(qLen);
    });

    // 3. Listen for PWA install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await offlineBilling.syncPendingBills();
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} offline bill(s) to server!`);
      } else if (result.failed > 0) {
        toast.error(`Sync failed for ${result.failed} bill(s). Check connection.`);
      } else {
        toast.info('No pending offline bills to sync.');
      }
    } catch {
      toast.error('Sync error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('RestoDesk app installed successfully!');
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Offline Alert Pill */}
      {!isOnline ? (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-800 border-amber-300 font-semibold gap-1.5 py-1 px-2.5 animate-pulse"
        >
          <WifiOff className="h-3 w-3 text-amber-600" />
          <span>Offline Mode ({queueLength} Queued)</span>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="ml-1 p-0.5 hover:bg-amber-100 rounded"
            title="Retry Sync"
          >
            <RefreshCw className={`h-3 w-3 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </Badge>
      ) : queueLength > 0 ? (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-800 border-blue-300 font-semibold gap-1.5 py-1 px-2.5 cursor-pointer"
          onClick={handleManualSync}
        >
          <RefreshCw className={`h-3 w-3 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync {queueLength} Bill(s)</span>
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium gap-1 py-0.5 px-2 hidden sm:inline-flex"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Cloud Sync Active</span>
        </Badge>
      )}

      {/* PWA Install Button if eligible */}
      {deferredPrompt && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 gap-1 px-2"
          onClick={handleInstallApp}
        >
          <Download className="h-3 w-3" /> Install App
        </Button>
      )}
    </div>
  );
}
export default PwaConnectivityBar;
