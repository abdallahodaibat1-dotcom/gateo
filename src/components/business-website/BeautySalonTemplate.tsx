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

const SERVICE_ICONS = [Scissors, Sparkles, Heart, Crown, Sparkles, Scissors];

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

  const products = business.products || [];
  const reviews = business.reviews || [];
  const workingHours = normalizeWorkingHours(business.workingHours);
  const galleryImages = useMemo(
    () =>
      business.images?.length
        ? business.images.map((img) => img.url)
        : LOCAL_IMAGES.gallery,
    [business.images]
  );

  const services = useMemo(
    () =>
      products.slice(0, 6).map((p, idx) => ({
        id: p.id,
        title: p.name,
        description: p.description || `خدمة مميزة من ${business.name}`,
        image: galleryImages[idx % galleryImages.length] || LOCAL_IMAGES.gallery[idx % LOCAL_IMAGES.gallery.length],
      })),
    [products, galleryImages, business.name]
  );

  const pricingPlans = useMemo(
    () =>
      products.slice(0, 3).map((p, idx) => ({
        id: p.id,
        title: p.name,
        price: p.price > 0 ? `${p.price} ر.س` : 'تواصل معنا',
        subtitle: p.description || 'باقة مختارة بعناية',
        featured: idx === 1,
      })),
    [products]
  );

  const navLinks = business.pages || [];
  const basePath = `/business/${business.slug}`;

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
            <Link href={basePath} className="brand">
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
              <Link href={basePath}>الرئيسية</Link>
              <a href={`${basePath}#about`}>من نحن</a>
              <a href={`${basePath}#services`}>خدماتنا</a>
              <a href={`${basePath}#gallery`}>معرض الأعمال</a>
              <a href={`${basePath}#booking`}>احجزي موعد</a>
              {navLinks
                .filter((p) => !p.isHomePage)
                .slice(0, 2)
                .map((p) => (
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
              <Link href={basePath} onClick={() => setMobileMenuOpen(false)}>
                الرئيسية
              </Link>
              <a href={`${basePath}#about`} onClick={() => setMobileMenuOpen(false)}>
                من نحن
              </a>
              <a href={`${basePath}#services`} onClick={() => setMobileMenuOpen(false)}>
                خدماتنا
              </a>
              <a href={`${basePath}#gallery`} onClick={() => setMobileMenuOpen(false)}>
                معرض الأعمال
              </a>
              <a href={`${basePath}#booking`} onClick={() => setMobileMenuOpen(false)}>
                احجزي موعد
              </a>
              {navLinks
                .filter((p) => !p.isHomePage)
                .map((p) => (
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

      <header className="hero" data-testid="beauty-hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow-row reveal">
              <span className="dot" />
              <span>صالون وسبا للسيدات</span>
            </div>
            <h1 className="reveal delay-1">
              جمالكِ يبدأ من <span className="accent">لمسة نور</span>
            </h1>
            <p className="hero-lead reveal delay-1">
              {business.description ||
                'تجربة فاخرة من العناية بالشعر والبشرة والأظافر، حيث تجمع خدماتنا بين الأناقة والراحة لإبراز إطلالتكِ الأجمل.'}
            </p>
            <div className="hero-ctas reveal delay-2">
              <a href={`${basePath}#booking`} className="btn btn-primary">
                <Calendar className="w-4 h-4" />
                احجزي موعدكِ
              </a>
              <a href={`${basePath}#services`} className="btn btn-ghost">
                اكتشفي خدماتنا
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
            <div className="hero-stats reveal delay-3">
              <div>
                <div className="num">+12</div>
                <div className="lbl">عاماً من الخبرة</div>
              </div>
              <div>
                <div className="num">+15k</div>
                <div className="lbl">زبونة راضية</div>
              </div>
              <div>
                <div className="num">+80</div>
                <div className="lbl">خدمة تجميلية</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-badge">
          <Sparkles className="w-9 h-9" />
          <div>
            <div className="b-title">حاصلين على تقييم ممتاز</div>
            <div className="b-sub">
              {business.reviewCount || 0} تقييم · {business.avgRating?.toFixed(1) || '5.0'} / 5
            </div>
          </div>
        </div>
      </header>

      <section id="about" className="about section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image reveal">
              <img src={LOCAL_IMAGES.about} alt={business.name} />
              <div className="float">
                <div className="float-inner">
                  <div className="y">12+</div>
                  <div className="t">عاماً من الخبرة</div>
                </div>
              </div>
            </div>
            <div className="about-text reveal delay-1">
              <div className="eyebrow">من نحن</div>
              <h2>
                نُقدم لكِ تجربة <span className="text-[#b76e79] font-[family-name:'Aref_Ruqaa'] italic">جمال استثنائية</span>
              </h2>
              <p className="lead">
                {business.description ||
                  'نؤمن بأن الجمال الحقيقي ينبع من الثقة بالنفس. لذلك نقدم خدمات تجميلية متكاملة في أجواء هادئة وفاخرة، بأيدي خبيرات متخصصات.'}
              </p>
              <div className="about-features">
                <div className="about-feat">
                  <div className="ic">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4>منتجات عالية الجودة</h4>
                    <p>نستخدم أجود الماركات العالمية المعتمدة.</p>
                  </div>
                </div>
                <div className="about-feat">
                  <div className="ic">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4>راحة وخصوصية</h4>
                    <p>أجواء نسائية خاصة لراحة تامة.</p>
                  </div>
                </div>
                <div className="about-feat">
                  <div className="ic">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4>خبيرات معتمدات</h4>
                    <p>فريق مدرب على أحدث التقنيات.</p>
                  </div>
                </div>
                <div className="about-feat">
                  <div className="ic">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4>مواعيد دقيقة</h4>
                    <p>نحترم وقتكِ بمواعيد منظمة ومرنة.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services section">
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">خدماتنا</div>
            <h2>باقات العناية والجمال</h2>
            <p>اختاري ما يناسبكِ من خدمات الشعر والبشرة والأظافر والمكياج.</p>
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
                      <a href={`${basePath}#booking`} className="service-link">
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

      <section className="bridal section">
        <div className="container">
          <div className="bridal-grid">
            <div className="bridal-image reveal">
              <img src={LOCAL_IMAGES.bridal} alt="عروض العرائس" />
              <div className="bridal-tag">باقات العرائس</div>
            </div>
            <div className="bridal-text reveal delay-1">
              <div className="eyebrow">يومكِ المميز</div>
              <h2>
                إطلالة عروس <span className="accent">تُنسَج بحب</span>
              </h2>
              <p>
                نُقدم باقات شاملة للعناية بالعروس تشمل المكياج، تسريحة الشعر، العناية
                بالبشرة والأظافر، لضمان إطلالة لا تُنسى في يومكِ الأهم.
              </p>
              <ul className="bridal-list">
                <li>
                  <span className="check">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <strong>مكياج عروس احترافي</strong>
                    <span>تجربة مكياج كاملة تناسب ذوقكِ وإطلالتكِ.</span>
                  </div>
                </li>
                <li>
                  <span className="check">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <strong>تسريحة شعر فاخرة</strong>
                    <span>تسريحات عصرية وكلاسيكية بأجود المنتجات.</span>
                  </div>
                </li>
                <li>
                  <span className="check">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <strong>عناية بالبشرة والأظافر</strong>
                    <span>جلسات تجهيز متكاملة قبل موعد الزفاف.</span>
                  </div>
                </li>
              </ul>
              <a href={`${basePath}#booking`} className="btn btn-primary">
                احجزي باقة العروس
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing section">
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">الباقات</div>
            <h2>اختري باقتكِ المثالية</h2>
            <p>أسعار واضحة وباقات مصممة لتلبية احتياجاتكِ بأفضل قيمة.</p>
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
                    <li>
                      <Check className="w-4 h-4" />
                      خدمة شخصية مخصصة
                    </li>
                    <li>
                      <Check className="w-4 h-4" />
                      منتجات عالية الجودة
                    </li>
                    <li>
                      <Check className="w-4 h-4" />
                      موعد مرن وسريع
                    </li>
                    <li>
                      <Check className="w-4 h-4" />
                      متابعة ما بعد الخدمة
                    </li>
                  </ul>
                  <a
                    href={`${basePath}#booking`}
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

      <section id="gallery" className="gallery section">
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">معرض الأعمال</div>
            <h2>لمحات من أعمالنا</h2>
            <p>صور من خدماتنا وأجواء الصالون لإلهام إطلالتكِ القادمة.</p>
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

      {reviews.length > 0 && (
        <section className="testimonials section">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">آراء زبوناتنا</div>
              <h2>تجارب حقيقية من زبوناتنا</h2>
              <p>نفخر بثقة زبوناتنا ونسعى دائماً لتقديم الأفضل.</p>
            </div>

            <div className="test-grid">
              {reviews.slice(0, 3).map((review, idx) => (
                <div
                  key={review.id}
                  className={`test-card reveal delay-${(idx % 3) + 1}`}
                >
                  <StarRating rating={review.rating} />
                  <p className="test-text">{review.comment || 'تجربة رائعة'}</p>
                  <div className="test-author">
                    <div className="avatar">
                      {getInitials(review.user?.name || 'عميلة')}
                    </div>
                    <div>
                      <div className="name">{review.user?.name || 'عميلة'}</div>
                      <div className="role">زبونة دائمة</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="booking" className="booking section">
        <div className="container">
          <div className="booking-grid">
            <div className="booking-info reveal">
              <div className="eyebrow">احجزي موعدكِ</div>
              <h2>
                جددي حيويتكِ مع <span className="accent">لمسة نور</span>
              </h2>
              <p>
                املئي النموذج وسنتواصل معكِ لتأكيد الموعد. فريقنا جاهز لاستقبالكِ
                وتقديم تجربة جمال لا تُنسى.
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
                  <Link href={basePath}>الرئيسية</Link>
                </li>
                <li>
                  <a href={`${basePath}#about`}>من نحن</a>
                </li>
                <li>
                  <a href={`${basePath}#services`}>خدماتنا</a>
                </li>
                <li>
                  <a href={`${basePath}#booking`}>احجزي موعد</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>الصفحات</h4>
              <ul>
                {navLinks
                  .filter((p) => !p.isHomePage)
                  .map((p) => (
                    <li key={p.slug}>
                      <Link href={`${basePath}/${p.slug}`}>{p.title}</Link>
                    </li>
                  ))}
                {navLinks.filter((p) => !p.isHomePage).length === 0 && (
                  <li>لا توجد صفحات إضافية</li>
                )}
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
