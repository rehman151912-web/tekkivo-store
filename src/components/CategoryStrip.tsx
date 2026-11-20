import {
  Baby,
  Cpu,
  Heart,
  Home,
  ShoppingBasket,
  Shirt,
  Smartphone,
  SprayCan,
  Utensils,
} from 'lucide-react';
import { LanguageMode, ProductCategory } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface CategoryStripProps {
  language: LanguageMode;
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory | 'All') => void;
}

interface FeaturedCategoryCard {
  label: string;
  labelUr: string;
  targetCategory: ProductCategory;
  image: string;
  icon: typeof Cpu;
}

const FEATURED_CATEGORIES: ReadonlyArray<FeaturedCategoryCard> = [
  {
    label: 'Electronics & Gadgets',
    labelUr: 'الیکٹرانکس اور گیجٹس',
    targetCategory: 'Electronics & Gadgets',
    image: '/assets/products/t-tech-wireless-earbuds.jpg',
    icon: Cpu,
  },
  {
    label: 'Kitchen Tools',
    labelUr: 'کچن ٹولز',
    targetCategory: 'Kitchen Tools & Appliances',
    image:
      '/assets/aistudio/2025_12_17_08a1977cec497809d74af5ecd055a3fb_1d3b4c47.webp',
    icon: Utensils,
  },
  {
    label: 'Home & Living',
    labelUr: 'ہوم اور لیونگ',
    targetCategory: 'Home & Living',
    image:
      '/assets/aistudio/2026_09_15_8d60c5097981457c8a749953922d7f62_715bd886.jpeg',
    icon: Home,
  },
  {
    label: 'Beauty & Personal Care',
    labelUr: 'بیوٹی کیئر',
    targetCategory: 'Beauty & Personal Care',
    image:
      '/assets/aistudio/2026_09_21_5ba51237c3c64bfc2cec0d1d3d34f0e9_af456f38.png',
    icon: Heart,
  },
  {
    label: 'Fashion & Accessories',
    labelUr: 'فیشن اسیسریز',
    targetCategory: 'Fashion & Accessories',
    image: '/src/assets/images/cat_fashion_accessories_1795183344161.jpg',
    icon: Shirt,
  },
  {
    label: 'Baby & Kids',
    labelUr: 'بے بی اور کڈز',
    targetCategory: 'Baby & Kids',
    image: '/src/assets/images/cat_baby_kids_1795183344473.jpg',
    icon: Baby,
  },
  {
    label: 'Mobile Accessories',
    labelUr: 'موبائل اسیسریز',
    targetCategory: 'Mobile Accessories',
    image: '/assets/aistudio/photo_1794983484395_0_66f84968.jpg',
    icon: Smartphone,
  },
  {
    label: 'Grocery',
    labelUr: 'گروسری',
    targetCategory: 'Grocery & Food Items',
    image: '/src/assets/images/cat_grocery_pantry_1795183344031.jpg',
    icon: ShoppingBasket,
  },
  {
    label: 'Daily Essentials',
    labelUr: 'روزمرہ ضروریات',
    targetCategory: 'Cleaning & Household Essentials',
    image: '/src/assets/images/cat_daily_essentials_1795183344317.jpg',
    icon: SprayCan,
  },
];

export function CategoryStrip({
  language,
  selectedCategory,
  onSelectCategory,
}: CategoryStripProps) {
  return (
    <section
      id="categories"
      aria-label="Shop by Category"
      className="py-5 sm:py-6 bg-white"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Centered Header with Side Rules Matching Reference */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          <span
            aria-hidden="true"
            className="h-px flex-1 max-w-[140px] bg-slate-200"
          />
          <h2 className="font-display text-base sm:text-xl font-bold text-[#10243D] tracking-tight whitespace-nowrap">
            Shop by Category
          </h2>
          <span
            aria-hidden="true"
            className="h-px flex-1 max-w-[140px] bg-slate-200"
          />
        </div>

        {/* Compact Category Cards: Horizontally scrollable on mobile, 9-col compact row on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-2.5">
          {FEATURED_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.targetCategory;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() =>
                  onSelectCategory(isActive ? 'All' : cat.targetCategory)
                }
                className={`group rounded-xl border bg-white p-1.5 sm:p-2 text-left transition-all cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] ${
                  isActive
                    ? 'border-[#F47721] ring-1 ring-[#F47721]/30 shadow-xs'
                    : 'border-slate-200/80 hover:border-[#10243D]/40 hover:shadow-xs'
                }`}
              >
                <div className="aspect-square w-full rounded-lg bg-[#F8FAFC] overflow-hidden p-1.5 flex items-center justify-center">
                  <ResilientImage
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="mt-1.5 px-0.5 flex items-center gap-1 min-w-0">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-[#F47721]' : 'text-[#10243D]'
                    }`}
                  />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#10243D] leading-tight line-clamp-1">
                    {language === 'ur' ? cat.labelUr : cat.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
