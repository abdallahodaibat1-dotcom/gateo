'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { X, ShoppingBag, Heart, Eye, CheckCircle, Minus, Plus } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { StarRating } from '@/components/business-website/StarRating';
import type { TemplateBusiness, TemplateProduct, TemplateReview } from '@/components/business-website/template-types';
import styles from './fashion-one.module.css';

interface QuickViewModalProps {
  product: TemplateProduct;
  business: TemplateBusiness;
  onClose: () => void;
}

const placeholder = '/uploads/placeholder.jpg';
const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colorsList = [
  { name: 'أبيض عاجي', hex: '#f8f5ed' },
  { name: 'أبيض نقي', hex: '#fff' },
  { name: 'شامبانيا', hex: '#f0e0d0' },
  { name: 'وردي بودرة', hex: '#e8d4d0' },
];

export function QuickViewModal({ product, business, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { showToast } = useToast();
  const { format } = useCurrency();
  const slug = business.slug || business.id;

  const images = useMemo(() => (product.images?.length ? product.images.map((img) => img.url) : [placeholder]), [product.images]);
  const [mainImage, setMainImage] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(colorsList[0].name);
  const [quantity, setQuantity] = useState(1);

  const inWishlist = isInWishlist(product.id);
  const isSale = product.comparePrice && product.comparePrice > product.price;
  const discount = isSale && product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const productReviews = (business.reviews || []).filter((r) => (r as any).productId === product.id || true).slice(0, 5) as TemplateReview[];
  const avgRating = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : product.rating || 0;
  const reviewCount = product.reviewCount || productReviews.length;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: slug,
      name: product.name,
      price: product.price,
      image: images[0],
    });
    showToast('تمت الإضافة للسلة', 'success');
  };

  const handleWishlist = () => {
    toggleItem({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: slug,
      name: product.name,
      price: product.price,
      image: images[0],
    });
    showToast(inWishlist ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة', 'success');
  };

  return (
    <div className={`${styles['modal']} ${styles['show']}`}>
      <div className={styles['modal-overlay']} onClick={onClose} />
      <div className={`${styles['modal-content']} ${styles['quick-view']}`}>
        <button className={styles['modal-close']} onClick={onClose} aria-label="إغلاق">
          <X size={18} />
        </button>
        <div className={styles['qv-grid']}>
          <div className={styles['qv-gallery']}>
            <div className={styles['qv-main-img']}>
              <img src={mainImage} alt={product.name} />
              {isSale && <span className={`${styles['qv-badge']} ${styles['sale']}`}>-{discount}%</span>}
            </div>
            <div className={styles['qv-thumbs']}>
              {images.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles['qv-thumb']} ${img === mainImage ? styles['active'] : ''}`}
                  onClick={() => setMainImage(img)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles['qv-info']}>
            <span className={styles['qv-cat']}>{product.category || 'فستان زفاف'}</span>
            <h2 className={styles['qv-name']}>{product.name}</h2>
            <div className={styles['qv-rating']}>
              <StarRating rating={avgRating} size={13} showValue={false} />
              <span>{avgRating.toFixed(1)}</span>
              <span>({reviewCount} تقييم)</span>
            </div>
            <div className={styles['qv-price']}>
              <span className={styles['qv-price-now']}>{format(product.price)}</span>
              {isSale && <span className={styles['qv-price-old']}>{format(product.comparePrice)}</span>}
            </div>
            <p className={styles['qv-desc']}>{product.description || 'فستان فاخر بتصميم أنيق، مزين بتفاصيل دقيقة مصنوعة من أجود الخامات.'}</p>

            <div className={styles['qv-variant']}>
              <label>اللون: <strong>{selectedColor}</strong></label>
              <div className={styles['qv-swatches']}>
                {colorsList.map((color) => (
                  <button
                    key={color.name}
                    className={`${styles['swatch']} ${selectedColor === color.name ? styles['active'] : ''}`}
                    style={{ background: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className={styles['qv-variant']}>
              <label>المقاس: <strong>{selectedSize}</strong></label>
              <div className={styles['qv-sizes']}>
                {sizesList.map((size) => (
                  <button
                    key={size}
                    className={`${styles['size-btn']} ${selectedSize === size ? styles['active'] : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles['qv-stock']}>
              <CheckCircle size={15} />
              <span>متوفر في المخزون - جاهز للشحن خلال 3-5 أيام</span>
            </div>

            <div className={styles['qv-actions']}>
              <div className={styles['pd-qty']}>
                <button className={styles['qty-btn']} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={10}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))}
                />
                <button className={styles['qty-btn']} onClick={() => setQuantity((q) => Math.min(10, q + 1))}>
                  <Plus size={14} />
                </button>
              </div>
              <button className={`${styles['btn-primary']} ${styles['qv-add-cart']}`} onClick={handleAddToCart}>
                <ShoppingBag size={16} /> أضيفي للسلة
              </button>
              <button
                className={`${styles['qv-wishlist']} ${inWishlist ? styles['active'] : ''}`}
                onClick={handleWishlist}
                aria-label="المفضلة"
              >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            <Link
              href={`/business/${slug}/product/${product.id}`}
              className={styles['qv-full-link']}
              onClick={onClose}
            >
              <Eye size={14} /> عرض تفاصيل المنتج الكاملة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
