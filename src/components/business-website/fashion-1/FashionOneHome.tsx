'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { FashionOneLayout } from './FashionOneLayout';
import { FashionOneProductCard } from './FashionOneProductCard';
import { StarRating } from '@/components/business-website/StarRating';
import type { TemplateBusiness, TemplateProduct, TemplateReview } from '@/components/business-website/template-types';
import { getSectionSettings, isSectionEnabled, getSetting } from '../section-settings';
import { FASHION_ONE_DEFAULTS } from '@/lib/fashion-one-content';
import styles from './fashion-one.module.css';

interface FashionOneHomeProps {
  business: TemplateBusiness;
}

const placeholder = '/uploads/placeholder.jpg';

interface HeroSlide {
  tag: string;
  titleEm: string;
  title: string;
  sub: string;
  cta1: string;
  cta2: string;
  image: string;
}

interface CategoryCard {
  script: string;
  sans: string;
  img: string;
  link: string;
}

interface ServiceItem {
  icon: string;
  title: string;
  desc: string;
}

interface AccessoryItem {
  name: string;
  img: string;
}

interface AboutStat {
  num: string;
  lbl: string;
  source?: 'productsCount' | 'reviewCount' | 'avgRating' | 'manual';
}

interface AchievementItem {
  label: string;
  value: string;
  source: string;
  icon: string;
}

const contactItems = [
  { icon: 'fas fa-phone', label: 'اتصلي بنا', valueProp: 'phone' },
  { icon: 'fab fa-whatsapp', label: 'واتساب', valueProp: 'whatsapp' },
  { icon: 'fas fa-map-marker-alt', label: 'العنوان', valueProp: 'address' },
  { icon: 'far fa-clock', label: 'أوقات العمل', valueProp: 'hours' },
];

export function FashionOneHome({ business }: FashionOneHomeProps) {
  const { showToast } = useToast();
  const slug = business.slug || business.id;
  const products = useMemo(() => business.products || [], [business.products]);

  // ---- Section settings ----
  const heroSettings = getSectionSettings(business, 'hero');
  const heroSlides = getSetting<HeroSlide[]>(heroSettings, 'slides', FASHION_ONE_DEFAULTS.hero.slides as unknown as HeroSlide[]);

  const categoriesSettings = getSectionSettings(business, 'categories');
  const categoryCards = getSetting<CategoryCard[]>(categoriesSettings, 'cards', FASHION_ONE_DEFAULTS.categories.cards as unknown as CategoryCard[]);

  const productsSettings = getSectionSettings(business, 'products');
  const productsTitle = getSetting(productsSettings, 'title', FASHION_ONE_DEFAULTS.products.title);
  const productsTitleEm = getSetting(productsSettings, 'titleEm', FASHION_ONE_DEFAULTS.products.titleEm);
  const productsSubtitle = getSetting(productsSettings, 'subtitle', FASHION_ONE_DEFAULTS.products.subtitle);
  const showProductTabs = getSetting<boolean>(productsSettings, 'showTabs', FASHION_ONE_DEFAULTS.products.showTabs);

  const promoSettings = getSectionSettings(business, 'promo');
  const promoTag = getSetting(promoSettings, 'tag', FASHION_ONE_DEFAULTS.promo.tag);
  const promoTitleEm = getSetting(promoSettings, 'titleEm', FASHION_ONE_DEFAULTS.promo.titleEm);
  const promoTitle = getSetting(promoSettings, 'title', FASHION_ONE_DEFAULTS.promo.title);
  const promoText = getSetting(promoSettings, 'text', FASHION_ONE_DEFAULTS.promo.text);
  const promoCta = getSetting(promoSettings, 'cta', FASHION_ONE_DEFAULTS.promo.cta);
  const promoImage = getSetting(promoSettings, 'image', '');

  const servicesSettings = getSectionSettings(business, 'services');
  const servicesTitle = getSetting(servicesSettings, 'title', FASHION_ONE_DEFAULTS.services.title);
  const servicesTitleEm = getSetting(servicesSettings, 'titleEm', FASHION_ONE_DEFAULTS.services.titleEm);
  const servicesSubtitle = getSetting(servicesSettings, 'subtitle', FASHION_ONE_DEFAULTS.services.subtitle);
  const serviceItems = getSetting<ServiceItem[]>(servicesSettings, 'items', FASHION_ONE_DEFAULTS.services.items as unknown as ServiceItem[]);

  const accessoriesSettings = getSectionSettings(business, 'accessories');
  const accessoriesTitle = getSetting(accessoriesSettings, 'title', FASHION_ONE_DEFAULTS.accessories.title);
  const accessoriesTitleEm = getSetting(accessoriesSettings, 'titleEm', FASHION_ONE_DEFAULTS.accessories.titleEm);
  const accessoriesSubtitle = getSetting(accessoriesSettings, 'subtitle', FASHION_ONE_DEFAULTS.accessories.subtitle);
  const accessoryItems = getSetting<AccessoryItem[]>(accessoriesSettings, 'items', FASHION_ONE_DEFAULTS.accessories.items as unknown as AccessoryItem[]);

  const aboutSettings = getSectionSettings(business, 'about');
  const aboutTag = getSetting(aboutSettings, 'tag', FASHION_ONE_DEFAULTS.about.tag);
  const aboutTitlePre = getSetting(aboutSettings, 'titlePre', FASHION_ONE_DEFAULTS.about.titlePre);
  const aboutTitleEm = getSetting(aboutSettings, 'titleEm', FASHION_ONE_DEFAULTS.about.titleEm);
  const aboutTitlePost = getSetting(aboutSettings, 'titlePost', FASHION_ONE_DEFAULTS.about.titlePost);
  const aboutParagraph1 = getSetting(aboutSettings, 'paragraph1', business.description || FASHION_ONE_DEFAULTS.about.paragraph1);
  const aboutParagraph2 = getSetting(aboutSettings, 'paragraph2', FASHION_ONE_DEFAULTS.about.paragraph2);
  const aboutEstablishedYear = getSetting(aboutSettings, 'establishedYear', FASHION_ONE_DEFAULTS.about.establishedYear);
  const aboutImage = getSetting(aboutSettings, 'image', '');
  const aboutCta = getSetting(aboutSettings, 'cta', FASHION_ONE_DEFAULTS.about.cta);

  const achievementsSettings = getSectionSettings(business, 'achievements');
  const achievementsEnabled = getSetting<boolean>(achievementsSettings, 'enabled', FASHION_ONE_DEFAULTS.achievements.enabled);
  const achievementItems = getSetting<AchievementItem[]>(
    achievementsSettings,
    'items',
    FASHION_ONE_DEFAULTS.achievements.items as unknown as AchievementItem[]
  );

  const contactSettings = getSectionSettings(business, 'contact');
  const bookingEnabled =
    isSectionEnabled(business, 'contact') &&
    getSetting<boolean>(contactSettings, 'bookingEnabled', FASHION_ONE_DEFAULTS.contact.bookingEnabled);
  const contactTag = getSetting(contactSettings, 'tag', FASHION_ONE_DEFAULTS.contact.tag);
  const contactTitle = getSetting(contactSettings, 'title', FASHION_ONE_DEFAULTS.contact.title);
  const contactTitleEm = getSetting(contactSettings, 'titleEm', FASHION_ONE_DEFAULTS.contact.titleEm);
  const contactDescription = getSetting(contactSettings, 'description', FASHION_ONE_DEFAULTS.contact.description);
  const contactPerks = getSetting<string[]>(contactSettings, 'perks', FASHION_ONE_DEFAULTS.contact.perks as unknown as string[]);
  const contactPhone = getSetting(contactSettings, 'phone', business.phone || '079-000-0000');
  const contactWhatsapp = getSetting(contactSettings, 'whatsapp', business.phone || '079-000-0000');
  const contactAddress = getSetting(contactSettings, 'address', business.address || 'شارع الموضة، المدينة');
  const contactHours = getSetting(
    contactSettings,
    'hours',
    typeof business.workingHours === 'string' ? business.workingHours : 'يومياً ١٠ص - ١٠م'
  );

  const newsletterSettings = getSectionSettings(business, 'newsletter');
  const newsletterEnabled =
    isSectionEnabled(business, 'newsletter') &&
    getSetting<boolean>(newsletterSettings, 'enabled', FASHION_ONE_DEFAULTS.newsletter.enabled);
  const newsletterTitle = getSetting(newsletterSettings, 'title', FASHION_ONE_DEFAULTS.newsletter.title);
  const newsletterSubtitle = getSetting(newsletterSettings, 'subtitle', FASHION_ONE_DEFAULTS.newsletter.subtitle);

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'wedding' | 'evening' | 'accessories'>('all');

  const heroImages = useMemo(() => {
    const imgs: string[] = [];
    if (business.cover) imgs.push(business.cover);
    products.forEach((p) => p.images?.forEach((img) => imgs.push(img.url)));
    return imgs.length ? imgs : [placeholder, placeholder, placeholder];
  }, [business.cover, products]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % Math.min(heroSlides.length, heroImages.length));
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length, heroSlides.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % Math.min(heroSlides.length, heroImages.length));
  const prevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + Math.min(heroSlides.length, heroImages.length)) % Math.min(heroSlides.length, heroImages.length));

  const productsLimit = getSetting<number>(productsSettings, 'limit', FASHION_ONE_DEFAULTS.products.limit);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return products.slice(0, productsLimit);
    return products.filter((p) => (p.category || '').toLowerCase().includes(activeTab)).slice(0, productsLimit);
  }, [activeTab, products, productsLimit]);

  const reviews = (business.reviews || []).slice(0, 3) as TemplateReview[];
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const reviewCount = business.reviewCount || 0;

  const deriveAboutStats = (stats: AboutStat[]): AboutStat[] => {
    return stats
      .map((stat) => {
        if (stat.source === 'productsCount') {
          const count = products.length;
          return count > 0 ? { ...stat, num: `${count}+` } : null;
        }
        if (stat.source === 'reviewCount') {
          const count = reviews.length;
          return count > 0 ? { ...stat, num: `${count}+` } : null;
        }
        if (stat.source === 'avgRating') {
          return avgRating > 0 ? { ...stat, num: `${avgRating.toFixed(1)}★` } : null;
        }
        // manual: keep user-entered value only if non-empty
        return stat.num ? stat : null;
      })
      .filter((s): s is AboutStat => s !== null);
  };

  const defaultStats = FASHION_ONE_DEFAULTS.about.stats as unknown as AboutStat[];
  const rawAboutStats: AboutStat[] =
    Array.isArray(aboutSettings['stats']) && (aboutSettings['stats'] as unknown[]).length
      ? (aboutSettings['stats'] as AboutStat[])
      : defaultStats;

  // Detect the old hard-coded fake defaults and replace them with real derived values
  const oldFakeValues = ['850+', '2400+', '4.9★'];
  const looksLikeOldDefaults =
    rawAboutStats.length === defaultStats.length &&
    rawAboutStats.every((s, i) => s.lbl === defaultStats[i].lbl && oldFakeValues.includes(s.num));

  const aboutStats = looksLikeOldDefaults ? deriveAboutStats(defaultStats) : deriveAboutStats(rawAboutStats);

  const ratingBars = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    return { star, pct };
  });

  const initial = (name?: string | null) => (name ? name.charAt(0).toUpperCase() : 'U');

  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    showToast('تم استلام طلب الحجز، سنتواصل معكِ قريباً', 'success');
  };

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    showToast('تم الاشتراك في النشرة البريدية', 'success');
  };

  const getContactValue = (prop: string) => {
    if (prop === 'phone') return contactPhone;
    if (prop === 'whatsapp') return contactWhatsapp;
    if (prop === 'address') return contactAddress;
    if (prop === 'hours') return contactHours;
    return '';
  };

  const getProductImage = (product?: TemplateProduct) => product?.images?.[0]?.url || placeholder;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = placeholder;
  };

  return (
    <FashionOneLayout business={business}>
      <div className={styles['fashionOne']}>
        {/* Hero Slider */}
        {isSectionEnabled(business, 'hero') && (
          <section className={styles['hero-slider']} id="home">
            <div className={styles['hero-slides']}>
              {heroSlides.slice(0, heroImages.length).map((slide, idx) => (
                <div
                  key={idx}
                  className={`${styles['hero-slide']} ${idx === activeSlide ? styles['active'] : ''}`}
                  style={{
                    backgroundImage: `url(${slide.image || heroImages[idx]})`,
                  }}
                >
                  <div className={styles['hero-content']}>
                    <span className={styles['hero-tag']}>{slide.tag}</span>
                    <h1 className={styles['hero-title']}>
                      <em>{slide.titleEm}</em> {slide.title}
                    </h1>
                    <p className={styles['hero-sub']}>{slide.sub}</p>
                    <div className={styles['hero-actions']}>
                      <Link href={`/business/${slug}/shop`} className={styles['btn-primary']}>
                        {slide.cta1}
                      </Link>
                      <Link href={`/business/${slug}#booking`} className={styles['btn-line']}>
                        {slide.cta2}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className={`${styles['hero-arrow']} ${styles['hero-prev']}`} onClick={prevSlide} aria-label="السابق">
              <ChevronRight size={14} />
            </button>
            <button className={`${styles['hero-arrow']} ${styles['hero-next']}`} onClick={nextSlide} aria-label="التالي">
              <ChevronLeft size={14} />
            </button>

            <div className={styles['hero-dots']}>
              {heroSlides.slice(0, heroImages.length).map((_, idx) => (
                <span
                  key={idx}
                  className={`${styles['dot']} ${idx === activeSlide ? styles['active'] : ''}`}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Category Cards */}
        {isSectionEnabled(business, 'categories') && (
          <section className={styles['cat-cards']}>
            <div className={styles['container']}>
              <div className={styles['cat-grid']}>
                {categoryCards.map((card, idx) => (
                  <Link href={`/business/${slug}/shop?cat=${card.link || 'accessories'}`} className={styles['cat-card']} key={idx}>
                    <div className={styles['cat-img']}>
                      <img
                        src={card.img || getProductImage(products.find((p) => (p.category || '').toLowerCase().includes(card.sans.toLowerCase())))}
                        alt={card.sans}
                        onError={handleImageError}
                      />
                    </div>
                    <div className={styles['cat-text']}>
                      <span className={styles['cat-script']}>{card.script}</span>
                      <span className={styles['cat-sans']}>{card.sans}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {isSectionEnabled(business, 'products') && (
          <section className={styles['featured']} id="dresses">
            <div className={styles['container']}>
              <div className={styles['section-head-simple']}>
                <h2 className={styles['section-title-simple']}>
                  {productsTitle} <em>{productsTitleEm}</em>
                </h2>
                <p className={styles['section-sub-simple']}>{productsSubtitle}</p>
              </div>

              {showProductTabs && (
                <div className={styles['filter-tabs']}>
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'wedding', label: 'أعراس' },
                    { key: 'evening', label: 'سهرة' },
                    { key: 'accessories', label: 'مستلزمات' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      className={`${styles['tab-btn']} ${activeTab === tab.key ? styles['active'] : ''}`}
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles['products-grid']}>
                {filteredProducts.length ? (
                  filteredProducts.map((product) => (
                    <FashionOneProductCard key={product.id} product={product} business={business} />
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-soft)' }}>
                    لا توجد منتجات في هذا القسم
                  </p>
                )}
              </div>

              <div className={styles['load-more-wrap']}>
                <Link href={`/business/${slug}/shop`} className={styles['btn-outline']}>
                  عرض جميع المنتجات
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Promo Banner */}
        {isSectionEnabled(business, 'promo') && (
          <section className={styles['promo-banner']}>
            <div className={styles['container']}>
              <div className={styles['promo-card']}>
                <div className={styles['promo-img']}>
                  <img
                    src={promoImage || getProductImage(products.find((p) => (p.category || '').toLowerCase().includes('accessories')))}
                    alt="إكسسوارات"
                    onError={handleImageError}
                  />
                </div>
                <div className={styles['promo-text']}>
                  <span className={styles['promo-tag']}>{promoTag}</span>
                  <h2 className={styles['promo-title']}>
                    <em>{promoTitleEm}</em> {promoTitle}
                  </h2>
                  <p>{promoText}</p>
                  <Link href={`/business/${slug}/shop?cat=accessories`} className={styles['btn-primary']}>
                    {promoCta}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {isSectionEnabled(business, 'services') && (
          <section className={styles['services-section']} id="services">
            <div className={styles['container']}>
              <div className={styles['section-head-simple']}>
                <h2 className={styles['section-title-simple']}>
                  {servicesTitle} <em>{servicesTitleEm}</em>
                </h2>
                <p className={styles['section-sub-simple']}>{servicesSubtitle}</p>
              </div>
              <div className={styles['services-grid']}>
                {serviceItems.map((svc, idx) => (
                  <div className={styles['service-card']} key={idx}>
                    <div className={styles['service-icon']}><i className={svc.icon} /></div>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        {isSectionEnabled(business, 'about') && (
          <section className={styles['about-section']} id="about">
            <div className={`${styles['container']} ${styles['about-grid']}`}>
              <div className={styles['about-img']}>
                <img
                  src={aboutImage || getProductImage(products.find((p) => (p.category || '').toLowerCase().includes('wedding')))}
                  alt="من نحن"
                  onError={handleImageError}
                />
                {aboutEstablishedYear && aboutEstablishedYear !== '2015' && (
                  <div className={styles['about-img-deco']}>
                    <span className={styles['deco-script']}>Est.</span>
                    <strong>{aboutEstablishedYear}</strong>
                  </div>
                )}
              </div>
              <div className={styles['about-content']}>
                <span className={styles['about-tag']}>{aboutTag}</span>
                <h2 className={styles['about-title']}>
                  {aboutTitlePre} <em>{aboutTitleEm}</em>
                  <br />
                  {aboutTitlePost}
                </h2>
                <p>{aboutParagraph1}</p>
                <p>{aboutParagraph2}</p>
                <div className={styles['about-stats']}>
                  {aboutStats.map((stat, idx) => (
                    <div className={styles['about-stat']} key={idx}>
                      <strong>{stat.num}</strong>
                      <span>{stat.lbl}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/business/${slug}#booking`} className={styles['btn-primary']}>
                  {aboutCta}
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Achievements / Stats */}
        {isSectionEnabled(business, 'achievements') && achievementsEnabled && achievementItems.length > 0 && (
          <section className={styles['achievements-section']} id="achievements">
            <div className={styles['container']}>
              <div className={styles['achievements-grid']}>
                {achievementItems.map((item, idx) => {
                  let displayValue = item.value || '';
                  if (item.source === 'reviewCount') displayValue = String(reviewCount);
                  else if (item.source === 'avgRating') displayValue = `${avgRating.toFixed(1)}/5`;
                  else if (item.source === 'businessName') displayValue = business.name || '';
                  else if (item.source === 'productsCount') displayValue = String(products.length);
                  else if (item.source === 'establishedYear') displayValue = aboutEstablishedYear;
                  // Skip auto cards that have no real data yet, unless the user entered a manual value
                  const isEmptyEstablished =
                    item.source === 'establishedYear' &&
                    (displayValue === '' || displayValue === '2015');
                  const isEmptyAuto =
                    item.source !== 'manual' &&
                    (displayValue === '' || displayValue === '0' || displayValue === '0.0/5' || isEmptyEstablished);
                  if (isEmptyAuto) return null;
                  return (
                    <div className={styles['achievement-card']} key={idx}>
                      <i className={item.icon} aria-hidden="true" />
                      <strong>{displayValue}</strong>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Accessories Highlight */}
        {isSectionEnabled(business, 'accessories') && (
          <section className={styles['accessories-section']} id="accessories">
            <div className={styles['container']}>
              <div className={styles['section-head-simple']}>
                <h2 className={styles['section-title-simple']}>
                  {accessoriesTitle} <em>{accessoriesTitleEm}</em>
                </h2>
                <p className={styles['section-sub-simple']}>{accessoriesSubtitle}</p>
              </div>
              <div className={styles['acc-grid']}>
                {accessoryItems.map((acc, idx) => (
                  <Link href={`/business/${slug}/shop?cat=accessories`} className={styles['acc-card']} key={idx}>
                    <div className={styles['acc-img-wrap']}>
                      <img src={acc.img} alt={acc.name} onError={handleImageError} />
                    </div>
                    <h4>{acc.name}</h4>
                    <span className={styles['acc-link']}>تسوّقي →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className={styles['reviews-section']} id="reviews">
          <div className={styles['container']}>
            <div className={styles['section-head-simple']}>
              <h2 className={styles['section-title-simple']}>
                CUSTOMER <em>Reviews</em>
              </h2>
              <p className={styles['section-sub-simple']}>{reviews.length ? 'قصص حقيقية من عميلاتنا' : 'كني أول من تُقيّم تجربتكِ معنا'}</p>
            </div>

            {reviews.length > 0 && (
              <div className={styles['rating-overview']}>
                <div className={styles['rating-big']}>
                  <strong>{avgRating.toFixed(1)}</strong>
                  <div className={styles['rating-stars']}>
                    <StarRating rating={avgRating} size={16} showValue={false} />
                  </div>
                  <span>من ٥ — {reviewCount} تقييم</span>
                </div>
                <div className={styles['rating-bars']}>
                  {ratingBars.map((rb) => (
                    <div className={styles['rb-row']} key={rb.star}>
                      <span>{rb.star} ★</span>
                      <div className={styles['rb']}>
                        <div style={{ width: `${rb.pct}%` }} />
                      </div>
                      <span className={styles['rb-pct']}>{rb.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles['reviews-grid']}>
              {reviews.length ? (
                reviews.map((review) => (
                  <div className={styles['review-card']} key={review.id}>
                    <span className={styles['review-quote']}>“</span>
                    <div className={styles['review-stars']}>
                      <StarRating rating={review.rating} size={14} showValue={false} />
                    </div>
                    <p className={styles['review-text']}>{review.comment || 'تجربة رائعة وممتازة'}</p>
                    <div className={styles['review-author']}>
                      <div className={styles['review-avatar']}>{initial(review.user?.name)}</div>
                      <div className={styles['review-info']}>
                        <h4>{review.user?.name || 'عميلة سعيدة'}</h4>
                        <p>{new Date(review.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-soft)', padding: '40px 0' }}>
                  لا توجد تقييمات بعد. بعد طلبكِ الأول يمكنكِ مشاركة رأيكِ لمساعدة العرائس الأخريات.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Booking Form */}
        {bookingEnabled && (
          <section className={styles['booking-section']} id="booking">
            <div className={styles['container']}>
              <div className={styles['booking-wrap']}>
                <div className={styles['booking-side']}>
                  <span className={styles['about-tag']}>{contactTag}</span>
                  <h2 className={styles['about-title']}>
                    {contactTitle} <em>{contactTitleEm}</em>
                  </h2>
                  <p>{contactDescription}</p>
                  <ul className={styles['booking-perks']}>
                    {contactPerks.map((perk, idx) => (
                      <li key={idx}>
                        <i className="fas fa-check" /> {perk}
                      </li>
                    ))}
                  </ul>
                  <div className={styles['booking-contact']}>
                    {contactItems.map((item, idx) => (
                      <div className={styles['bc-item']} key={idx}>
                        <i className={item.icon} />
                        <div>
                          <span>{item.label}</span>
                          <strong>{getContactValue(item.valueProp)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form className={styles['booking-form']} onSubmit={handleBookingSubmit}>
                  <h3>نموذج الحجز</h3>
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label>الاسم الكامل *</label>
                      <input type="text" name="name" required placeholder="اسمكِ الثلاثي" />
                    </div>
                    <div className={styles['form-group']}>
                      <label>رقم الهاتف *</label>
                      <input type="tel" name="phone" required placeholder="07X-XXXXXXX" />
                    </div>
                  </div>
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label>البريد الإلكتروني</label>
                      <input type="email" name="email" placeholder="example@email.com" />
                    </div>
                    <div className={styles['form-group']}>
                      <label>تاريخ المناسبة</label>
                      <input type="date" name="date" />
                    </div>
                  </div>
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label>نوع الخدمة</label>
                      <select name="service">
                        <option value="">اختاري...</option>
                        <option value="rent">إيجار فستان</option>
                        <option value="buy">شراء فستان</option>
                        <option value="custom">تصميم حسب الطلب</option>
                        <option value="acc">مستلزمات العروس</option>
                      </select>
                    </div>
                    <div className={styles['form-group']}>
                      <label>نوع المناسبة</label>
                      <select name="occasion">
                        <option value="">اختاري...</option>
                        <option value="wedding">زفاف</option>
                        <option value="engagement">خطوبة</option>
                        <option value="party">حفلة سهرة</option>
                        <option value="graduation">تخرج</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles['form-group']}>
                    <label>ملاحظاتكِ</label>
                    <textarea name="notes" rows={4} placeholder="حدّثينا عن حلمكِ..." />
                  </div>
                  <button type="submit" className={`${styles['btn-primary']} ${styles['btn-block']}`}>
                    أرسلي الطلب <Send size={14} />
                  </button>
                  <p className={styles['form-note']}>سنتواصل معكِ خلال ٢٤ ساعة لتأكيد موعدكِ</p>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Newsletter */}
        {newsletterEnabled && (
          <section className={styles['newsletter']}>
            <div className={styles['container']}>
              <div className={styles['news-card']}>
                <span className={styles['news-tag']}>Newsletter</span>
                <h3>{newsletterTitle}</h3>
                <p>{newsletterSubtitle}</p>
                <form className={styles['news-form']} onSubmit={handleNewsletterSubmit}>
                  <input type="email" placeholder="بريدكِ الإلكتروني" required />
                  <button type="submit">
                    اشتراك <i className="fas fa-envelope" />
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
      </div>
    </FashionOneLayout>
  );
}
