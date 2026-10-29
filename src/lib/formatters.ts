/**
 * Indian Number & Currency Formatter (₹)
 * Formats numbers according to the Indian numbering system (Lakhs and Crores)
 * e.g., 100000 -> "₹1,00,000.00"
 */
export function formatCurrency(amount: number | null | undefined, showDecimals: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const parts = absAmount.toFixed(showDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian numbering regex: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = showDecimals && decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Format Indian Phone Numbers (+91 98765 43210)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Validate Indian 10-digit mobile number
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return true;
  }
  if (cleaned.length === 12 && /^91[6-9]\d{9}$/.test(cleaned)) {
    return true;
  }
  return false;
}

/**
 * Clean Indian Phone to standard 10-digit format
 */
export function cleanIndianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Format Date to Indian standard (DD/MM/YYYY)
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format DateTime to Indian standard (DD/MM/YYYY, hh:mm A)
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Format Time (hh:mm A)
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * Indian Number in Words (e.g. for Cheque or Bill total)
 */
export function formatAmountInLakhsCrores(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} Lakh`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toString();
}

/**
 * Converts Indian Rupee number to words (e.g. 2058 -> "Rupees Two Thousand Fifty Eight Only")
 */
export function numberToWords(amount: number | null | undefined): string {
  if (!amount || isNaN(amount)) return 'Rupees Zero Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const num = Math.floor(Math.abs(amount));
  if (num === 0) return 'Rupees Zero Only';

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10] + (n % 10 ? ' ' : '');
    return a[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  if (crore > 0) words += convertLessThanThousand(crore) + 'Crore ';
  if (lakh > 0) words += convertLessThanThousand(lakh) + 'Lakh ';
  if (thousand > 0) words += convertLessThanThousand(thousand) + 'Thousand ';
  if (remainder > 0) words += convertLessThanThousand(remainder);

  return 'Rupees ' + words.trim() + ' Only';
}

export const formatIndianDate = formatDate;
export const formatIndianPhone = formatPhone;

