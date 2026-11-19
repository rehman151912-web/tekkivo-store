import { useState } from 'react';
import { Camera } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  fallbackSubtext?: string;
  loading?: 'eager' | 'lazy';
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel,
  fallbackSubtext = 'Exact product photo pending upload',
  loading = 'lazy',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F7FA] to-[#E8EDF3] text-[#10243D] p-5 text-center ${className}`}
      >
        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mb-2.5 shadow-2xs">
          <Camera className="w-5 h-5 text-[#10243D]/60" strokeWidth={1.6} />
        </div>
        <span className="font-display text-xs sm:text-sm font-semibold text-[#10243D] max-w-[220px] leading-snug">
          {fallbackLabel || alt}
        </span>
        <span className="mt-1 text-[11px] text-slate-500">
          {fallbackSubtext}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
