import { ArrowRight, Banknote, ShieldCheck, Truck } from 'lucide-react';
import { COPY } from '../data/translations';
import { LanguageMode } from '../types/store';
import { formatPkr } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface HeroBannerProps {
  language: LanguageMode;
  freeDeliveryThresholdPkr: number;
  onShopNow: () => void;
  onBrowseCategories: () => void;
}

export function HeroBanner({
  language,
  freeDeliveryThresholdPkr,
  onShopNow,
  onBrowseCategories,
}: HeroBannerProps) {
  const copy = COPY[language];

  return (
    <section
      aria-label="TEKKIVO Store Highlight"
      className="bg-white pt-3 sm:pt-4 pb-2"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-[#F4F6F9] via-[#F8FAFC] to-white border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Promotional Copy — Compact Height */}
          <div className="lg:col-span-6 p-5 sm:p-7 lg:px-10 lg:py-8 flex flex-col justify-center relative z-10">
            <p className="text-xs sm:text-sm font-semibold text-[#F47721]">
              TEKKIVO Pakistan · {copy.heroKicker}
            </p>

            <h1
              className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-bold tracking-tight text-[#10243D] leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Smart Choice.{' '}
              <span className="text-[#F47721]">Better Life.</span>
            </h1>

            <p
              className={`mt-2 text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {language === 'ur'
                ? copy.heroSubtitle
                : 'Shop everyday electronics, kitchen appliances, home lighting & personal care with Cash on Delivery across Pakistan.'}
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onShopNow}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10243D]"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onBrowseCategories}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
              >
                Explore Categories
              </button>
            </div>

            {/* Compact Trust Strip */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] sm:text-xs font-medium text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-[#F47721]" />
                <span>Cash on Delivery</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10243D]" />
                <span>Verified Stock</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#10243D]" />
                <span>
                  {freeDeliveryThresholdPkr > 0
                    ? `Free Delivery ${formatPkr(freeDeliveryThresholdPkr)}+`
                    : 'Pakistan-Wide Delivery'}
                </span>
              </span>
            </div>
          </div>

          {/* Right Lifestyle Product Visual — Kept Compact in Height */}
          <div className="lg:col-span-6 relative h-44 sm:h-56 lg:h-auto lg:min-h-[260px] lg:max-h-[300px] overflow-hidden bg-slate-100">
            <ResilientImage
              src="/src/assets/images/hero_tekkivo_lifestyle_1795183343957.jpg"
              alt="TEKKIVO electronics, kitchen appliances, home lamp, skincare and lifestyle shopping essentials"
              loading="eager"
              className="w-full h-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="hidden lg:block absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F8FAFC] to-transparent pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
