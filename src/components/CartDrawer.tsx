import { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, Product } from '../types/store';
import { buildCartSummary } from '../utils/cart';
import { formatPkr } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  products: Product[];
  onClose: () => void;
  onUpdateQuantity: (
    productId: string,
    quantity: number,
    selectedColor?: string
  ) => void;
  onRemoveItem: (productId: string, selectedColor?: string) => void;
  onOpenCartPage: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  cartItems,
  products,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCartPage,
  onProceedToCheckout,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const summary = buildCartSummary(cartItems, products);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
      className="fixed inset-0 z-50 bg-[#10243D]/55 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#F47721]" />
            <h2 className="font-display text-lg font-bold text-[#10243D]">
              Shopping Cart
            </h2>
            <span className="tabular-nums text-xs font-medium text-slate-500">
              ({summary.totalItemCount} items)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping cart"
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-[#10243D] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress */}
        {summary.detailedItems.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80">
            <p className="text-xs font-medium text-[#10243D]">
              {summary.remainingForFreeDeliveryPkr === 0
                ? 'Unlocked: Free Cash on Delivery across Pakistan.'
                : `Add ${formatPkr(
                    summary.remainingForFreeDeliveryPkr
                  )} more to unlock Free COD Delivery.`}
            </p>
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F47721] transition-all duration-200"
                style={{ width: `${summary.freeProgressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {summary.detailedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="font-display text-base font-semibold text-[#10243D]">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-slate-500 max-w-xs">
                Browse our catalog and add available products to place a Cash on
                Delivery order.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 h-10 px-5 rounded-xl bg-[#10243D] text-white text-sm font-semibold hover:bg-[#183558] transition-colors cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            summary.detailedItems.map(
              ({ product, quantity, selectedColor, lineTotalPkr }) => (
                <div
                  key={`${product.id}-${selectedColor || 'default'}`}
                  className="flex gap-4 pb-4 border-b border-slate-100 last:border-b-0"
                >
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#F5F7FA] border border-slate-200/70 shrink-0">
                    <ResilientImage
                      src={product.image}
                      alt={product.imageAlt}
                      fallbackLabel={product.sku}
                      fallbackSubtext="Photo pending"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-semibold text-[#10243D] leading-snug line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                      {formatPkr(product.sellingPricePkr)} each · {product.sku}
                      {selectedColor ? ` · ${selectedColor}` : ''}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(
                              product.id,
                              quantity - 1,
                              selectedColor
                            )
                          }
                          aria-label={`Decrease ${product.title} quantity`}
                          className="w-8 h-8 flex items-center justify-center text-[#10243D] hover:bg-slate-200/70 rounded-l-lg cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center tabular-nums text-xs font-semibold text-[#10243D]">
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
                          aria-label={`Increase ${product.title} quantity`}
                          className="w-8 h-8 flex items-center justify-center text-[#10243D] hover:bg-slate-200/70 rounded-r-lg disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="tabular-nums text-sm font-bold text-[#10243D]">
                          {formatPkr(lineTotalPkr)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveItem(product.id, selectedColor)
                          }
                          aria-label={`Remove ${product.title} from cart`}
                          className="p-1.5 text-slate-400 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Footer Totals & Page Links */}
        {summary.detailedItems.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#10243D]">
                  {formatPkr(summary.subtotalPkr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pakistan COD Shipping</span>
                <span className="tabular-nums font-medium text-[#10243D]">
                  {summary.shippingFeePkr === 0
                    ? 'FREE'
                    : formatPkr(summary.shippingFeePkr)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-[#10243D]">
                <span>Total (Cash on Delivery)</span>
                <span className="tabular-nums">
                  {formatPkr(summary.totalPkr)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onOpenCartPage}
                className="h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#10243D] text-sm font-semibold transition-colors cursor-pointer"
              >
                View Cart Page
              </button>
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="h-11 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10243D]"
              >
                Checkout (COD)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
