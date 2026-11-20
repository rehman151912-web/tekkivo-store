import { ArrowRight, Flame, SlidersHorizontal, Sparkles, Tag, TrendingUp, X } from 'lucide-react';
import {
  CategoryDefinition,
  LanguageMode,
  Product,
  ProductCategory,
} from '../types/store';
import { isProductOrderable } from '../utils/cart';
import { ProductCard } from './ProductCard';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'available';

interface CatalogSectionProps {
  language: LanguageMode;
  products: Product[];
  categories: ReadonlyArray<CategoryDefinition>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory | 'All') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onOpenDetail: (product: Product) => void;
}

export function CatalogSection({
  language,
  products,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onOpenDetail,
}: CatalogSectionProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isFilteredView =
    selectedCategory !== 'All' || Boolean(normalizedQuery);

  const filteredProducts = products
    .filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (sortBy === 'available' && !isProductOrderable(product)) {
        return false;
      }
      if (!normalizedQuery) return true;
      return (
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.titleUr.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.shortSpec.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.sellingPricePkr - b.sellingPricePkr;
      if (sortBy === 'price-desc') return b.sellingPricePkr - a.sellingPricePkr;
      if (sortBy === 'featured') {
        const orderA =
          Number(isProductOrderable(a)) * 2 + Number(Boolean(a.isBestSeller));
        const orderB =
          Number(isProductOrderable(b)) * 2 + Number(Boolean(b.isBestSeller));
        return orderB - orderA;
      }
      return 0;
    });

  // Curated Homepage Showcase Slices (when viewing All unfiltered)
  const featuredProducts = products
    .filter((p) => p.isFeatured && isProductOrderable(p))
    .slice(0, 6);
  const newArrivals = products
    .filter((p) => p.isNewArrival && isProductOrderable(p))
    .slice(0, 6);
  const bestSellers = products
    .filter((p) => (p.isBestSeller || p.isTrending) && isProductOrderable(p))
    .slice(0, 6);
  const specialDeals = products
    .filter(
      (p) =>
        isProductOrderable(p) &&
        ((p.compareAtPricePkr && p.compareAtPricePkr > p.sellingPricePkr) ||
          p.sellingPricePkr <= 1500)
    )
    .sort((a, b) => {
      const hasDiscountA =
        a.compareAtPricePkr && a.compareAtPricePkr > a.sellingPricePkr ? 1 : 0;
      const hasDiscountB =
        b.compareAtPricePkr && b.compareAtPricePkr > b.sellingPricePkr ? 1 : 0;
      if (hasDiscountA !== hasDiscountB) return hasDiscountB - hasDiscountA;
      return a.sellingPricePkr - b.sellingPricePkr;
    })
    .slice(0, 6);

  const activeCategoryDef =
    selectedCategory === 'All'
      ? null
      : categories.find((c) => c.name === selectedCategory);
  const headingLabel =
    selectedCategory === 'All'
      ? 'All Products'
      : activeCategoryDef?.shortLabel || selectedCategory;

  const gridClass =
    'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3.5';

  const scrollToAll = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F8FAFC] border-t border-slate-200/70">
      {/* 4. FEATURED PRODUCTS (Most Important Section on Unfiltered Storefront) */}
      {!isFilteredView && featuredProducts.length > 0 && (
        <section
          id="featured-products"
          aria-label="Featured Products"
          className="pt-6 pb-4 sm:pt-8 sm:pb-6"
        >
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 mb-3.5 sm:mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#F47721] shrink-0" />
                <h2 className="font-display text-base sm:text-xl font-bold text-[#10243D] tracking-tight">
                  Featured Products
                </h2>
              </div>
              <button
                type="button"
                onClick={scrollToAll}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#10243D] hover:text-[#F47721] transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>View all products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={gridClass}>
              {featuredProducts.map((product) => (
                <ProductCard
                  key={`feat-${product.id}`}
                  product={product}
                  language={language}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5A. NEW ARRIVALS */}
      {!isFilteredView && newArrivals.length > 0 && (
        <section
          id="new-arrivals"
          aria-label="New Arrivals"
          className="py-4 sm:py-5 border-t border-slate-200/60"
        >
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F47721] shrink-0" />
                <h2 className="font-display text-base sm:text-lg font-bold text-[#10243D] tracking-tight">
                  New Arrivals
                </h2>
              </div>
              <button
                type="button"
                onClick={scrollToAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#F47721] transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Explore all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={gridClass}>
              {newArrivals.map((product) => (
                <ProductCard
                  key={`new-${product.id}`}
                  product={product}
                  language={language}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5B. BEST SELLERS */}
      {!isFilteredView && bestSellers.length > 0 && (
        <section
          id="best-sellers"
          aria-label="Best Sellers"
          className="py-4 sm:py-5 border-t border-slate-200/60"
        >
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#10243D] shrink-0" />
                <h2 className="font-display text-base sm:text-lg font-bold text-[#10243D] tracking-tight">
                  Best Sellers
                </h2>
              </div>
              <button
                type="button"
                onClick={scrollToAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#F47721] transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Explore all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={gridClass}>
              {bestSellers.map((product) => (
                <ProductCard
                  key={`best-${product.id}`}
                  product={product}
                  language={language}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5C. SPECIAL DEALS */}
      {!isFilteredView && specialDeals.length > 0 && (
        <section
          id="special-deals"
          aria-label="Special Deals"
          className="py-4 sm:py-5 border-t border-slate-200/60"
        >
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[#F47721] shrink-0" />
                <h2 className="font-display text-base sm:text-lg font-bold text-[#10243D] tracking-tight">
                  Special Deals &amp; Value Picks
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onSortChange('price-asc')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#F47721] transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Lowest price first</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={gridClass}>
              {specialDeals.map((product) => (
                <ProductCard
                  key={`deal-${product.id}`}
                  product={product}
                  language={language}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5D. ALL PRODUCTS (Full Searchable, Filterable & Sortable Grid) */}
      <section
        id="catalog"
        aria-label="All Products Catalog"
        className="py-6 sm:py-8 border-t border-slate-200/80"
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#10243D] tracking-tight">
                {headingLabel}
              </h2>
              <span className="text-xs sm:text-sm text-slate-500 tabular-nums">
                · {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>

              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => onSelectCategory('All')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-[#10243D] hover:border-[#F47721] cursor-pointer"
                >
                  <span>Clear category</span>
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}

              {normalizedQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-[#10243D] hover:border-[#F47721] cursor-pointer"
                >
                  <span>“{searchQuery.trim()}”</span>
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}
            </div>

            <div className="relative flex items-center shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <select
                aria-label="Sort products by price or availability"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="h-9 sm:h-10 pl-9 pr-7 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-[#10243D] focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="available">Available Only</option>
              </select>
            </div>
          </div>

          {/* Horizontal Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-4">
            <button
              type="button"
              onClick={() => onSelectCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#10243D] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-[#10243D]/40'
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#10243D] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#10243D]/40'
                  }`}
                >
                  {cat.shortLabel || cat.name}
                </button>
              );
            })}
          </div>

          {filteredProducts.length > 0 ? (
            <div className={gridClass}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center">
              <p className="font-display text-base sm:text-lg font-semibold text-[#10243D]">
                {selectedCategory !== 'All' && !normalizedQuery
                  ? `No products listed in ${selectedCategory} yet`
                  : 'No matching products found'}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                {selectedCategory !== 'All' && !normalizedQuery
                  ? 'New products can be added anytime from the Admin & Product Manager.'
                  : 'Try clearing your search keyword or switching back to All Products.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onSelectCategory('All');
                  onSortChange('featured');
                }}
                className="mt-4 h-10 px-5 rounded-xl bg-[#10243D] text-white text-xs sm:text-sm font-semibold hover:bg-[#183558] transition-colors cursor-pointer"
              >
                Show All Products
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
