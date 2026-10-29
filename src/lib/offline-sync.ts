/**
 * RestoDesk Offline Billing Queue & Synchronization Manager
 * Allows cashiers to bill customers without interruption when internet connectivity drops.
 * Queues bills locally in localStorage and automatically drains to server upon reconnection.
 */

export interface QueuedOfflineBill {
  localId: string;
  orderType: string;
  tableId?: string;
  items: Array<{
    itemId: string;
    name: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  timestamp: string;
  status: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorDetails?: string;
}

const STORAGE_KEY = 'restodesk_offline_billing_queue';

class OfflineBillingManager {
  private listeners: Array<(isOnline: boolean, queueLength: number) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }

  public getQueue(): QueuedOfflineBill[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public enqueueBill(bill: Omit<QueuedOfflineBill, 'localId' | 'timestamp' | 'status'>): QueuedOfflineBill {
    const queue = this.getQueue();
    const queuedBill: QueuedOfflineBill = {
      ...bill,
      localId: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: 'PENDING_SYNC',
    };

    queue.push(queuedBill);
    this.saveQueue(queue);
    this.notifyListeners();

    // If online, trigger sync immediately
    if (this.isOnline()) {
      this.syncPendingBills();
    }

    return queuedBill;
  }

  public async syncPendingBills(): Promise<{ synced: number; failed: number }> {
    const queue = this.getQueue();
    const pending = queue.filter((b) => b.status === 'PENDING_SYNC' || b.status === 'FAILED');

    if (pending.length === 0) return { synced: 0, failed: 0 };

    let syncedCount = 0;
    let failedCount = 0;

    for (const bill of pending) {
      bill.status = 'SYNCING';
      this.saveQueue(queue);

      try {
        const res = await fetch('/api/pos/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderType: bill.orderType,
            tableId: bill.tableId,
            items: bill.items.map((it) => ({
              itemId: it.itemId,
              quantity: it.qty,
              unitPrice: it.price,
            })),
            paidAmount: bill.paidAmount,
            paymentMethod: bill.paymentMethod,
            notes: `Offline synced bill created at ${bill.timestamp}`,
          }),
        });

        if (res.ok) {
          bill.status = 'SYNCED';
          syncedCount++;
        } else {
          bill.status = 'FAILED';
          bill.errorDetails = `HTTP ${res.status}`;
          failedCount++;
        }
      } catch (err: any) {
        bill.status = 'FAILED';
        bill.errorDetails = err.message || 'Network error';
        failedCount++;
      }
    }

    // Retain only un-synced bills in storage
    const remaining = queue.filter((b) => b.status !== 'SYNCED');
    this.saveQueue(remaining);
    this.notifyListeners();

    return { synced: syncedCount, failed: failedCount };
  }

  public subscribe(callback: (isOnline: boolean, queueLength: number) => void): () => void {
    this.listeners.push(callback);
    callback(this.isOnline(), this.getQueue().length);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private handleNetworkChange(online: boolean) {
    this.notifyListeners();
    if (online) {
      this.syncPendingBills();
    }
  }

  private saveQueue(queue: QueuedOfflineBill[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  }

  private notifyListeners() {
    const online = this.isOnline();
    const len = this.getQueue().length;
    this.listeners.forEach((cb) => cb(online, len));
  }
}

export const offlineBilling = new OfflineBillingManager();
export default offlineBilling;
