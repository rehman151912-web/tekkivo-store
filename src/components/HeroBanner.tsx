import { FormEvent, useState } from 'react';
import { ArrowRight, Globe, Search, ShieldCheck } from 'lucide-react';
import { COPY } from '../data/translations';
import { LanguageMode } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface HeroBannerProps {
  language: LanguageMode;
  onToggleLanguage: (lang: LanguageMode) => void;
  onShopCollection: () => void;
  onBrowseCategories: () => void;
  onSearchSubmit: (query: string) => void;
}

export function HeroBanner({
  language,
  onToggleLanguage,
  onShopCollection,
  onBrowseCategories,
  onSearchSubmit,
}: HeroBannerProps) {
  const [heroSearch, setHeroSearch] = useState('');
  const copy = COPY[language];

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit(heroSearch);
  };

  return (
    <section
      id="top"
      className="relative bg-white border-b border-slate-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Language & Nationwide COD Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#F47721] shrink-0" />
            <span className={language === 'ur' ? 'font-urdu text-sm' : ''}>
              {copy.heroKicker}
            </span>
          </div>

          <div
            role="group"
            aria-label="Display language"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
            <button
              type="button"
              onClick={() => onToggleLanguage('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                language === 'en'
                  ? 'bg-white text-[#10243D] shadow-sm'
                  : 'text-slate-600 hover:text-[#10243D]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onToggleLanguage('ur')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                language === 'ur'
                  ? 'bg-white text-[#10243D] shadow-sm'
                  : 'text-slate-600 hover:text-[#10243D]'
              }`}
            >
              اردو Friendly
            </button>
          </div>
        </div>

        {/* Two-Column Balanced Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Brand Headline, Search Bar & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h1
              className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#10243D] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Smart Choice.{' '}
              <span className="text-[#F47721]">Better Life.</span>
            </h1>

            <p
              className={`mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {copy.heroSubtitle}
            </p>

            {/* Prominent Homepage Search Products Bar */}
            <form
              onSubmit={handleSearch}
              className="mt-6 flex items-stretch gap-2 max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search earbuds, headphones, kitchen tools..."
                  aria-label="Search products on TEKKIVO"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-5 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Primary & Secondary Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onShopCollection}
                className="h-12 px-6 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm sm:text-base font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10243D]"
              >
                <span>{copy.shopCollection}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onBrowseCategories}
                className="h-12 px-6 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[#10243D] text-sm sm:text-base font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
              >
                {copy.exploreCategories}
              </button>
            </div>

            {/* Clean Unboxed Trust Line */}
            <p
              className={`mt-7 text-xs sm:text-sm text-slate-500 border-t border-slate-100 pt-5 ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {copy.heroTrustNote}
            </p>
          </div>

          {/* Right Column: Kitchen Tools & Electronics Hero Photography */}
          <div className="lg:col-span-6 flex">
            <div className="relative w-full rounded-2xl overflow-hidden bg-[#10243D] border border-slate-200 shadow-sm flex flex-col">
              <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] lg:min-h-[430px]">
                <ResilientImage
                  src="/src/assets/images/hero_kitchen_electronics_1794981203946.jpg"
                  alt="Modern Kitchen Tools and Electronics lifestyle showcase on travertine countertop"
                  loading="eager"
                  className="w-full h-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#10243D]/95 via-[#10243D]/55 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-wrap items-end justify-between gap-4 text-white">
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      TEKKIVO Pakistan · Kitchen, Home & Electronics
                    </p>
                    <h2 className="font-display text-lg sm:text-xl font-semibold text-white mt-0.5">
                      Everyday Kitchen Tools & Smart Electronics
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onBrowseCategories}
                    className="h-10 px-4 rounded-xl bg-white text-[#10243D] hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
                  >
                    Explore 7 Categories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
