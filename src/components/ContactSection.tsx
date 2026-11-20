import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react';
import { STORE_CONFIG } from '../config/store';
import { LanguageMode } from '../types/store';
import { formatWhatsAppDisplayNumber, getWhatsAppUrl } from '../utils/currency';

interface ContactSectionProps {
  language: LanguageMode;
}

export function ContactSection({ language }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mailtoHref, setMailtoHref] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedPhone || !trimmedMessage) {
      setError('Please fill in your name, phone number, and message.');
      return;
    }

    setError('');
    const subject = `TEKKIVO Store Inquiry from ${trimmedName}`;
    const bodyLines = [
      `Name: ${trimmedName}`,
      `Phone: ${trimmedPhone}`,
      ``,
      `Message:`,
      trimmedMessage,
    ];
    const href = `mailto:${STORE_CONFIG.supportEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    setMailtoHref(href);

    if (typeof document !== 'undefined') {
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const whatsappHelpUrl = getWhatsAppUrl(
    STORE_CONFIG.ownerWhatsAppNumber,
    'Assalam-o-Alaikum TEKKIVO, I need help with an order or product.'
  );

  return (
    <section
      id="contact"
      aria-label="Contact TEKKIVO"
      className="py-12 sm:py-16 bg-slate-50/70 border-t border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Contact Details */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#F47721]">
                Customer Support
              </p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-[#10243D] tracking-tight">
                {language === 'ur' ? 'ہم سے رابطہ کریں' : 'Contact Us'}
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base text-slate-600 leading-relaxed ${
                  language === 'ur' ? 'font-urdu text-right' : ''
                }`}
                dir={language === 'ur' ? 'rtl' : 'ltr'}
              >
                {language === 'ur'
                  ? 'آرڈر، ڈیلیوری یا مصنوعات سے متعلق کسی بھی سوال کے لیے ہمیں ای میل یا واٹس ایپ کریں۔'
                  : 'Have a question about an order, Cash on Delivery, or product availability? Reach out directly via email or WhatsApp.'}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
              <a
                href={`mailto:${STORE_CONFIG.supportEmail}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#F47721]/50 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#F47721]" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Official Email</p>
                  <p className="font-semibold text-[#10243D] truncate">
                    {STORE_CONFIG.supportEmail}
                  </p>
                </div>
              </a>

              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#F47721]/50 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-[#10243D]" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">WhatsApp Support</p>
                  <p className="font-semibold text-[#10243D] tabular-nums">
                    {formatWhatsAppDisplayNumber(
                      STORE_CONFIG.ownerWhatsAppNumber
                    )}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3 px-3 py-1.5 text-xs sm:text-sm text-slate-500">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{STORE_CONFIG.operatingHours}</span>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
                  >
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Your full name"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
                  >
                    Phone *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="03XX-XXXXXXX"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#10243D] tabular-nums placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs sm:text-sm font-semibold text-[#10243D] mb-1.5"
                >
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Write your question, order reference, or product inquiry..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none focus:ring-2 focus:ring-[#F47721]/20 transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-rose-700">{error}</p>
              )}

              {mailtoHref && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    Your email draft to{' '}
                    <a
                      href={mailtoHref}
                      className="font-semibold underline underline-offset-2"
                    >
                      {STORE_CONFIG.supportEmail}
                    </a>{' '}
                    is ready. If your mail client did not open automatically,
                    click the link above.
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-500">
                  Opens your email app addressed to {STORE_CONFIG.supportEmail}
                </p>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
