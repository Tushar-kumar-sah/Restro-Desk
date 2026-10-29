/**
 * RestoDesk Unified POS Thermal Printing Engine
 * Supports 80mm standard and 58mm compact thermal receipt & KOT printing.
 * Uses an isolated, clean iframe rendering pipeline to prevent viewport/modal clipping.
 */

export interface PrintThermalOptions {
  paperWidth?: '58mm' | '80mm' | string;
  title?: string;
}

/**
 * Prints a receipt or KOT element cleanly using an isolated invisible iframe.
 * Avoids modal clipping (overflow-hidden, max-h-[...], transforms) and ensures 100% full receipt printing.
 */
export function printThermalReceipt(
  element: HTMLElement | null,
  options?: PrintThermalOptions
) {
  if (typeof window === 'undefined') return;

  if (!element) {
    window.print();
    return;
  }

  const paperWidth = options?.paperWidth === '58mm' ? '58mm' : '80mm';
  const title = options?.title || 'Receipt';
  const contentWidth = paperWidth === '58mm' ? '48mm' : '72mm';

  // Create an invisible iframe attached to body
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect existing stylesheets and fonts from main document
  const headStyles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  )
    .map((el) => el.outerHTML)
    .join('\n');

  // Clone node to safely manipulate
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove screen-preview specific constraints
  clone.classList.remove(
    'shadow-md',
    'shadow-lg',
    'shadow-2xl',
    'border',
    'border-dashed',
    'border-gray-300'
  );

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${headStyles}
        <style>
          @page {
            size: ${paperWidth} auto;
            margin: 0mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: ${paperWidth === '58mm' ? '9px' : '11px'} !important;
            line-height: 1.25 !important;
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
          }
          .receipt-print-wrapper {
            width: ${contentWidth} !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 2mm 1mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            height: auto !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Strip preview card wrapper margins & shadows */
          .receipt-print-wrapper > div {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-top: none !important;
            border-bottom: none !important;
            box-shadow: none !important;
            background: #fff !important;
            color: #000 !important;
            overflow: visible !important;
            height: auto !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="receipt-print-wrapper">
          ${clone.outerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1200);
  };

  const doPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print failed, falling back to window.print', err);
      window.print();
    } finally {
      cleanup();
    }
  };

  // Wait for stylesheets and resources to be parsed
  if (iframe.contentWindow) {
    if (doc.readyState === 'complete') {
      setTimeout(doPrint, 200);
    } else {
      iframe.contentWindow.addEventListener('load', () => {
        setTimeout(doPrint, 200);
      });
    }
  } else {
    setTimeout(doPrint, 300);
  }
}
