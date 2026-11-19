import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types/store';
import { isProductOrderable } from '../utils/cart';
import { formatPkr } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface SearchOverlayProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onApplyToCatalog: (query: string) => void;
}

export function SearchOverlay({
  isOpen,
  products,
  onClose,
  onSelectProduct,
  onApplyToCatalog,
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const matches = trimmed
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.shortSpec.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.sku.toLowerCase().includes(trimmed)
      )
    : products.slice(0, 5);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search TEKKIVO products"
      className="fixed inset-0 z-50 bg-[#10243D]/55 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search earbuds, headphones, kitchen tools, categories..."
            className="flex-1 text-sm sm:text-base text-[#10243D] placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="w-9 h-9 rounded-lg text-slate-500 hover:text-[#10243D] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-slate-100">
          {matches.length > 0 ? (
            matches.map((item) => {
              const canOrder = isProductOrderable(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectProduct(item);
                  }}
                  className="w-full flex items-center gap-4 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#F5F7FA] shrink-0">
                    <ResilientImage
                      src={item.image}
                      alt={item.imageAlt}
                      fallbackLabel={item.sku}
                      fallbackSubtext="Pending"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 truncate">
                      {item.category} · {item.sku}
                    </p>
                    <p className="font-display text-sm font-semibold text-[#10243D] truncate">
                      {item.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="tabular-nums text-sm font-bold text-[#10243D]">
                      {formatPkr(item.sellingPricePkr)}
                    </p>
                    <p
                      className={`text-xs ${
                        !canOrder
                          ? 'text-rose-700 font-semibold'
                          : item.stockConfirmationStatus ===
                            'pending_confirmation'
                          ? 'text-amber-800'
                          : 'text-emerald-700'
                      }`}
                    >
                      {!canOrder
                        ? 'Out of Stock'
                        : item.stockConfirmationStatus ===
                          'pending_confirmation'
                        ? 'Pending Stock'
                        : 'In Stock'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">
              No products matched “{query}”.
            </div>
          )}
        </div>

        {trimmed && matches.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => {
                onApplyToCatalog(query);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#10243D] text-white text-xs font-semibold hover:bg-[#183558] transition-colors cursor-pointer"
            >
              Show all results in Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
