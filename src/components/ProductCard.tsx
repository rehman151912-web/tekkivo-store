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

  const handleAdd = () => {
    if (!canOrder) return;
    onAddToCart(product.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  // Single concise badge: real discount first, otherwise Out of Stock or New Arrival (max 1)
  const cornerTag =
    discountPct !== null
      ? {
          text: `-${discountPct}%`,
          className: 'bg-[#F47721] text-white',
        }
      : !canOrder
      ? {
          text: 'Out of Stock',
          className: 'bg-slate-800 text-white',
        }
      : product.isNewArrival
      ? {
          text: 'New',
          className: 'bg-[#10243D] text-white',
        }
      : product.isBestSeller
      ? {
          text: 'Best Seller',
          className: 'bg-[#10243D] text-white',
        }
      : null;

  return (
    <article className="group bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col transition-all">
      {/* Compact Square-Proportioned Image Box (~124-136px on mobile, ~140px on desktop) */}
      <div className="relative h-[124px] sm:h-[136px] xl:h-[144px] w-full bg-white border-b border-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          className="w-full h-full block p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F47721]"
          aria-label={`View details for ${product.title}`}
        >
          <ResilientImage
            src={product.image}
            alt={product.imageAlt}
            fallbackLabel={product.title}
            fallbackSubtext={
              canOrder ? 'Photo pending upload' : 'Currently out of stock'
            }
            className="w-full h-full object-contain"
          />
        </button>

        {cornerTag && (
          <span
            className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums leading-none ${cornerTag.className}`}
          >
            {cornerTag.text}
          </span>
        )}

        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          aria-pressed={isWishlisted}
          className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
            isWishlisted
              ? 'bg-[#F47721] text-white shadow-xs'
              : 'bg-white/95 text-[#10243D] hover:bg-slate-100 border border-slate-200/70'
          }`}
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Compact Card Body: Small Readable Title, Clear PKR Price, Compact Add to Cart */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <h3 className="font-display text-xs sm:text-[13px] font-semibold text-[#10243D] leading-snug line-clamp-2 min-h-[2.1rem] sm:min-h-[2.25rem]">
          <button
            type="button"
            onClick={() => onOpenDetail(product)}
            className="text-left hover:text-[#F47721] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            {language === 'ur' ? product.titleUr : product.title}
          </button>
        </h3>

        {/* Price in PKR (No fake discounts, no fake star ratings) */}
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <span className="tabular-nums font-display text-sm sm:text-[15px] font-bold text-[#10243D]">
            {formatPkr(product.sellingPricePkr)}
          </span>
          {product.compareAtPricePkr &&
            product.compareAtPricePkr > product.sellingPricePkr && (
              <span className="tabular-nums text-[11px] text-slate-400 line-through">
                {formatPkr(product.compareAtPricePkr)}
              </span>
            )}
        </div>

        {/* Compact Full-Width Add to Cart */}
        <div className="mt-auto pt-2">
          <button
            type="button"
            disabled={!canOrder}
            onClick={handleAdd}
            aria-label={
              canOrder ? `${copy.addToCart} ${product.title}` : 'Out of Stock'
            }
            className={`w-full h-8 sm:h-9 px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#10243D] hover:bg-[#F47721] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{copy.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>{canOrder ? copy.addToCart : 'Out of Stock'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
