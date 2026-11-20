import { FormEvent, useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { COPY } from '../data/translations';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LanguageMode } from '../types/store';
import { saveSubscriberToFirestore } from '../utils/firestoreService';

interface NewsletterSectionProps {
  language: LanguageMode;
}

export function NewsletterSection({ language }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribedEmails, setSubscribedEmails] = useLocalStorage<string[]>(
    'tekkivo_newsletter_v1',
    []
  );
  const [isSubscribedSuccess, setIsSubscribedSuccess] = useState(false);

  const copy = COPY[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubmitting(true);

    if (!subscribedEmails.includes(trimmed)) {
      setSubscribedEmails((prev) => [...prev, trimmed]);
    }

    try {
      await saveSubscriberToFirestore(trimmed, 'newsletter');
    } catch {
      // Saved locally even if Firestore offline
    } finally {
      setSubmitting(false);
      setIsSubscribedSuccess(true);
      setEmail('');
    }
  };

  return (
    <section className="py-12 sm:py-14 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-[#F47721]">
              Restock Alerts &amp; New Arrivals
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#10243D]">
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
            {isSubscribedSuccess ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2.5 text-sm font-medium text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Thanks! You&apos;re subscribed.</span>
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
                    aria-label="Email address for Stay in the Loop and Restock Alerts"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 px-6 rounded-xl bg-[#10243D] hover:bg-[#183558] disabled:opacity-60 text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
                >
                  {submitting ? 'Saving...' : 'Subscribe'}
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
