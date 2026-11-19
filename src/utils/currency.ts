import { STORE_CONFIG } from '../config/store';
import { OrderReceipt } from '../types/store';

export function formatPkr(amount: number): string {
  const rounded = Math.round(amount);
  return `${STORE_CONFIG.currencyPrefix} ${rounded.toLocaleString('en-PK')}`;
}

export function formatWhatsAppDisplayNumber(rawNumber: string): string {
  const digits = rawNumber.replace(/[^\d]/g, '');
  if (digits.length === 12 && digits.startsWith('92')) {
    return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return rawNumber;
}

export function getDiscountPercentage(
  sellingPrice: number,
  compareAtPrice?: number
): number | null {
  if (!compareAtPrice || compareAtPrice <= sellingPrice) {
    return null;
  }
  return Math.round(((compareAtPrice - sellingPrice) / compareAtPrice) * 100);
}

export function calculateShippingFee(subtotalPkr: number): number {
  if (subtotalPkr <= 0) return 0;
  return subtotalPkr >= STORE_CONFIG.freeDeliveryThresholdPkr
    ? 0
    : STORE_CONFIG.standardDeliveryFeePkr;
}

export function generateOrderReference(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TKV-${y}${m}${d}-${rand}`;
}

/**
 * Generates the customer-facing WhatsApp order summary.
 * Excludes supplier prices, supplier product IDs, and private fulfillment internals.
 */
export function buildWhatsAppOrderSummary(
  receipt: Omit<OrderReceipt, 'whatsappMessage'>
): string {
  const resolvedCity =
    receipt.customer.city === 'Other City' && receipt.customer.customCity
      ? receipt.customer.customCity.trim()
      : receipt.customer.city;

  const itemLines = receipt.items
    .map((item, idx) => {
      const colorPart = item.selectedColor
        ? ` (${item.selectedColor})`
        : '';
      return `${idx + 1}. ${item.title}${colorPart}\n   SKU: ${
        item.sku
      }\n   Qty: ${item.quantity} × ${formatPkr(
        item.unitPricePkr
      )} = ${formatPkr(item.lineTotalPkr)}`;
    })
    .join('\n');

  const lines = [
    `*NEW ORDER — ${STORE_CONFIG.brandName}*`,
    `Order Reference: ${receipt.orderRef}`,
    `Payment Method: Cash on Delivery (COD)`,
    ``,
    `*ITEMS ORDERED:*`,
    itemLines,
    ``,
    `*ORDER TOTALS (PKR):*`,
    `Subtotal: ${formatPkr(receipt.subtotalPkr)}`,
    `COD Delivery: ${
      receipt.shippingFeePkr === 0 ? 'FREE' : formatPkr(receipt.shippingFeePkr)
    }`,
    `Order Total: *${formatPkr(receipt.totalPkr)}*`,
    ``,
    `*CUSTOMER DETAILS:*`,
    `Full Name: ${receipt.customer.fullName}`,
    `Mobile Number: ${receipt.customer.phone}`,
    `City: ${resolvedCity}`,
    `Delivery Address: ${receipt.customer.address}`,
  ];

  if (receipt.customer.notes && receipt.customer.notes.trim()) {
    lines.push(`Order Notes: ${receipt.customer.notes.trim()}`);
  }

  lines.push(``);
  lines.push(`Please confirm stock availability and Cash on Delivery dispatch.`);

  return lines.join('\n');
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanedPhone = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens official wa.me link via anchor click inside a user gesture.
 */
export function launchWhatsAppHandoff(whatsappUrl: string): boolean {
  if (typeof document === 'undefined' || !whatsappUrl) {
    return false;
  }
  const anchor = document.createElement('a');
  anchor.href = whatsappUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  return true;
}
