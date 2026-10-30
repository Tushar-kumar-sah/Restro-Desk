'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Clock,
  CheckCircle2,
  Receipt,
  Calculator,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTotal: number;
  onSettled: (settleData: any) => void;
  customer?: any;
}

export function SettleModal({ isOpen, onClose, orderTotal, onSettled, customer }: SettleModalProps) {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'UPI_QR' | 'WALLET' | 'DUE_CREDIT' | 'SPLIT'>('CASH');
  const [tenderedCash, setTenderedCash] = useState<number>(orderTotal);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick tender suggestions
  const tenderPresets = [
    orderTotal,
    Math.ceil(orderTotal / 100) * 100,
    500,
    1000,
    2000,
  ].filter((amt, idx, arr) => amt >= orderTotal && arr.indexOf(amt) === idx);

  const changeDue = Math.max(0, tenderedCash - orderTotal);

  const handleConfirmPayment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSettled({
        paymentMethod: method,
        amountPaid: orderTotal,
        tenderedCash: method === 'CASH' ? tenderedCash : orderTotal,
        changeDue: method === 'CASH' ? changeDue : 0,
        referenceNumber: referenceNumber || (method === 'UPI_QR' ? `UPI-${Date.now().toString().slice(-6)}` : null),
      });
      onClose();
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:rounded-2xl p-0 overflow-hidden border shadow-2xl">
        <DialogHeader className="p-4 pr-12 border-b bg-muted/20">
          <DialogTitle className="text-sm sm:text-base font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-600 shrink-0" />
              Settle &amp; Close Bill
            </span>
            <span className="text-base sm:text-lg font-black text-orange-600">
              {formatCurrency(orderTotal)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          {/* Payment Method Tabs */}
          <Tabs value={method} onValueChange={(val: any) => setMethod(val)}>
            <TabsList className="grid grid-cols-4 h-11 w-full p-1 bg-muted rounded-xl">
              <TabsTrigger value="CASH" className="text-[11px] sm:text-xs font-semibold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2">
                <Banknote className="h-3.5 w-3.5" />
                Cash
              </TabsTrigger>
              <TabsTrigger value="UPI_QR" className="text-[11px] sm:text-xs font-semibold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2">
                <QrCode className="h-3.5 w-3.5" />
                UPI QR
              </TabsTrigger>
              <TabsTrigger value="CARD" className="text-[11px] sm:text-xs font-semibold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2">
                <CreditCard className="h-3.5 w-3.5" />
                Card
              </TabsTrigger>
              <TabsTrigger value="WALLET" className="text-[11px] sm:text-xs font-semibold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2">
                <Wallet className="h-3.5 w-3.5" />
                Wallet
              </TabsTrigger>
            </TabsList>

            {/* CASH TAB */}
            <TabsContent value="CASH" className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label>Quick Tender Buttons</Label>
                <div className="flex flex-wrap gap-2">
                  {tenderPresets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={tenderedCash === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTenderedCash(preset)}
                      className="rounded-lg text-xs font-bold"
                    >
                      {preset === orderTotal ? 'Exact ' : ''}₹{preset}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tendered-cash">Cash Received from Customer</Label>
                <div className="relative">
                  <Input
                    id="tendered-cash"
                    type="number"
                    value={tenderedCash}
                    onChange={(e) => setTenderedCash(parseFloat(e.target.value) || 0)}
                    className="h-11 text-base font-bold pl-8"
                  />
                  <span className="absolute left-3 top-3 text-sm font-bold text-muted-foreground">
                    ₹
                  </span>
                </div>
              </div>

              {/* Change Due Callout */}
              <div className="rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-orange-900 dark:text-orange-200 block">
                    Change to Return
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Cash tendered minus bill total
                  </span>
                </div>
                <div className="text-xl font-black text-orange-600 dark:text-orange-400">
                  {formatCurrency(changeDue)}
                </div>
              </div>
            </TabsContent>

            {/* UPI QR TAB */}
            <TabsContent value="UPI_QR" className="space-y-4 pt-3 text-center">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card space-y-2">
                {/* Dynamic SVG QR Visual */}
                <div className="p-3 bg-white rounded-xl shadow-xs border">
                  <svg className="h-36 w-36" viewBox="0 0 100 100" fill="currentColor">
                    <rect width="100" height="100" fill="#ffffff" />
                    <rect x="10" y="10" width="25" height="25" fill="#000000" />
                    <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="18" width="9" height="9" fill="#000000" />
                    <rect x="65" y="10" width="25" height="25" fill="#000000" />
                    <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="73" y="18" width="9" height="9" fill="#000000" />
                    <rect x="10" y="65" width="25" height="25" fill="#000000" />
                    <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="73" width="9" height="9" fill="#000000" />
                    <rect x="45" y="15" width="10" height="10" fill="#ea580c" />
                    <rect x="45" y="45" width="10" height="10" fill="#000000" />
                    <rect x="60" y="45" width="10" height="10" fill="#000000" />
                    <rect x="45" y="65" width="10" height="10" fill="#000000" />
                    <rect x="65" y="65" width="25" height="25" fill="#000000" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-foreground">
                  Scan to Pay: <strong className="text-orange-600">{formatCurrency(orderTotal)}</strong>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  GPay • PhonePe • Paytm • BHIM UPI
                </div>
              </div>

              <div className="space-y-1 text-left">
                <Label htmlFor="upi-ref">UPI UTR / Reference No. (Optional)</Label>
                <Input
                  id="upi-ref"
                  placeholder="e.g. 429381029384"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* CARD TAB */}
            <TabsContent value="CARD" className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="card-ref">Card Approval Code / Transaction Ref</Label>
                <Input
                  id="card-ref"
                  placeholder="e.g. TXN-948271"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
                <span className="text-[11px] text-muted-foreground">
                  Swipe or tap card on PineLabs / EDC POS machine.
                </span>
              </div>
            </TabsContent>

            {/* WALLET TAB */}
            <TabsContent value="WALLET" className="space-y-4 pt-3">
              <div className="rounded-xl border p-3.5 space-y-2 bg-muted/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold">{customer?.name || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Wallet Balance:</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(customer?.walletBalance || 0)}
                  </span>
                </div>
              </div>

              {(!customer || customer.walletBalance < orderTotal) && (
                <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200">
                  Customer has insufficient balance for full bill payment. You can split or choose Cash.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>

          <Button
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {isSubmitting ? 'Recording Payment...' : `Settle ${formatCurrency(orderTotal)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
