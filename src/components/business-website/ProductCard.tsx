'use client';

import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import { StarRating } from './StarRating';

export interface ProductCardProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  quantity?: number;
  images?: { url: string; alt?: string }[] | null;
  category?: string | null;
  rating?: number;
  reviewCount?: number;
  createdAt?: string | Date;
  badge?: 'hot' | 'sale' | 'new' | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  variant?: 'grid' | 'list';
  showWishlist?: boolean;
  showAddToCart?: boolean;
  showRatingValue?: boolean;
  onAddToCart?: (product: ProductCardProduct) => void;
}

export function ProductCard({
  product,
  variant = 'grid',
  showWishlist = true,
  showAddToCart = true,
  showRatingValue = false,
  onAddToCart,
}: ProductCardProps) {
  const { format, convert } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const price = Number(product.price) || 0;
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : 0;
  const discount = comparePrice > 0 ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const primaryImage = product.images?.[0]?.url;
  const hoverImage = product.images?.[1]?.url || primaryImage;

  const badge = product.badge || (discount > 0 ? 'sale' : isNewProduct(product.createdAt) ? 'new' : 'hot');

  const badgeConfig = {
    hot: { text: 'HOT', className: 'bg-emerald-500' },
    sale: { text: `خصم ${discount}%`, className: 'bg-amber-500' },
    new: { text: 'NEW', className: 'bg-rose-500' },
  };

  if (variant === 'list') {
    return (
      <motion.div
        whileHover={{ x: -4 }}
        className="flex gap-4 bg-[var(--theme-surface)] rounded-lg border border-border p-3 shadow-sm"
        style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-slate-100">
          {primaryImage ? (
            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          {product.category && (
            <span className="text-[11px] text-muted mb-1">{product.category}</span>
          )}
          <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{product.name}</h3>
          <StarRating rating={product.rating || 0} size={12} showValue={showRatingValue} />
          <div className="mt-auto flex items-center gap-2">
            <span className="font-bold text-base" style={{ color: 'var(--theme-primary)' }}>
              {format(convert(price))}
            </span>
            {comparePrice > 0 && (
              <span className="text-xs text-muted line-through">{format(convert(comparePrice))}</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-[var(--theme-surface)] rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
      style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
    >
      <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: hoverImage && isHovered ? 0 : 1 }}
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: isHovered ? 1 : 0 }}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}

        {badge && (
          <span
            className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full text-white ${badgeConfig[badge].className}`}
          >
            {badgeConfig[badge].text}
          </span>
        )}

        {showWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setWishlisted((v) => !v);
            }}
            className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              wishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 text-foreground hover:bg-white opacity-0 group-hover:opacity-100'
            }`}
            aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-[160px]">
        {product.category && (
          <span className="text-[11px] text-muted mb-1">{product.category}</span>
        )}
        <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <StarRating rating={product.rating || 0} size={12} showValue={showRatingValue} />
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold" style={{ color: 'var(--theme-primary)' }}>
              {format(convert(price))}
            </span>
            {comparePrice > 0 && (
              <span className="text-sm text-muted line-through">{format(convert(comparePrice))}</span>
            )}
          </div>
          {showAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              className="w-full py-2 rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <ShoppingCart className="w-4 h-4" />
              أضف للسلة
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function isNewProduct(createdAt?: string | Date): boolean {
  if (!createdAt) return false;
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return false;
  const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 14;
}
