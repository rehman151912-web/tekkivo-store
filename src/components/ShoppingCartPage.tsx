import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { STORE_CONFIG } from '../config/store';
import { CartItem, LanguageMode, Product } from '../types/store';
import { buildCartSummary } from '../utils/cart';
import { formatPkr } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ShoppingCartPageProps {
  language: LanguageMode;
  cartItems: CartItem[];
  products: Product[];
  onUpdateQuantity: (
    productId: string,
    nextQty: number,
    selectedColor?: string
  ) => void;
  onRemoveItem: (productId: string, selectedColor?: string) => void;
  onClearCart: () => void;
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
  onInspectProduct: (product: Product) => void;
}

export function ShoppingCartPage({
  language,
  cartItems,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onProceedToCheckout,
  onInspectProduct,
}: ShoppingCartPageProps) {
  const summary = buildCartSummary(cartItems, products);
  const isEmpty = summary.detailedItems.length === 0;

  return (
    <section
      aria-label="Shopping Cart Page"
      className="py-8 sm:py-12 bg-slate-50/60 min-h-[70vh]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <button
              type="button"
              onClick={onContinueShopping}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#10243D] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
              Shopping Cart
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 tabular-nums">
              {summary.totalItemCount}{' '}
              {summary.totalItemCount === 1 ? 'item' : 'items'} in your bag ·
              Prices in PKR
            </p>
          </div>

          {!isEmpty && (
            <button
              type="button"
              onClick={onClearCart}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs sm:text-sm font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#10243D]">
              Your shopping cart is empty
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
              Add available products to your bag before proceeding to Cash on
              Delivery checkout.
            </p>
            <button
              type="button"
              onClick={onContinueShopping}
              className="mt-7 h-12 px-7 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              {summary.detailedItems.map(
                ({ product, quantity, selectedColor, lineTotalPkr }) => (
                  <article
                    key={`${product.id}-${selectedColor || 'default'}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5"
                  >
                    <button
                      type="button"
                      onClick={() => onInspectProduct(product)}
                      aria-label={`View details for ${product.title}`}
                      className="w-full sm:w-32 aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F7FA] border border-slate-200/70 shrink-0 cursor-pointer"
                    >
                      <ResilientImage
                        src={product.image}
                        alt={product.imageAlt}
                        fallbackLabel={product.title}
                        fallbackSubtext="Photo pending"
                        className="w-full h-full object-cover"
                      />
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">
                            {product.category} ·{' '}
                            <span className="font-mono">{product.sku}</span>
                            {selectedColor ? ` · Colour: ${selectedColor}` : ''}
                          </p>
                          <h2 className="mt-1 font-display text-base sm:text-lg font-semibold text-[#10243D] leading-snug">
                            <button
                              type="button"
                              onClick={() => onInspectProduct(product)}
                              className="text-left hover:text-[#F47721] transition-colors cursor-pointer"
                            >
                              {language === 'ur'
                                ? product.titleUr
                                : product.title}
                            </button>
                          </h2>
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 tabular-nums">
                            Unit Price: {formatPkr(product.sellingPricePkr)} ·{' '}
                            <span className="text-amber-800 font-medium">
                              {product.stockConfirmationStatus === 'confirmed'
                                ? `In Stock (${product.stock})`
                                : `Pending Confirmation (${product.stock} listed)`}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onRemoveItem(product.id, selectedColor)
                          }
                          aria-label={`Remove ${product.title} from cart`}
                          className="h-10 px-3 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(
                                product.id,
                                quantity - 1,
                                selectedColor
                              )
                            }
                            aria-label={`Decrease quantity for ${product.title}`}
                            className="w-11 h-11 flex items-center justify-center text-[#10243D] hover:bg-slate-200/70 rounded-l-xl cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span
                            aria-label={`Quantity of ${product.title}`}
                            className="w-11 text-center tabular-nums text-sm font-bold text-[#10243D]"
                          >
                            {quantity}
                          </span>
                          <button
                            type="button"
                            disabled={quantity >= product.stock}
                            onClick={() =>
                              onUpdateQuantity(
                                product.id,
                                quantity + 1,
                                selectedColor
                              )
                            }
                            aria-label={`Increase quantity for ${product.title}`}
                            className="w-11 h-11 flex items-center justify-center text-[#10243D] hover:bg-slate-200/70 rounded-r-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">Item Total</p>
                          <p className="tabular-nums font-display text-lg font-bold text-[#10243D]">
                            {formatPkr(lineTotalPkr)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>

            <aside className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-5 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-bold text-[#10243D]">
                Order Summary
              </h2>

              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#10243D]">
                  <Truck className="w-4 h-4 text-[#F47721] shrink-0" />
                  <span>
                    {summary.remainingForFreeDeliveryPkr === 0
                      ? 'Unlocked: Free Cash on Delivery across Pakistan.'
                      : `Add ${formatPkr(
                          summary.remainingForFreeDeliveryPkr
                        )} more for Free COD Delivery.`}
                  </span>
                </div>
                <div className="mt-2.5 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F47721] transition-all duration-200"
                    style={{ width: `${summary.freeProgressPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({summary.totalItemCount} items)</span>
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
                  <span>Total (Cash on Delivery)</span>
                  <span className="tabular-nums">
                    {formatPkr(summary.totalPkr)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full h-12 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10243D]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-2 text-xs text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#10243D] shrink-0 mt-0.5" />
                <span>
                  {STORE_CONFIG.estimatedDeliveryWindow}. Payment collected at
                  your doorstep in PKR.
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
