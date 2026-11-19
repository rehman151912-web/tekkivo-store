import {
  DEFAULT_OWNER_CATALOG_META,
  OwnerProductCostMeta,
} from '../data/ownerCatalogMeta';
import { OrderReceipt } from '../types/store';

export interface OrderFinancialBreakdown {
  sellingSubtotalPkr: number;
  shippingFeePkr: number;
  customerTotalPkr: number;
  supplierCostTotalPkr: number;
  estimatedProfitPkr: number;
  profitMarginPct: number;
}

export function calculateOrderFinancials(
  order: OrderReceipt,
  ownerMetaMap: Record<string, OwnerProductCostMeta> = DEFAULT_OWNER_CATALOG_META
): OrderFinancialBreakdown {
  const supplierCostTotalPkr = order.items.reduce((sum, item) => {
    const meta = ownerMetaMap[item.productId];
    const unitCost = meta ? meta.supplierCostPkr : 0;
    return sum + unitCost * item.quantity;
  }, 0);

  const estimatedProfitPkr = order.subtotalPkr - supplierCostTotalPkr;
  const profitMarginPct =
    order.subtotalPkr > 0
      ? Math.round((estimatedProfitPkr / order.subtotalPkr) * 100)
      : 0;

  return {
    sellingSubtotalPkr: order.subtotalPkr,
    shippingFeePkr: order.shippingFeePkr,
    customerTotalPkr: order.totalPkr,
    supplierCostTotalPkr,
    estimatedProfitPkr,
    profitMarginPct,
  };
}

function escapeCsvCell(value: string | number | undefined): string {
  const str = value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildOrdersCsv(
  orders: OrderReceipt[],
  ownerMetaMap: Record<string, OwnerProductCostMeta> = DEFAULT_OWNER_CATALOG_META
): string {
  const headers = [
    'Order Reference',
    'Created At',
    'Status',
    'HHC Fulfillment Ref',
    'Customer Name',
    'Mobile Number',
    'City',
    'Complete Address',
    'Customer Notes',
    'Owner Notes',
    'Items (SKU x Qty)',
    'Subtotal (PKR)',
    'Delivery Fee (PKR)',
    'Order Total (PKR)',
    'Supplier Cost (PKR)',
    'Estimated Profit (PKR)',
  ];

  const rows = orders.map((order) => {
    const financials = calculateOrderFinancials(order, ownerMetaMap);
    const resolvedCity =
      order.customer.city === 'Other City' && order.customer.customCity
        ? order.customer.customCity
        : order.customer.city;
    const itemSummary = order.items
      .map((i) => {
        const color = i.selectedColor ? ` (${i.selectedColor})` : '';
        return `${i.title}${color} [${i.sku}] x${i.quantity} @ Rs.${i.unitPricePkr}`;
      })
      .join(' | ');

    return [
      order.orderRef,
      order.createdAt,
      order.status,
      order.hhcFulfillmentRef,
      order.customer.fullName,
      order.customer.phone,
      resolvedCity,
      order.customer.address,
      order.customer.notes || '',
      order.ownerNotes || '',
      itemSummary,
      financials.sellingSubtotalPkr,
      financials.shippingFeePkr,
      financials.customerTotalPkr,
      financials.supplierCostTotalPkr,
      financials.estimatedProfitPkr,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

export function downloadOrdersCsv(
  orders: OrderReceipt[],
  ownerMetaMap: Record<string, OwnerProductCostMeta> = DEFAULT_OWNER_CATALOG_META
): void {
  if (typeof document === 'undefined' || orders.length === 0) return;
  const csvContent = buildOrdersCsv(orders, ownerMetaMap);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `tekkivo-orders-${dateStamp}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
