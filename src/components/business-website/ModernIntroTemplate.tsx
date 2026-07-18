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
  Star,
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Users,
  Award,
  Sparkles,
  Lightbulb,
  Zap,
  Target,
  Heart,
  Check,
  Send,
} from 'lucide-react';
import type { TemplateBusiness } from './template-types';
import { TEMPLATE_STYLES } from './modern-intro-template-styles';

interface ModernIntroTemplateProps {
  business: TemplateBusiness;
}

const LOCAL_IMAGES = {
  hero: '/templates/modern-intro/hero.jpg',
  about: '/templates/modern-intro/about.jpg',
  gallery: [
    '/templates/modern-intro/gallery-1.jpg',
    '/templates/modern-intro/gallery-2.jpg',
    '/templates/modern-intro/gallery-3.jpg',
    '/templates/modern-intro/gallery-4.jpg',
    '/templates/modern-intro/gallery-5.jpg',
    '/templates/modern-intro/gallery-6.jpg',
  ],
};

const DEFAULT_FEATURES = [
  { icon: 'shield', title: 'جودة موثوقة', description: 'نلتزم بأعلى معايير الجودة في كل ما نقدمه.' },
  { icon: 'users', title: 'فريق محترف', description: 'خبراء ومختصون يعملون لتحقيق رؤيتك.' },
  { icon: 'award', title: 'خبرة مثبتة', description: 'سنوات من الخبرة في خدمة عملائنا.' },
  { icon: 'sparkles', title: 'حلول مبتكرة', description: 'نبتكر الحلول التي تناسب احتياجاتك.' },
];

const DEFAULT_STATS = [
  { value: '+10', label: 'سنوات خبرة' },
  { value: '+500', label: 'عميل سعيد' },
  { value: '+50', label: 'مشروع ناجح' },
  { value: '24/7', label: 'دعم مستمر' },
];

const DEFAULT_TESTIMONIALS = [
  { name: 'أحمد العلي', role: 'صاحب شركة', content: 'تجربة ممتازة من البداية للنهاية، أنصح بالتعامل معهم بشدة.', rating: 5 },
  { name: 'سارة محمد', role: 'مديرة تسويق', content: 'فريق محترف يفهم احتياجات العميل ويقدم حلولاً مبتكرة.', rating: 5 },
  { name: 'خالد السبيعي', role: 'رائد أعمال', content: 'خدمة سريعة وجودة عالية، سأتعامل معهم مرة أخرى بالتأكيد.', rating: 4 },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheck,
  users: Users,
  award: Award,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  zap: Zap,
  target: Target,
  heart: Heart,
  check: Check,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
}

function useInjectStyles() {
  useEffect(() => {
    const id = 'modern-intro-template-styles';
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
      { threshold: 0, rootMargin: '0px 0px 18% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

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

function formatWorkingHoursShort(hours: { day: string; open: string; close: string }[]): string {
  if (!hours.length) return '';
  return hours.map((h) => `${h.day}: ${h.open} - ${h.close}`).join(' | ');
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="mi-stars">
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

export function ModernIntroTemplate({ business }: ModernIntroTemplateProps) {
  useInjectStyles();
  const navRef = useScrollNav();
  useReveal();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const basePath = `/business/${business.slug}`;
  const homePath = `${basePath}/home`;

  const navLinks = business.pages || [];
  const visibleNavLinks = navLinks.slice(0, 5);
  const dropdownNavLinks = navLinks.slice(5);

  const businessServices = business.services || [];
  const products = business.products || [];
  const reviews = business.reviews || [];
  const workingHours = normalizeWorkingHours(business.workingHours);

  const assets = business.assets || [];
  const getAssetUrl = (types: string[], role?: string): string | undefined => {
    const asset = assets.find((a) =>
      types.includes(a.type?.toUpperCase()) || (role && a.role === role)
    );
    return asset?.url;
  };

  const galleryImages = useMemo(() => {
    const sectionImages = getSectionSettings(business, 'gallery').images as string[] | undefined;
    if (sectionImages && sectionImages.length > 0) return sectionImages;
    const assetGallery = assets
      .filter((a) => ['GALLERY', 'SERVICE', 'PRODUCT'].includes(a.type?.toUpperCase()) && a.url)
      .map((a) => a.url);
    if (assetGallery.length > 0) return assetGallery;
    if (business.images?.length) return business.images.map((img) => img.url);
    return LOCAL_IMAGES.gallery;
  }, [business.images, business.assets, business.theme?.sections]);

  const services: { id: string; title: string; description: string; image: string; price?: string }[] = useMemo(() => {
    if (businessServices.length > 0) {
      return businessServices.slice(0, 6).map((s, idx) => ({
        id: s.id,
        title: s.name,
        description: s.description || `خدمة مميزة من ${business.name}`,
        price: s.price ? `${s.price} ر.س` : undefined,
        image: s.image || galleryImages[idx % galleryImages.length] || LOCAL_IMAGES.gallery[idx % LOCAL_IMAGES.gallery.length],
      }));
    }
    const feats = getSectionSettings(business, 'features').features as { title: string; description: string }[] | undefined;
    if (feats && feats.length > 0) {
      return feats.slice(0, 6).map((f, idx) => ({
        id: `feat-${idx}`,
        title: f.title,
        description: f.description,
        image: galleryImages[idx % galleryImages.length] || LOCAL_IMAGES.gallery[idx % LOCAL_IMAGES.gallery.length],
      }));
    }
    return [];
  }, [businessServices, business.name, galleryImages, business.theme?.sections]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
    setMobileMenuOpen(false);
  };

  const heroSettings = getSectionSettings(business, 'hero');
  const aboutSettings = getSectionSettings(business, 'about');
  const featuresSettings = getSectionSettings(business, 'features');
  const servicesSettings = getSectionSettings(business, 'services');
  const statsSettings = getSectionSettings(business, 'stats');
  const gallerySettings = getSectionSettings(business, 'gallery');
  const testimonialsSettings = getSectionSettings(business, 'testimonials');
  const contactSettings = getSectionSettings(business, 'contact');
  const ctaSettings = getSectionSettings(business, 'cta');

  const heroImage =
    (getSetting(heroSettings, 'image', '') as string) ||
    getAssetUrl(['COVER'], 'hero-main') ||
    business.cover ||
    business.images?.[0]?.url ||
    LOCAL_IMAGES.hero;

  const aboutImage =
    (getSetting(aboutSettings, 'image', '') as string) ||
    getAssetUrl(['ABOUT'], 'about-main') ||
    business.images?.[1]?.url ||
    business.images?.[0]?.url ||
    LOCAL_IMAGES.about;

  const features =
    (getSetting(featuresSettings, 'features', undefined) as { icon?: string; title: string; description: string }[] | undefined) ||
    DEFAULT_FEATURES;

  const stats =
    (getSetting(statsSettings, 'stats', undefined) as { value: string; label: string }[] | undefined) ||
    DEFAULT_STATS;

  const testimonials =
    (reviews.length > 0
      ? reviews.slice(0, 3).map((r) => ({
          name: r.user?.name || 'عميل',
          role: 'عميل',
          content: r.comment || '',
          rating: r.rating,
        }))
      : (getSetting(testimonialsSettings, 'items', DEFAULT_TESTIMONIALS) as { name: string; role: string; content: string; rating: number }[])) ||
    DEFAULT_TESTIMONIALS;

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => setContactSent(false), 4000);
  };

  return (
    <div className="modern-intro-template js-reveal" dir="rtl">
      <nav ref={navRef} className="mi-nav">
        <div className="container">
          <div className="mi-nav-row">
            <Link href={homePath} className="mi-brand">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-11 h-11 rounded-xl object-cover" />
              ) : (
                <span className="mi-brand-mark">{getInitials(business.name)}</span>
              )}
              <span className="mi-brand-name">{business.name}</span>
            </Link>

            <div className="mi-nav-links">
              {visibleNavLinks.map((p) => {
                const isHome = p.isHomePage;
                const hash = isHome ? 'hero' : undefined;
                return (
                  <a
                    key={p.slug}
                    href={isHome ? `${homePath}#hero` : `${basePath}/${p.slug}`}
                    onClick={hash ? (e) => scrollToSection(e, hash) : undefined}
                    className={isHome ? 'active' : ''}
                  >
                    {p.title}
                  </a>
                );
              })}

              {dropdownNavLinks.length > 0 && (
                <div className="mi-dropdown">
                  <button type="button" className="inline-flex items-center gap-1">
                    المزيد
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="mi-dropdown-menu">
                    {dropdownNavLinks.map((p) => (
                      <Link key={p.slug} href={`${basePath}/${p.slug}`}>
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="menu-toggle"
              aria-label="القائمة"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-[#0f172a]">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="إغلاق" className="p-2 hover:bg-black/5 rounded-full">
                <X className="w-5 h-5 text-[#0f172a]" />
              </button>
            </div>
            <div className="space-y-4 text-[#0f172a]">
              {navLinks.map((p) => {
                const isHome = p.isHomePage;
                return isHome ? (
                  <a key={p.slug} href={`${homePath}#hero`} onClick={(e) => scrollToSection(e, 'hero')}>
                    {p.title}
                  </a>
                ) : (
                  <Link key={p.slug} href={`${basePath}/${p.slug}`} onClick={() => setMobileMenuOpen(false)}>
                    {p.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isSectionEnabled(business, 'hero') && (
        <header id="hero" className="mi-hero">
          <div className="container">
            <div className="mi-hero-grid">
              <div className="mi-hero-content">
                <div className="mi-hero-badge reveal">
                  <Sparkles className="w-4 h-4" />
                  {getSetting(heroSettings, 'subtitle', 'نبني حلولاً تُحقق طموحاتك') as string}
                </div>
                <h1 className="reveal delay-1">
                  {(getSetting(heroSettings, 'title', '') as string) || (
                    <>
                      نحول <span>فكرتك</span> إلى واقع ملموس
                    </>
                  )}
                </h1>
                <p className="mi-hero-lead reveal delay-1">
                  {getSetting(
                    heroSettings,
                    'description',
                    business.description || 'نقدم خدمات احترافية متميزة تجمع بين الجودة والابتكار لنساعدك على النمو والتميز.'
                  ) as string}
                </p>
                <div className="mi-hero-ctas reveal delay-2">
                  <a href={`${homePath}#contact`} onClick={(e) => scrollToSection(e, 'contact')} className="btn btn-primary">
                    {getSetting(heroSettings, 'ctaPrimary', 'ابدأ الآن') as string}
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                  <a href={`${homePath}#services`} onClick={(e) => scrollToSection(e, 'services')} className="btn btn-ghost">
                    {getSetting(heroSettings, 'ctaSecondary', 'اكتشف خدماتنا') as string}
                  </a>
                </div>
                <div className="mi-hero-stats reveal delay-3">
                  {(getSetting(heroSettings, 'stats', DEFAULT_STATS) as { value: string; label: string }[]).map((stat, idx) => (
                    <div key={idx}>
                      <div className="num">{stat.value}</div>
                      <div className="lbl">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mi-hero-media reveal">
                <img src={heroImage} alt={business.name} />
                <div className="mi-hero-float">
                  <div className="icon">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0f172a]">تقييم ممتاز</div>
                    <div className="text-sm text-slate-500">
                      {business.reviewCount || 0} تقييم · {business.avgRating?.toFixed(1) || '5.0'} / 5
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {isSectionEnabled(business, 'features') && (
        <section id="features" className="mi-features section">
          <div className="container">
            <div className="mi-section-head reveal">
              <div className="eyebrow">{getSetting(featuresSettings, 'subtitle', 'لماذا نحن') as string}</div>
              <h2>{getSetting(featuresSettings, 'title', 'نختلف لأننا نهتم بالتفاصيل') as string}</h2>
              <p>{getSetting(featuresSettings, 'description', 'نقدم تجربة متكاملة تجمع بين الاحترافية والسرعة والجودة.') as string}</p>
            </div>
            <div className="mi-features-grid">
              {features.map((feat, idx) => {
                const Icon = ICON_MAP[feat.icon || ''] || Sparkles;
                return (
                  <div key={idx} className={`mi-feature reveal delay-${(idx % 4) + 1}`}>
                    <div className="ic">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3>{feat.title}</h3>
                    <p>{feat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {isSectionEnabled(business, 'about') && (
        <section id="about" className="mi-about section">
          <div className="container">
            <div className="mi-about-grid">
              <div className="mi-about-image reveal">
                <img src={aboutImage} alt={business.name} />
                <div className="float">
                  <div className="num">{getSetting(aboutSettings, 'floatYear', '10+') as string}</div>
                  <div className="txt">{getSetting(aboutSettings, 'floatLabel', 'عاماً من الخبرة') as string}</div>
                </div>
              </div>
              <div className="mi-about-text reveal delay-1">
                <div className="eyebrow">{getSetting(aboutSettings, 'subtitle', 'من نحن') as string}</div>
                <h2>
                  {getSetting(aboutSettings, 'title', '') as string || (
                    <>
                      شريكك الموثوق نحو <span className="text-[var(--theme-primary,var(--color-primary))]">التفوق</span>
                    </>
                  )}
                </h2>
                <p className="lead">
                  {getSetting(
                    aboutSettings,
                    'description',
                    business.description || 'نحن فريق متخصص نقدم حلولاً مبتكرة تلبي احتياجات عملائنا وتتجاوز توقعاتهم.'
                  ) as string}
                </p>
                <p>
                  {getSetting(
                    aboutSettings,
                    'summary',
                    'نسعى دائماً لتقديم الأفضل من خلال فريق محترف وعمليات مُحكمة واهتمام بأدق التفاصيل.'
                  ) as string}
                </p>
                <div className="mi-values">
                  {((getSetting(aboutSettings, 'values', ['الجودة', 'الاحترافية', 'الشفافية']) as string[]) || []).map((v, idx) => (
                    <span key={idx}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {isSectionEnabled(business, 'services') && services.length > 0 && (
        <section id="services" className="mi-services section">
          <div className="container">
            <div className="mi-section-head reveal">
              <div className="eyebrow">{getSetting(servicesSettings, 'subtitle', 'خدماتنا') as string}</div>
              <h2>{getSetting(servicesSettings, 'title', 'حلول مصممة خصيصاً لك') as string}</h2>
              <p>{getSetting(servicesSettings, 'description', 'اكتشف مجموعة الخدمات التي نقدمها لنساعدك على تحقيق أهدافك.') as string}</p>
            </div>
            <div className="mi-services-grid">
              {services.map((service, idx) => (
                <div key={service.id} className={`mi-service reveal delay-${(idx % 3) + 1}`}>
                  <div className="mi-service-img">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <div className="mi-service-body">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className="mi-service-meta">
                      {service.price && <span className="mi-service-price">{service.price}</span>}
                      <a href={`${homePath}#contact`} onClick={(e) => scrollToSection(e, 'contact')} className="mi-service-link">
                        اطلب الخدمة
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isSectionEnabled(business, 'stats') && (
        <section className="mi-stats section">
          <div className="container">
            <div className="mi-stats-grid">
              {stats.map((stat, idx) => (
                <div key={idx} className={`mi-stat reveal delay-${(idx % 4) + 1}`}>
                  <div className="num">{stat.value}</div>
                  <div className="lbl">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isSectionEnabled(business, 'gallery') && (
        <section id="gallery" className="mi-gallery section">
          <div className="container">
            <div className="mi-section-head reveal">
              <div className="eyebrow">{getSetting(gallerySettings, 'subtitle', 'معرض الأعمال') as string}</div>
              <h2>{getSetting(gallerySettings, 'title', 'لمحات من أعمالنا') as string}</h2>
              <p>{getSetting(gallerySettings, 'description', 'صور من مشاريعنا وخدماتنا التي نفتخر بتقديمها.') as string}</p>
            </div>
            <div className="mi-gallery-grid">
              {galleryImages.slice(0, 7).map((url, idx) => (
                <div key={`${url}-${idx}`} className={`mi-gallery-item reveal delay-${(idx % 4) + 1}`}>
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

      {isSectionEnabled(business, 'testimonials') && (
        <section id="testimonials" className="mi-testimonials section">
          <div className="container">
            <div className="mi-section-head reveal">
              <div className="eyebrow">{getSetting(testimonialsSettings, 'subtitle', 'آراء العملاء') as string}</div>
              <h2>{getSetting(testimonialsSettings, 'title', 'ثقة عملائنا سر نجاحنا') as string}</h2>
              <p>{getSetting(testimonialsSettings, 'description', 'نفخر بآراء عملائنا ونسعى دائماً لتقديم الأفضل.') as string}</p>
            </div>
            <div className="mi-test-grid">
              {testimonials.map((review, idx) => (
                <div key={idx} className={`mi-test-card reveal delay-${(idx % 3) + 1}`}>
                  <StarRating rating={review.rating || 5} />
                  <p className="mi-test-text">{review.content}</p>
                  <div className="mi-test-author">
                    <div className="avatar">{getInitials(review.name)}</div>
                    <div>
                      <div className="name">{review.name}</div>
                      <div className="role">{review.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isSectionEnabled(business, 'contact') && (
        <section id="contact" className="mi-contact section">
          <div className="container">
            <div className="mi-contact-grid">
              <div className="mi-contact-info reveal">
                <div className="eyebrow">{getSetting(contactSettings, 'subtitle', 'تواصل معنا') as string}</div>
                <h2>
                  {getSetting(contactSettings, 'title', '') as string || (
                    <>
                      دعنا نبدأ <span className="text-[var(--theme-primary,var(--color-primary))]">مشروعك</span> معاً
                    </>
                  )}
                </h2>
                <p>
                  {getSetting(
                    contactSettings,
                    'description',
                    'املأ النموذج وسنكون على تواصل معك في أقرب وقت لمناقشة احتياجاتك.'
                  ) as string}
                </p>
                <ul className="mi-info-list">
                  {business.phone && (
                    <li>
                      <span className="ic">
                        <Phone className="w-5 h-5" />
                      </span>
                      <div>
                        <strong>اتصل بنا</strong>
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

              <div className="mi-contact-form reveal delay-1">
                {contactSent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[var(--theme-primary,var(--color-primary))] text-white flex items-center justify-center mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">تم استلام رسالتك</h3>
                    <p className="text-slate-500">سنتواصل معك قريباً.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <div className="mi-form-row">
                      <div className="mi-form-group">
                        <label>الاسم</label>
                        <input type="text" placeholder="اسمك الكامل" required />
                      </div>
                      <div className="mi-form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" placeholder="email@example.com" required />
                      </div>
                    </div>
                    <div className="mi-form-row">
                      <div className="mi-form-group">
                        <label>رقم الجوال</label>
                        <input type="tel" placeholder="05xxxxxxxx" />
                      </div>
                      <div className="mi-form-group">
                        <label>الموضوع</label>
                        <input type="text" placeholder="موضوع الرسالة" />
                      </div>
                    </div>
                    <div className="mi-form-row full">
                      <div className="mi-form-group">
                        <label>الرسالة</label>
                        <textarea rows={5} placeholder="اكتب رسالتك هنا..." required></textarea>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <Send className="w-4 h-4" />
                      إرسال الرسالة
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {isSectionEnabled(business, 'cta') && (
        <section className="mi-cta section">
          <div className="container">
            <div className="reveal">
              <h2>{getSetting(ctaSettings, 'title', `ابدأ رحلة النجاح مع ${business.name}`) as string}</h2>
              <p>{getSetting(ctaSettings, 'subtitle', 'تواصل معنا اليوم واحصل على استشارة مجانية.') as string}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href={`${homePath}#contact`} onClick={(e) => scrollToSection(e, 'contact')} className="btn btn-ghost">
                  تواصل معنا
                </a>
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="btn btn-primary">
                    <Phone className="w-4 h-4" />
                    {business.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="mi-footer">
        <div className="container">
          <div className="mi-footer-grid">
            <div className="mi-footer-brand">
              <div className="mi-brand-mark">{getInitials(business.name)}</div>
              <h4 className="text-lg font-bold">{business.name}</h4>
              <p>{business.description || 'نشاط تجاري يسعى دائماً لتقديم الأفضل لعملائه.'}</p>
              <div className="mi-socials">
                {business.phone && (
                  <a href={`tel:${business.phone}`} aria-label="Phone">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} aria-label="Email">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            <div className="mi-footer-col">
              <h4>روابط سريعة</h4>
              <ul>
                <li>
                  <a href={`${homePath}#hero`} onClick={(e) => scrollToSection(e, 'hero')}>الرئيسية</a>
                </li>
                <li>
                  <a href={`${homePath}#about`} onClick={(e) => scrollToSection(e, 'about')}>من نحن</a>
                </li>
                <li>
                  <a href={`${homePath}#services`} onClick={(e) => scrollToSection(e, 'services')}>خدماتنا</a>
                </li>
                <li>
                  <a href={`${homePath}#gallery`} onClick={(e) => scrollToSection(e, 'gallery')}>معرض الأعمال</a>
                </li>
                <li>
                  <a href={`${homePath}#contact`} onClick={(e) => scrollToSection(e, 'contact')}>تواصل معنا</a>
                </li>
              </ul>
            </div>
            <div className="mi-footer-col">
              <h4>الصفحات</h4>
              <ul>
                {navLinks.filter((p) => !p.isHomePage).map((p) => (
                  <li key={p.slug}>
                    <Link href={`${basePath}/${p.slug}`}>{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mi-footer-col">
              <h4>معلومات التواصل</h4>
              {business.phone && <p>{business.phone}</p>}
              {business.email && <p>{business.email}</p>}
              {(business.city || business.address) && (
                <p>{[business.city, business.address].filter(Boolean).join(' - ')}</p>
              )}
            </div>
          </div>
          <div className="mi-footer-bottom">
            <span>
              © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
            </span>
            <span>صُمم بعناية ليبدو مميزاً</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
