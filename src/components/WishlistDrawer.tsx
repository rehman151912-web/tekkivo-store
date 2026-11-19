import { useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { Product } from '../types/store';
import { isProductOrderable } from '../utils/cart';
import { formatPkr } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistIds: string[];
  products: Product[];
  onClose: () => void;
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (productId: string) => void;
  onOpenProduct: (product: Product) => void;
}

export function WishlistDrawer({
  isOpen,
  wishlistIds,
  products,
  onClose,
  onRemoveFromWishlist,
  onMoveToCart,
  onOpenProduct,
}: WishlistDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved wishlist"
      className="fixed inset-0 z-50 bg-[#10243D]/55 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#F47721]" />
            <h2 className="font-display text-lg font-bold text-[#10243D]">
              Saved Wishlist
            </h2>
            <span className="tabular-nums text-xs font-medium text-slate-500">
              ({savedProducts.length})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-[#10243D] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {savedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7" />
              </div>
              <p className="font-display text-base font-semibold text-[#10243D]">
                No saved items yet
              </p>
              <p className="mt-1 text-sm text-slate-500 max-w-xs">
                Tap the heart icon on any item to save it for later.
              </p>
            </div>
          ) : (
            savedProducts.map((product) => {
              const canOrder = isProductOrderable(product);
              return (
                <div
                  key={product.id}
                  className="flex gap-4 pb-4 border-b border-slate-100 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenProduct(product);
                    }}
                    className="w-20 h-16 rounded-xl overflow-hidden bg-[#F5F7FA] border border-slate-200/70 shrink-0 cursor-pointer"
                  >
                    <ResilientImage
                      src={product.image}
                      alt={product.imageAlt}
                      fallbackLabel={product.sku}
                      fallbackSubtext="Photo pending"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenProduct(product);
                      }}
                      className="text-left font-display text-sm font-semibold text-[#10243D] hover:text-[#F47721] line-clamp-2 cursor-pointer"
                    >
                      {product.title}
                    </button>
                    <p className="mt-1 tabular-nums text-sm font-bold text-[#10243D]">
                      {formatPkr(product.sellingPricePkr)}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!canOrder}
                        onClick={() => onMoveToCart(product.id)}
                        className="h-8 px-3 rounded-lg bg-[#10243D] hover:bg-[#F47721] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{canOrder ? 'Move to Cart' : 'Out of Stock'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveFromWishlist(product.id)}
                        aria-label={`Remove ${product.title} from wishlist`}
                        className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
