'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Scissors,
  Sparkles,
  Heart,
  Crown,
  Check,
  Star,
  ArrowLeft,
  Share2,
  Calendar,
} from 'lucide-react';
import type { TemplateBusiness } from './template-types';
import { TEMPLATE_STYLES } from './beauty-salon-template-styles';

interface BeautySalonTemplateProps {
  business: TemplateBusiness;
}

const LOCAL_IMAGES = {
  hero: '/templates/beauty-salon/hero-hair.jpg',
  about: '/templates/beauty-salon/salon-interior.jpg',
  bridal: '/templates/beauty-salon/bridal.jpg',
  gallery: [
    '/templates/beauty-salon/spa-1.jpg',
    '/templates/beauty-salon/skincare-1.jpg',
    '/templates/beauty-salon/nails-1.jpg',
    '/templates/beauty-salon/hair-coloring.jpg',
    '/templates/beauty-salon/makeup-products.jpg',
    '/templates/beauty-salon/spa-2.jpg',
    '/templates/beauty-salon/skincare-2.jpg',
    '/templates/beauty-salon/spa-3.jpg',
  ],
};

const DEFAULT_HERO_STATS = [
  { num: '+12', lbl: 'عاماً من الخبرة' },
  { num: '+15k', lbl: 'زبونة راضية' },
  { num: '+80', lbl: 'خدمة تجميلية' },
];

const DEFAULT_ABOUT_FEATURES = [
  { icon: 'sparkles', title: 'منتجات عالية الجودة', description: 'نستخدم أجود الماركات العالمية المعتمدة.' },
  { icon: 'heart', title: 'راحة وخصوصية', description: 'أجواء نسائية خاصة لراحة تامة.' },
  { icon: 'crown', title: 'خبيرات معتمدات', description: 'فريق مدرب على أحدث التقنيات.' },
  { icon: 'clock', title: 'مواعيد دقيقة', description: 'نحترم وقتكِ بمواعيد منظمة ومرنة.' },
];

const DEFAULT_BRIDAL_LIST = [
  { title: 'مكياج عروس احترافي', description: 'تجربة مكياج كاملة تناسب ذوقكِ وإطلالتكِ.' },
  { title: 'تسريحة شعر فاخرة', description: 'تسريحات عصرية وكلاسيكية بأجود المنتجات.' },
  { title: 'عناية بالبشرة والأظافر', description: 'جلسات تجهيز متكاملة قبل موعد الزفاف.' },
];

const DEFAULT_PRICING_FEATURES = [
  'خدمة شخصية مخصصة',
  'منتجات عالية الجودة',
  'موعد مرن وسريع',
  'متابعة ما بعد الخدمة',
];

const SERVICE_ICONS = [Scissors, Sparkles, Heart, Crown, Sparkles, Scissors];

function getSections(business: TemplateBusiness) {
  return business.theme?.sections || [];
}

function isSectionEnabled(business: TemplateBusiness, id: string) {
  const sections = getSections(business);
  const section = sections.find((s) => s.id === id);
  return section ? section.enabled : true;
}

function getSectionSettings(business: TemplateBusiness, id: string): Record<string, unknown> {
  const sections = getSections(business);
  const section = sections.find((s) => s.id === id);
  return (section?.settings as Record<string, unknown>) || {};
}

function getSetting<T>(settings: Record<string, unknown>, key: string, fallback: T): T {
  const value = settings[key];
  return value !== undefined && value !== null && value !== '' ? (value as T) : fallback;
}

function normalizeWorkingHours(
  value?: TemplateBusiness['workingHours']
): { day: string; open: string; close: string }[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatWorkingHoursShort(
  hours: { day: string; open: string; close: string }[]
): string {
  if (!hours.length) return '';
  return hours.map((h) => `${h.day}: ${h.open} - ${h.close}`).join(' | ');
}

function useInjectStyles() {
  useEffect(() => {
    const id = 'beauty-salon-template-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = TEMPLATE_STYLES;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
}

function useScrollNav() {
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!navRef.current) return;
      navRef.current.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return navRef;
}

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px 20% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="test-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-[18px] h-[18px]"
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke={i <= Math.round(rating) ? 'currentColor' : 'currentColor'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function BeautySalonTemplate({ business }: BeautySalonTemplateProps) {
  useInjectStyles();
  const navRef = useScrollNav();
  useReveal();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
    setMobileMenuOpen(false);
  };

  const products = business.products || [];
  const businessServices = business.services || [];
  const reviews = business.reviews || [];
  const workingHours = normalizeWorkingHours(business.workingHours);
  const galleryImages = useMemo(() => {
    const sectionImages = (getSectionSettings(business, 'gallery').images as string[] | undefined);
    if (sectionImages && sectionImages.length > 0) return sectionImages;
    if (business.images?.length) return business.images.map((img) => img.url);
    return LOCAL_IMAGES.gallery;
  }, [business.images, business.theme?.sections]);

  const services = useMemo(
    () =>
      (businessServices.length > 0 ? businessServices : products).slice(0, 6).map((s, idx) => ({
        id: s.id,
        title: 'name' in s ? (s as any).name : (s as any).title || (s as any).name,
        description: (s as any).description || `خدمة مميزة من ${business.name}`,
        image: 'image' in s && (s as any).image
          ? (s as any).image
          : galleryImages[idx % galleryImages.length] || LOCAL_IMAGES.gallery[idx % LOCAL_IMAGES.gallery.length],
      })),
    [businessServices, products, galleryImages, business.name]
  );

  const pricingPlans = useMemo(
    () =>
      (businessServices.length > 0 ? businessServices : products).slice(0, 3).map((s, idx) => ({
        id: s.id,
        title: 'name' in s ? (s as any).name : (s as any).title || (s as any).name,
        price: Number((s as any).price) > 0 ? `${(s as any).price} ر.س` : 'تواصل معنا',
        subtitle: (s as any).description || 'باقة مختارة بعناية',
        featured: idx === 1,
      })),
    [businessServices, products]
  );

  const navLinks = business.pages || [];
  const visibleNavLinks = navLinks.filter(
    (p) => !p.isHomePage && p.slug !== 'about' && p.title?.trim() !== 'من نحن'
  );
  const basePath = `/business/${business.slug}`;
  const homePath = `${basePath}/home`;

  const showHero = isSectionEnabled(business, 'hero');
  const showAbout = isSectionEnabled(business, 'about');
  const showServices = isSectionEnabled(business, 'services');
  const showBridal = isSectionEnabled(business, 'bridal');
  const showPricing = isSectionEnabled(business, 'pricing');
  const showGallery = isSectionEnabled(business, 'gallery');
  const showTestimonials = isSectionEnabled(business, 'reviews');
  const showBooking = isSectionEnabled(business, 'contact');

  const heroSettings = getSectionSettings(business, 'hero');
  const aboutSettings = getSectionSettings(business, 'about');
  const servicesSettings = getSectionSettings(business, 'services');
  const bridalSettings = getSectionSettings(business, 'bridal');
  const pricingSettings = getSectionSettings(business, 'pricing');
  const gallerySettings = getSectionSettings(business, 'gallery');
  const testimonialsSettings = getSectionSettings(business, 'reviews');
  const bookingSettings = getSectionSettings(business, 'contact');

  const heroImage =
    (getSetting(heroSettings, 'image', '') as string) ||
    business.cover ||
    business.images?.[0]?.url ||
    LOCAL_IMAGES.hero;
  const aboutImage =
    (getSetting(aboutSettings, 'image', '') as string) ||
    business.images?.[0]?.url ||
    LOCAL_IMAGES.about;
  const bridalImage =
    (getSetting(bridalSettings, 'image', '') as string) ||
    business.images?.[1]?.url ||
    LOCAL_IMAGES.bridal;

  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingSent(true);
    setTimeout(() => setBookingSent(false), 4000);
  };

  return (
    <div className="beauty-salon-template js-reveal" dir="rtl">
      <nav ref={navRef} className="nav">
        <div className="container">
          <div className="nav-row">
            <Link href={homePath} className="brand">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <span className="brand-mark">{getInitials(business.name)}</span>
              )}
              <span className="brand-name">{business.name}</span>
            </Link>

            <div className="nav-links">
              <Link href={homePath}>الرئيسية</Link>
              <a href={`${homePath}#about`} onClick={(e) => scrollToSection(e, 'about')}>من نحن</a>
              <a href={`${homePath}#services`} onClick={(e) => scrollToSection(e, 'services')}>خدماتنا</a>
              <a href={`${homePath}#pricing`} onClick={(e) => scrollToSection(e, 'pricing')}>الباقات</a>
              <a href={`${homePath}#gallery`} onClick={(e) => scrollToSection(e, 'gallery')}>معرض الأعمال</a>
              <a href={`${homePath}#booking`} onClick={(e) => scrollToSection(e, 'booking')}>احجزي موعد</a>
              {visibleNavLinks.slice(0, 2).map((p) => (
                <Link key={p.slug} href={`${basePath}/${p.slug}`}>
                  {p.title}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="nav-cta hidden md:inline-flex">
                  احجزي الآن
                </a>
              )}
              <button
                className="menu-toggle"
                aria-label="القائمة"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[#fbf7f4] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-[#2a1f24]">القائمة</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="إغلاق"
                className="p-2 hover:bg-black/5 rounded-full"
              >
                <X className="w-5 h-5 text-[#2a1f24]" />
              </button>
            </div>
            <div className="space-y-4 text-[#2a1f24]">
              <Link href={homePath} onClick={() => setMobileMenuOpen(false)}>
                الرئيسية
              </Link>
              <a href={`${homePath}#about`} onClick={(e) => scrollToSection(e, 'about')}>
                من نحن
              </a>
              <a href={`${homePath}#services`} onClick={(e) => scrollToSection(e, 'services')}>
                خدماتنا
              </a>
              <a href={`${homePath}#pricing`} onClick={(e) => scrollToSection(e, 'pricing')}>
                الباقات
              </a>
              <a href={`${homePath}#gallery`} onClick={(e) => scrollToSection(e, 'gallery')}>
                معرض الأعمال
              </a>
              <a href={`${homePath}#booking`} onClick={(e) => scrollToSection(e, 'booking')}>
                احجزي موعد
              </a>
              {visibleNavLinks.map((p) => (
                <Link
                  key={p.slug}
                  href={`${basePath}/${p.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {showHero && (
        <header
          className="hero"
          data-testid="beauty-hero"
          style={{
            '--hero-image': `url(${heroImage})`,
          } as React.CSSProperties}
        >
          <div className="hero-bg" />
          <div className="hero-overlay" />
          <div className="container">
            <div className="hero-content">
              <div className="hero-eyebrow-row reveal">
                <span className="dot" />
                <span>{getSetting(heroSettings, 'subtitle', 'صالون وسبا للسيدات') as string}</span>
              </div>
              <h1 className="reveal delay-1">
                {(getSetting(heroSettings, 'title', '') as string) || (
                  <>جمالكِ يبدأ من <span className="accent">لمسة نور</span></>
                )}
              </h1>
              <p className="hero-lead reveal delay-1">
                {getSetting(
                  heroSettings,
                  'description',
                  business.description ||
                    'تجربة فاخرة من العناية بالشعر والبشرة والأظافر، حيث تجمع خدماتنا بين الأناقة والراحة لإبراز إطلالتكِ الأجمل.'
                ) as string}
              </p>
              <div className="hero-ctas reveal delay-2">
                <a href={`${homePath}#booking`} onClick={(e) => scrollToSection(e, 'booking')} className="btn btn-primary">
                  <Calendar className="w-4 h-4" />
                  {getSetting(heroSettings, 'ctaPrimary', 'احجزي موعدكِ') as string}
                </a>
                <a href={`${homePath}#services`} onClick={(e) => scrollToSection(e, 'services')} className="btn btn-ghost">
                  {getSetting(heroSettings, 'ctaSecondary', 'اكتشفي خدماتنا') as string}
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
              <div className="hero-stats reveal delay-3">
                {(getSetting(heroSettings, 'stats', DEFAULT_HERO_STATS) as { num: string; lbl: string }[]).map((stat, idx) => (
                  <div key={idx}>
                    <div className="num">{stat.num}</div>
                    <div className="lbl">{stat.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-badge">
            <Sparkles className="w-9 h-9" />
            <div>
              <div className="b-title">{getSetting(heroSettings, 'badgeTitle', 'حاصلين على تقييم ممتاز') as string}</div>
              <div className="b-sub">
                {getSetting(heroSettings, 'badgeSubtitle', `${business.reviewCount || 0} تقييم · ${business.avgRating?.toFixed(1) || '5.0'} / 5`) as string}
              </div>
            </div>
          </div>
        </header>
      )}

      {showAbout && (
        <section id="about" className="about section">
          <div className="container">
            <div className="about-grid">
              <div className="about-image reveal">
                <img src={aboutImage} alt={business.name} />
                <div className="float">
                  <div className="float-inner">
                    <div className="y">{getSetting(aboutSettings, 'floatYear', '12+') as string}</div>
                    <div className="t">{getSetting(aboutSettings, 'floatLabel', 'عاماً من الخبرة') as string}</div>
                  </div>
                </div>
              </div>
              <div className="about-text reveal delay-1">
                <div className="eyebrow">{getSetting(aboutSettings, 'subtitle', 'من نحن') as string}</div>
                <h2>
                  {getSetting(aboutSettings, 'title', '') as string || (
                    <>نُقدم لكِ تجربة <span className="text-[#b76e79] font-[family-name:'Aref_Ruqaa'] italic">جمال استثنائية</span></>
                  )}
                </h2>
                <p className="lead">
                  {getSetting(
                    aboutSettings,
                    'description',
                    business.description ||
                      'نؤمن بأن الجمال الحقيقي ينبع من الثقة بالنفس. لذلك نقدم خدمات تجميلية متكاملة في أجواء هادئة وفاخرة، بأيدي خبيرات متخصصات.'
                  ) as string}
                </p>
                <div className="about-features">
                  {(getSetting(aboutSettings, 'features', DEFAULT_ABOUT_FEATURES) as { icon: string; title: string; description: string }[]).map((feat, idx) => {
                    const Icon =
                      feat.icon === 'heart'
                        ? Heart
                        : feat.icon === 'crown'
                        ? Crown
                        : feat.icon === 'clock'
                        ? Clock
                        : Sparkles;
                    return (
                      <div className="about-feat" key={idx}>
                        <div className="ic">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4>{feat.title}</h4>
                          <p>{feat.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {showServices && (
        <section id="services" className="services section">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">{getSetting(servicesSettings, 'subtitle', 'خدماتنا') as string}</div>
              <h2>{getSetting(servicesSettings, 'title', 'باقات العناية والجمال') as string}</h2>
              <p>{getSetting(servicesSettings, 'description', 'اختاري ما يناسبكِ من خدمات الشعر والبشرة والأظافر والمكياج.') as string}</p>
            </div>

            <div className="services-grid">
              {services.length > 0 ? (
                services.map((service, idx) => {
                  const Icon = SERVICE_ICONS[idx % SERVICE_ICONS.length];
                  return (
                    <div
                      key={service.id}
                      className={`service reveal delay-${(idx % 3) + 1}`}
                    >
                      <div className="service-img">
                        <img src={service.image} alt={service.title} />
                      </div>
                      <div className="service-body">
                        <span className="ic">
                          <Icon className="w-5 h-5" />
                        </span>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <a href={`${homePath}#booking`} onClick={(e) => scrollToSection(e, 'booking')} className="service-link">
                          احجزي الآن
                          <ArrowLeft className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12">
                  لا توجد خدمات مسجلة حالياً
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {showBridal && (
        <section className="bridal section">
          <div className="container">
            <div className="bridal-grid">
              <div className="bridal-image reveal">
                <img src={bridalImage} alt="عروض العرائس" />
                <div className="bridal-tag">{getSetting(bridalSettings, 'tag', 'باقات العرائس') as string}</div>
              </div>
              <div className="bridal-text reveal delay-1">
                <div className="eyebrow">{getSetting(bridalSettings, 'subtitle', 'يومكِ المميز') as string}</div>
                <h2>
                  {getSetting(bridalSettings, 'title', '') as string || (
                    <>إطلالة عروس <span className="accent">تُنسَج بحب</span></>
                  )}
                </h2>
                <p>
                  {getSetting(
                    bridalSettings,
                    'description',
                    'نُقدم باقات شاملة للعناية بالعروس تشمل المكياج، تسريحة الشعر، العناية بالبشرة والأظافر، لضمان إطلالة لا تُنسى في يومكِ الأهم.'
                  ) as string}
                </p>
                <ul className="bridal-list">
                  {(getSetting(bridalSettings, 'list', DEFAULT_BRIDAL_LIST) as { title: string; description: string }[]).map((item, idx) => (
                    <li key={idx}>
                      <span className="check">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <a href={`${homePath}#booking`} onClick={(e) => scrollToSection(e, 'booking')} className="btn btn-primary">
                  {getSetting(bridalSettings, 'cta', 'احجزي باقة العروس') as string}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {showPricing && (
        <section id="pricing" className="pricing section">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">{getSetting(pricingSettings, 'subtitle', 'الباقات') as string}</div>
              <h2>{getSetting(pricingSettings, 'title', 'اختري باقتكِ المثالية') as string}</h2>
              <p>{getSetting(pricingSettings, 'description', 'أسعار واضحة وباقات مصممة لتلبية احتياجاتكِ بأفضل قيمة.') as string}</p>
            </div>

            <div className="pricing-grid">
              {pricingPlans.length > 0 ? (
                pricingPlans.map((plan, idx) => (
                  <div
                    key={plan.id}
                    className={`price-card reveal delay-${(idx % 3) + 1} ${plan.featured ? 'featured' : ''}`}
                  >
                    {plan.featured && <span className="badge">الأكثر طلباً</span>}
                    <h3>{plan.title}</h3>
                    <div className="price">{plan.price}</div>
                    <div className="price-sub">{plan.subtitle}</div>
                    <ul>
                      {(getSetting(pricingSettings, 'features', DEFAULT_PRICING_FEATURES) as string[]).map((feature, fidx) => (
                        <li key={fidx}>
                          <Check className="w-4 h-4" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`${homePath}#booking`}
                      onClick={(e) => scrollToSection(e, 'booking')}
                      className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      احجزي الآن
                    </a>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12">
                  لا توجد باقات متاحة حالياً
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {showGallery && (
        <section id="gallery" className="gallery section">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">{getSetting(gallerySettings, 'subtitle', 'معرض الأعمال') as string}</div>
              <h2>{getSetting(gallerySettings, 'title', 'لمحات من أعمالنا') as string}</h2>
              <p>{getSetting(gallerySettings, 'description', 'صور من خدماتنا وأجواء الصالون لإلهام إطلالتكِ القادمة.') as string}</p>
            </div>

            <div className="gallery-grid">
              {galleryImages.slice(0, 8).map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className={`gallery-item reveal delay-${(idx % 3) + 1}`}
                >
                  <img src={url} alt={`صورة ${idx + 1}`} />
                  <div className="overlay">
                    <span>عمل {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showTestimonials && (
        <section className="testimonials section">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">{getSetting(testimonialsSettings, 'subtitle', 'آراء زبوناتنا') as string}</div>
              <h2>{getSetting(testimonialsSettings, 'title', 'تجارب حقيقية من زبوناتنا') as string}</h2>
              <p>{getSetting(testimonialsSettings, 'description', 'نفخر بثقة زبوناتنا ونسعى دائماً لتقديم الأفضل.') as string}</p>
            </div>

            <div className="test-grid">
              {(reviews.length > 0 ? reviews.slice(0, 3) : (getSetting(testimonialsSettings, 'items', []) as { name: string; role: string; comment: string; rating: number }[]).slice(0, 3)).map((review, idx) => (
                <div
                  key={'id' in review && review.id ? review.id : idx}
                  className={`test-card reveal delay-${(idx % 3) + 1}`}
                >
                  <StarRating rating={'rating' in review ? (review as any).rating : 5} />
                  <p className="test-text">{(review as any).comment || 'تجربة رائعة'}</p>
                  <div className="test-author">
                    <div className="avatar">
                      {getInitials((review as any).user?.name || (review as any).name || 'عميلة')}
                    </div>
                    <div>
                      <div className="name">{(review as any).user?.name || (review as any).name || 'عميلة'}</div>
                      <div className="role">{(review as any).role || 'زبونة دائمة'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showBooking && (
        <section id="booking" className="booking section">
          <div className="container">
            <div className="booking-grid">
              <div className="booking-info reveal">
                <div className="eyebrow">{getSetting(bookingSettings, 'subtitle', 'احجزي موعدكِ') as string}</div>
                <h2>
                  {getSetting(bookingSettings, 'title', '') as string || (
                    <>جددي حيويتكِ مع <span className="accent">لمسة نور</span></>
                  )}
                </h2>
                <p>
                  {getSetting(
                    bookingSettings,
                    'description',
                    'املئي النموذج وسنتواصل معكِ لتأكيد الموعد. فريقنا جاهز لاستقبالكِ وتقديم تجربة جمال لا تُنسى.'
                  ) as string}
                </p>
                <ul className="info-list">
                  {business.phone && (
                    <li>
                      <span className="ic">
                        <Phone className="w-5 h-5" />
                      </span>
                      <div>
                        <strong>اتصلي بنا</strong>
                        <span>{business.phone}</span>
                      </div>
                    </li>
                  )}
                  {(business.city || business.address) && (
                    <li>
                      <span className="ic">
                        <MapPin className="w-5 h-5" />
                      </span>
                      <div>
                        <strong>الموقع</strong>
                        <span>{[business.city, business.address].filter(Boolean).join(' - ')}</span>
                      </div>
                    </li>
                  )}
                  {workingHours.length > 0 && (
                    <li>
                      <span className="ic">
                        <Clock className="w-5 h-5" />
                      </span>
                      <div>
                        <strong>ساعات العمل</strong>
                        <span>{formatWorkingHoursShort(workingHours)}</span>
                      </div>
                    </li>
                  )}
                  {business.email && (
                    <li>
                      <span className="ic">
                        <Mail className="w-5 h-5" />
                      </span>
                      <div>
                        <strong>البريد الإلكتروني</strong>
                        <span>{business.email}</span>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              <div className="booking-form reveal delay-1">
                {bookingSent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#b76e79] text-white flex items-center justify-center mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">تم استلام طلبكِ</h3>
                    <p className="text-white/70">سنتواصل معكِ قريباً لتأكيد الموعد.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>الاسم</label>
                        <input type="text" placeholder="اسمكِ الكامل" required />
                      </div>
                      <div className="form-group">
                        <label>رقم الجوال</label>
                        <input type="tel" placeholder="05xxxxxxxx" required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>الخدمة</label>
                        <select required>
                          <option value="">اختري الخدمة</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.title}>
                              {s.title}
                            </option>
                          ))}
                          <option value="bridal">باقة العروس</option>
                          <option value="other">خدمة أخرى</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>التاريخ</label>
                        <input type="date" required />
                      </div>
                    </div>
                    <div className="form-row full">
                      <div className="form-group">
                        <label>ملاحظات</label>
                        <textarea rows={4} placeholder="أخبرينا بأي تفاصيل إضافية..."></textarea>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <Calendar className="w-4 h-4" />
                      تأكيد الحجز
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="brand-mark">{getInitials(business.name)}</div>
              <h4 className="text-lg font-bold">{business.name}</h4>
              <p>{business.description || 'صالون وسبا للسيدات يقدم تجربة جمال فاخرة.'}</p>
              <div className="socials">
                <a href="#" aria-label="Social">
                  <Share2 className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Favorite">
                  <Heart className="w-4 h-4" />
                </a>
                {business.phone && (
                  <a href={`tel:${business.phone}`} aria-label="Phone">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            <div className="footer-col">
              <h4>روابط سريعة</h4>
              <ul>
                <li>
                  <Link href={homePath}>الرئيسية</Link>
                </li>
                <li>
                  <a href={`${homePath}#about`} onClick={(e) => scrollToSection(e, 'about')}>من نحن</a>
                </li>
                <li>
                  <a href={`${homePath}#services`} onClick={(e) => scrollToSection(e, 'services')}>خدماتنا</a>
                </li>
                <li>
                  <a href={`${homePath}#pricing`} onClick={(e) => scrollToSection(e, 'pricing')}>الباقات</a>
                </li>
                <li>
                  <a href={`${homePath}#booking`} onClick={(e) => scrollToSection(e, 'booking')}>احجزي موعد</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>الصفحات</h4>
              <ul>
                {visibleNavLinks.map((p) => (
                  <li key={p.slug}>
                    <Link href={`${basePath}/${p.slug}`}>{p.title}</Link>
                  </li>
                ))}
                {visibleNavLinks.length === 0 && <li>لا توجد صفحات إضافية</li>}
              </ul>
            </div>
            <div className="footer-col">
              <h4>تواصل معنا</h4>
              {business.phone && <p>{business.phone}</p>}
              {business.email && <p>{business.email}</p>}
              {(business.city || business.address) && (
                <p>{[business.city, business.address].filter(Boolean).join(' - ')}</p>
              )}
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
            </span>
            <span className="serif-en">
              Designed with <span className="text-[#b76e79]">♥</span> for beauty
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
