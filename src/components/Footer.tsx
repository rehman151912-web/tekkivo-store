import { ExternalLink, Mail, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { STORE_CONFIG } from '../config/store';
import { StoreSettings } from '../types/store';
import {
  formatPkr,
  formatWhatsAppDisplayNumber,
  getWhatsAppUrl,
} from '../utils/currency';
import { StoreInfoModalType } from './StoreInfoModal';

interface FooterProps {
  storeSettings: StoreSettings;
  onNavigateSection: (sectionId: string) => void;
  onOpenOwnerPortal: () => void;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  onOpenInfoModal: (type: Exclude<StoreInfoModalType, null>) => void;
}

export function Footer({
  storeSettings,
  onNavigateSection,
  onOpenOwnerPortal,
  onOpenCart,
  onOpenTrackOrder,
  onOpenInfoModal,
}: FooterProps) {
  const whatsappContactUrl = getWhatsAppUrl(
    STORE_CONFIG.ownerWhatsAppNumber,
    'Assalam-o-Alaikum TEKKIVO, I need assistance with my order.'
  );

  return (
    <footer className="bg-[#F8FAFC] text-[#10243D] border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: TEKKIVO Logo & Store Summary */}
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-[#10243D]">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#10243D] text-white text-sm font-bold relative overflow-hidden"
              >
                <span>T</span>
                <span className="absolute bottom-0 inset-x-0 h-1 bg-[#F47721]" />
              </span>
              <span>
                TEKKIV<span className="text-[#F47721]">O</span>
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-[#F47721]">
              {STORE_CONFIG.tagline}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your Pakistan online general store for everyday electronics,
              kitchen appliances, home &amp; living, beauty, fashion, and daily
              essentials with Cash on Delivery.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <a
                href={STORE_CONFIG.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-[#F47721] transition-colors"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={STORE_CONFIG.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-[#F47721] transition-colors"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={STORE_CONFIG.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-[#F47721] transition-colors"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="font-display text-sm font-bold text-[#10243D]">
              Shop
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('catalog')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('featured-products')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Featured Products
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('new-arrivals')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('best-sellers')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('special-deals')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Special Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Support */}
          <div>
            <h3 className="font-display text-sm font-bold text-[#10243D]">
              Customer Support
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('contact')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Shopping Cart
                </button>
              </li>
              <li>
                <a
                  href={whatsappContactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#10243D] font-semibold hover:text-[#F47721] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#F47721]" />
                  <span>
                    WhatsApp Support:{' '}
                    {formatWhatsAppDisplayNumber(
                      STORE_CONFIG.ownerWhatsAppNumber
                    )}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${STORE_CONFIG.supportEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#F47721] transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{STORE_CONFIG.supportEmail}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Policies */}
          <div>
            <h3 className="font-display text-sm font-bold text-[#10243D]">
              About &amp; Policies
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfoModal('about')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfoModal('privacy')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfoModal('returns')}
                  className="hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Return Policy
                </button>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  onClick={onOpenOwnerPortal}
                  className="text-xs font-semibold text-[#10243D] underline underline-offset-4 hover:text-[#F47721] transition-colors cursor-pointer"
                >
                  Admin &amp; Product Manager
                </button>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <p className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#F47721] shrink-0" />
                <span>
                  {storeSettings.freeDeliveryThresholdPkr > 0
                    ? `Free COD ${formatPkr(storeSettings.freeDeliveryThresholdPkr)}+`
                    : 'Free COD Pakistan-wide'}
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10243D] shrink-0" />
                <span>7-Day Defect Check Support</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} TEKKIVO Pakistan · Smart Choice.
            Better Life. All rights reserved.
          </p>
          <p>{STORE_CONFIG.operatingHours}</p>
        </div>
      </div>
    </footer>
  );
}
