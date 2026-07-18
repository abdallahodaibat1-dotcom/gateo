'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Images,
  Heart,
  Sparkles,
  Leaf,
  Flower2,
  Star,
  ArrowLeft,
  Clock3,
} from 'lucide-react';
import { StarRating } from './StarRating';
import { formatWorkingHours, type TemplateBusiness } from './template-types';

interface EnfoldSpaTemplateProps {
  business: TemplateBusiness;
  page?: {
    id: string;
    slug: string;
    title: string;
    isHomePage: boolean;
    content?: string | null;
  } | null;
}

const heroImage = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&h=900&fit=crop';
const serviceIcons = [Sparkles, Leaf, Flower2, Heart];

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
  value?: { day: string; open: string; close: string }[] | Record<string, string> | string | null
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

export function EnfoldSpaTemplate({ business, page }: EnfoldSpaTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const products = business.products || [];
  const navLinks = business.pages || [];
  const workingHours = normalizeWorkingHours(business.workingHours);
  const workingHoursText = formatWorkingHours(business.workingHours);
  const galleryImages =
    business.images?.filter((img) => !img.type || img.type === 'gallery').map((img) => img.url) || [];
  const isHome = !page || page.isHomePage;
  const pageContent = page?.content || '';

  const services = business.services || [];
  const featuredServices = useMemo(() => services.slice(0, 4), [services]);

  const sections = getSections(business);
  const heroSettings = getSectionSettings(business, 'hero');
  const aboutSettings = getSectionSettings(business, 'about');
  const servicesSettings = getSectionSettings(business, 'services');
  const gallerySettings = getSectionSettings(business, 'gallery');
  const reviewsSettings = getSectionSettings(business, 'reviews');
  const contactSettings = getSectionSettings(business, 'contact');

  const showHero = isSectionEnabled(business, 'hero');
  const showAbout = isSectionEnabled(business, 'about');
  const showServices = isSectionEnabled(business, 'services');
  const showGallery = isSectionEnabled(business, 'gallery');
  const showReviews = isSectionEnabled(business, 'reviews');
  const showContact = isSectionEnabled(business, 'contact');

  const basePath = `/business/${business.slug}`;

  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--theme-background)]"
      style={{ fontFamily: 'var(--theme-font, Cairo)' }}
    >
      {/* Transparent sticky header over hero */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-gradient-to-b from-black/30 to-transparent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <Link href={basePath} className="flex items-center gap-3">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/40"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-lg drop-shadow-sm">{business.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-sm">
              <Link href={basePath} className="hover:text-white/80 transition-colors">
                الرئيسية
              </Link>
              <a href={`${basePath}#services`} className="hover:text-white/80 transition-colors">
                خدماتنا
              </a>
              <a href={`${basePath}#gallery`} className="hover:text-white/80 transition-colors">
                معرض الصور
              </a>
              <a href={`${basePath}#contact`} className="hover:text-white/80 transition-colors">
                تواصل معنا
              </a>
              {navLinks
                .filter((p) => !p.isHomePage)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`${basePath}/${p.slug}`}
                    className="hover:text-white/80 transition-colors"
                  >
                    {p.title}
                  </Link>
                ))}
            </nav>

            <div className="flex items-center gap-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold hover:bg-white/30 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  احجزي الآن
                </a>
              )}
              <button
                className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="فتح القائمة"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[var(--theme-surface)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-[var(--theme-text)]">القائمة</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5 text-[var(--theme-text)]" />
              </button>
            </div>
            <div className="space-y-4 text-[var(--theme-text)]">
              <Link
                href={basePath}
                className="block hover:text-[var(--theme-primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <a
                href={`${basePath}#services`}
                className="block hover:text-[var(--theme-primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                خدماتنا
              </a>
              <a
                href={`${basePath}#gallery`}
                className="block hover:text-[var(--theme-primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                معرض الصور
              </a>
              <a
                href={`${basePath}#contact`}
                className="block hover:text-[var(--theme-primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                تواصل معنا
              </a>
              {navLinks
                .filter((p) => !p.isHomePage)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`${basePath}/${p.slug}`}
                    className="block hover:text-[var(--theme-primary)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {p.title}
                  </Link>
                ))}
            </div>
          </motion.div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {isHome ? (
          <>
            {/* Hero */}
            {showHero && (
              <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src={getSetting(heroSettings, 'image', business.cover || heroImage) as string}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white pt-20">
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm md:text-base tracking-widest uppercase mb-4 opacity-90"
                  >
                    {getSetting(heroSettings, 'subtitle', business.city || 'استرخِ · تجددِ · تمتعي') as string}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-lg"
                  >
                    {getSetting(heroSettings, 'title', business.name) as string}
                  </motion.h1>
                  {(getSetting(heroSettings, 'description', business.description || '') as string) && (
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10"
                    >
                      {getSetting(heroSettings, 'description', business.description || '') as string}
                    </motion.p>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-4 flex-wrap"
                  >
                    <a
                      href={`${basePath}#contact`}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[var(--theme-text)] font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
                    >
                      <Calendar className="w-4 h-4" />
                      {getSetting(heroSettings, 'ctaPrimary', 'احجزي موعد') as string}
                    </a>
                    <a
                      href={`${basePath}#services`}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white text-white font-bold text-sm hover:bg-white/10 transition-colors"
                    >
                      {getSetting(heroSettings, 'ctaSecondary', 'اكتشفي الخدمات') as string}
                      <ArrowLeft className="w-4 h-4" />
                    </a>
                  </motion.div>
                </div>
              </section>
            )}

          {/* Intro / About */}
          {showAbout && (
            <section className="py-24 md:py-32 max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <span
                className="font-bold text-sm tracking-wide"
                style={{ color: 'var(--theme-primary)' }}
              >
                {getSetting(aboutSettings, 'subtitle', 'رحلة استرخاء فريدة') as string}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-[var(--theme-text)] mt-4 mb-6">
                {getSetting(aboutSettings, 'title', 'دللي نفسك بأفضل العلاجات') as string}
              </h2>
              <p className="text-gray-500 leading-loose text-lg">
                {getSetting(
                  aboutSettings,
                  'description',
                  business.description ||
                    'نقدم لك تجربة فريدة من العناية والاسترخاء، حيث تجمع خدماتنا بين الطبيعة والرفاهية لإظهار جمالك الداخلي والخارجي.'
                ) as string}
              </p>
            </section>
          )}

          {/* Services */}
          {showServices && (
            <section id="services" className="py-24 bg-[var(--theme-surface)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--theme-text)]">
                    {getSetting(servicesSettings, 'title', 'خدماتنا') as string}
                  </h2>
                  <p className="text-gray-500 mt-3">
                    {getSetting(servicesSettings, 'subtitle', 'اختري ما يناسبك من باقات العناية والاسترخاء') as string}
                  </p>
                </div>

                {featuredServices.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    لا توجد خدمات متاحة حالياً
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredServices.map((service, idx) => {
                      const Icon = serviceIcons[idx % serviceIcons.length];
                      const hasPrice = service.price && Number(service.price) > 0;
                      return (
                        <motion.div
                          key={service.id}
                          whileHover={{ y: -8 }}
                          className="bg-[var(--theme-background)] rounded-[var(--theme-radius,1.5rem)] overflow-hidden border text-center transition-shadow hover:shadow-lg"
                          style={{ borderColor: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)' }}
                        >
                          {service.image ? (
                            <div className="relative h-44 w-full overflow-hidden">
                              <img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="pt-8">
                              <div
                                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5"
                                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)' }}
                              >
                                <Icon className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
                              </div>
                            </div>
                          )}
                          <div className="p-6 pt-5">
                            <h3 className="font-bold text-[var(--theme-text)] text-lg mb-2">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
                              {hasPrice && (
                                <span
                                  className="font-bold px-3 py-1 rounded-full"
                                  style={{
                                    color: 'var(--theme-primary)',
                                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                                  }}
                                >
                                  {service.price}
                                </span>
                              )}
                              {service.duration ? (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                  <Clock3 className="w-3.5 h-3.5" />
                                  {service.duration} دقيقة
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Gallery */}
          {showGallery && galleryImages.length > 0 && (
            <section id="gallery" className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--theme-text)]">
                  {getSetting(gallerySettings, 'title', 'معرض الصور') as string}
                </h2>
                <p className="text-gray-500 mt-3">
                  {getSetting(gallerySettings, 'subtitle', 'لمحات من أجواء الراحة والجمال') as string}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((url, idx) => (
                  <motion.div
                    key={`${url}-${idx}`}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-square rounded-[var(--theme-radius,1rem)] overflow-hidden shadow-sm"
                  >
                    <img
                      src={url}
                      alt={`صورة ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {showReviews && business.reviews && business.reviews.length > 0 && (
            <section className="py-24 bg-[var(--theme-surface)]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--theme-text)] mb-12">
                  {getSetting(reviewsSettings, 'title', 'آراء ضيوفنا') as string}
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {business.reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="bg-[var(--theme-background)] rounded-[var(--theme-radius,1.5rem)] p-8 border"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                      }}
                    >
                      <StarRating rating={review.rating} size={14} />
                      <p className="text-[var(--theme-text)] mt-5 leading-relaxed line-clamp-4">
                        {review.comment || 'تجربة رائعة'}
                      </p>
                      <p className="text-sm font-bold mt-5" style={{ color: 'var(--theme-primary)' }}>
                        {review.user?.name || 'عميلة'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        /* Internal page content */
        <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-[var(--theme-background)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-text)] mb-5">
                {page.title}
              </h1>
              <div
                className="w-20 h-1 rounded-full mx-auto"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--theme-surface)] rounded-[var(--theme-radius,1.5rem)] border p-8 md:p-14"
              style={{
                borderColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
              }}
            >
              <div className="prose prose-lg max-w-none text-[var(--theme-text)] whitespace-pre-wrap leading-loose">
                {pageContent || 'لا يوجد محتوى لهذه الصفحة بعد.'}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact / CTA */}
      {showContact && (
        <section id="contact" className="py-24 bg-[var(--theme-primary)] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-5">
                  {getSetting(contactSettings, 'title', 'جددي حيويتك اليوم') as string}
                </h2>
                <p className="text-white/80 leading-relaxed text-lg mb-8">
                  {getSetting(
                    contactSettings,
                    'description',
                    'تواصلي معنا لحجز موعد أو الاستفسار عن باقات العناية المتوفرة. فريقنا جاهز لاستقبالك وتقديم تجربة استرخاء لا تُنسى.'
                  ) as string}
                </p>
                <div className="space-y-4 text-white/90">
                  {business.phone && (
                    <a href={`tel:${business.phone}`} className="flex items-center gap-3 hover:text-white">
                      <Phone className="w-5 h-5" /> {business.phone}
                    </a>
                  )}
                  {business.email && (
                    <a href={`mailto:${business.email}`} className="flex items-center gap-3 hover:text-white">
                      <Mail className="w-5 h-5" /> {business.email}
                    </a>
                  )}
                  {(business.city || business.address) && (
                    <p className="flex items-center gap-3">
                      <MapPin className="w-5 h-5" />
                      {[business.city, business.address].filter(Boolean).join(' - ')}
                    </p>
                  )}
                  {workingHoursText && (
                    <p className="flex items-center gap-3">
                      <Clock className="w-5 h-5" /> {workingHoursText}
                    </p>
                  )}
                </div>
              </div>
              <div
                className="bg-white/10 backdrop-blur-sm rounded-[var(--theme-radius,1.5rem)] p-8 border border-white/20"
              >
                <h3 className="text-xl font-bold mb-6">
                  {getSetting(contactSettings, 'formTitle', 'احجزي موعدك') as string}
                </h3>
                <div className="space-y-4">
                  <a
                    href={`/book/${business.id}`}
                    className="block w-full py-3.5 rounded-full bg-white text-center font-bold transition-colors hover:bg-white/90"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    {getSetting(contactSettings, 'ctaPrimary', 'احجزي الآن') as string}
                  </a>
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="block w-full py-3.5 rounded-full border border-white text-center font-bold hover:bg-white/10 transition-colors"
                    >
                      {getSetting(contactSettings, 'ctaSecondary', 'اتصلي بنا') as string}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {business.name}
              </h4>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-4">
                {business.description || ''}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link href={basePath} className="hover:text-white transition-colors">
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <a href={`${basePath}#services`} className="hover:text-white transition-colors">
                    خدماتنا
                  </a>
                </li>
                <li>
                  <a href={`${basePath}#gallery`} className="hover:text-white transition-colors">
                    معرض الصور
                  </a>
                </li>
                <li>
                  <a href={`${basePath}#contact`} className="hover:text-white transition-colors">
                    تواصل معنا
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الصفحات</h4>
              <ul className="space-y-2 text-sm text-white/70">
                {navLinks
                  .filter((p) => !p.isHomePage)
                  .map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`${basePath}/${p.slug}`}
                        className="hover:text-white transition-colors"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                {navLinks.filter((p) => !p.isHomePage).length === 0 && (
                  <li>لا توجد صفحات إضافية</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-sm text-white/70">
                {business.phone && <p>{business.phone}</p>}
                {business.email && <p>{business.email}</p>}
                {business.city && <p>{business.city}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-xs text-white/50">
            © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </main>
    </div>
  );
}
