import {
  CookingPot,
  Cpu,
  Headphones,
  Home,
  Smartphone,
  Utensils,
  Zap,
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../config/store';
import { COPY } from '../data/translations';
import { LanguageMode, Product, ProductCategory } from '../types/store';

interface CategoryStripProps {
  language: LanguageMode;
  products: Product[];
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory) => void;
}

const CATEGORY_ICONS: Record<ProductCategory, typeof Utensils> = {
  'Kitchen Tools': Utensils,
  'Kitchen Appliances': Zap,
  'Cookware & Bakeware': CookingPot,
  'Home Essentials': Home,
  'Electronics & Gadgets': Cpu,
  'Mobile Accessories': Smartphone,
  'Audio & Headphones': Headphones,
};

export function CategoryStrip({
  language,
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

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 sm:gap-4">
          {PRODUCT_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name];
            const categoryProducts = products.filter(
              (p) => p.category === cat.name
            );
            const isActive = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`group text-left rounded-2xl p-4 bg-white border transition-colors cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
                  isActive
                    ? 'border-[#F47721] ring-1 ring-[#F47721]/30 shadow-xs'
                    : 'border-slate-200/90 hover:border-[#10243D]/40'
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
                    : 'Catalog slot'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
