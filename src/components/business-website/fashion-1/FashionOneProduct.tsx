'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ZoomIn,
  Tag,
  Clock,
  CheckCircle,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  CalendarCheck,
  Ruler,
  X,
} from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { StarRating } from '@/components/business-website/StarRating';
import { FashionOneLayout } from './FashionOneLayout';
import { FashionOneProductCard } from './FashionOneProductCard';
import { FashionOneRecentlyViewed } from './FashionOneRecentlyViewed';
import type { TemplateBusiness, TemplateProduct, TemplateReview } from '@/components/business-website/template-types';
import { getSectionSettings, getSetting } from '../section-settings';
import styles from './fashion-one.module.css';

interface FashionOneProductProps {
  business: TemplateBusiness;
  product: TemplateProduct;
  relatedProducts: TemplateProduct[];
}

const placeholder = '/uploads/placeholder.jpg';
const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colorsList = [
  { name: 'أبيض عاجي', hex: '#f8f5ed' },
  { name: 'أبيض نقي', hex: '#fff' },
  { name: 'شامبانيا', hex: '#f0e0d0' },
  { name: 'وردي بودرة', hex: '#e8d4d0' },
];

const sizeTable = [
  { size: 'XS', bust: 80, waist: 62, hip: 88, length: 160 },
  { size: 'S', bust: 84, waist: 66, hip: 92, length: 162 },
  { size: 'M', bust: 88, waist: 70, hip: 96, length: 164 },
  { size: 'L', bust: 92, waist: 74, hip: 100, length: 166 },
  { size: 'XL', bust: 96, waist: 78, hip: 104, length: 168 },
  { size: 'XXL', bust: 100, waist: 82, hip: 108, length: 170 },
];

const careItems = [
  { icon: 'fas fa-tint', title: 'التنظيف', desc: 'تنظيف جاف فقط (Dry Clean). لا تنقعيه في الماء ولا تستخدمي الغسالة أبداً.' },
  { icon: 'fas fa-sun', title: 'التخزين', desc: 'احفظيه في كيس قماشي (غير بلاستيكي) في مكان جاف ومظلل بعيداً عن الشمس.' },
  { icon: 'fas fa-tshirt', title: 'الكي', desc: 'كي على درجة حرارة منخفضة مع قماش قطني بين المكواة والفستان. تجنبي البخار المباشر.' },
  { icon: 'fas fa-fire-alt', title: 'البقع', desc: 'أزيلي البقع فوراً بقطعة قماش مبللة. لا تفركي. استشيري خبيرة تنظيف متخصصة.' },
];

export function FashionOneProduct({ business, product, relatedProducts }: FashionOneProductProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { showToast } = useToast();
  const { format } = useCurrency();
  const slug = business.slug || business.id;

  const images = useMemo(() => (product.images?.length ? product.images.map((img) => img.url) : [placeholder]), [product.images]);
  const [mainImage, setMainImage] = useState(images[0]);
  const [selectedColor, setSelectedColor] = useState(colorsList[0].name);
  const [selectedSize, setSelectedSize] = useState('M');
  const [serviceMode, setServiceMode] = useState<'buy' | 'rent'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping' | 'reviews' | 'care'>('details');
  const [openAccordions, setOpenAccordions] = useState<number[]>([0]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const rentMultiplier = getSetting(getSectionSettings(business, 'shop'), 'rentMultiplier', 0.2);
  const rentPrice = Math.max(1, Math.round(product.price * rentMultiplier));
  const isSale = product.comparePrice && product.comparePrice > product.price;
  const discount = isSale && product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const productReviews = (business.reviews || []).slice(0, 5) as TemplateReview[];
  const avgRating = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;
  const reviewCount = productReviews.length;

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: slug,
      name: product.name,
      price: serviceMode === 'rent' ? rentPrice : product.price,
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

  const toggleAccordion = (idx: number) => {
    setOpenAccordions((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const isAccordionOpen = (idx: number) => openAccordions.includes(idx);

  const ratingBars = useMemo(() => {
    const bars = [5, 4, 3, 2, 1].map((star) => {
      const count = productReviews.filter((r) => Math.round(r.rating) === star).length;
      const pct = productReviews.length ? Math.round((count / productReviews.length) * 100) : star === 5 ? 88 : star === 4 ? 9 : 2;
      return { star, pct };
    });
    return bars;
  }, [productReviews]);

  const initial = (name?: string | null) => (name ? name.charAt(0).toUpperCase() : 'U');

  const activeBadge = isSale ? 'sale' : 'new';
  const badgeText = isSale ? 'Sale' : 'New';

  return (
    <FashionOneLayout business={business}>
      <div className={styles['fashionOne']}>
        {/* Breadcrumb */}
        <div className={styles['breadcrumb']}>
          <div className={styles['container']}>
            <Link href={`/business/${slug}`}>
              <i className="fas fa-home" /> الرئيسية
            </Link>
            <span className={styles['bc-sep']}>
              <ChevronLeft size={9} />
            </span>
            <Link href={`/business/${slug}/shop`}>{(product.category || 'فساتين الزفاف')}</Link>
            <span className={styles['bc-sep']}>
              <ChevronLeft size={9} />
            </span>
            <span className={styles['bc-current']}>{product.name}</span>
          </div>
        </div>

        {/* Product Detail */}
        <section className={styles['product-detail']}>
          <div className={styles['container']}>
            <div className={styles['pd-grid']}>
              {/* Gallery */}
              <div className={styles['pd-gallery']}>
                <div className={styles['pd-main-img']}>
                  <img src={mainImage} alt={product.name} />
                  <span className={`${styles['pd-badge']} ${styles[activeBadge]}`}>{badgeText}</span>
                  <button className={styles['pd-zoom']} aria-label="تكبير">
                    <ZoomIn size={16} />
                  </button>
                </div>
                <div className={styles['pd-thumbs']}>
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      className={`${styles['pd-thumb']} ${img === mainImage ? styles['active'] : ''}`}
                      onClick={() => setMainImage(img)}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className={styles['pd-info']}>
                <span className={styles['pd-cat']}>{product.category || 'فستان زفاف'}</span>
                <h1 className={styles['pd-name']}>{product.name}</h1>

                <div className={styles['pd-rating']}>
                  <span className={styles['stars']}>
                    <StarRating rating={avgRating} size={14} showValue={false} />
                  </span>
                  <span className={styles['rating-num']}>{avgRating.toFixed(1)}</span>
                  <a href="#reviews-tab" className={styles['rating-link']}>
                    ({reviewCount} تقييم)
                  </a>
                  <span className={styles['rating-sep']}>|</span>
                  <a href="#reviews-tab" className={styles['rating-link']}>
                    <i className="fas fa-pen" /> اكتب تقييم
                  </a>
                </div>

                <div className={styles['pd-price']}>
                  <span className={styles['pd-price-now']}>
                    {format(serviceMode === 'rent' ? rentPrice : product.price)}
                    {serviceMode === 'rent' && <span style={{ fontSize: 14 }}> / يوم</span>}
                  </span>
                  {isSale && <span className={styles['pd-price-old']}>{format(product.comparePrice)}</span>}
                  {isSale && <span className={styles['pd-price-badge']}>-{discount}%</span>}
                </div>
                <p className={styles['pd-short-desc']}>
                  {product.description || 'فستان فاخر بتصميم أنيق، مزين بتفاصيل دقيقة مصنوعة من أجود الخامات لتمنحكِ إطلالة مميزة.'}
                </p>

                {/* Color */}
                <div className={styles['pd-variant']}>
                  <label>
                    اللون: <strong>{selectedColor}</strong>
                  </label>
                  <div className={styles['pd-swatches']}>
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

                {/* Size */}
                <div className={styles['pd-variant']}>
                  <label>
                    المقاس: <strong>{selectedSize ? selectedSize : 'اختاري مقاسكِ'}</strong>
                  </label>
                  <div className={styles['pd-sizes']}>
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
                  <button className={styles['size-guide-link']} onClick={() => setShowSizeGuide(true)}>
                    <Ruler size={14} /> دليل المقاسات
                  </button>
                </div>

                {/* Service Toggle */}
                <div className={styles['pd-variant']}>
                  <label>نوع الخدمة:</label>
                  <div className={styles['pd-service-toggle']}>
                    <button
                      className={`${styles['service-opt']} ${serviceMode === 'buy' ? styles['active'] : ''}`}
                      onClick={() => setServiceMode('buy')}
                    >
                      <Tag size={18} />
                      <strong>شراء</strong>
                      <span className={styles['svc-price']}>{format(product.price)}</span>
                    </button>
                    <button
                      className={`${styles['service-opt']} ${serviceMode === 'rent' ? styles['active'] : ''}`}
                      onClick={() => setServiceMode('rent')}
                    >
                      <Clock size={18} />
                      <strong>إيجار</strong>
                      <span className={styles['svc-price']}>{format(rentPrice)} / يوم</span>
                    </button>
                  </div>
                </div>

                {/* Stock */}
                <div className={styles['pd-stock']}>
                  <CheckCircle size={16} />
                  <span>متوفر في المخزون - جاهز للشحن خلال 3-5 أيام</span>
                </div>

                {/* Quantity & Cart */}
                <div className={styles['pd-cart']}>
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
                  <button className={`${styles['btn-primary']} ${styles['pd-add-cart']}`} onClick={handleAddToCart}>
                    <ShoppingBag size={16} /> أضيفي للسلة
                  </button>
                  <button
                    className={`${styles['pd-wishlist']} ${inWishlist ? styles['active'] : ''}`}
                    onClick={handleWishlist}
                    aria-label="المفضلة"
                  >
                    <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className={styles['pd-quick-actions']}>
                  <Link href={`/business/${slug}#booking`} className={styles['pd-quick-link']}>
                    <CalendarCheck size={14} /> احجزي موعد قياس
                  </Link>
                  <a
                    href={`https://wa.me/${(business.phone || '0790000000').replace(/[^0-9]/g, '')}`}
                    className={styles['pd-quick-link']}
                  >
                    <i className="fab fa-whatsapp" /> استشيري عبر واتساب
                  </a>
                </div>

                {/* Trust */}
                <ul className={styles['pd-trust']}>
                  <li>
                    <i className="fas fa-truck" /> توصيل مجاني داخل المدينة
                  </li>
                  <li>
                    <i className="fas fa-undo" /> إرجاع مجاني خلال 14 يوم
                  </li>
                  <li>
                    <i className="fas fa-shield-alt" /> ضمان سنة كاملة
                  </li>
                  <li>
                    <i className="fas fa-credit-card" /> دفع آمن متعدد الوسائل
                  </li>
                </ul>
              </div>
            </div>

            {/* Tabs */}
            <div className={styles['pd-tabs-section']}>
              <div className={styles['pd-tabs-nav']}>
                {[
                  { key: 'details', label: 'التفاصيل', icon: 'far fa-file-alt' },
                  { key: 'specs', label: 'المواصفات', icon: 'fas fa-list-ul' },
                  { key: 'shipping', label: 'الشحن والإرجاع', icon: 'fas fa-truck' },
                  { key: 'reviews', label: 'التقييمات', icon: 'far fa-star' },
                  { key: 'care', label: 'العناية بالفستان', icon: 'fas fa-tshirt' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`${styles['pd-tab-btn']} ${activeTab === tab.key ? styles['active'] : ''}`}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  >
                    <i className={tab.icon} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Details Tab */}
              <div className={`${styles['pd-tab-panel']} ${activeTab === 'details' ? styles['active'] : ''}`}>
                <div className={styles['pd-tab-layout']}>
                  <div className={styles['pd-tab-content']}>
                    <h2 className={styles['pd-tab-title']}>Durable and Versatile</h2>
                    <p>
                      هذا الفستان الاستثنائي مصمم خصيصاً ليمنحكِ إطلالة الأميرات في أهم لحظات حياتكِ. يتميز بقصة منفوشة أنيقة مع ذيل طويل يضفي لمسة من الفخامة.
                    </p>
                    <p>مزين بتطريز يدوي دقيق من الدانتيل الفرنسي وحبيبات لؤلؤية تضيف بريقاً ساحراً تحت الأضواء.</p>

                    <div className={styles['pd-accordion']}>
                      {[
                        {
                          icon: 'fas fa-gem',
                          title: 'المادة والسعة',
                          body: 'مصنوع من أفخر أنواع الأقمشة: دانتيل فرنسي، تول إيطالي ناعم، ساتان حريري طبيعي. البطانة الداخلية من القطن المصري عالي الجودة.',
                        },
                        {
                          icon: 'fas fa-ruler-combined',
                          title: 'المقاس والملاءمة',
                          body: 'الفستان مصمم ليلائم الجسم بشكل مثالي مع قصة A-Line الكلاسيكية. ننصح بأخذ المقاس بعد إجراء التعديلات الأخيرة (قبل 4-6 أسابيع من المناسبة).',
                          list: ['XS: محيط الصدر 80 سم', 'S: محيط الصدر 84 سم', 'M: محيط الصدر 88 سم', 'L: محيط الصدر 92 سم', 'XL: محيط الصدر 96 سم'],
                        },
                        {
                          icon: 'fas fa-magic',
                          title: 'تعليمات العناية',
                          body: 'يُنصح بالتنظيف الجاف (Dry Clean) فقط. يُخزن في مكان جاف بعيداً عن الرطوبة وأشعة الشمس المباشرة. يُعلّق على شمّاعة مبطنة للحفاظ على شكله.',
                        },
                        {
                          icon: 'fas fa-pencil-ruler',
                          title: 'التعديلات',
                          body: 'نوفر خدمة تعديل مجانية خلال 30 يوماً من الشراء. يمكن تعديل طول الذيل، والأكمام، والمحيط بكل سهولة. خدمة التعديل متوفرة أيضاً للإيجار.',
                        },
                      ].map((acc, idx) => (
                        <div className={`${styles['pd-acc-item']} ${isAccordionOpen(idx) ? styles['open'] : ''}`} key={idx}>
                          <button className={styles['pd-acc-head']} onClick={() => toggleAccordion(idx)}>
                            <span>
                              <i className={acc.icon} /> {acc.title}
                            </span>
                            <i className="fas fa-chevron-down" />
                          </button>
                          <div className={styles['pd-acc-body']}>
                            <p>{acc.body}</p>
                            {acc.list && (
                              <ul>
                                {acc.list.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles['pd-tab-image']}>
                    <img src={images[1] || images[0]} alt="صورة إضافية" />
                  </div>
                </div>
              </div>

              {/* Specs Tab */}
              <div className={`${styles['pd-tab-panel']} ${activeTab === 'specs' ? styles['active'] : ''}`}>
                <h2 className={styles['pd-tab-title']}>مواصفات المنتج</h2>
                <div className={styles['specs-grid']}>
                  {[
                    { label: 'العلامة التجارية', value: `${business.name} Exclusive` },
                    { label: 'الموديل', value: `NUYASA-${product.id.slice(0, 6).toUpperCase()}-2026` },
                    { label: 'الفئة', value: product.category || 'فستان زفاف' },
                    { label: 'الستايل', value: 'Princess Ball Gown' },
                    { label: 'الخامة الرئيسية', value: 'دانتيل فرنسي + تول إيطالي' },
                    { label: 'البطانة', value: 'قطن مصري 100%' },
                    { label: 'التطريز', value: 'يدوي - حبيبات لؤلؤية' },
                    { label: 'طول الذيل', value: '120 سم' },
                    { label: 'الموسم', value: 'كل الفصول' },
                    { label: 'بلد الصنع', value: 'إيطاليا (تصميم) + تركيا (تصنيع)' },
                    { label: 'الضمان', value: 'سنة كاملة' },
                    { label: 'رقم القطعة', value: `DS-${product.id.slice(0, 6).toUpperCase()}-2026-001` },
                  ].map((spec, idx) => (
                    <div className={styles['spec-row']} key={idx}>
                      <span>{spec.label}</span>
                      <strong>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Tab */}
              <div className={`${styles['pd-tab-panel']} ${activeTab === 'shipping' ? styles['active'] : ''}`}>
                <h2 className={styles['pd-tab-title']}>الشحن والإرجاع</h2>
                <div className={styles['shipping-grid']}>
                  {[
                    { icon: 'fas fa-truck', title: 'التوصيل', desc: 'توصيل مجاني داخل المدينة خلال 24-48 ساعة. للمدن الأخرى 3-5 أيام عمل مع تأمين شامل.', price: 'مجاني للمدينة' },
                    { icon: 'fas fa-undo', title: 'الإرجاع', desc: 'يمكنكِ إرجاع أو استبدال المنتج خلال 14 يوماً من الاستلام بشرط أن يكون بحالته الأصلية.', price: 'إرجاع مجاني' },
                    { icon: 'fas fa-shield-alt', title: 'الضمان', desc: 'ضمان شامل لمدة سنة ضد عيوب الصناعة. تعديلات مجانية خلال 30 يوماً من الشراء.', price: 'سنة كاملة' },
                    { icon: 'fas fa-credit-card', title: 'الدفع', desc: 'نقبل جميع بطاقات الائتمان، Apple Pay، والمحافظ الإلكترونية. إمكانية الدفع عند الاستلام.', price: 'آمن 100%' },
                  ].map((ship, idx) => (
                    <div className={styles['ship-card']} key={idx}>
                      <i className={ship.icon} />
                      <h3>{ship.title}</h3>
                      <p>{ship.desc}</p>
                      <span className={styles['ship-price']}>{ship.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Tab */}
              <div className={`${styles['pd-tab-panel']} ${activeTab === 'reviews' ? styles['active'] : ''}`} id="reviews-tab">
                <h2 className={styles['pd-tab-title']}>آراء العميلات</h2>
                <div className={styles['reviews-summary']}>
                  <div className={styles['rs-big']}>
                    <strong>{avgRating.toFixed(1)}</strong>
                    <div className={styles['rs-stars']}>
                      <StarRating rating={avgRating} size={16} showValue={false} />
                    </div>
                    <span>
                      من ٥ — <span>{reviewCount}</span> تقييم
                    </span>
                  </div>
                  <div className={styles['rs-bars']}>
                    {ratingBars.map((rb) => (
                      <div className={styles['rs-row']} key={rb.star}>
                        <span>{rb.star} ★</span>
                        <div className={styles['rs-bar']}>
                          <div style={{ width: `${rb.pct}%` }} />
                        </div>
                        <span>{rb.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles['reviews-list']}>
                  {productReviews.length ? (
                    productReviews.map((review) => (
                      <div className={styles['review-item']} key={review.id}>
                        <div className={styles['review-item-head']}>
                          <div className={styles['review-item-avatar']}>{initial(review.user?.name)}</div>
                          <div className={styles['review-item-info']}>
                            <h4>{review.user?.name || 'عميلة سعيدة'}</h4>
                            <p>{new Date(review.createdAt).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                        <div className={styles['stars']}>
                          <StarRating rating={review.rating} size={14} showValue={false} />
                        </div>
                        <p className={styles['review-text']}>{review.comment || 'تجربة رائعة وممتازة'}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-soft)' }}>لا توجد تقييمات بعد</p>
                  )}
                </div>

                {reviewCount > 0 && (
                  <button className={styles['btn-outline']} style={{ marginTop: 24 }}>
                    عرض جميع التقييمات ({reviewCount})
                  </button>
                )}
              </div>

              {/* Care Tab */}
              <div className={`${styles['pd-tab-panel']} ${activeTab === 'care' ? styles['active'] : ''}`}>
                <h2 className={styles['pd-tab-title']}>تعليمات العناية بالفستان</h2>
                <div className={styles['care-grid']}>
                  {careItems.map((care, idx) => (
                    <div className={styles['care-item']} key={idx}>
                      <div className={styles['care-icon']}>
                        <i className={care.icon} />
                      </div>
                      <h4>{care.title}</h4>
                      <p>{care.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className={styles['related-products']}>
                <div className={styles['section-head-simple']}>
                  <h2 className={styles['section-title-simple']}>
                    YOU MAY <em>Also Like</em>
                  </h2>
                  <p className={styles['section-sub-simple']}>منتجات قد تعجبكِ أيضاً</p>
                </div>
                <div className={styles['related-grid']}>
                  {relatedProducts.slice(0, 4).map((p) => (
                    <FashionOneProductCard key={p.id} product={p} business={business} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <FashionOneRecentlyViewed business={business} excludeProductId={product.id} />

        {/* Sticky Cart */}
        <div className={`${styles['sticky-cart']} ${showSticky ? styles['visible'] : ''}`}>
          <div className={`${styles['container']} ${styles['sticky-inner']}`}>
            <div className={styles['sticky-info']}>
              <img src={images[0]} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <span>{format(serviceMode === 'rent' ? rentPrice : product.price)}</span>
              </div>
            </div>
            <button className={styles['btn-primary']} onClick={handleAddToCart}>
              <ShoppingBag size={16} /> أضيفي للسلة
            </button>
          </div>
        </div>

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className={`${styles['modal']} ${styles['show']}`}>
            <div className={styles['modal-overlay']} onClick={() => setShowSizeGuide(false)} />
            <div className={styles['modal-content']}>
              <button className={styles['modal-close']} onClick={() => setShowSizeGuide(false)}>
                <X size={16} />
              </button>
              <h3>دليل المقاسات</h3>
              <table className={styles['size-table']}>
                <thead>
                  <tr>
                    <th>المقاس</th>
                    <th>الصدر (سم)</th>
                    <th>الخصر (سم)</th>
                    <th>الورك (سم)</th>
                    <th>الطول (سم)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeTable.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.bust}</td>
                      <td>{row.waist}</td>
                      <td>{row.hip}</td>
                      <td>{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles['modal-note']}>
                هل تحتاجين مساعدة في اختيار المقاس؟{' '}
                <a href={`https://wa.me/${(business.phone || '0790000000').replace(/[^0-9]/g, '')}`}>تواصلي معنا</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </FashionOneLayout>
  );
}
