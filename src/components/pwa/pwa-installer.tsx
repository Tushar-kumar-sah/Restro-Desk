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
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
      {/* Offline Alert Pill */}
      {!isOnline ? (
        <Badge
          variant="outline"
          className="h-8 bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 font-semibold gap-1.5 px-2.5 rounded-xl animate-pulse text-xs"
        >
          <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Offline Mode</span>
          <span>({queueLength})</span>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="ml-1 p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900 rounded cursor-pointer"
            title="Retry Sync"
          >
            <RefreshCw className={`h-3 w-3 text-amber-700 dark:text-amber-300 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </Badge>
      ) : queueLength > 0 ? (
        <Badge
          variant="outline"
          className="h-8 bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 font-semibold gap-1.5 px-2.5 rounded-xl cursor-pointer text-xs"
          onClick={handleManualSync}
        >
          <RefreshCw className={`h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync {queueLength}</span>
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="h-8 bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-medium gap-1.5 px-2.5 rounded-xl hidden sm:inline-flex text-xs shadow-2xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="hidden xl:inline">Cloud Sync Active</span>
          <span className="xl:hidden inline">Synced</span>
        </Badge>
      )}

      {/* PWA Install Button if eligible */}
      {deferredPrompt && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs font-semibold border-orange-200 text-orange-700 bg-orange-50/80 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/60 gap-1.5 px-2.5 rounded-xl hidden sm:inline-flex shadow-2xs cursor-pointer"
          onClick={handleInstallApp}
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>Install App</span>
        </Button>
      )}
    </div>
  );
}
export default PwaConnectivityBar;
