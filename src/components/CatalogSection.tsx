import { Search, SlidersHorizontal, X } from 'lucide-react';
import { COPY } from '../data/translations';
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
  const copy = COPY[language];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const featuredProducts = products
    .filter((p) => p.isFeatured && isProductOrderable(p))
    .slice(0, 3);

  const trendingProducts = products
    .filter((p) => (p.isTrending || p.isBestSeller) && isProductOrderable(p))
    .slice(0, 3);

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

  const newArrivalProducts = products
    .filter((p) => p.isNewArrival && isProductOrderable(p))
    .slice(0, 3);

  return (
    <>
      {/* Featured Products Band */}
      {featuredProducts.length > 0 && (
        <section
          id="featured"
          className="py-12 sm:py-14 bg-white border-b border-slate-200/80"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#F47721]">
                Featured Selection · Pakistan COD
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
                {copy.featuredTitle}
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base text-slate-600 ${
                  language === 'ur' ? 'font-urdu text-right' : ''
                }`}
                dir={language === 'ur' ? 'rtl' : 'ltr'}
              >
                {copy.featuredSubtitle}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={`featured-${product.id}`}
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

      {/* Main Catalog & Best Sellers with Search + Category Filters */}
      <section id="catalog" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
                {copy.bestSellersTitle}
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base text-slate-600 max-w-2xl ${
                  language === 'ur' ? 'font-urdu text-right' : ''
                }`}
                dir={language === 'ur' ? 'rtl' : 'ltr'}
              >
                {copy.bestSellersSubtitle}
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search catalog products"
                  className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#10243D] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative flex items-center">
                <SlidersHorizontal className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  className="h-11 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#10243D] focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 cursor-pointer"
                >
                  <option value="featured">Sort: Best Sellers</option>
                  <option value="available">Available Only</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter products by category"
            className="mt-7 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'All'}
              onClick={() => onSelectCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
                selectedCategory === 'All'
                  ? 'bg-[#10243D] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
                  selectedCategory === cat.name
                    ? 'bg-[#10243D] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
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
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-10 text-center">
              <p className="font-display text-lg font-semibold text-[#10243D]">
                {selectedCategory !== 'All' && !normalizedQuery
                  ? `No verified listings in ${selectedCategory} yet`
                  : 'No matching products found'}
              </p>
              <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
                {selectedCategory !== 'All' && !normalizedQuery
                  ? 'New products for this category can be added anytime from the TEKKIVO Admin Dashboard.'
                  : 'Try clearing your search keyword or switching back to all categories.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onSelectCategory('All');
                  onSortChange('featured');
                }}
                className="mt-5 h-10 px-5 rounded-xl bg-[#10243D] text-white text-sm font-semibold hover:bg-[#183558] transition-colors cursor-pointer"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
        <section
          id="trending"
          className="py-12 sm:py-16 bg-slate-50/70 border-t border-slate-200/80"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#F47721]">
                  Customer Favorites
                </p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
                  {language === 'ur' ? 'مقبول مصنوعات' : 'Trending Products'}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600">
                  Popular picks across electronics, smart lighting, and kitchen
                  appliances.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('All');
                  document
                    .getElementById('catalog')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-semibold text-[#F47721] hover:text-[#d66010] transition-colors cursor-pointer"
              >
                Explore All →
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={`trending-${product.id}`}
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

      {/* New Arrivals Section */}
      {newArrivalProducts.length > 0 && (
        <section
          id="new-arrivals"
          className="py-12 sm:py-16 bg-white border-t border-slate-200/80"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
                  {copy.newArrivalsTitle}
                </h2>
                <p
                  className={`mt-2 text-sm sm:text-base text-slate-600 ${
                    language === 'ur' ? 'font-urdu text-right' : ''
                  }`}
                  dir={language === 'ur' ? 'rtl' : 'ltr'}
                >
                  {copy.newArrivalsSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('All');
                  document
                    .getElementById('catalog')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-semibold text-[#F47721] hover:text-[#d66010] transition-colors cursor-pointer"
              >
                View Full Catalog →
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
              {newArrivalProducts.map((product) => (
                <ProductCard
                  key={`arrival-${product.id}`}
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
    </>
  );
}
