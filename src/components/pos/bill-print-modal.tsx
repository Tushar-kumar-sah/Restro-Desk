'use client';

import React, { useRef, useState } from 'react';
import { Printer, FileText, Receipt } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, numberToWords } from '@/lib/formatters';
import { useAppStore } from '@/store/useAppStore';
import { printThermalReceipt } from '@/lib/printer';

interface BillPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export function BillPrintModal({ isOpen, onClose, order }: BillPrintModalProps) {
  const { selectedOutlet } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');

  if (!order) return null;

  const paperWidth = selectedOutlet?.printerPaperWidth || '80mm';

  const handlePrint = () => {
    if (printFormat === 'a4') {
      printThermalReceipt(printRef.current, {
        paperWidth: 'A4',
        title: `Tax_Invoice_${order.orderNumber || 'A4'}`,
      });
    } else {
      printThermalReceipt(printRef.current, {
        paperWidth: paperWidth as '58mm' | '80mm',
        title: `Tax_Invoice_${order.orderNumber || 'Receipt'}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`w-full flex flex-col p-0 overflow-hidden border shadow-2xl rounded-2xl transition-all duration-200 print:max-w-none print:max-h-none print:overflow-visible print:border-none print:shadow-none print:bg-white print:p-0 ${
          printFormat === 'a4'
            ? 'max-w-3xl sm:max-w-4xl h-[92vh] max-h-[920px]'
            : 'max-w-md sm:max-w-xl h-[90vh] max-h-[820px]'
        }`}
      >
        {/* Header with Format Switcher */}
        <DialogHeader className="px-4 sm:px-5 py-3 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pr-12 sm:pr-16 no-print shrink-0">
          <div className="space-y-0.5 text-left">
            <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2 tracking-tight">
              <Printer className="h-4 w-4 text-orange-600 shrink-0" />
              Bill &amp; Invoice Preview
            </DialogTitle>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Order #{order.orderNumber} • Table {order.tableNumber || 'Takeaway'}
            </p>
          </div>

          {/* Toggle: 80mm Thermal vs Full A4 Tax Invoice */}
          <div className="flex items-center gap-1 bg-muted/80 p-0.5 sm:p-1 rounded-xl border shrink-0">
            <button
              type="button"
              onClick={() => setPrintFormat('thermal')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all ${
                printFormat === 'thermal'
                  ? 'bg-white dark:bg-zinc-800 text-orange-600 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              80mm Thermal
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('a4')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all ${
                printFormat === 'a4'
                  ? 'bg-white dark:bg-zinc-800 text-orange-600 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              A4 Full Page
            </button>
          </div>
        </DialogHeader>

        {/* Printable Area with full-view responsive height */}
        <div className="py-6 px-4 bg-slate-100 dark:bg-zinc-950 flex flex-col items-center flex-1 overflow-y-auto min-h-0 print:max-h-none print:overflow-visible print:p-0 print:bg-white">
          {printFormat === 'thermal' ? (
            /* ========================================================= */
            /* 80mm / 58mm THERMAL RECEIPT                               */
            /* ========================================================= */
            <div
              ref={printRef}
              className={`bg-white text-black p-4 shadow-xl font-mono text-[11px] leading-snug border border-dashed border-gray-300 rounded-sm print-only mb-10 ${
                paperWidth === '58mm'
                  ? 'thermal-receipt-58mm w-[230px]'
                  : 'thermal-receipt-80mm w-[320px] max-w-full'
              }`}
            >
              {/* Header */}
              <div className="text-center space-y-0.5 border-b border-black pb-2 mb-2">
                <div className="font-black text-sm tracking-wide uppercase">RESTODESK</div>
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
              <div className="space-y-0.5 border-b border-dashed border-black pb-2 mb-2 text-[10.5px]">
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
                <div className="flex justify-between font-bold text-[10.5px] border-b border-black pb-1 mb-1">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/6 text-center">QTY</span>
                  <span className="w-1/6 text-right">RATE</span>
                  <span className="w-1/6 text-right">AMT</span>
                </div>

                <div className="space-y-1 text-[10.5px]">
                  {(order.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start">
                      <span className="w-1/2 pr-1 truncate font-medium">
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
              <div className="space-y-0.5 border-b border-dashed border-black pb-2 mb-2 text-[10.5px]">
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
                <div className="flex justify-between font-black text-sm border-t border-black pt-1 mt-1">
                  <span>NET PAYABLE:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="border-b border-black pb-1.5 mb-2 text-[10px]">
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
              <div className="text-center space-y-0.5 pt-0.5 text-[10px]">
                <div className="font-bold">Thank You! Please Visit Again.</div>
                <div className="text-[9px] text-gray-600">
                  Feedback &amp; Loyalty: Scan QR or visit restodesk.in
                </div>
                <div className="text-[8px] text-gray-500 pt-0.5">
                  Powered by RestoDesk POS Operating System
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* FULL PAGE A4 TAX INVOICE (INDIAN GST STANDARD)            */
            /* ========================================================= */
            <div
              ref={printRef}
              className="bg-white text-black p-6 sm:p-8 shadow-xl border w-full max-w-[800px] text-xs leading-normal print-only rounded-sm"
              style={{ minHeight: '1000px' }}
            >
              {/* Top Tax Invoice Banner */}
              <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-wide text-orange-600 uppercase">
                    RestoDesk
                  </h1>
                  <h2 className="font-bold text-sm text-gray-900 uppercase">
                    {selectedOutlet?.name || 'Indiranagar Flagship'}
                  </h2>
                  <p className="text-gray-600 text-[11px] max-w-sm mt-0.5">
                    {selectedOutlet?.address || '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038'}
                  </p>
                  <p className="text-[11px] text-gray-700 mt-0.5">
                    Phone: {selectedOutlet?.phone || '+91 80 4123 4567'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-semibold text-gray-800 mt-1">
                    <span>GSTIN: {selectedOutlet?.gstin || '29AABCU9603R1ZM'}</span>
                    <span>FSSAI: {selectedOutlet?.fssaiNumber || '11223334000123'}</span>
                    <span>State: Karnataka (Code: 29)</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-neutral-900 text-white font-bold text-xs uppercase px-3 py-1 rounded">
                    Tax Invoice
                  </div>
                  <div className="mt-2 text-xs">
                    <p className="font-bold text-sm">Invoice #: {order.orderNumber}</p>
                    <p className="text-gray-600">Date: {formatDateTime(order.createdAt || new Date())}</p>
                    <p className="text-gray-600">Order Type: <strong className="text-black">{order.orderType}</strong></p>
                    <p className="text-gray-600">Table: <strong className="text-black">{order.tableNumber || 'Takeaway'}</strong></p>
                  </div>
                </div>
              </div>

              {/* Billed To / Customer Section */}
              <div className="bg-slate-50 border p-3 rounded-lg mb-4 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-700 uppercase text-[10px]">Billed To / Customer</div>
                  <div className="font-bold text-sm mt-0.5">{order.customerName || 'Walk-in Guest'}</div>
                  <div className="text-gray-600">{order.customerPhone || 'Counter Sale'}</div>
                </div>
                <div className="text-right text-xs">
                  <div>Place of Supply: <strong>Karnataka (29)</strong></div>
                  <div>SAC Code: <strong>9963 (Restaurant Services)</strong></div>
                  <div>Payment Status: <strong className="text-emerald-700">PAID VIA {order.paymentMethod || 'CASH'}</strong></div>
                </div>
              </div>

              {/* Full Items Table */}
              <table className="w-full border-collapse mb-4 text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-y border-black font-bold text-gray-800">
                    <th className="py-2 px-2 text-left w-10">#</th>
                    <th className="py-2 px-2 text-left">Item Description</th>
                    <th className="py-2 px-2 text-center w-16">HSN/SAC</th>
                    <th className="py-2 px-2 text-center w-14">Qty</th>
                    <th className="py-2 px-2 text-right w-20">Rate (₹)</th>
                    <th className="py-2 px-2 text-right w-24">Taxable (₹)</th>
                    <th className="py-2 px-2 text-right w-20">CGST (2.5%)</th>
                    <th className="py-2 px-2 text-right w-20">SGST (2.5%)</th>
                    <th className="py-2 px-2 text-right w-24">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item: any, idx: number) => {
                    const itemTotal = Number(item.totalPrice || item.subtotal || item.unitPrice * item.quantity);
                    const itemTaxable = Math.round((itemTotal / 1.05) * 100) / 100;
                    const itemCgst = Math.round(((itemTotal - itemTaxable) / 2) * 100) / 100;
                    const itemSgst = itemCgst;

                    return (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-2 px-2 text-gray-600">{idx + 1}</td>
                        <td className="py-2 px-2 font-medium">
                          {item.name}
                          {item.variantName && (
                            <span className="text-[10px] text-gray-500 block">({item.variantName})</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center text-gray-600">9963</td>
                        <td className="py-2 px-2 text-center font-bold">{item.quantity}</td>
                        <td className="py-2 px-2 text-right">{item.unitPrice}</td>
                        <td className="py-2 px-2 text-right font-mono">{formatCurrency(itemTaxable, false)}</td>
                        <td className="py-2 px-2 text-right font-mono text-gray-700">{formatCurrency(itemCgst, false)}</td>
                        <td className="py-2 px-2 text-right font-mono text-gray-700">{formatCurrency(itemSgst, false)}</td>
                        <td className="py-2 px-2 text-right font-bold font-mono">{formatCurrency(itemTotal, false)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals & Calculations Row */}
              <div className="flex justify-between items-start gap-6 border-t border-black pt-3 mb-6">
                <div className="flex-1 space-y-2">
                  <div className="p-3 bg-neutral-50 rounded border text-xs">
                    <span className="font-semibold text-gray-600 block text-[10px] uppercase">
                      Amount Chargeable (in words):
                    </span>
                    <strong className="text-sm text-gray-900 block mt-0.5">
                      {numberToWords(order.totalAmount)}
                    </strong>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded border text-[11px] text-gray-600">
                    <span className="font-bold text-gray-800 block text-[10px] uppercase mb-1">
                      Terms &amp; Conditions:
                    </span>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>GST collected on restaurant service at statutory 5% (2.5% CGST + 2.5% SGST).</li>
                      <li>Goods / Services once billed cannot be cancelled or refunded.</li>
                      <li>This is a computer generated tax invoice powered by RestoDesk.</li>
                    </ol>
                  </div>
                </div>

                {/* Right Totals Breakdown Box */}
                <div className="w-72 border rounded-lg p-3 bg-neutral-50 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub Total:</span>
                    <span className="font-mono font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>

                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount:</span>
                      <span>- {formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-700">
                    <span>CGST @ 2.5%:</span>
                    <span className="font-mono">{formatCurrency(order.cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>SGST @ 2.5%:</span>
                    <span className="font-mono">{formatCurrency(order.sgstAmount)}</span>
                  </div>

                  {order.packagingCharge > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Packaging Charge:</span>
                      <span className="font-mono">{formatCurrency(order.packagingCharge)}</span>
                    </div>
                  )}

                  {order.serviceCharge > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Service Charge:</span>
                      <span className="font-mono">{formatCurrency(order.serviceCharge)}</span>
                    </div>
                  )}

                  {order.roundOff !== 0 && (
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Round Off:</span>
                      <span className="font-mono">{order.roundOff > 0 ? `+${order.roundOff}` : order.roundOff}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black text-base border-t border-black pt-2 mt-2">
                    <span>Total Amount:</span>
                    <span className="text-orange-600 font-mono">{formatCurrency(order.totalAmount)}</span>
                  </div>

                  <div className="pt-2 border-t text-[11px] text-gray-700 flex justify-between font-bold">
                    <span>Paid via {order.paymentMethod || 'CASH'}:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Signatory & Footer */}
              <div className="border-t pt-4 flex justify-between items-end text-xs">
                <div>
                  <p className="font-bold text-gray-800">Thank you for dining with us!</p>
                  <p className="text-[11px] text-gray-500">Visit us again or order online at restodesk.in</p>
                </div>
                <div className="text-right">
                  <div className="h-10"></div>
                  <div className="border-t border-gray-400 w-44 inline-block pt-1 font-semibold text-gray-700 text-center">
                    For {selectedOutlet?.name || 'RestoDesk'}
                    <span className="block text-[10px] text-gray-500 font-normal">Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Controls */}
        <div className="p-3.5 sm:p-4 bg-background border-t flex items-center justify-end gap-3 no-print">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl px-4 text-xs">
            Close
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm text-xs font-semibold px-4"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            {printFormat === 'a4' ? 'Print Full Page A4 Invoice' : 'Print 80mm Thermal Bill'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
