import {
  Baby,
  Cpu,
  Dumbbell,
  Gamepad2,
  HeartPulse,
  Home,
  ShoppingBasket,
  Shirt,
  Smartphone,
  Sparkles,
  SprayCan,
  Utensils,
} from 'lucide-react';
import { COPY } from '../data/translations';
import {
  CategoryDefinition,
  LanguageMode,
  Product,
  ProductCategory,
} from '../types/store';

interface CategoryStripProps {
  language: LanguageMode;
  categories: ReadonlyArray<CategoryDefinition>;
  products: Product[];
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory | 'All') => void;
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('electron') || lower.includes('gadget')) return Cpu;
  if (lower.includes('kitchen')) return Utensils;
  if (lower.includes('home') || lower.includes('living')) return Home;
  if (lower.includes('beauty')) return Sparkles;
  if (lower.includes('fashion')) return Shirt;
  if (lower.includes('baby') || lower.includes('kid')) return Baby;
  if (lower.includes('mobile')) return Smartphone;
  if (lower.includes('grocery') || lower.includes('food'))
    return ShoppingBasket;
  if (lower.includes('health')) return HeartPulse;
  if (lower.includes('toy') || lower.includes('game')) return Gamepad2;
  if (lower.includes('sport') || lower.includes('outdoor')) return Dumbbell;
  if (lower.includes('clean') || lower.includes('household')) return SprayCan;
  return ShoppingBasket;
}

export function CategoryStrip({
  language,
  categories,
  products,
  selectedCategory,
  onSelectCategory,
}: CategoryStripProps) {
  const copy = COPY[language];

  return (
    <section
      id="categories"
      className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
              {copy.shopByCategoryTitle}
            </h2>
            <p
              className={`mt-2 text-sm sm:text-base text-slate-600 ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {copy.shopByCategorySubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className="text-sm font-semibold text-[#F47721] hover:text-[#d66010] transition-colors cursor-pointer whitespace-nowrap"
          >
            View All Products →
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const categoryProducts = products.filter(
              (p) => p.category === cat.name
            );
            const isActive = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`group text-left rounded-2xl p-4 bg-white border transition-all cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
                  isActive
                    ? 'border-[#F47721] ring-1 ring-[#F47721]/30 shadow-xs'
                    : 'border-slate-200/90 hover:border-[#10243D]/40 hover:shadow-xs'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isActive
                      ? 'bg-[#F47721] text-white'
                      : 'bg-[#10243D]/5 text-[#10243D] group-hover:bg-[#10243D] group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-display text-sm font-semibold text-[#10243D] leading-snug">
                  {cat.name}
                </h3>
                {language === 'ur' && (
                  <p className="font-urdu text-xs text-slate-600 mt-0.5">
                    {cat.nameUr}
                  </p>
                )}
                <p className="mt-auto pt-2 text-xs text-slate-500 tabular-nums">
                  {categoryProducts.length > 0
                    ? `${categoryProducts.length} ${
                        categoryProducts.length === 1 ? 'listing' : 'listings'
                      }`
                    : 'Ready for items'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
