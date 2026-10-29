'use client';

import React, { useRef } from 'react';
import { Printer, X, Download, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

interface BillPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export function BillPrintModal({ isOpen, onClose, order }: BillPrintModalProps) {
  const { selectedOutlet } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const paperWidth = selectedOutlet?.printerPaperWidth || '80mm';

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    toast.success(`Digital e-bill sent via WhatsApp to ${order.customerPhone || 'customer'}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:rounded-2xl p-0 overflow-hidden border shadow-2xl">
        <DialogHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Printer className="h-4 w-4 text-orange-600" />
              Thermal Bill Receipt Preview
            </DialogTitle>
            <span className="text-xs text-muted-foreground">
              Paper Mode: <strong>{paperWidth} Thermal</strong>
            </span>
          </div>
        </DialogHeader>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-slate-100 dark:bg-zinc-950 flex justify-center max-h-[65vh] overflow-y-auto">
          <div
            ref={printRef}
            className={`bg-white text-black p-4 shadow-md font-mono text-xs leading-relaxed border border-dashed border-gray-300 print-only ${
              paperWidth === '58mm' ? 'thermal-receipt-58mm w-[220px]' : 'thermal-receipt-80mm w-[300px]'
            }`}
          >
            {/* Header */}
            <div className="text-center space-y-0.5 border-b border-black pb-2 mb-2">
              <div className="font-bold text-sm tracking-wide uppercase">RestoDesk</div>
              <div className="font-bold text-xs uppercase">{selectedOutlet?.name || 'Indiranagar Flagship'}</div>
              <div className="text-[10px] text-gray-700 leading-tight">
                {selectedOutlet?.address || '100ft Road, HAL 2nd Stage, Indiranagar'}
              </div>
              <div className="text-[10px]">Ph: {selectedOutlet?.phone || '+91 80 4123 4567'}</div>
              {selectedOutlet?.gstin && (
                <div className="text-[10px] font-bold">GSTIN: {selectedOutlet.gstin}</div>
              )}
              {selectedOutlet?.fssaiNumber && (
                <div className="text-[10px]">FSSAI Lic: {selectedOutlet.fssaiNumber}</div>
              )}
            </div>

            {/* Bill Details */}
            <div className="space-y-0.5 border-b border-dashed border-black pb-2 mb-2 text-[11px]">
              <div className="flex justify-between">
                <span>Bill No: <strong>{order.orderNumber}</strong></span>
                <span>Type: <strong>{order.orderType}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>Table: <strong>{order.tableNumber || 'Takeaway'}</strong></span>
                <span>Date: {formatDateTime(order.createdAt || new Date())}</span>
              </div>
              {order.customerName && order.customerName !== 'Walk-in Guest' && (
                <div className="flex justify-between text-[10px]">
                  <span>Guest: {order.customerName}</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border-b border-black pb-2 mb-2">
              <div className="flex justify-between font-bold text-[11px] border-b border-black pb-1 mb-1">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/6 text-center">QTY</span>
                <span className="w-1/6 text-right">RATE</span>
                <span className="w-1/6 text-right">AMT</span>
              </div>

              <div className="space-y-1 text-[11px]">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="w-1/2 truncate font-medium">
                      {item.name}
                      {item.variantName && <span className="text-[9px] block">({item.variantName})</span>}
                    </span>
                    <span className="w-1/6 text-center">{item.quantity}</span>
                    <span className="w-1/6 text-right">{item.unitPrice}</span>
                    <span className="w-1/6 text-right font-bold">{item.totalPrice || item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Calculation */}
            <div className="space-y-1 border-b border-dashed border-black pb-2 mb-2 text-[11px]">
              <div className="flex justify-between">
                <span>Sub Total:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-gray-800">
                  <span>Discount ({order.discountReason || 'Special'}):</span>
                  <span>- {formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              {/* GST Split */}
              <div className="flex justify-between">
                <span>CGST @ 2.5%:</span>
                <span>{formatCurrency(order.cgstAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST @ 2.5%:</span>
                <span>{formatCurrency(order.sgstAmount)}</span>
              </div>

              {order.packagingCharge > 0 && (
                <div className="flex justify-between">
                  <span>Packaging Charge:</span>
                  <span>{formatCurrency(order.packagingCharge)}</span>
                </div>
              )}

              {order.serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge:</span>
                  <span>{formatCurrency(order.serviceCharge)}</span>
                </div>
              )}

              {order.roundOff !== 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Round Off:</span>
                  <span>{order.roundOff > 0 ? `+${order.roundOff}` : order.roundOff}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
                <span>NET PAYABLE:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Mode */}
            <div className="border-b border-black pb-2 mb-2 text-[10px]">
              <div className="flex justify-between font-bold">
                <span>PAID VIA {order.paymentMethod || 'CASH'}:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.changeDue > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Cash Tendered: {formatCurrency(order.tenderedCash)}</span>
                  <span>Change Given: {formatCurrency(order.changeDue)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center space-y-1 pt-1 text-[10px]">
              <div className="font-bold">Thank You! Please Visit Again.</div>
              <div className="text-[9px] text-gray-600">
                Feedback &amp; Loyalty: Scan QR or visit restodesk.in
              </div>
              <div className="text-[8px] text-gray-500 pt-1">
                Powered by RestoDesk POS Operating System
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="p-4 bg-background border-t flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendWhatsApp}
              className="text-xs rounded-xl"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
              WhatsApp Bill
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
              Close
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print Thermal Bill
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
