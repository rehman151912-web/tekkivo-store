import { Banknote, Headphones, ShieldCheck, Truck } from 'lucide-react';
import { LanguageMode } from '../types/store';

interface WhyChooseTekkivoProps {
  language: LanguageMode;
}

const TRUST_ITEMS = [
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    titleUr: 'کیش آن ڈیلیوری',
    description: 'Pay in PKR at your doorstep across Pakistan.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Shopping',
    titleUr: 'محفوظ خریداری',
    description: 'Manual stock verification before every dispatch.',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    titleUr: 'کسٹمر سپورٹ',
    description: 'Direct WhatsApp & email order assistance.',
  },
  {
    icon: Truck,
    title: 'Pakistan-wide Delivery',
    titleUr: 'پاکستان بھر میں ڈیلیوری',
    description: 'Free shipping on orders Rs. 5,000 and above.',
  },
];

export function WhyChooseTekkivo({ language }: WhyChooseTekkivoProps) {
  return (
    <section
      id="why-tekkivo"
      aria-label="TEKKIVO Customer Guarantees"
      className="py-6 sm:py-8 bg-white"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F4F6F9] border border-slate-200/80 p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-[#10243D] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#F47721]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xs sm:text-sm font-bold text-[#10243D] leading-snug">
                    {language === 'ur' ? item.titleUr : item.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
