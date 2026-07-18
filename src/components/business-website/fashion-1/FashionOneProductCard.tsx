'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Eye, GitCompare } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { useCompare } from '@/components/CompareProvider';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { StarRating } from '@/components/business-website/StarRating';
import { QuickViewModal } from './QuickViewModal';
import type { TemplateBusiness, TemplateProduct } from '@/components/business-website/template-types';
import { getSectionSettings, getSetting } from '../section-settings';
import styles from './fashion-one.module.css';

interface FashionOneProductCardProps {
  product: TemplateProduct;
  business: TemplateBusiness;
  variant?: 'grid' | 'list';
  mode?: 'buy' | 'rent' | 'both';
}

const placeholder = '/uploads/placeholder.jpg';

export function FashionOneProductCard({
  product,
  business,
  variant = 'grid',
  mode = 'both',
}: FashionOneProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();
  const { isInCompare, toggleItem: toggleCompare } = useCompare();
  const { showToast } = useToast();
  const { format } = useCurrency();
  const [showQuickView, setShowQuickView] = useState(false);

  const slug = business.slug || business.id;
  const productImage = product.images?.[0]?.url || placeholder;
  const hoverImage = product.images?.[1]?.url || productImage;
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const isNew = () => {
    if (!product.createdAt) return false;
    const created = new Date(product.createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return diff <= 14 * 24 * 60 * 60 * 1000;
  };

  const isSale = product.comparePrice && product.comparePrice > product.price;
  const badge = isSale ? 'sale' : isNew() ? 'new' : 'hot';
  const badgeText = isSale ? 'Sale' : isNew() ? 'New' : 'Hot';

  const rentMultiplier = getSetting(getSectionSettings(business, 'shop'), 'rentMultiplier', 0.2);
  const rentPrice = Math.max(1, Math.round(product.price * rentMultiplier));

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: slug,
      name: product.name,
      price: product.price,
      image: productImage,
    });
    showToast(inWishlist ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة', 'success');
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: slug,
      name: product.name,
      price: product.price,
      image: productImage,
      category: product.category,
    });
    showToast(inCompare ? 'تمت الإزالة من المقارنة' : 'تمت الإضافة للمقارنة', 'success');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: slug,
      name: product.name,
      price: product.price,
      image: productImage,
    });
    showToast('تمت الإضافة للسلة', 'success');
  };

  const renderPrices = () => {
    if (mode === 'rent') {
      return (
        <div className={styles['product-prices']}>
          <span className={styles['price']}>{format(rentPrice)}</span>
          <span className={styles['price-mode']}> / يوم</span>
        </div>
      );
    }
    if (mode === 'buy') {
      return (
        <div className={styles['product-prices']}>
          {isSale && <span className={styles['price-old']}>{format(product.comparePrice)}</span>}
          <span className={styles['price']}>{format(product.price)}</span>
        </div>
      );
    }
    return (
      <div className={styles['product-prices']}>
        {isSale && <span className={styles['price-old']}>{format(product.comparePrice)}</span>}
        <span className={styles['price']}>{format(product.price)}</span>
        <span className={styles['price-mode']}>أو {format(rentPrice)} / يوم</span>
      </div>
    );
  };

  return (
    <div className={styles['product-card']} data-variant={variant}>
      <div className={styles['product-img-wrap']}>
        <Link href={`/business/${slug}/product/${product.id}`}>
          <img
            src={productImage}
            alt={product.name}
            className={styles['product-img']}
            onMouseEnter={(e) => {
              if (hoverImage !== productImage) {
                e.currentTarget.src = hoverImage;
              }
            }}
            onMouseLeave={(e) => {
              if (hoverImage !== productImage) {
                e.currentTarget.src = productImage;
              }
            }}
          />
        </Link>
        <span className={`${styles['product-badge']} ${styles[badge]}`}>{badgeText}</span>
        <div className={styles['product-actions']}>
          <button
            className={`${styles['product-action-btn']} ${inWishlist ? styles['active'] : ''}`}
            onClick={handleWishlist}
            aria-label="المفضلة"
          >
            <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`${styles['product-action-btn']} ${inCompare ? styles['active'] : ''}`}
            onClick={handleCompare}
            aria-label="قارن"
          >
            <GitCompare size={14} />
          </button>
          <button
            className={styles['product-action-btn']}
            aria-label="عرض سريع"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
          >
            <Eye size={14} />
          </button>
        </div>
        <div className={styles['product-quick']}>
          <button className={styles['product-quick-btn']} onClick={handleQuickAdd}>
            <ShoppingBag size={12} /> أضيفي للسلة
          </button>
        </div>
      </div>
      <div className={styles['product-info']}>
        <h3 className={styles['product-name']}>
          <Link href={`/business/${slug}/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className={styles['product-desc']}>{product.description || 'فستان فاخر من التشكيلة الحصرية'}</p>
        <div className={styles['product-rating']}>
          <StarRating rating={product.rating || 0} size={12} showValue={false} />
          <span>({product.reviewCount || 0})</span>
        </div>
        {renderPrices()}
      </div>
      {showQuickView && (
        <QuickViewModal product={product} business={business} onClose={() => setShowQuickView(false)} />
      )}
    </div>
  );
}
