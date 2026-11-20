import { useState } from 'react';
import {
  Grid2X2,
  Home,
  MessageCircle,
  ShoppingBag,
  X,
} from 'lucide-react';
import { STORE_CONFIG } from '../config/store';
import { CategoryDefinition, ProductCategory } from '../types/store';
import { getWhatsAppUrl } from '../utils/currency';

interface MobileBottomNavProps {
  categories: ReadonlyArray<CategoryDefinition>;
  selectedCategory: ProductCategory | 'All';
  cartCount: number;
  onGoHome: () => void;
  onSelectCategory: (category: ProductCategory | 'All') => void;
  onOpenCart: () => void;
}

export function MobileBottomNav({
  categories,
  selectedCategory,
  cartCount,
  onGoHome,
  onSelectCategory,
  onOpenCart,
}: MobileBottomNavProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const whatsappUrl = getWhatsAppUrl(
    STORE_CONFIG.ownerWhatsAppNumber,
    'Assalam-o-Alaikum TEKKIVO, I would like to order or ask about a product.'
  );

  return (
    <>
      {isCategoriesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Browse Categories"
          className="md:hidden fixed inset-0 z-50 bg-[#10243D]/55 backdrop-blur-xs flex items-end"
          onClick={() => setIsCategoriesOpen(false)}
        >
          <div
            className="w-full max-h-[75vh] bg-white rounded-t-2xl border-t border-slate-200 p-4 overflow-y-auto space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-display text-base font-bold text-[#10243D]">
                Categories
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(false)}
                aria-label="Close categories"
                className="w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('All');
                  setIsCategoriesOpen(false);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-colors cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#10243D] text-white border-[#10243D]'
                    : 'bg-slate-50 text-[#10243D] border-slate-200'
                }`}
              >
                All Products
              </button>

              {categories.map((cat) => {
                const active = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.name);
                      setIsCategoriesOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-colors truncate cursor-pointer ${
                      active
                        ? 'bg-[#10243D] text-white border-[#10243D]'
                        : 'bg-slate-50 text-[#10243D] border-slate-200'
                    }`}
                  >
                    {cat.shortLabel || cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-sm"
      >
        <div className="grid grid-cols-4 h-14">
          <button
            type="button"
            onClick={onGoHome}
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-[#10243D] hover:text-[#F47721] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCategoriesOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${
              isCategoriesOpen ? 'text-[#F47721]' : 'text-[#10243D]'
            }`}
          >
            <Grid2X2 className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-[#10243D] hover:text-[#F47721] cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F47721] text-white text-[10px] font-bold tabular-nums flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-[#10243D] hover:text-[#F47721]"
          >
            <MessageCircle className="w-4 h-4 text-[#F47721]" />
            <span>WhatsApp</span>
          </a>
        </div>
      </nav>
    </>
  );
}
