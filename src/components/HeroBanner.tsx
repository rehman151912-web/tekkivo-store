import { ArrowRight, Award, ShieldCheck, Truck } from 'lucide-react';
import { COPY } from '../data/translations';
import { LanguageMode } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface HeroBannerProps {
  language: LanguageMode;
  onShopCollection: () => void;
  onBrowseCategories: () => void;
}

export function HeroBanner({
  language,
  onShopCollection,
  onBrowseCategories,
}: HeroBannerProps) {
  const copy = COPY[language];

  return (
    <section
      id="top"
      className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold text-[#F47721]">
              {copy.heroKicker}
            </p>

            <h1
              className="mt-3 font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#10243D] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Smart Choice.{' '}
              <span className="text-[#F47721]">Better Life.</span>
            </h1>

            <p
              className={`mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {copy.heroSubtitle}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onShopCollection}
                className="h-12 px-7 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm sm:text-base font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10243D]"
              >
                <span>{copy.shopCollection}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onBrowseCategories}
                className="h-12 px-6 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm sm:text-base font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
              >
                {copy.exploreCategories}
              </button>
            </div>

            {/* 3 Trust Pillars */}
            <div className="mt-8 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 sm:gap-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#F47721]" />
                </span>
                <span className="leading-tight">Cash on Delivery</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-[#10243D]" />
                </span>
                <span className="leading-tight">Verified Stock</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-[#10243D]" />
                </span>
                <span className="leading-tight">Across Pakistan</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6 min-h-[260px] sm:min-h-[360px] lg:min-h-[430px] relative bg-[#10243D]">
            <ResilientImage
              src="/src/assets/images/hero_kitchen_electronics_1794981203946.jpg"
              alt="TEKKIVO General Store showcase across electronics, kitchen tools, and home essentials"
              loading="eager"
              className="w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#10243D]/95 via-[#10243D]/55 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex flex-wrap items-end justify-between gap-3 text-white">
              <div>
                <p className="text-xs font-medium text-slate-300">
                  TEKKIVO Pakistan · Online General Store
                </p>
                <p className="font-display text-base sm:text-lg font-semibold text-white mt-0.5">
                  12 Everyday Categories · Transparent PKR Pricing
                </p>
              </div>
              <button
                type="button"
                onClick={onBrowseCategories}
                className="h-9 px-4 rounded-xl bg-white text-[#10243D] hover:bg-slate-100 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
