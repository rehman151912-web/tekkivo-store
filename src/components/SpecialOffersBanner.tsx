import { ArrowRight } from 'lucide-react';
import { COPY } from '../data/translations';
import { LanguageMode } from '../types/store';
import { formatPkr } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface SpecialOffersBannerProps {
  language: LanguageMode;
  standardDeliveryFeePkr: number;
  freeDeliveryThresholdPkr: number;
  onViewOffers: () => void;
}

export function SpecialOffersBanner({
  language,
  standardDeliveryFeePkr,
  freeDeliveryThresholdPkr,
  onViewOffers,
}: SpecialOffersBannerProps) {
  const copy = COPY[language];

  return (
    <section id="offers" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#10243D] text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold text-[#F47721]">
              {copy.specialOfferKicker}
            </p>
            <h2
              className="mt-2 font-display text-2xl sm:text-4xl font-bold text-white leading-tight tracking-wide"
              style={{ textWrap: 'balance' }}
            >
              {language === 'en'
                ? freeDeliveryThresholdPkr > 0
                  ? `Free Cash on Delivery Across Pakistan Above ${formatPkr(
                      freeDeliveryThresholdPkr
                    )}`
                  : 'Free Cash on Delivery Across Pakistan on All Orders'
                : copy.specialOfferTitle}
            </h2>
            <p
              className={`mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {language === 'en'
                ? `Combine electronics, kitchen appliances, beauty, and home essentials in one order to waive the ${formatPkr(
                    standardDeliveryFeePkr
                  )} standard courier delivery fee.`
                : copy.specialOfferDesc}
            </p>
            <div className="mt-7">
              <button
                type="button"
                onClick={onViewOffers}
                className="h-11 px-6 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>{copy.specialOfferCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[240px] sm:min-h-[300px]">
            <ResilientImage
              src="/src/assets/images/banner_home_appliances_1794981204608.jpg"
              alt="TEKKIVO kitchen tools, smart home gadgets, and wireless audio flat-lay on deep navy backdrop"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
