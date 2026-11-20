import { FormEvent, useState } from 'react';
import { CheckCircle2, Gift, Mail } from 'lucide-react';
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
    <section className="pb-6 sm:pb-8 bg-white">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#10243D] text-white p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 max-w-md">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#F47721]" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-xl font-bold text-white">
                {language === 'ur' ? copy.newsletterTitle : 'Join Our Newsletter'}
              </h2>
              <p
                className={`text-xs sm:text-sm text-slate-300 ${
                  language === 'ur' ? 'font-urdu text-right' : ''
                }`}
                dir={language === 'ur' ? 'rtl' : 'ltr'}
              >
                {language === 'ur'
                  ? copy.newsletterSubtitle
                  : 'Get restock alerts & new arrival updates'}
              </p>
            </div>
          </div>

          <div className="w-full lg:flex-1 lg:max-w-lg">
            {isSubscribedSuccess ? (
              <div className="rounded-xl bg-emerald-950/70 border border-emerald-400/30 px-4 py-3 flex items-center gap-2.5 text-sm font-medium text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Thanks! You&apos;re subscribed.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address for Stay in the Loop and Restock Alerts"
                  className="flex-1 h-10 sm:h-11 px-4 rounded-xl bg-white text-sm text-[#10243D] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F47721]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 sm:h-11 px-6 rounded-xl bg-[#F47721] hover:bg-[#e06512] disabled:opacity-60 text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {submitting ? 'Saving...' : 'Subscribe'}
                </button>
              </form>
            )}
            {error && (
              <p className="mt-1.5 text-xs font-medium text-rose-300">
                {error}
              </p>
            )}
          </div>

          <div className="hidden xl:flex items-center gap-2.5 text-xs text-slate-200 shrink-0">
            <Gift className="w-5 h-5 text-[#F47721]" />
            <span>
              New Arrivals &amp;
              <br />
              Stock Notifications
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
