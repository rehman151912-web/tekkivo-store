import { FormEvent, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { PAKISTAN_CITIES, STORE_CONFIG } from '../config/store';
import { COPY } from '../data/translations';
import {
  CartItem,
  LanguageMode,
  OrderReceipt,
  Product,
} from '../types/store';
import { buildCartSummary } from '../utils/cart';
import {
  buildWhatsAppOrderSummary,
  formatPkr,
  formatWhatsAppDisplayNumber,
  generateOrderReference,
  getWhatsAppUrl,
  launchWhatsAppHandoff,
} from '../utils/currency';
import {
  CheckoutFieldName,
  validateCheckoutForm,
} from '../utils/validation';
import { ResilientImage } from './ResilientImage';

interface CheckoutPageProps {
  language: LanguageMode;
  cartItems: CartItem[];
  products: Product[];
  onBackToCart: () => void;
  onContinueShopping: () => void;
  onSaveDemoOrder: (order: OrderReceipt) => void;
  onWhatsAppHandoffComplete: () => void;
  onRestoreCartItems: (items: CartItem[]) => void;
}

interface HandoffState {
  receipt: OrderReceipt;
  whatsappUrl: string;
  originalCartSnapshot: CartItem[];
}

export function CheckoutPage({
  language,
  cartItems,
  products,
  onBackToCart,
  onContinueShopping,
  onSaveDemoOrder,
  onWhatsAppHandoffComplete,
  onRestoreCartItems,
}: CheckoutPageProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [customCity, setCustomCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<
    Partial<Record<CheckoutFieldName, string>>
  >({});
  const [handoff, setHandoff] = useState<HandoffState | null>(null);
  const [copied, setCopied] = useState(false);

  const copy = COPY[language];
  const summary = buildCartSummary(cartItems, products);

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();

    const validation = validateCheckoutForm(
      {
        fullName,
        phone,
        city,
        customCity,
        address,
        notes,
      },
      summary.detailedItems.length
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    const baseReceipt: Omit<OrderReceipt, 'whatsappMessage'> = {
      orderRef: generateOrderReference(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      hhcFulfillmentRef: '',
      customer: {
        fullName: fullName.trim(),
        phone: validation.normalizedPhone || phone.trim(),
        city,
        customCity: city === 'Other City' ? customCity.trim() : undefined,
        address: address.trim(),
        notes: notes.trim() || undefined,
        paymentMethod: 'COD',
      },
      items: summary.detailedItems.map((entry) => ({
        productId: entry.product.id,
        sku: entry.product.sku,
        title: entry.product.title,
        selectedColor: entry.selectedColor,
        quantity: entry.quantity,
        unitPricePkr: entry.product.sellingPricePkr,
        lineTotalPkr: entry.lineTotalPkr,
      })),
      subtotalPkr: summary.subtotalPkr,
      shippingFeePkr: summary.shippingFeePkr,
      totalPkr: summary.totalPkr,
    };

    const whatsappMessage = buildWhatsAppOrderSummary(baseReceipt);
    const fullReceipt: OrderReceipt = {
      ...baseReceipt,
      whatsappMessage,
    };

    const whatsappUrl = getWhatsAppUrl(
      STORE_CONFIG.ownerWhatsAppNumber,
      whatsappMessage
    );

    // Save locally for demo inspection ONLY with status 'pending'
    onSaveDemoOrder(fullReceipt);

    // Open official wa.me link with URL-encoded order message
    const launched = launchWhatsAppHandoff(whatsappUrl);

    const snapshot = summary.detailedItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
    }));

    setHandoff({
      receipt: fullReceipt,
      whatsappUrl,
      originalCartSnapshot: snapshot,
    });

    if (launched) {
      onWhatsAppHandoffComplete();
    }
  };

  const handleManualWhatsAppRetry = () => {
    if (!handoff) return;
    const launched = launchWhatsAppHandoff(handoff.whatsappUrl);
    if (launched && cartItems.length > 0) {
      onWhatsAppHandoffComplete();
    }
  };

  const handleCopySummary = async () => {
    if (!handoff) return;
    try {
      await navigator.clipboard.writeText(handoff.receipt.whatsappMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const handleRestoreToCart = () => {
    if (!handoff) return;
    onRestoreCartItems(handoff.originalCartSnapshot);
    setHandoff(null);
    onBackToCart();
  };

  if (handoff) {
    return (
      <section
        aria-label="WhatsApp Order Submission Instructions"
        className="py-8 sm:py-12 bg-slate-50/60 min-h-[70vh]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 sm:p-6 flex items-start gap-3.5">
            <AlertCircle className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-900">
                Status: Pending · Order Reference{' '}
                <span className="font-mono">{handoff.receipt.orderRef}</span>
              </p>
              <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#10243D]">
                Press Send in WhatsApp to Submit Your Order
              </h1>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                WhatsApp has been opened with your prefilled Cash on Delivery
                order message.{' '}
                <strong>
                  Your order is NOT confirmed or submitted until you press Send
                  in WhatsApp.
                </strong>
              </p>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Demo Storage Notice: A copy of this order (
                <span className="font-mono">{handoff.receipt.orderRef}</span>)
                was saved in your browser&apos;s{' '}
                <code className="font-mono">localStorage</code> for
                demonstration purposes only.{' '}
                <strong>
                  localStorage is not a secure central order database
                </strong>{' '}
                — only messages sent to our WhatsApp reach our team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="font-display text-sm font-bold text-[#10243D]">
                  Prefilled WhatsApp Order Message
                </h2>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10243D] hover:text-[#F47721] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-xl border border-slate-200 p-4 max-h-80 overflow-y-auto">
                {handoff.receipt.whatsappMessage}
              </pre>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h2 className="font-display text-base font-bold text-[#10243D]">
                  Complete Submission on WhatsApp
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Store WhatsApp:{' '}
                  <span className="font-mono font-semibold text-[#10243D]">
                    {formatWhatsAppDisplayNumber(
                      STORE_CONFIG.ownerWhatsAppNumber
                    )}
                  </span>
                </p>
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs sm:text-sm space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Reference</span>
                    <span className="font-mono font-semibold text-[#10243D]">
                      {handoff.receipt.orderRef}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Customer</span>
                    <span className="font-semibold text-[#10243D]">
                      {handoff.receipt.customer.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment</span>
                    <span className="font-semibold text-[#10243D]">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                    <span>Total Payable</span>
                    <span className="tabular-nums font-bold text-[#10243D]">
                      {formatPkr(handoff.receipt.totalPkr)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <a
                  href={handoff.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleManualWhatsAppRetry()}
                  className="w-full h-12 px-5 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp to Press Send</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleRestoreToCart}
                  className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#10243D] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Edit Order & Restore Cart</span>
                </button>

                <button
                  type="button"
                  onClick={onContinueShopping}
                  className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#10243D] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (summary.detailedItems.length === 0) {
    return (
      <section
        aria-label="Empty Cart Checkout Guard"
        className="py-12 sm:py-16 bg-slate-50/60 min-h-[70vh]"
      >
        <div className="max-w-xl mx-auto px-4 text-center rounded-3xl border border-slate-200 bg-white p-8 sm:p-12">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#10243D]">
            Cannot Checkout with an Empty Cart
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Please add at least one available product to your cart before
            entering your Pakistani Cash on Delivery details.
          </p>
          <button
            type="button"
            onClick={onContinueShopping}
            className="mt-6 h-12 px-6 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Browse TEKKIVO Products
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Cash on Delivery Checkout Page"
      className="py-8 sm:py-12 bg-slate-50/60 min-h-[70vh]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-6 border-b border-slate-200/80">
          <button
            type="button"
            onClick={onBackToCart}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#10243D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping Cart</span>
          </button>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
            {copy.checkoutTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Complete your Pakistani delivery details below. Clicking PLACE ORDER
            opens WhatsApp so you can send your order summary directly.
          </p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          noValidate
          className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5">
            <h2 className="font-display text-lg font-bold text-[#10243D]">
              Delivery Details (Pakistan)
            </h2>

            <div>
              <label
                htmlFor="checkout-full-name"
                className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="checkout-full-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.fullName)}
                placeholder="e.g. Hamza Tariq"
                className={`w-full h-12 px-4 rounded-xl border text-sm text-[#10243D] focus:outline-none focus:ring-2 transition-colors ${
                  errors.fullName
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-[#F47721] focus:ring-[#F47721]/20'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs font-medium text-rose-700">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-mobile"
                  className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
                >
                  Pakistani Mobile Number *
                </label>
                <input
                  id="checkout-mobile"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  placeholder="03XX-XXXXXXX"
                  className={`w-full h-12 px-4 rounded-xl border text-sm text-[#10243D] tabular-nums focus:outline-none focus:ring-2 transition-colors ${
                    errors.phone
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-[#F47721] focus:ring-[#F47721]/20'
                  }`}
                />
                {errors.phone ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-700">
                    {errors.phone}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Accepted: 03001234567, 0300-1234567, or +923001234567
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-city-select"
                  className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
                >
                  City *
                </label>
                <select
                  id="checkout-city-select"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city || errors.customCity) {
                      setErrors((prev) => ({
                        ...prev,
                        city: undefined,
                        customCity: undefined,
                      }));
                    }
                  }}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#10243D] focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1.5 text-xs font-medium text-rose-700">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            {city === 'Other City' && (
              <div>
                <label
                  htmlFor="checkout-other-city"
                  className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
                >
                  Enter Your City / Tehsil *
                </label>
                <input
                  id="checkout-other-city"
                  type="text"
                  value={customCity}
                  onChange={(e) => {
                    setCustomCity(e.target.value);
                    if (errors.customCity) {
                      setErrors((prev) => ({ ...prev, customCity: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.customCity)}
                  placeholder="e.g. Mardan, Rahim Yar Khan, Mirpur"
                  className={`w-full h-12 px-4 rounded-xl border text-sm text-[#10243D] focus:outline-none focus:ring-2 transition-colors ${
                    errors.customCity
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-[#F47721] focus:ring-[#F47721]/20'
                  }`}
                />
                {errors.customCity && (
                  <p className="mt-1.5 text-xs font-medium text-rose-700">
                    {errors.customCity}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="checkout-street-address"
                className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
              >
                Complete Delivery Address *
              </label>
              <textarea
                id="checkout-street-address"
                rows={3}
                autoComplete="street-address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) {
                    setErrors((prev) => ({ ...prev, address: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.address)}
                placeholder="House / Flat No., Street, Sector / Block, Nearest Landmark"
                className={`w-full p-4 rounded-xl border text-sm text-[#10243D] focus:outline-none focus:ring-2 transition-colors ${
                  errors.address
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-[#F47721] focus:ring-[#F47721]/20'
                }`}
              />
              {errors.address && (
                <p className="mt-1.5 text-xs font-medium text-rose-700">
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="checkout-order-notes"
                className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
              >
                Order Notes (Optional)
              </label>
              <input
                id="checkout-order-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please call before delivery after 3 PM"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-[#10243D] focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs sm:text-sm font-semibold text-[#10243D] mb-2">
                Payment Method
              </p>
              <div className="rounded-2xl border border-[#10243D] bg-slate-50 p-4 flex items-start gap-3">
                <Banknote className="w-5 h-5 text-[#F47721] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#10243D]">
                    Cash on Delivery (COD)
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Pay in Pakistani Rupees (PKR) at your doorstep upon parcel
                    delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-[#10243D]">
              Order Summary
            </h2>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {summary.detailedItems.map(
                ({ product, quantity, selectedColor, lineTotalPkr }) => (
                  <div
                    key={`${product.id}-${selectedColor || 'default'}`}
                    className="py-3 flex items-center gap-3"
                  >
                    <div className="w-14 h-11 rounded-lg overflow-hidden bg-[#F5F7FA] border border-slate-200/70 shrink-0">
                      <ResilientImage
                        src={product.image}
                        alt={product.imageAlt}
                        fallbackLabel={product.sku}
                        fallbackSubtext="Pending"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#10243D] truncate">
                        {product.title}
                        {selectedColor ? ` (${selectedColor})` : ''}
                      </p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {product.sku} · Qty {quantity} ×{' '}
                        {formatPkr(product.sellingPricePkr)}
                      </p>
                    </div>
                    <span className="tabular-nums text-sm font-bold text-[#10243D] shrink-0">
                      {formatPkr(lineTotalPkr)}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold text-[#10243D]">
                  {formatPkr(summary.subtotalPkr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pakistan COD Shipping</span>
                <span className="tabular-nums font-semibold text-[#10243D]">
                  {summary.shippingFeePkr === 0
                    ? 'FREE'
                    : formatPkr(summary.shippingFeePkr)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base sm:text-lg font-bold text-[#10243D]">
                <span>Total Payable (COD)</span>
                <span className="tabular-nums">
                  {formatPkr(summary.totalPkr)}
                </span>
              </div>
            </div>

            {errors.cart && (
              <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                {errors.cart}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-13 rounded-xl bg-[#F47721] hover:bg-[#e06512] active:scale-[0.99] text-white text-base font-bold tracking-wide transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10243D]"
            >
              PLACE ORDER
            </button>

            <p
              className={`text-xs text-slate-500 leading-relaxed ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              Clicking <strong>PLACE ORDER</strong> opens WhatsApp (
              {formatWhatsAppDisplayNumber(STORE_CONFIG.ownerWhatsAppNumber)})
              with your prefilled order summary. You must press{' '}
              <strong>Send</strong> inside WhatsApp to submit your order.
            </p>
          </aside>
        </form>
      </div>
    </section>
  );
}
