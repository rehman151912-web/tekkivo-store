import { useState } from 'react';
import { Check, Heart, ShoppingBag } from 'lucide-react';
import { COPY } from '../data/translations';
import { LanguageMode, Product } from '../types/store';
import { isProductOrderable } from '../utils/cart';
import { formatPkr, getDiscountPercentage } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  language: LanguageMode;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onOpenDetail: (product: Product) => void;
}

export function ProductCard({
  product,
  language,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenDetail,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const copy = COPY[language];
  const discountPct = getDiscountPercentage(
    product.sellingPricePkr,
    product.compareAtPricePkr
  );
  const canOrder = isProductOrderable(product);

  const stockLabel =
    product.stockConfirmationStatus === 'out_of_stock' || product.stock <= 0
      ? 'Out of Stock'
      : product.stockConfirmationStatus === 'pending_confirmation'
      ? `Pending Confirmation (${product.stock})`
      : `In Stock (${product.stock})`;

  const stockColorClass =
    product.stockConfirmationStatus === 'out_of_stock' || product.stock <= 0
      ? 'text-rose-700 font-semibold'
      : product.stockConfirmationStatus === 'pending_confirmation'
      ? 'text-amber-800 font-medium'
      : 'text-emerald-700 font-medium';

  const handleAdd = () => {
    if (!canOrder) return;
    onAddToCart(product.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full bg-[#F5F7FA] overflow-hidden">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          className="w-full h-full block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F47721]"
          aria-label={`View details for ${product.title}`}
        >
          <ResilientImage
            src={product.image}
            alt={product.imageAlt}
            fallbackLabel={product.title}
            fallbackSubtext={
              canOrder
                ? 'Exact product photo pending upload'
                : 'Currently out of stock'
            }
            className="w-full h-full object-cover"
          />
        </button>

        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          aria-pressed={isWishlisted}
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
            isWishlisted
              ? 'bg-[#F47721] text-white shadow-sm'
              : 'bg-white/95 text-[#10243D] hover:bg-white shadow-sm'
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Product Metadata, Pricing & Action */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs text-slate-500">
          <span className="font-medium text-slate-600 truncate max-w-full">
            {product.category}
          </span>
          <span aria-hidden="true">·</span>
          <span className={stockColorClass}>{stockLabel}</span>
        </div>

        <h3 className="mt-1.5 font-display text-sm sm:text-[17px] font-semibold text-[#10243D] leading-snug line-clamp-2">
          <button
            type="button"
            onClick={() => onOpenDetail(product)}
            className="text-left hover:text-[#F47721] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            {language === 'ur' ? product.titleUr : product.title}
          </button>
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {product.shortSpec}
        </p>

        {product.conditionNote && (
          <p className="mt-2 text-[11px] sm:text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 line-clamp-2">
            {product.conditionNote}
          </p>
        )}

        <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="tabular-nums font-display text-base sm:text-lg font-bold text-[#10243D]">
                {formatPkr(product.sellingPricePkr)}
              </span>
              {product.compareAtPricePkr && (
                <span className="tabular-nums text-xs text-slate-400 line-through">
                  {formatPkr(product.compareAtPricePkr)}
                </span>
              )}
            </div>
            {discountPct !== null && (
              <p className="tabular-nums text-[11px] font-semibold text-[#F47721]">
                Save {discountPct}%
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!canOrder}
            onClick={handleAdd}
            aria-label={canOrder ? `${copy.addToCart} ${product.title}` : 'Unavailable'}
            className={`h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#10243D] hover:bg-[#F47721] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">{copy.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {canOrder ? copy.addToCart : 'Unavailable'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
