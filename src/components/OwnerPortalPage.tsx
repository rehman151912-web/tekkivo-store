import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  Download,
  Lock,
  LogIn,
  LogOut,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { OwnerProductCostMeta } from '../data/ownerCatalogMeta';
import {
  CategoryDefinition,
  OrderReceipt,
  OrderStatus,
  Product,
  ProductCategory,
  ProductSpec,
  StockConfirmationStatus,
  StoreSettings,
} from '../types/store';
import { formatPkr } from '../utils/currency';
import {
  calculateOrderFinancials,
  downloadOrdersCsv,
} from '../utils/ownerOrders';
import { ResilientImage } from './ResilientImage';

interface OwnerPortalPageProps {
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  authError: string;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  orders: OrderReceipt[];
  products: Product[];
  ownerMetaMap: Record<string, OwnerProductCostMeta>;
  storeSettings: StoreSettings;
  cloudStatusText: string;
  onSeedStarterCatalog: () => Promise<number>;
  onUpdateOrder: (
    orderRef: string,
    patch: Partial<
      Pick<OrderReceipt, 'status' | 'hhcFulfillmentRef' | 'ownerNotes'>
    >
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
  onUpdateStoreSettings: (next: StoreSettings) => void;
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

function formatSpecsToLines(specs: ProductSpec[]): string {
  return specs.map((s) => `${s.label}: ${s.value}`).join('\n');
}

function parseLinesToSpecs(
  text: string,
  fallbackCategory: string
): ProductSpec[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const parsed: ProductSpec[] = [];
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const label = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (label && value) {
        parsed.push({ label, value });
      }
    }
  }
  return parsed.length > 0
    ? parsed
    : [{ label: 'Category', value: fallbackCategory }];
}

function parseGalleryUrls(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);
}

export function OwnerPortalPage({
  user,
  isAdmin,
  authLoading,
  authError,
  onSignInWithGoogle,
  onSignOut,
  orders,
  products,
  ownerMetaMap,
  storeSettings,
  cloudStatusText,
  onSeedStarterCatalog,
  onUpdateOrder,
  onDeleteOrder,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onResetCatalog,
  onUpdateSupplierMeta,
  onUpdateStoreSettings,
  onBackToStore,
}: OwnerPortalPageProps) {
  const [activeTab, setActiveTab] = useState<
    'orders' | 'catalog' | 'settings' | 'margins'
  >('orders');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [seedFeedback, setSeedFeedback] = useState('');
  const [seeding, setSeeding] = useState(false);

  const defaultCategory =
    storeSettings.categories[0]?.name || 'Electronics & Gadgets';

  // New Product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] =
    useState<ProductCategory>(defaultCategory);
  const [newSku, setNewSku] = useState('');
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newSupplierCost, setNewSupplierCost] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [newCompareAtPrice, setNewCompareAtPrice] = useState('');
  const [newStock, setNewStock] = useState('2');
  const [newStockStatus, setNewStockStatus] =
    useState<StockConfirmationStatus>('pending_confirmation');
  const [newColors, setNewColors] = useState('');
  const [newConditionNote, setNewConditionNote] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSpecsText, setNewSpecsText] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newGalleryText, setNewGalleryText] = useState('');
  const [productFormError, setProductFormError] = useState('');

  // Store Settings local form state
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(
    String(storeSettings.standardDeliveryFeePkr)
  );
  const [freeThresholdInput, setFreeThresholdInput] = useState(
    String(storeSettings.freeDeliveryThresholdPkr)
  );
  const [deliveryWindowInput, setDeliveryWindowInput] = useState(
    storeSettings.estimatedDeliveryWindow
  );
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameUr, setNewCatNameUr] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  useEffect(() => {
    setDeliveryFeeInput(String(storeSettings.standardDeliveryFeePkr));
    setFreeThresholdInput(String(storeSettings.freeDeliveryThresholdPkr));
    setDeliveryWindowInput(storeSettings.estimatedDeliveryWindow);
  }, [
    storeSettings.standardDeliveryFeePkr,
    storeSettings.freeDeliveryThresholdPkr,
    storeSettings.estimatedDeliveryWindow,
  ]);

  if (authLoading) {
    return (
      <section className="py-16 bg-slate-50/70 min-h-[70vh] flex items-center justify-center px-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center max-w-md w-full">
          <p className="font-display text-lg font-bold text-[#10243D]">
            Verifying Admin Session...
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Checking Firebase authentication state for TEKKIVO Admin.
          </p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section
        aria-label="Admin Login Required"
        className="py-14 sm:py-20 bg-slate-50/70 min-h-[72vh] flex items-center justify-center px-4"
      >
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-7 sm:p-10 max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#10243D] text-[#F47721] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#10243D]">
              TEKKIVO Admin Sign-In
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Sign in with your authorized store administrator Google account to
              manage products, categories, delivery fees, supplier costs, and
              customer orders in Cloud Firestore.
            </p>
          </div>

          {authError && (
            <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {authError}
            </p>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={onSignInWithGoogle}
              className="w-full h-12 px-5 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#F47721]" />
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={onBackToStore}
              className="w-full h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section
        aria-label="Admin Access Denied"
        className="py-14 sm:py-20 bg-slate-50/70 min-h-[72vh] flex items-center justify-center px-4"
      >
        <div className="rounded-3xl bg-white border border-rose-200 shadow-sm p-7 sm:p-10 max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#10243D]">
              Administrator Access Only
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Signed in as{' '}
              <strong className="text-[#10243D]">{user.email}</strong>. This
              account is not authorized to view private supplier costs or
              customer order records.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={onSignOut}
              className="flex-1 h-11 px-4 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#F47721]" />
              <span>Switch Account</span>
            </button>
            <button
              type="button"
              onClick={onBackToStore}
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 cursor-pointer"
            >
              Storefront
            </button>
          </div>
        </div>
      </section>
    );
  }

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

  const handleSeedClick = async () => {
    setSeeding(true);
    try {
      const count = await onSeedStarterCatalog();
      setSeedFeedback(
        count > 0
          ? `Synced ${count} missing starter product(s) to Cloud Firestore.`
          : 'All 7 starter products are already synced in Cloud Firestore.'
      );
    } catch {
      setSeedFeedback('Unable to sync right now — check network or permissions.');
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const selling = Number(newSellingPrice);
    const compareAt = Number(newCompareAtPrice);
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
    const id = `tkv-${Date.now()}`;
    const sku =
      newSku.trim() || `TKV-${String(products.length + 1).padStart(2, '0')}`;
    const colorsList = newColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const desc =
      newDescription.trim() || `${title} — ${newCategory} listing.`;
    const primaryImage = newImage.trim();
    const extraGallery = parseGalleryUrls(newGalleryText);
    const galleryImages = primaryImage
      ? Array.from(new Set([primaryImage, ...extraGallery]))
      : extraGallery;

    const specs = newSpecsText.trim()
      ? parseLinesToSpecs(newSpecsText, newCategory)
      : [
          { label: 'Category', value: newCategory },
          ...(colorsList.length > 0
            ? [{ label: 'Available Colours', value: colorsList.join(', ') }]
            : []),
        ];

    const product: Product = {
      id,
      sku,
      title,
      titleUr: title,
      category: newCategory,
      sellingPricePkr: Math.round(selling),
      compareAtPricePkr:
        Number.isFinite(compareAt) && compareAt > selling
          ? Math.round(compareAt)
          : undefined,
      stock: stockNum,
      stockConfirmationStatus: newStockStatus,
      availableColors: colorsList.length > 0 ? colorsList : undefined,
      conditionNote: newConditionNote.trim() || undefined,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: false,
      shortSpec: desc,
      description: desc,
      descriptionUr: desc,
      specs,
      image: primaryImage || galleryImages[0] || '',
      imageAlt: `${title} product photo`,
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      isPublished: true,
      isDemoData: false,
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
    setNewCompareAtPrice('');
    setNewStock('2');
    setNewColors('');
    setNewConditionNote('');
    setNewDescription('');
    setNewSpecsText('');
    setNewImage('');
    setNewGalleryText('');
  };

  const handleSaveDeliverySettings = (e: FormEvent) => {
    e.preventDefault();
    const fee = Math.max(0, Math.round(Number(deliveryFeeInput) || 0));
    const threshold = Math.max(
      0,
      Math.round(Number(freeThresholdInput) || 0)
    );
    const windowText =
      deliveryWindowInput.trim() || storeSettings.estimatedDeliveryWindow;

    onUpdateStoreSettings({
      ...storeSettings,
      standardDeliveryFeePkr: fee,
      freeDeliveryThresholdPkr: threshold,
      estimatedDeliveryWindow: windowText,
    });
    setSettingsSavedMsg('Delivery settings saved to Cloud Firestore.');
    window.setTimeout(() => setSettingsSavedMsg(''), 2500);
  };

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;
    if (
      storeSettings.categories.some(
        (c) => c.name.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      return;
    }

    const nextCat: CategoryDefinition = {
      name: cleanName,
      nameUr: newCatNameUr.trim() || cleanName,
      shortDesc:
        newCatDesc.trim() || `Explore ${cleanName} products with Pakistan COD`,
    };

    onUpdateStoreSettings({
      ...storeSettings,
      categories: [...storeSettings.categories, nextCat],
    });
    setNewCatName('');
    setNewCatNameUr('');
    setNewCatDesc('');
    setSettingsSavedMsg(`Added category "${cleanName}".`);
    window.setTimeout(() => setSettingsSavedMsg(''), 2500);
  };

  const handleDeleteCategory = (catName: string) => {
    if (storeSettings.categories.length <= 1) return;
    onUpdateStoreSettings({
      ...storeSettings,
      categories: storeSettings.categories.filter((c) => c.name !== catName),
    });
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
                Admin · Product &amp; Order Management
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Signed in as <strong>{user.email}</strong> · Manage products,
              categories, delivery charges, orders, and supplier margins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap p-1 bg-slate-200/70 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
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
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-white text-[#10243D] shadow-xs'
                    : 'text-slate-600 hover:text-[#10243D]'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white text-[#10243D] shadow-xs'
                    : 'text-slate-600 hover:text-[#10243D]'
                }`}
              >
                Categories &amp; Delivery
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('margins')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'margins'
                    ? 'bg-white text-[#10243D] shadow-xs'
                    : 'text-slate-600 hover:text-[#10243D]'
                }`}
              >
                Supplier Costs
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

            <button
              type="button"
              onClick={onSignOut}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-[#10243D] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#F47721]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Cloud Database Sync Status Banner */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Cloud className="w-5 h-5 text-[#F47721] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-[#10243D]">
                Cloud Firestore Database Active:
              </strong>{' '}
              {cloudStatusText} Supplier costs, product IDs, and customer order
              PII remain strictly locked to verified admin access.
            </div>
          </div>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedClick}
            className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#10243D] whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            {seeding ? 'Syncing...' : 'Sync Starter Products to Cloud'}
          </button>
        </div>

        {seedFeedback && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{seedFeedback}</span>
          </div>
        )}

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
                  No orders in this status view
                </p>
                <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
                  When customers submit Cash on Delivery orders, they save to
                  Cloud Firestore and appear here for status updates and CSV
                  export.
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
                            aria-label={`Delete order ${order.orderRef}`}
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
                                Est. Gross Profit ({financials.profitMarginPct}
                                %)
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#10243D]">
                  Editable Product Catalogue
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Edit product names, categories, descriptions, specs,
                  multi-image galleries, selling prices, discounts, and stock
                  confirmation status.
                </p>
              </div>
              <button
                type="button"
                onClick={onResetCatalog}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-[#10243D] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Starter 7 Products</span>
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
                    {/* Image Uploader & Multi-image URLs */}
                    <div className="lg:col-span-3 space-y-2.5">
                      <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F5F7FA] border border-slate-200">
                        <ResilientImage
                          src={product.image}
                          alt={product.imageAlt}
                          fallbackLabel={product.title}
                          fallbackSubtext="Upload exact product photo"
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
                        placeholder="Primary image URL"
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-[#10243D]"
                      />

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Gallery URLs (one per line)
                        </label>
                        <textarea
                          rows={2}
                          value={(product.galleryImages || []).join('\n')}
                          onChange={(e) => {
                            const list = parseGalleryUrls(e.target.value);
                            onUpdateProduct(product.id, {
                              galleryImages:
                                list.length > 0 ? list : undefined,
                            });
                          }}
                          placeholder="/assets/... or https://..."
                          className="w-full p-2 rounded-lg border border-slate-200 text-[11px] font-mono text-[#10243D]"
                        />
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="lg:col-span-9 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs text-slate-500">
                        <span className="font-mono">
                          SKU: {product.sku} · Supplier:{' '}
                          {meta?.supplierName || 'HHC'} (ID:{' '}
                          {meta?.supplierProductId || 'N/A'}) · Cost:{' '}
                          {formatPkr(supplierCost)} · Supplier Stock:{' '}
                          {meta?.listedStock ?? product.stock} · Commission:{' '}
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                            {storeSettings.categories.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                            {!storeSettings.categories.some(
                              (c) => c.name === product.category
                            ) && (
                              <option value={product.category}>
                                {product.category}
                              </option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Selling Price (PKR)
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

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Compare-At (Optional)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={product.compareAtPricePkr ?? ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              onUpdateProduct(product.id, {
                                compareAtPricePkr:
                                  val > product.sellingPricePkr
                                    ? Math.round(val)
                                    : undefined,
                              });
                            }}
                            placeholder="Original PKR"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm tabular-nums text-[#10243D]"
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            Specs (Label: Value per line)
                          </label>
                          <textarea
                            rows={2}
                            value={formatSpecsToLines(product.specs || [])}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                specs: parseLinesToSpecs(
                                  e.target.value,
                                  product.category
                                ),
                              })
                            }
                            placeholder="Power: 1000W&#10;Brand: RAF"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[#10243D]"
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
                              : 'Unpublished Draft'}
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
                            checked={Boolean(product.isTrending)}
                            onChange={(e) =>
                              onUpdateProduct(product.id, {
                                isTrending: e.target.checked,
                              })
                            }
                          />
                          <span>Trending</span>
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
                  Add New Product
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
                  {storeSettings.categories.map((c) => (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <input
                  type="text"
                  value={newSupplierId}
                  onChange={(e) => setNewSupplierId(e.target.value)}
                  placeholder="Supplier ID (Owner)"
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
                <input
                  type="number"
                  min={0}
                  value={newCompareAtPrice}
                  onChange={(e) => setNewCompareAtPrice(e.target.value)}
                  placeholder="Compare-At PKR"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
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
                <textarea
                  rows={2}
                  value={newSpecsText}
                  onChange={(e) => setNewSpecsText(e.target.value)}
                  placeholder="Optional Specs (one per line, e.g. Power: 1000W)"
                  className="p-3 rounded-xl border border-slate-200 text-xs font-mono text-[#10243D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="Or paste primary image URL"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#10243D]"
                  />
                </div>

                <textarea
                  rows={2}
                  value={newGalleryText}
                  onChange={(e) => setNewGalleryText(e.target.value)}
                  placeholder="Additional gallery image URLs (one per line)"
                  className="p-3 rounded-xl border border-slate-200 text-xs font-mono text-[#10243D]"
                />
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
        ) : activeTab === 'settings' ? (
          <div className="space-y-8">
            {settingsSavedMsg && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{settingsSavedMsg}</span>
              </div>
            )}

            {/* Delivery Charges Configuration */}
            <form
              onSubmit={handleSaveDeliverySettings}
              className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-bold text-[#10243D]">
                Pakistan Cash on Delivery (COD) Charges
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Standard COD Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={deliveryFeeInput}
                    onChange={(e) => setDeliveryFeeInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm tabular-nums text-[#10243D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Free Delivery Threshold (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={freeThresholdInput}
                    onChange={(e) => setFreeThresholdInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm tabular-nums text-[#10243D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Estimated Delivery Window
                  </label>
                  <input
                    type="text"
                    value={deliveryWindowInput}
                    onChange={(e) => setDeliveryWindowInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Save Delivery Settings
              </button>
            </form>

            {/* Category Manager */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-[#10243D]">
                  Store Categories ({storeSettings.categories.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Manage the categories displayed in the Storefront navigation,
                  Category Grid, and Filters.
                </p>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {storeSettings.categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-[#10243D]">
                        {cat.name}{' '}
                        <span className="font-urdu text-xs text-slate-500 ml-2">
                          {cat.nameUr}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cat.shortDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={storeSettings.categories.length <= 1}
                      onClick={() => handleDeleteCategory(cat.name)}
                      aria-label={`Remove category ${cat.name}`}
                      className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-700 hover:border-rose-200 disabled:opacity-40 cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddCategory}
                className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New Category Name *"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
                <input
                  type="text"
                  value={newCatNameUr}
                  onChange={(e) => setNewCatNameUr(e.target.value)}
                  placeholder="Urdu Title (optional)"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description"
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#10243D]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </form>
            </div>
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
                                p.isPublished === false ||
                                p.sellingPricePkr <= 0
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
