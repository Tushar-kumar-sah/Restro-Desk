'use client';

import React, { useRef } from 'react';
import { ChefHat, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/formatters';

interface KOTPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  kotData: any;
}

export function KOTPrintModal({ isOpen, onClose, kotData }: KOTPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!kotData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:rounded-2xl p-0 overflow-hidden border shadow-2xl">
        <DialogHeader className="p-4 border-b bg-muted/20">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-emerald-600" />
            Kitchen Order Ticket (KOT) Preview
          </DialogTitle>
        </DialogHeader>

        {/* Printable KOT Paper */}
        <div className="p-6 bg-slate-100 dark:bg-zinc-950 flex justify-center max-h-[60vh] overflow-y-auto">
          <div
            ref={printRef}
            className="bg-white text-black p-4 shadow-md font-mono text-xs leading-relaxed border-2 border-black w-[260px] print-only"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-2 mb-2">
              <div className="font-extrabold text-sm uppercase">*** KITCHEN TICKET ***</div>
              <div className="font-bold text-xs uppercase">{kotData.station || 'GENERAL KITCHEN'}</div>
            </div>

            {/* KOT Metadata */}
            <div className="space-y-1 border-b border-black pb-2 mb-2 text-[11px]">
              <div className="flex justify-between">
                <span>KOT: <strong className="text-sm">{kotData.kotNumber || 'KOT-201'}</strong></span>
                <span>Table: <strong className="text-base font-black">{kotData.tableNumber || 'T-04'}</strong></span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Order: {kotData.orderNumber}</span>
                <span>Type: <strong>{kotData.orderType || 'DINE_IN'}</strong></span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Captain: {kotData.waiter || 'Karthik Gowda'}</span>
                <span>Time: {formatTime(new Date())}</span>
              </div>
            </div>

            {/* Items with Bold Quantities */}
            <div className="border-b-2 border-black pb-2 mb-2 space-y-2">
              {(kotData.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-xs block">{item.name}</span>
                    {item.variantName && (
                      <span className="text-[10px] text-gray-700 block">[{item.variantName}]</span>
                    )}
                    {item.notes && (
                      <span className="text-[10px] text-red-600 font-semibold block uppercase">
                        *** NOTE: {item.notes} ***
                      </span>
                    )}
                  </div>
                  <span className="text-base font-black border border-black px-1.5 py-0.5 rounded">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] font-bold">
              KOT GENERATED • RESTODESK
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-background border-t flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print KOT Slip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
