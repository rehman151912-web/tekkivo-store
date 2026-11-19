import { COPY } from '../data/translations';
import { LanguageMode } from '../types/store';

interface CustomerReviewsSectionProps {
  language: LanguageMode;
}

const SAMPLE_TEMPLATES = [
  {
    slot: 'Sample Slot 01 · Audio Category',
    cityExample: 'Sample City: Lahore',
    quote:
      '[Sample Template] Placeholder for verified buyer feedback covering sound clarity, battery life, and COD parcel condition on delivery.',
    statusLabel: 'Awaiting Verified Order Review',
  },
  {
    slot: 'Sample Slot 02 · Charging & Power',
    cityExample: 'Sample City: Karachi',
    quote:
      '[Sample Template] Placeholder for verified buyer feedback on 3-pin Pakistani socket fit, charging speed, and courier delivery timeline.',
    statusLabel: 'Awaiting Verified Order Review',
  },
  {
    slot: 'Sample Slot 03 · Smartwatches',
    cityExample: 'Sample City: Islamabad',
    quote:
      '[Sample Template] Placeholder for verified buyer feedback regarding AMOLED display brightness, strap comfort, and WhatsApp support.',
    statusLabel: 'Awaiting Verified Order Review',
  },
];

export function CustomerReviewsSection({
  language,
}: CustomerReviewsSectionProps) {
  const copy = COPY[language];

  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#F47721]">
            Sample Content Notice · No Fabricated Ratings
          </p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
            {copy.reviewsTitle}
          </h2>
          <p
            className={`mt-2 text-sm sm:text-base text-slate-600 ${
              language === 'ur' ? 'font-urdu text-right' : ''
            }`}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          >
            {copy.reviewsSubtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TEMPLATES.map((template) => (
            <article
              key={template.slot}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-[#10243D]">
                    {template.slot}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{template.cityExample}</span>
                </div>

                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  {template.quote}
                </p>
              </div>

              <p className="mt-5 pt-4 border-t border-slate-200/80 text-xs font-medium text-slate-500">
                {template.statusLabel}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
