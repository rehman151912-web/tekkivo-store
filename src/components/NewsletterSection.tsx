import { FormEvent, useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { COPY } from '../data/translations';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LanguageMode } from '../types/store';

interface NewsletterSectionProps {
  language: LanguageMode;
}

export function NewsletterSection({ language }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [subscribedEmails, setSubscribedEmails] = useLocalStorage<string[]>(
    'tekkivo_newsletter_v1',
    []
  );
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const copy = COPY[language];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    if (!subscribedEmails.includes(trimmed)) {
      setSubscribedEmails((prev) => [...prev, trimmed]);
    }
    setSubmittedEmail(trimmed);
    setEmail('');
  };

  return (
    <section className="py-12 sm:py-14 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#10243D]">
              {copy.newsletterTitle}
            </h2>
            <p
              className={`mt-1.5 text-sm text-slate-600 ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
            >
              {copy.newsletterSubtitle}
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[420px]">
            {submittedEmail ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2.5 text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>
                  Saved <strong>{submittedEmail}</strong> for TEKKIVO restock
                  alerts.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address for restock alerts"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-[#F47721] hover:bg-[#e06512] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10243D]"
                >
                  Subscribe
                </button>
              </form>
            )}
            {error && (
              <p className="mt-2 text-xs font-medium text-rose-700">{error}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
