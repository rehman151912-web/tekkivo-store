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
      ? 'Out of Stock · Unavailable'
      : product.stockConfirmationStatus === 'pending_confirmation'
      ? `Pending Stock Confirmation (${product.stock} listed)`
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
    <article className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      {/* Product Photography Slot */}
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
                ? 'Exact HHC photo pending upload'
                : 'Currently out of stock'
            }
            className="w-full h-full object-cover"
          />
        </button>

        {/* Wishlist Action */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          aria-pressed={isWishlisted}
          className={`absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
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

      {/* Product Metadata, Pricing & Controls */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Clean Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
          <span className="font-medium text-slate-600">{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className={stockColorClass}>{stockLabel}</span>
        </div>

        {/* Title */}
        <h3 className="mt-2 font-display text-base sm:text-[17px] font-semibold text-[#10243D] leading-snug">
          <button
            type="button"
            onClick={() => onOpenDetail(product)}
            className="text-left hover:text-[#F47721] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            {language === 'ur' ? product.titleUr : product.title}
          </button>
        </h3>

        {/* Exact Listing Summary */}
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {product.shortSpec}
        </p>

        {/* Condition / Packaging / Authenticity Note */}
        {product.conditionNote && (
          <p className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            {product.conditionNote}
          </p>
        )}

        {/* Price Row & Action */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="tabular-nums font-display text-lg font-bold text-[#10243D]">
                {formatPkr(product.sellingPricePkr)}
              </span>
              {product.compareAtPricePkr && (
                <span className="tabular-nums text-xs text-slate-400 line-through">
                  {formatPkr(product.compareAtPricePkr)}
                </span>
              )}
            </div>
            {discountPct !== null && (
              <p className="tabular-nums text-xs font-semibold text-[#F47721]">
                Save {discountPct}%
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!canOrder}
            onClick={handleAdd}
            className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#10243D] hover:bg-[#F47721] text-white'
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
                <span>{canOrder ? copy.addToCart : 'Unavailable'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
