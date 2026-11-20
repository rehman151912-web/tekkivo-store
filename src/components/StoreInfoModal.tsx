import { ShieldCheck, Truck, X } from 'lucide-react';
import { STORE_CONFIG } from '../config/store';
import { formatPkr, formatWhatsAppDisplayNumber, getWhatsAppUrl } from '../utils/currency';

export type StoreInfoModalType = 'about' | 'privacy' | 'returns' | null;

interface StoreInfoModalProps {
  modalType: StoreInfoModalType;
  freeDeliveryThresholdPkr: number;
  standardDeliveryFeePkr: number;
  onClose: () => void;
}

export function StoreInfoModal({
  modalType,
  freeDeliveryThresholdPkr,
  standardDeliveryFeePkr,
  onClose,
}: StoreInfoModalProps) {
  if (!modalType) return null;

  const whatsappUrl = getWhatsAppUrl(
    STORE_CONFIG.ownerWhatsAppNumber,
    'Assalam-o-Alaikum TEKKIVO, I need help regarding store policy or my order.'
  );

  const titles: Record<Exclude<StoreInfoModalType, null>, string> = {
    about: 'About TEKKIVO Pakistan',
    privacy: 'Privacy Policy',
    returns: 'Return & Replacement Policy',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titles[modalType]}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-[#10243D] text-white flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#F47721]">
              TEKKIVO · {STORE_CONFIG.tagline}
            </p>
            <h2 className="font-display text-lg font-bold">
              {titles[modalType]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close policy dialog"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-sm text-slate-600 leading-relaxed max-h-[75vh] overflow-y-auto">
          {modalType === 'about' && (
            <>
              <p>
                <strong className="text-[#10243D]">TEKKIVO</strong> is a
                Pakistan-focused online general store built around one promise:{' '}
                <em>Smart Choice. Better Life.</em>
              </p>
              <p>
                We supply everyday electronics, kitchen appliances, home &amp;
                living decor, beauty essentials, fashion accessories, baby care,
                mobile accessories, and household utilities across Pakistan with
                transparent PKR pricing and Cash on Delivery (COD).
              </p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#F47721] shrink-0" />
                  <span>
                    Standard COD Delivery: {formatPkr(standardDeliveryFeePkr)}{' '}
                    (Free on orders {formatPkr(freeDeliveryThresholdPkr)}+)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10243D] shrink-0" />
                  <span>
                    Manual stock verification before dispatch · WhatsApp:{' '}
                    {formatWhatsAppDisplayNumber(STORE_CONFIG.ownerWhatsAppNumber)}
                  </span>
                </div>
              </div>
            </>
          )}

          {modalType === 'privacy' && (
            <>
              <p>
                TEKKIVO collects only the details required to fulfill your Cash
                on Delivery (COD) order in Pakistan: your full name, Pakistani
                mobile number, city, street address, and optional delivery notes.
              </p>
              <p>
                We never collect credit/debit card details on this site, and we
                do not sell or share your personal contact information with third
                parties outside courier dispatch required for your delivery.
              </p>
              <p>
                Newsletter email addresses are used strictly for restock alerts
                and store updates. For data removal requests, email{' '}
                <strong className="text-[#10243D]">
                  {STORE_CONFIG.supportEmail}
                </strong>
                .
              </p>
            </>
          )}

          {modalType === 'returns' && (
            <>
              <p>
                Customer satisfaction is important to us. Please inspect your
                parcel on arrival and check item completeness within{' '}
                <strong className="text-[#10243D]">7 days of delivery</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  If an item arrives damaged, defective, or incorrect, contact
                  our WhatsApp team immediately with your Order Reference and
                  parcel photo.
                </li>
                <li>
                  Items must remain unused with original packaging and accessories
                  included.
                </li>
                <li>
                  Verified claims are eligible for prompt replacement or refund
                  coordination via WhatsApp support.
                </li>
              </ul>
            </>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#F47721] hover:underline"
            >
              Chat on WhatsApp ({formatWhatsAppDisplayNumber(STORE_CONFIG.ownerWhatsAppNumber)})
            </a>
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
