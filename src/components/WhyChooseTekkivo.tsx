import { Banknote, ClipboardCheck, MessageCircle, ShieldCheck } from 'lucide-react';
import { COPY } from '../data/translations';
import { LanguageMode } from '../types/store';

interface WhyChooseTekkivoProps {
  language: LanguageMode;
}

const VALUE_PILLARS = [
  {
    icon: Banknote,
    title: 'Cash on Delivery Across Pakistan',
    titleUr: 'پورے پاکستان میں کیش آن ڈیلیوری',
    description:
      'Pay in PKR at your doorstep in Karachi, Lahore, Islamabad, Rawalpindi, and 100+ cities—free delivery on orders Rs. 5,000 and above.',
  },
  {
    icon: MessageCircle,
    title: 'Direct WhatsApp Order Support',
    titleUr: 'واٹس ایپ پر فوری آرڈر تصدیق',
    description:
      'Every checkout prepares a structured WhatsApp order message so you can confirm city, street address, and delivery timing directly with our team.',
  },
  {
    icon: ClipboardCheck,
    title: 'Manual Stock Verification Before Dispatch',
    titleUr: 'روانگی سے قبل دستی اسٹاک تصدیق',
    description:
      'Every order is verified manually for product availability before courier dispatch—no surprise cancellations after checkout.',
  },
  {
    icon: ShieldCheck,
    title: '7-Day Parcel Check Support',
    titleUr: '7 دن چیک اور تبدیلی سہولت',
    description:
      'Inspect physical condition on arrival and reach our support line on WhatsApp within 7 days if a manufacturing defect is found.',
  },
];

export function WhyChooseTekkivo({ language }: WhyChooseTekkivoProps) {
  const copy = COPY[language];

  return (
    <section
      id="why-tekkivo"
      className="py-14 sm:py-16 bg-slate-50/70 border-y border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
            {copy.whyChooseTitle}
          </h2>
          <p
            className={`mt-2 text-sm sm:text-base text-slate-600 ${
              language === 'ur' ? 'font-urdu text-right' : ''
            }`}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          >
            {copy.whyChooseSubtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl bg-[#10243D] text-[#F47721] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-[#10243D]">
                  {language === 'ur' ? pillar.titleUr : pillar.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
