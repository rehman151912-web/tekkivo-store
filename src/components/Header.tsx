import { FormEvent, useEffect, useState } from 'react';
import {
  Globe,
  Heart,
  PackageSearch,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import {
  CategoryDefinition,
  LanguageMode,
  ProductCategory,
} from '../types/store';
import { formatPkr } from '../utils/currency';

interface HeaderProps {
  language: LanguageMode;
  onToggleLanguage: (lang: LanguageMode) => void;
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  categories: ReadonlyArray<CategoryDefinition>;
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory | 'All') => void;
  freeDeliveryThresholdPkr: number;
  cartCount: number;
  wishlistCount: number;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  onOpenOwnerPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export function Header({
  language,
  onToggleLanguage,
  searchQuery,
  onSearchSubmit,
  categories,
  selectedCategory,
  onSelectCategory,
  freeDeliveryThresholdPkr,
  cartCount,
  wishlistCount,
  onOpenSearch,
  onOpenWishlist,
  onOpenCart,
  onOpenTrackOrder,
  onOpenOwnerPortal,
  onNavigateSection,
}: HeaderProps) {
  const [headerSearch, setHeaderSearch] = useState(searchQuery);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setHeaderSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit(headerSearch);
  };

  return (
    <div className="bg-white border-b border-slate-200/80">
      {/* Top Bar */}
      <div className="bg-[#10243D] text-slate-200 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">
            Cash on Delivery across Pakistan{' '}
            <span aria-hidden="true" className="mx-1.5 text-white/30">
              |
            </span>{' '}
            <span className="text-[#F47721] font-semibold">
              {freeDeliveryThresholdPkr > 0
                ? `Free delivery on ${formatPkr(freeDeliveryThresholdPkr)}+`
                : 'Free delivery across Pakistan'}
            </span>
          </p>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={onOpenTrackOrder}
              className="hover:text-[#F47721] transition-colors whitespace-nowrap cursor-pointer"
            >
              Track Order
            </button>
            <span aria-hidden="true" className="text-white/25">
              |
            </span>
            <button
              type="button"
              onClick={() => onNavigateSection('contact')}
              className="hover:text-[#F47721] transition-colors whitespace-nowrap cursor-pointer"
            >
              Help &amp; Contact
            </button>
            <span aria-hidden="true" className="text-white/25">
              |
            </span>
            <div
              role="group"
              aria-label="Display language"
              className="inline-flex items-center gap-1"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-[#10243D]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('ur')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'ur'
                    ? 'bg-white text-[#10243D]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                اردو
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 sm:gap-6">
          {/* Existing TEKKIVO Logo */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('top');
            }}
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#10243D] whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] rounded-md"
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#10243D] text-white text-sm font-bold"
            >
              T
            </span>
            <span>
              TEKKIV<span className="text-[#F47721]">O</span>
            </span>
          </a>

          {/* Wide Search Bar */}
          <form
            onSubmit={handleSearchFormSubmit}
            className="order-3 lg:order-2 w-full lg:flex-1 lg:max-w-2xl flex items-stretch gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search electronics, kitchen tools, beauty, groceries..."
                aria-label="Search products on TEKKIVO"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 transition-colors"
              />
            </div>
            <button
              type="submit"
              aria-label="Search catalog"
              className="h-11 px-4 sm:px-5 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
            >
              <Search className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Right Actions: Account/Admin, Wishlist, Cart */}
          <div className="order-2 lg:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-expanded={accountOpen}
                aria-label="Account and admin menu"
                className="h-10 px-2.5 sm:px-3 rounded-xl text-slate-700 hover:text-[#10243D] hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </button>

              {accountOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenTrackOrder();
                      }}
                      className="w-full px-4 py-2.5 text-left text-[#10243D] hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <PackageSearch className="w-4 h-4 text-[#F47721]" />
                      <span>Track Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenSearch();
                      }}
                      className="w-full px-4 py-2.5 text-left text-[#10243D] hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <Search className="w-4 h-4 text-slate-500" />
                      <span>Quick Product Finder</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenOwnerPortal();
                      }}
                      className="w-full px-4 py-2.5 text-left text-slate-600 hover:text-[#10243D] hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                      Admin Dashboard
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`Open wishlist (${wishlistCount} items)`}
              className="relative h-10 px-2.5 sm:px-3 rounded-xl text-slate-700 hover:text-[#10243D] hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="tabular-nums text-xs font-bold text-[#F47721]">
                  ({wishlistCount})
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open shopping cart (${cartCount} items)`}
              className="h-10 px-3 sm:px-4 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
            >
              <ShoppingBag className="w-4 h-4 text-[#F47721]" />
              <span>Cart</span>
              <span className="tabular-nums text-xs bg-[#F47721] text-white px-1.5 py-0.5 rounded-md font-bold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Category Menu Row (12 Categories) */}
      <nav
        aria-label="Store Categories"
        className="border-t border-slate-100 bg-slate-50/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className={`py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'border-[#F47721] text-[#10243D] font-semibold'
                : 'border-transparent text-slate-600 hover:text-[#10243D]'
            }`}
          >
            All Products
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#F47721] text-[#10243D] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-[#10243D]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
