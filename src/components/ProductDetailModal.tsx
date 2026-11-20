import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';
import { COPY } from '../data/translations';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LanguageMode, Product, StoreSettings } from '../types/store';
import { isProductOrderable } from '../utils/cart';
import { formatPkr, getDiscountPercentage } from '../utils/currency';
import { saveSubscriberToFirestore } from '../utils/firestoreService';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  product: Product | null;
  language: LanguageMode;
  storeSettings: StoreSettings;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (
    productId: string,
    quantity: number,
    selectedColor?: string
  ) => void;
  onBuyNowCod: (
    productId: string,
    quantity: number,
    selectedColor?: string
  ) => void;
}

export function ProductDetailModal({
  product,
  language,
  storeSettings,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBuyNowCod,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );
  const [justAdded, setJustAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');
  const [restockEmail, setRestockEmail] = useState('');
  const [restockError, setRestockError] = useState('');
  const [restockSubscribed, setRestockSubscribed] = useState(false);
  const [restockSaving, setRestockSaving] = useState(false);
  const [savedSubscribers, setSavedSubscribers] = useLocalStorage<string[]>(
    'tekkivo_newsletter_v1',
    []
  );

  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
    setActiveImage(product?.image || '');
    setRestockError('');
    setRestockSubscribed(false);
    setSelectedColor(
      product?.availableColors && product.availableColors.length > 0
        ? product.availableColors[0]
        : undefined
    );
  }, [product?.id, product?.image, product?.availableColors]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const copy = COPY[language];
  const canOrder = isProductOrderable(product);
  const discountPct = getDiscountPercentage(
    product.sellingPricePkr,
    product.compareAtPricePkr
  );

  const stockLabel =
    product.stockConfirmationStatus === 'out_of_stock' || product.stock <= 0
      ? 'Currently Out of Stock — Unavailable until supplier reconfirms'
      : product.stockConfirmationStatus === 'pending_confirmation'
      ? `Pending Supplier Stock Confirmation (Listed: ${product.stock})`
      : `In Stock (${product.stock} units)`;

  const handleAdd = () => {
    if (!canOrder) return;
    onAddToCart(product.id, quantity, selectedColor);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const handleRestockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = restockEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setRestockError('Please enter a valid email address.');
      return;
    }
    setRestockError('');
    setRestockSaving(true);
    if (!savedSubscribers.includes(trimmed)) {
      setSavedSubscribers((prev) => [...prev, trimmed]);
    }
    try {
      await saveSubscriberToFirestore(trimmed, 'restock_alert', product.id);
    } catch {
      // Saved locally if offline
    } finally {
      setRestockSaving(false);
      setRestockSubscribed(true);
      setRestockEmail('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
      className="fixed inset-0 z-50 bg-[#10243D]/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 lg:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-white sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[100dvh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Bar */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500 truncate">
            <span className="font-semibold text-[#10243D]">
              {product.category}
            </span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span className="font-mono">{product.sku}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-[#10243D] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Two-Column Contiguous PDP Layout */}
        <div className="overflow-y-auto p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Product Photography + Listing Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white border border-slate-200/80">
                <ResilientImage
                  src={activeImage || product.image}
                  alt={product.imageAlt}
                  fallbackLabel={product.title}
                  fallbackSubtext={
                    canOrder
                      ? 'Exact supplier product photo pending upload'
                      : 'Currently out of stock'
                  }
                  className="w-full h-full object-contain"
                />
              </div>

              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2.5">
                  {product.galleryImages.map((imgUrl, idx) => {
                    const isSelected = (activeImage || product.image) === imgUrl;
                    return (
                      <button
                        key={imgUrl}
                        type="button"
                        onClick={() => setActiveImage(imgUrl)}
                        aria-label={`View photo ${idx + 1} of ${product.title}`}
                        className={`aspect-square rounded-xl overflow-hidden border transition cursor-pointer bg-white ${
                          isSelected
                            ? 'border-[#F47721] ring-2 ring-[#F47721]/30'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.title} view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {product.specs.length > 0 && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-display text-sm font-semibold text-[#10243D]">
                    Listed Product Details
                  </h3>
                </div>
                <dl className="divide-y divide-slate-100 text-sm">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <dt className="text-slate-500">{spec.label}</dt>
                      <dd className="font-medium text-[#10243D] text-right tabular-nums">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span
                className={
                  !canOrder
                    ? 'text-rose-700 font-semibold'
                    : product.stockConfirmationStatus === 'pending_confirmation'
                    ? 'text-amber-800 font-semibold'
                    : 'text-emerald-700 font-semibold'
                }
              >
                {stockLabel}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="text-slate-500">
                {storeSettings.estimatedDeliveryWindow}
              </span>
            </div>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#10243D] leading-tight">
              {language === 'ur' ? product.titleUr : product.title}
            </h2>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="tabular-nums font-display text-3xl font-bold text-[#10243D]">
                {formatPkr(product.sellingPricePkr)}
              </span>
              {product.compareAtPricePkr && (
                <span className="tabular-nums text-base text-slate-400 line-through">
                  {formatPkr(product.compareAtPricePkr)}
                </span>
              )}
              {discountPct !== null && (
                <span className="tabular-nums text-sm font-semibold text-[#F47721]">
                  Save {discountPct}%
                </span>
              )}
            </div>

            <p
              className={`mt-4 text-sm sm:text-base text-slate-600 leading-relaxed ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {language === 'ur' ? product.descriptionUr : product.description}
            </p>

            {product.conditionNote && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>{product.conditionNote}</span>
              </div>
            )}

            {/* Available Colours Selector */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-[#10243D] mb-2">
                  Colour Option:{' '}
                  <span className="text-slate-600 font-normal">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      disabled={!canOrder}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                        selectedColor === color
                          ? 'border-[#10243D] bg-[#10243D] text-white'
                          : 'border-slate-200 bg-white text-[#10243D] hover:border-slate-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Action Buttons */}
            <div className="mt-7 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    disabled={!canOrder}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-11 h-11 flex items-center justify-center text-[#10243D] hover:bg-slate-200/70 rounded-l-xl disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center tabular-nums text-sm font-semibold text-[#10243D]">
                    {canOrder ? quantity : 0}
                  </span>
                  <button
                    type="button"
                    disabled={!canOrder || quantity >= product.stock}
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock || 1, q + 1))
                    }
                    aria-label="Increase quantity"
                    className="w-11 h-11 flex items-center justify-center text-[#10243D] hover:bg-slate-200/70 rounded-r-xl disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  className={`h-11 px-4 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'border-[#F47721] bg-[#F47721]/10 text-[#F47721]'
                      : 'border-slate-200 text-[#10243D] hover:bg-slate-50'
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isWishlisted ? 'currentColor' : 'none'}
                  />
                  <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!canOrder}
                  onClick={handleAdd}
                  className={`h-12 px-5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed ${
                    justAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#10243D] hover:bg-[#183558] text-white'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{copy.addedToCart}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{canOrder ? copy.addToCart : 'Out of Stock'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!canOrder}
                  onClick={() => onBuyNowCod(product.id, quantity, selectedColor)}
                  className="h-12 px-5 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  Order via Cash on Delivery
                </button>
              </div>
            </div>

            {!canOrder && (
              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#10243D]">
                  <Bell className="w-4 h-4 text-[#F47721]" />
                  <span>Restock Alerts — Get notified when back in stock</span>
                </div>
                {restockSubscribed ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Thanks! You&apos;re subscribed.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleRestockSubmit}
                    noValidate
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="email"
                      value={restockEmail}
                      onChange={(e) => setRestockEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-label="Email for restock alerts"
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-[#10243D] placeholder:text-slate-400 focus:border-[#F47721] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={restockSaving}
                      className="h-10 px-4 rounded-xl bg-[#10243D] hover:bg-[#183558] disabled:opacity-60 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      {restockSaving ? 'Saving...' : 'Notify Me'}
                    </button>
                  </form>
                )}
                {restockError && (
                  <p className="text-xs font-medium text-rose-700">
                    {restockError}
                  </p>
                )}
              </div>
            )}

            {/* Customer COD Transparency */}
            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#F47721] shrink-0 mt-0.5" />
                <span>
                  {storeSettings.freeDeliveryThresholdPkr > 0 ? (
                    <>
                      Free COD delivery above{' '}
                      <strong className="text-[#10243D]">
                        {formatPkr(storeSettings.freeDeliveryThresholdPkr)}
                      </strong>{' '}
                      (otherwise Rs. {storeSettings.standardDeliveryFeePkr}{' '}
                      flat across Pakistan).
                    </>
                  ) : (
                    'Free Cash on Delivery across Pakistan.'
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#10243D] shrink-0 mt-0.5" />
                <span>
                  Order details are sent via WhatsApp so supplier stock can be
                  reconfirmed before dispatch.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
