'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  reviewCount?: number;
  showValue?: boolean;
}

export function StarRating({
  rating,
  max = 5,
  size = 14,
  reviewCount,
  showValue = true,
}: StarRatingProps) {
  const safeRating = Math.max(0, Math.min(max, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1" aria-label={`تقييم ${safeRating} من ${max}`}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, safeRating - i));
          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="absolute inset-0 text-amber-200"
                fill="currentColor"
                strokeWidth={0}
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={size}
                  className="text-amber-400"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs text-muted ms-1">
          {safeRating.toFixed(2)} من {max}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}
