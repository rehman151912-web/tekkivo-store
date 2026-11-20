import { FormEvent, useEffect, useState } from 'react';
import {
  Globe,
  Heart,
  PackageSearch,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import { LanguageMode, ProductCategory } from '../types/store';
import { formatPkr } from '../utils/currency';

interface HeaderProps {
  language: LanguageMode;
  onToggleLanguage: (lang: LanguageMode) => void;
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  onSelectCategory: (category: ProductCategory | 'All') => void;
  freeDeliveryThresholdPkr: number;
  cartCount: number;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  onOpenOwnerPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

const COMPACT_NAV_LINKS: ReadonlyArray<{
  label: string;
  sectionId: string;
  resetFilter?: boolean;
}> = [
  { label: 'Home', sectionId: 'top', resetFilter: true },
  { label: 'Shop', sectionId: 'catalog', resetFilter: true },
  { label: 'New Arrivals', sectionId: 'new-arrivals', resetFilter: true },
  { label: 'Best Sellers', sectionId: 'best-sellers', resetFilter: true },
  { label: 'Deals', sectionId: 'special-deals', resetFilter: true },
  { label: 'Contact', sectionId: 'contact' },
];

export function Header({
  language,
  onToggleLanguage,
  searchQuery,
  onSearchSubmit,
  onSelectCategory,
  freeDeliveryThresholdPkr,
  cartCount,
  wishlistCount,
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
    if (headerSearch.trim()) {
      onNavigateSection('catalog');
    }
  };

  return (
    <>
      {/* Top Trust Utility Strip (Desktop/Tablet) */}
      <div className="hidden sm:block bg-[#10243D] text-slate-200 text-[11px] sm:text-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-6 truncate">
            <span className="text-[#F47721] font-semibold whitespace-nowrap">
              {freeDeliveryThresholdPkr > 0
                ? `Free Delivery on Orders ${formatPkr(freeDeliveryThresholdPkr)}+`
                : 'Free COD Delivery Across Pakistan'}
            </span>
            <span aria-hidden="true" className="text-white/25">
              |
            </span>
            <span className="whitespace-nowrap">Cash on Delivery (COD)</span>
            <span aria-hidden="true" className="hidden md:inline text-white/25">
              |
            </span>
            <span className="hidden md:inline whitespace-nowrap">
              7-Day Check Support
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
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

      {/* Main Sticky Header: TEKKIVO Logo, Compact Nav, Search Bar, Account, Wishlist, Cart */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-6">
          {/* Brand Logo */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('All');
              onSearchSubmit('');
              onNavigateSection('top');
            }}
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#10243D] whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] rounded-md"
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#10243D] text-white text-sm font-bold relative overflow-hidden"
            >
              <span>T</span>
              <span className="absolute bottom-0 inset-x-0 h-1 bg-[#F47721]" />
            </span>
            <span>
              TEKKIV<span className="text-[#F47721]">O</span>
            </span>
          </a>

          {/* Compact Navigation Menu (Desktop) */}
          <nav
            aria-label="Primary Store Navigation"
            className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-slate-700 shrink-0"
          >
            {COMPACT_NAV_LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.resetFilter) {
                    onSelectCategory('All');
                    onSearchSubmit('');
                  }
                  onNavigateSection(item.sectionId);
                }}
                className="hover:text-[#F47721] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop/Tablet Inline Search Bar */}
          <form
            onSubmit={handleSearchFormSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="search"
              value={headerSearch}
              onChange={(e) => {
                setHeaderSearch(e.target.value);
                onSearchSubmit(e.target.value);
              }}
              placeholder="Search electronics, kitchen, home..."
              aria-label="Search products on TEKKIVO"
              className="w-full h-9 sm:h-10 pl-9 pr-16 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1 h-7 sm:h-8 px-2.5 rounded-lg bg-[#10243D] hover:bg-[#F47721] text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Right Utility Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-expanded={accountOpen}
                aria-label="Account and admin menu"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-[#10243D] hover:bg-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
              >
                <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
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
                        onToggleLanguage(language === 'en' ? 'ur' : 'en');
                        setAccountOpen(false);
                      }}
                      className="sm:hidden w-full px-4 py-2.5 text-left text-[#10243D] hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span>
                        Language:{' '}
                        {language === 'en' ? 'Switch to اردو' : 'Switch to EN'}
                      </span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenOwnerPortal();
                      }}
                      className="w-full px-4 py-2.5 text-left text-slate-700 hover:text-[#10243D] hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                      Admin &amp; Product Manager
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`Open wishlist (${wishlistCount} items)`}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-[#10243D] hover:bg-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
            >
              <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#10243D] text-white text-[10px] font-bold inline-flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open shopping cart (${cartCount} items)`}
              className="relative h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
            >
              <ShoppingBag className="w-4 h-4 text-[#F47721]" />
              <span className="hidden sm:inline">Cart</span>
              <span className="tabular-nums text-[11px] bg-[#F47721] text-white min-w-[18px] h-[18px] px-1 rounded-md font-bold inline-flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Non-sticky Mobile Search Bar + Quick Links Row */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 space-y-2">
        <form
          onSubmit={handleSearchFormSubmit}
          className="flex items-center gap-1.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={headerSearch}
              onChange={(e) => {
                setHeaderSearch(e.target.value);
                onSearchSubmit(e.target.value);
              }}
              placeholder="Search products in TEKKIVO..."
              aria-label="Search products on TEKKIVO mobile"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-3 rounded-lg bg-[#10243D] text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        <nav
          aria-label="Quick Store Sections"
          className="flex items-center gap-4 overflow-x-auto no-scrollbar text-xs font-medium text-slate-600"
        >
          {COMPACT_NAV_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.resetFilter) {
                  onSelectCategory('All');
                  onSearchSubmit('');
                }
                onNavigateSection(item.sectionId);
              }}
              className="hover:text-[#F47721] whitespace-nowrap shrink-0 py-0.5 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
