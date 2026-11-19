import { ChangeEvent, FormEvent, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../config/store';
import { OwnerProductCostMeta } from '../data/ownerCatalogMeta';
import {
  OrderReceipt,
  OrderStatus,
  Product,
  ProductCategory,
  StockConfirmationStatus,
} from '../types/store';
import { formatPkr } from '../utils/currency';
import {
  calculateOrderFinancials,
  downloadOrdersCsv,
} from '../utils/ownerOrders';
import { ResilientImage } from './ResilientImage';

interface OwnerPortalPageProps {
  orders: OrderReceipt[];
  products: Product[];
  ownerMetaMap: Record<string, OwnerProductCostMeta>;
  onUpdateOrder: (
    orderRef: string,
    patch: Partial<Pick<OrderReceipt, 'status' | 'hhcFulfillmentRef' | 'ownerNotes'>>
  ) => void;
  onDeleteOrder: (orderRef: string) => void;
  onUpdateProduct: (productId: string, patch: Partial<Product>) => void;
  onAddProduct: (
    product: Product,
    supplierMeta: OwnerProductCostMeta
  ) => void;
  onDeleteProduct: (productId: string) => void;
  onResetCatalog: () => void;
  onUpdateSupplierMeta: (
    productId: string,
    patch: Partial<OwnerProductCostMeta>
  ) => void;
  onBackToStore: () => void;
}

const ORDER_STATUSES: ReadonlyArray<{
  value: OrderStatus;
  label: string;
  badgeStyle: string;
}> = [
  {
    value: 'pending',
    label: 'Pending',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    value: 'submitted',
    label: 'Submitted',
    badgeStyle: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    value: 'processing',
    label: 'Processing',
    badgeStyle: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    value: 'shipped',
    label: 'Shipped',
    badgeStyle: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    value: 'delivered',
    label: 'Delivered',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200',
  },
];

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const maxDim = 720;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function OwnerPortalPage({
  orders,
  products,
  ownerMetaMap,
  onUpdateOrder,
  onDeleteOrder,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onResetCatalog,
  onUpdateSupplierMeta,
  onBackToStore,
}: OwnerPortalPageProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'margins'>(
    'orders'
  );
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // New Product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] =
    useState<ProductCategory>('Kitchen Tools');
  const [newSku, setNewSku] = useState('');
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newSupplierCost, setNewSupplierCost] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [newStock, setNewStock] = useState('2');
  const [newStockStatus, setNewStockStatus] =
    useState<StockConfirmationStatus>('pending_confirmation');
  const [newColors, setNewColors] = useState('');
  const [newConditionNote, setNewConditionNote] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [productFormError, setProductFormError] = useState('');

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const totals = filteredOrders.reduce(
    (acc, order) => {
      const f = calculateOrderFinancials(order, ownerMetaMap);
      acc.revenuePkr += f.sellingSubtotalPkr;
      acc.costPkr += f.supplierCostTotalPkr;
      acc.profitPkr += f.estimatedProfitPkr;
      return acc;
    },
    { revenuePkr: 0, costPkr: 0, profitPkr: 0 }
  );

  const handleExistingPhotoUpload = async (
    productId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onUpdateProduct(productId, { image: dataUrl });
    } catch {
      // Ignore unreadable image file
    }
    e.target.value = '';
  };

  const handleNewPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setNewImage(dataUrl);
    } catch {
      // Ignore unreadable image file
    }
    e.target.value = '';
  };

  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const selling = Number(newSellingPrice);
    const cost = Number(newSupplierCost) || 0;
    const stockNum =
      newStockStatus === 'out_of_stock' ? 0 : Math.max(0, Number(newStock) || 0);

    if (title.length < 2) {
      setProductFormError('Please enter a product name.');
      return;
    }
    if (!Number.isFinite(selling) || selling <= 0) {
      setProductFormError('Please enter a valid PKR selling price.');
      return;
    }

    setProductFormError('');
    const id = `hhc-custom-${Date.now()}`;
    const sku =
      newSku.trim() || `TKV-${String(products.length + 1).padStart(2, '0')}`;
    const colorsList = newColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const desc =
      newDescription.trim() || `${title} — ${newCategory} listing.`;

    const product: Product = {
      id,
      sku,
      title,
      titleUr: title,
      category: newCategory,
      sellingPricePkr: Math.round(selling),
      stock: stockNum,
      stockConfirmationStatus: newStockStatus,
      availableColors: colorsList.length > 0 ? colorsList : undefined,
      conditionNote: newConditionNote.trim() || undefined,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      shortSpec: desc,
      description: desc,
      descriptionUr: desc,
      specs: [
        { label: 'Category', value: newCategory },
        ...(colorsList.length > 0
          ? [{ label: 'Available Colours', value: colorsList.join(', ') }]
          : []),
      ],
      image: newImage.trim(),
      imageAlt: `${title} product photo`,
      isDemoData: true,
    };

    const meta: OwnerProductCostMeta = {
      productId: id,
      supplierProductId: newSupplierId.trim() || 'MANUAL',
      supplierCostPkr: Math.round(cost),
      listedStock: stockNum,
    };

    onAddProduct(product, meta);

    setNewTitle('');
    setNewSku('');
    setNewSupplierId('');
    setNewSupplierCost('');
    setNewSellingPrice('');
    setNewStock('2');
    setNewColors('');
    setNewConditionNote('');
    setNewDescription('');
    setNewImage('');
  };

  return (
    <section
      aria-label="Store Owner Admin and Order Management"
      className="py-8 sm:py-12 bg-slate-50/70 min-h-[75vh]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#10243D] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Customer Storefront</span>
            </button>
            <div className="mt-2 flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#F47721]" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
                Admin · Product & Order Management
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Private owner workspace for editing products, uploading exact HHC
              photos, updating selling prices & stock, tracking orders, and
              exporting CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-white text-[#10243D] shadow-xs'
                    : 'text-slate-600 hover:text-[#10243D]'
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-white text-[#10243D] shadow-xs'
                    : 'text-slate-600 hover:text-[#10243D]'
                }`}
              >
                Product Management ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('margins')}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'margins'
                    ? 'bg-white text-[#10243D] shadow-xs'
                    : 'text-slate-600 hover:text-[#10243D]'
                }`}
              >
                Supplier Costs & Profit
              </button>
            </div>

            {activeTab === 'orders' && (
              <button
                type="button"
                disabled={filteredOrders.length === 0}
                onClick={() => downloadOrdersCsv(filteredOrders, ownerMetaMap)}
                className="h-10 px-4 rounded-xl bg-[#10243D] hover:bg-[#183558] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#F47721]" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Browser Storage & Manual HHC Disclaimer */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
            <strong>Demo Browser Storage Notice:</strong> Orders and catalog
            edits are saved locally in this browser&apos;s{' '}
            <code className="font-mono">localStorage</code> for demonstration
            purposes. <code className="font-mono">localStorage</code> is not a
            secure central order database, and there is no automatic HHC order
            synchronization. Supplier prices and supplier product IDs remain
            hidden from customers.
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Selling Subtotal ({filteredOrders.length} orders)
                </p>
                <p className="mt-1 tabular-nums font-display text-2xl font-bold text-[#10243D]">
                  {formatPkr(totals.revenuePkr)}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Supplier Cost (Private)
                </p>
                <p className="mt-1 tabular-nums font-display text-2xl font-bold text-slate-700">
                  {formatPkr(totals.costPkr)}
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Estimated Gross Profit
                </p>
                <p className="mt-1 tabular-nums font-display text-2xl font-bold text-emerald-700">
                  {formatPkr(totals.profitPkr)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#10243D] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-[#10243D]'
                }`}
              >
                All ({orders.length})
              </button>
              {ORDER_STATUSES.map((st) => {
                const count = orders.filter((o) => o.status === st.value).length;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setStatusFilter(st.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      statusFilter === st.value
                        ? 'bg-[#10243D] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-[#10243D]'
                    }`}
                  >
                    {st.label} ({count})
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">
                <p className="font-display text-lg font-semibold text-[#10243D]">
                  No local demo orders in this view
                </p>
                <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
                  When a customer completes the COD checkout form in this
                  browser, the pending order appears here for manual status
                  tracking and CSV export.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const financials = calculateOrderFinancials(
                    order,
                    ownerMetaMap
                  );
                  const statusMeta =
                    ORDER_STATUSES.find((s) => s.value === order.status) ||
                    ORDER_STATUSES[0];
                  const resolvedCity =
                    order.customer.city === 'Other City' &&
                    order.customer.customCity
                      ? order.customer.customCity
                      : order.customer.city;

                  return (
                    <article
                      key={order.orderRef}
                      className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-[#10243D]">
                              {order.orderRef}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${statusMeta.badgeStyle}`}
                            >
                              {statusMeta.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleString(
                                'en-PK',
                                {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                }
                              )}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-[#10243D]">
                            {order.customer.fullName} ·{' '}
                            <span className="tabular-nums font-mono text-xs">
                              {order.customer.phone}
                            </span>{' '}
                            · {resolvedCity}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {order.customer.address}
                            {order.customer.notes
                              ? ` — Note: ${order.customer.notes}`
                              : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            htmlFor={`status-${order.orderRef}`}
                            className="sr-only"
                          >
                            Order status
                          </label>
                          <select
                            id={`status-${order.orderRef}`}
                            value={order.status}
                            onChange={(e) =>
                              onUpdateOrder(order.orderRef, {
                                status: e.target.value as OrderStatus,
                              })
                            }
                            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-[#10243D] focus:border-[#F47721] focus:outline-none cursor-pointer"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st.value} value={st.value}>
                                Status: {st.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => onDeleteOrder(order.orderRef)}
                            aria-label={`Delete demo order ${order.orderRef}`}
                            className="h-10 w-10 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-7 space-y-2">
                          <p className="text-xs font-semibold text-slate-500">
                            Ordered Items
                          </p>
                          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/50">
                            {order.items.map((item) => (
                              <li
                                key={`${order.orderRef}-${item.sku}-${
                                  item.selectedColor || 'def'
                                }`}
                                className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-[#10243D] truncate">
                                    {item.title}
                                    {item.selectedColor
                                      ? ` (${item.selectedColor})`
                                      : ''}
                                  </p>
                                  <p className="text-xs text-slate-500 font-mono">
                                    {item.sku} · Qty {item.quantity} ×{' '}
                                    {formatPkr(item.unitPricePkr)}
                                  </p>
                                </div>
                                <span className="tabular-nums font-semibold text-[#10243D] shrink-0">
                                  {formatPkr(item.lineTotalPkr)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="lg:col-span-5 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor={`hhc-ref-${order.orderRef}`}
                                className="block text-xs font-semibold text-[#10243D] mb-1"
                              >
                                HHC Fulfillment Reference
                              </label>
                              <input
                                id={`hhc-ref-${order.orderRef}`}
                                type="text"
                                value={order.hhcFulfillmentRef}
                                onChange={(e) =>
                                  onUpdateOrder(order.orderRef, {
                                    hhcFulfillmentRef: e.target.value,
                                  })
                                }
                                placeholder="e.g. HHC-ORD-10492"
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-[#10243D] focus:border-[#F47721] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`owner-note-${order.orderRef}`}
                                className="block text-xs font-semibold text-[#10243D] mb-1"
                              >
                                Internal Owner Note
                              </label>
                              <input
                                id={`owner-note-${order.orderRef}`}
                                type="text"
                                value={order.ownerNotes || ''}
                                onChange={(e) =>
                                  onUpdateOrder(order.orderRef, {
                                    ownerNotes: e.target.value,
                                  })
                                }
                                placeholder="Courier / call note"
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#10243D] focus:border-[#F47721] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs space-y-1">
                            <div className="flex justify-between text-slate-600">
                              <span>Customer Total (incl. COD shipping)</span>
                              <span className="tabular-nums font-bold text-[#10243D]">
                                {formatPkr(financials.customerTotalPkr)}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Supplier Cost</span>
                              <span className="tabular-nums font-medium text-slate-700">
                                {formatPkr(financials.supplierCostTotalPkr)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200">
                              <span className="font-semibold text-[#10243D]">
                                Est. Gross Profit ({financials.profitMarginPct}%)
                              </span>
                              <span className="tabular-nums font-bold text-emerald-700">
                                +{formatPkr(financials.estimatedProfitPkr)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : activeTab === 'catalog' ? (
          <div className="space-y-8">
            {/* Existing Products Editor */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#10243D]">
                  Editable Product Catalogue
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Edit product names, descriptions, exact HHC images, selling
                  prices, and stock confirmation status. Changes sync
                  immediately to the storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={onResetCatalog}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-[#10243D] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Catalog</span>
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product) => {
                const meta = ownerMetaMap[product.id];
                const supplierCost = meta?.supplierCostPkr ?? 0;
                const unitProfit = product.sellingPricePkr - supplierCost;

                return (
                  <div
                    key={product.id}
                    className={`rounded-2xl bg-white border p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 ${
                      product.isPublished === false ||
                      product.sellingPricePkr <= 0
                        ? 'border-amber-300 ring-1 ring-amber-200'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Image Uploader */}
                    <div className="lg:col-span-3 space-y-2.5">
                      <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F5F7FA] border border-slate-200">
                        <ResilientImage
                          src={product.image}
                          alt={product.imageAlt}
                          fallbackLabel={product.title}
                          fallbackSubtext="Upload exact HHC photo"
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex-1 h-9 px-3 rounded-lg bg-[#10243D] hover:bg-[#183558] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#F47721]" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleExistingPhotoUpload(product.id, e)
                            }
                            className="sr-only"
                          />
                        </label>
                        {product.image && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProduct(product.id, { image: '' })
                            }
                            className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-700 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        value={
                          product.image.startsWith('data:') ? '' : product.image
                        }
                        onChange={(e) =>
                          onUpdateProduct(product.id, { image: e.target.value })
                        }
                        placeholder="Or paste exact HHC image URL"
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-[#10243D]"
                      />
                    </div>

                    {/* Editable Fields */}
                    <div className="lg:col-span-9 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs text-slate-500">
                        <span className="font-mono">
                          SKU: {product.sku} · Supplier:{' '}
                          {meta?.supplierName || 'HHC'} (ID:{' '}
                          {meta?.supplierProductId || 'N/A'}) · Supplier Cost:{' '}
                          {formatPkr(supplierCost)} · Supplier Stock Shown:{' '}
                          {meta?.listedStock ?? product.stock}
                          {meta?.dispatchLocation
                            ? ` · Dispatch: ${meta.dispatchLocation}`
                            : ''}
                          {meta?.inspectionStatus
                            ? ` · Inspection: ${meta.inspectionStatus}`
                            : ''}{' '}
                          · Commission:{' '}
                          <strong
                            className={
                              product.sellingPricePkr <= 0
                                ? 'text-amber-700'
                                : unitProfit >= 0
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }
                          >
                            {product.sellingPricePkr <= 0
                              ? 'Set Selling Price'
                              : formatPkr(unitProfit)}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(product.id)}
                          aria-label={`Delete ${product.title}`}
                          className="text-slate-400 hover:text-rose-700 inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={product.title}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium text-[#10243D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Category
                          </label>
                          <select
                            value={product.category}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                category: e.target.value as ProductCategory,
                              })
                            }
                            className="w-full h-10 px-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-[#10243D]"
                          >
                            {PRODUCT_CATEGORIES.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Selling Price (PKR){' '}
                            {product.sellingPricePkr <= 0 && (
                              <span className="text-amber-700">*Required to publish</span>
                            )}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={product.sellingPricePkr}
                            onChange={(e) => {
                              const nextPrice = Math.max(
                                0,
                                Number(e.target.value) || 0
                              );
                              onUpdateProduct(product.id, {
                                sellingPricePkr: nextPrice,
                                isPublished:
                                  nextPrice <= 0 ? false : product.isPublished,
                              });
                            }}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-bold tabular-nums text-[#10243D]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Availability Status
                          </label>
                          <select
                            value={product.stockConfirmationStatus}
                            onChange={(e) => {
                              const nextStatus = e.target
                                .value as StockConfirmationStatus;
                              onUpdateProduct(product.id, {
                                stockConfirmationStatus: nextStatus,
                                stock:
                                  nextStatus === 'out_of_stock'
                                    ? 0
                                    : Math.max(1, product.stock || 2),
                              });
                            }}
                            className="w-full h-10 px-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-[#10243D]"
                          >
                            <option value="confirmed">
                              Confirmed In Stock
                            </option>
                            <option value="pending_confirmation">
                              Pending Supplier Confirmation
                            </option>
                            <option value="out_of_stock">
                              Out of Stock (Unavailable)
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Listed Stock Qty
                          </label>
                          <input
                            type="number"
                            min={0}
                            disabled={
                              product.stockConfirmationStatus === 'out_of_stock'
                            }
                            value={product.stock}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                stock: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm tabular-nums text-[#10243D] disabled:bg-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Colours (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={(product.availableColors || []).join(', ')}
                            onChange={(e) => {
                              const parsed = e.target.value
                                .split(',')
                                .map((c) => c.trim())
                                .filter(Boolean);
                              onUpdateProduct(product.id, {
                                availableColors:
                                  parsed.length > 0 ? parsed : undefined,
                              });
                            }}
                            placeholder="Black, White"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#10243D]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={product.description}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                description: e.target.value,
                                shortSpec: e.target.value,
                              })
                            }
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#10243D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Packaging / Condition Notice
                          </label>
                          <textarea
                            rows={2}
                            value={product.conditionNote || ''}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                conditionNote: e.target.value || undefined,
                              })
                            }
                            placeholder="e.g. Without Box, or Out of Stock notice"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#10243D]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-slate-700">
                        <label
                          className={`inline-flex items-center gap-1.5 ${
                            product.sellingPricePkr > 0
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={product.sellingPricePkr <= 0}
                            checked={
                              product.isPublished !== false &&
                              product.sellingPricePkr > 0
                            }
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                isPublished:
                                  product.sellingPricePkr > 0
                                    ? e.target.checked
                                    : false,
                              })
                            }
                          />
                          <span>
                            {product.isPublished !== false &&
                            product.sellingPricePkr > 0
                              ? 'Published on Storefront'
                              : 'Unpublished Draft (Enter Selling Price > 0 to publish)'}
                          </span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(product.isFeatured)}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                isFeatured: e.target.checked,
                              })
                            }
                          />
                          <span>Featured</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(product.isBestSeller)}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                isBestSeller: e.target.checked,
                              })
                            }
                          />
                          <span>Best Seller</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(product.isNewArrival)}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                isNewArrival: e.target.checked,
                              })
                            }
                          />
                          <span>New Arrival</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Product Form */}
            <form
              onSubmit={handleCreateProduct}
              className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F47721]" />
                <h3 className="font-display text-base sm:text-lg font-bold text-[#10243D]">
                  Add New HHC Product
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Product Name *"
                  className="sm:col-span-2 h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as ProductCategory)
                  }
                  className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-[#10243D]"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="Store SKU (optional)"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono text-[#10243D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="text"
                  value={newSupplierId}
                  onChange={(e) => setNewSupplierId(e.target.value)}
                  placeholder="Supplier ID (Owner Only)"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono text-[#10243D]"
                />
                <input
                  type="number"
                  min={0}
                  value={newSupplierCost}
                  onChange={(e) => setNewSupplierCost(e.target.value)}
                  placeholder="Supplier Cost PKR"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
                <input
                  type="number"
                  min={1}
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(e.target.value)}
                  placeholder="Selling Price PKR *"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold text-[#10243D]"
                />
                <select
                  value={newStockStatus}
                  onChange={(e) =>
                    setNewStockStatus(e.target.value as StockConfirmationStatus)
                  }
                  className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-[#10243D]"
                >
                  <option value="pending_confirmation">
                    Pending Confirmation
                  </option>
                  <option value="confirmed">Confirmed In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <input
                  type="number"
                  min={0}
                  disabled={newStockStatus === 'out_of_stock'}
                  value={newStockStatus === 'out_of_stock' ? '0' : newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Listed Stock"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D] disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newColors}
                  onChange={(e) => setNewColors(e.target.value)}
                  placeholder="Colours (e.g. Black, White)"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
                <input
                  type="text"
                  value={newConditionNote}
                  onChange={(e) => setNewConditionNote(e.target.value)}
                  placeholder="Condition Note (e.g. Without Box)"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Exact listing description (do not invent specs)"
                  className="p-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#10243D] inline-flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Exact Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewPhotoUpload}
                        className="sr-only"
                      />
                    </label>
                    {newImage && (
                      <span className="text-xs text-emerald-700 font-medium">
                        Photo attached
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={newImage.startsWith('data:') ? '' : newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Or paste exact HHC image URL"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#10243D]"
                  />
                </div>
              </div>

              {productFormError && (
                <p className="text-xs font-medium text-rose-700">
                  {productFormError}
                </p>
              )}

              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold cursor-pointer"
              >
                Add Product to Store
              </button>
            </form>
          </div>
        ) : (
          /* Isolated Private Supplier Cost & Margin Reference Table */
          <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">
                    Store SKU / Supplier ID
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Supplier Price (PKR)
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Selling Price (PKR)
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Commission (PKR)
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Stock Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const meta = ownerMetaMap[p.id];
                  const cost = meta ? meta.supplierCostPkr : 0;
                  const profit = p.sellingPricePkr - cost;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                        <div>{p.sku}</div>
                        <div className="text-slate-500">
                          ID: {meta?.supplierProductId || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#10243D]">
                        {p.title}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                        <input
                          type="number"
                          min={0}
                          aria-label={`Supplier cost for ${p.title}`}
                          value={cost}
                          onChange={(e) =>
                            onUpdateSupplierMeta(p.id, {
                              supplierCostPkr: Math.max(
                                0,
                                Number(e.target.value) || 0
                              ),
                            })
                          }
                          className="w-24 h-8 px-2 text-right rounded-lg border border-slate-200 text-xs font-medium text-slate-700"
                        />
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#10243D] whitespace-nowrap">
                        {p.sellingPricePkr > 0
                          ? formatPkr(p.sellingPricePkr)
                          : 'Unpublished (Price Pending)'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right tabular-nums font-semibold whitespace-nowrap ${
                          p.sellingPricePkr <= 0
                            ? 'text-amber-700'
                            : profit >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {p.sellingPricePkr <= 0
                          ? '—'
                          : profit >= 0
                          ? `+${formatPkr(profit)}`
                          : formatPkr(profit)}
                      </td>
                      <td className="py-3 px-4 text-right text-xs whitespace-nowrap">
                        <div>
                          {p.stockConfirmationStatus === 'out_of_stock'
                            ? 'Storefront: Out of Stock (0)'
                            : `Storefront: ${p.stock} · ${
                                p.isPublished === false || p.sellingPricePkr <= 0
                                  ? 'Unpublished'
                                  : 'Published'
                              }`}
                        </div>
                        <div className="text-slate-500">
                          Supplier Shown: {meta?.listedStock ?? p.stock}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
