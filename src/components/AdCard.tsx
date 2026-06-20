'use client';

import { useState } from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  video: string | null;
  link: string | null;
  buttonText: string | null;
  advertiserName: string | null;
  advertiserLogo: string | null;
}

interface AdCardProps {
  ad: Ad;
  variant?: 'feed' | 'sidebar' | 'banner';
}

export default function AdCard({ ad, variant = 'feed' }: AdCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = async () => {
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id }),
      });
    } catch (e) {
      console.error(e);
    }
    if (ad.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    }
  };

  const isSidebar = variant === 'sidebar';
  const isBanner = variant === 'banner';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-surface rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
        isBanner ? 'w-full' : ''
      }`}
    >
      {/* Sponsored label */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
          <Megaphone className="w-3 h-3" />
          إعلان
        </span>
      </div>

      <div
        onClick={handleClick}
        className={`cursor-pointer ${isSidebar ? 'flex flex-col' : isBanner ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}
      >
        {/* Media */}
        {(ad.image || ad.video) && !imageError && (
          <div className={`relative overflow-hidden bg-slate-50 ${isBanner ? 'sm:w-2/5 h-48 sm:h-auto' : 'h-48 sm:h-56'}`}>
            {ad.video ? (
              <video
                src={ad.video}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <img
                src={ad.image!}
                alt={ad.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Advertiser info */}
          {(ad.advertiserName || ad.advertiserLogo) && (
            <div className="flex items-center gap-2 mb-3">
              {ad.advertiserLogo && (
                <img
                  src={ad.advertiserLogo}
                  alt={ad.advertiserName || ''}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              )}
              {ad.advertiserName && (
                <span className="text-sm font-medium text-muted">{ad.advertiserName}</span>
              )}
            </div>
          )}

          <h3 className="font-bold text-foreground text-base mb-2 leading-snug">{ad.title}</h3>
          {ad.description && (
            <p className={`text-sm text-muted mb-4 leading-relaxed ${isSidebar ? 'line-clamp-3' : 'line-clamp-2'}`}>
              {ad.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              {ad.buttonText || 'اعرف المزيد'}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
