import { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onNavigateSection: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'categories', label: 'Categories' },
  { id: 'featured', label: 'Featured' },
  { id: 'catalog', label: 'Best Sellers' },
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'why-tekkivo', label: 'COD Trust' },
] as const;

export function Header({
  cartCount,
  wishlistCount,
  onOpenSearch,
  onOpenWishlist,
  onOpenCart,
  onNavigateSection,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Wordmark */}
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
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#10243D] text-white text-sm font-bold"
          >
            T
          </span>
          <span>
            TEKKIV<span className="text-[#F47721]">O</span>
          </span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_LINKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="hover:text-[#10243D] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#F47721] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] rounded-sm"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Search, Wishlist & Primary Cart Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search products"
            className="h-10 px-3 rounded-xl text-slate-700 hover:text-[#10243D] hover:bg-slate-100 transition-colors inline-flex items-center gap-2 text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline whitespace-nowrap">Search</span>
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            aria-label={`Open wishlist (${wishlistCount} items)`}
            className="relative h-10 w-10 sm:w-auto sm:px-3 rounded-xl text-slate-700 hover:text-[#10243D] hover:bg-slate-100 transition-colors inline-flex items-center justify-center gap-1.5 text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden md:inline whitespace-nowrap">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="tabular-nums text-xs font-semibold text-[#F47721]">
                ({wishlistCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart (${cartCount} items)`}
            className="h-10 px-4 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
          >
            <ShoppingBag className="w-4 h-4 text-[#F47721]" />
            <span>Cart</span>
            <span className="tabular-nums text-xs bg-white/15 px-1.5 py-0.5 rounded-md">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            className="lg:hidden h-10 w-10 rounded-xl text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-[#10243D] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
