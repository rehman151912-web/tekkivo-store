import { FormEvent, useEffect, useState } from 'react';
import { MessageCircle, PackageSearch, X } from 'lucide-react';
import { STORE_CONFIG } from '../config/store';
import { OrderReceipt } from '../types/store';
import { formatPkr, getWhatsAppUrl } from '../utils/currency';

interface TrackOrderModalProps {
  isOpen: boolean;
  orders: OrderReceipt[];
  onClose: () => void;
}

export function TrackOrderModal({
  isOpen,
  orders,
  onClose,
}: TrackOrderModalProps) {
  const [orderRefInput, setOrderRefInput] = useState('');
  const [searchedRef, setSearchedRef] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = searchedRef.trim().toUpperCase();
  const matchedOrder = trimmed
    ? orders.find((o) => o.orderRef.toUpperCase() === trimmed)
    : null;

  const handleLookup = (e: FormEvent) => {
    e.preventDefault();
    setSearchedRef(orderRefInput);
  };

  const whatsappTrackUrl = getWhatsAppUrl(
    STORE_CONFIG.ownerWhatsAppNumber,
    trimmed
      ? `Assalam-o-Alaikum TEKKIVO, please share an update for my order reference: ${trimmed}`
      : 'Assalam-o-Alaikum TEKKIVO, I would like to check the status of my order.'
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Track Order"
      className="fixed inset-0 z-50 bg-[#10243D]/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PackageSearch className="w-5 h-5 text-[#F47721]" />
            <h2 className="font-display text-lg font-bold text-[#10243D]">
              Track Your Order
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Track Order modal"
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-[#10243D] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Enter your TEKKIVO order reference (e.g.{' '}
            <span className="font-mono text-[#10243D]">TKV-261119-123456</span>)
            to check saved status or verify dispatch on WhatsApp.
          </p>

          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              value={orderRefInput}
              onChange={(e) => setOrderRefInput(e.target.value)}
              placeholder="TKV-YYMMDD-XXXXXX"
              aria-label="Order Reference"
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm font-mono text-[#10243D] placeholder:text-slate-400 focus:bg-white focus:border-[#F47721] focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors"
            >
              Check
            </button>
          </form>

          {trimmed && matchedOrder && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono font-semibold text-[#10243D]">
                  {matchedOrder.orderRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold capitalize text-[#F47721]">
                  {matchedOrder.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total (COD)</span>
                <span className="tabular-nums font-bold text-[#10243D]">
                  {formatPkr(matchedOrder.totalPkr)}
                </span>
              </div>
            </div>
          )}

          {trimmed && !matchedOrder && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              No local record found in this browser for{' '}
              <span className="font-mono font-semibold">{trimmed}</span>. For
              live courier updates across devices, message our support team on
              WhatsApp.
            </p>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <a
              href={`mailto:${STORE_CONFIG.supportEmail}`}
              className="text-xs font-medium text-slate-600 hover:text-[#10243D] underline underline-offset-2"
            >
              Email {STORE_CONFIG.supportEmail}
            </a>
            <a
              href={whatsappTrackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-[#10243D] hover:bg-[#183558] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#F47721]" />
              <span>Track on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
