import { ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { PRODUCT_CATEGORIES, STORE_CONFIG } from '../config/store';
import { ProductCategory } from '../types/store';
import { formatWhatsAppDisplayNumber, getWhatsAppUrl } from '../utils/currency';

interface FooterProps {
  onSelectCategory: (category: ProductCategory) => void;
  onOpenOwnerPortal: () => void;
  onOpenCart: () => void;
}

export function Footer({
  onSelectCategory,
  onOpenOwnerPortal,
  onOpenCart,
}: FooterProps) {
  const whatsappContactUrl = getWhatsAppUrl(
    STORE_CONFIG.ownerWhatsAppNumber,
    'Assalam-o-Alaikum TEKKIVO, I have a question about a product.'
  );

  return (
    <footer className="bg-[#10243D] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Summary */}
          <div>
            <div className="font-display text-2xl font-bold text-white tracking-tight">
              TEKKIV<span className="text-[#F47721]">O</span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-200">
              {STORE_CONFIG.tagline}
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pakistan-based online store for Kitchen Tools, Kitchen Appliances,
              Cookware & Bakeware, Home Essentials, Electronics & Gadgets,
              Mobile Accessories, and Audio & Headphones.
            </p>
          </div>

          {/* 7 Store Categories */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white tracking-wide">
              Shop Categories
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.name}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.name)}
                    className="text-slate-300 hover:text-[#F47721] transition-colors text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & COD Policy */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white tracking-wide">
              Contact & Delivery (Pakistan)
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-300">
              <li>Payment: Cash on Delivery (COD)</li>
              <li>
                Free Delivery: Rs.{' '}
                {STORE_CONFIG.freeDeliveryThresholdPkr.toLocaleString('en-PK')}+
                (Rs. {STORE_CONFIG.standardDeliveryFeePkr} below)
              </li>
              <li>Delivery: {STORE_CONFIG.estimatedDeliveryWindow}</li>
              <li className="pt-1">
                <a
                  href={whatsappContactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:text-[#F47721] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#F47721]" />
                  <span>
                    {formatWhatsAppDisplayNumber(
                      STORE_CONFIG.ownerWhatsAppNumber
                    )}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${STORE_CONFIG.supportEmail}`}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#F47721] transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{STORE_CONFIG.supportEmail}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media & Store Actions */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white tracking-wide">
              Connect & Quick Links
            </h3>
            <div className="mt-3 flex flex-col gap-2.5 items-start text-xs sm:text-sm">
              <a
                href={STORE_CONFIG.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#F47721] transition-colors"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={STORE_CONFIG.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#F47721] transition-colors"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={STORE_CONFIG.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#F47721] transition-colors"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onOpenCart}
                className="pt-2 text-slate-300 hover:text-[#F47721] transition-colors cursor-pointer"
              >
                View Shopping Cart
              </button>
              <button
                type="button"
                onClick={onOpenOwnerPortal}
                className="text-slate-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
              >
                Admin & Order Management
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TEKKIVO Pakistan · Smart Choice. Better Life.</p>
          <p>{STORE_CONFIG.operatingHours}</p>
        </div>
      </div>
    </footer>
  );
}
