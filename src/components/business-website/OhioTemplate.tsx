'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Briefcase,
  Palette,
  Code,
  Megaphone,
  Star,
} from 'lucide-react';
import { StarRating } from './StarRating';
import type { TemplateBusiness, TemplateProduct } from './template-types';

interface OhioTemplateProps {
  business: TemplateBusiness;
}

const heroImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop';

const services = [
  { icon: Palette, title: 'تصميم إبداعي', desc: 'هوية بصرية وتجربة مستخدم مميزة' },
  { icon: Code, title: 'تطوير', desc: 'حلول تقنية عالية الأداء' },
  { icon: Megaphone, title: 'تسويق', desc: 'استراتيجيات رقمية فعّالة' },
  { icon: Briefcase, title: 'استشارات', desc: 'خطط عمل مدروسة لنموك' },
];

export function OhioTemplate({ business }: OhioTemplateProps) {
  const products = business.products || [];
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('الكل');

  const navLinks = business.pages;

  const portfolio = useMemo(() => {
    if (activeFilter === 'الكل') return products;
    return products.filter((p) => p.category === activeFilter);
  }, [products, activeFilter]);

  return (
    <div className="min-h-screen bg-[var(--theme-background)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--theme-background)]/95 backdrop-blur border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href={`/business/${business.slug}`} className="flex items-center gap-2">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-9 h-9 rounded-none object-cover" />
              ) : (
                <div className="w-9 h-9 bg-[var(--theme-primary)] flex items-center justify-center text-white font-bold">
                  {business.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-[var(--theme-text)]">{business.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-sm text-[var(--theme-text)]">
              <Link href={`/business/${business.slug}`} className="hover:opacity-70">الرئيسية</Link>
              <a href="#work" className="hover:opacity-70">أعمالنا</a>
              <a href="#services" className="hover:opacity-70">الخدمات</a>
              <a href="#about" className="hover:opacity-70">عنّا</a>
              <a href="#contact" className="hover:opacity-70">تواصل</a>
              {navLinks.slice(0, 2).map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="hover:opacity-70">{page.title}</Link>
              ))}
            </nav>

            <button className="lg:hidden p-2 hover:bg-black/5" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5 text-[var(--theme-text)]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="absolute top-0 right-0 h-full w-72 bg-[var(--theme-background)] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-[var(--theme-text)]">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm text-[var(--theme-text)]">
              <Link href={`/business/${business.slug}`} className="block hover:opacity-70">الرئيسية</Link>
              <a href="#work" className="block hover:opacity-70">أعمالنا</a>
              <a href="#services" className="block hover:opacity-70">الخدمات</a>
              <a href="#about" className="block hover:opacity-70">عنّا</a>
              <a href="#contact" className="block hover:opacity-70">تواصل</a>
              {navLinks.map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="block hover:opacity-70">{page.title}</Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={business.cover || heroImage} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-white">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-sm tracking-widest uppercase mb-4 opacity-80">
            {business.city || 'وكالة إبداعية'}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-7xl font-bold mb-6 leading-tight max-w-3xl">
            {business.name}
          </motion.h1>
          {business.description && (
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-white/80 max-w-xl mb-8">
              {business.description}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <a href="#work" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm hover:bg-white/90">
              استعرض أعمالنا <ArrowLeft className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Work / Portfolio */}
      <section id="work" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--theme-text)]">أعمال مختارة</h2>
            <p className="text-gray-500 mt-2">نماذج من مشاريعنا الإبداعية</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('الكل')}
              className={`px-4 py-1.5 text-sm border ${activeFilter === 'الكل' ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]' : 'border-black/10 text-[var(--theme-text)] hover:border-[var(--theme-primary)]'}`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 text-sm border ${activeFilter === cat ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]' : 'border-black/10 text-[var(--theme-text)] hover:border-[var(--theme-primary)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center text-gray-400 py-16">لا توجد أعمال لعرضها حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.map((project) => {
              const image = project.images?.[0]?.url;
              return (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden bg-[var(--theme-surface)] border border-black/5"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {image ? (
                      <img src={image} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Palette className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-4 py-2 bg-white text-black text-sm font-bold flex items-center gap-2">
                        عرض المشروع <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-gray-500">{project.category || 'مشروع'}</span>
                    <h3 className="text-xl font-bold text-[var(--theme-text)] mt-1">{project.name}</h3>
                    {project.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-[var(--theme-surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--theme-text)] mb-12 text-center">خدماتنا</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="p-6 bg-[var(--theme-background)] border border-black/5 hover:border-[var(--theme-primary)] transition-colors">
                <s.icon className="w-8 h-8 text-[var(--theme-primary)] mb-4" />
                <h3 className="font-bold text-[var(--theme-text)] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--theme-text)] mb-6">نصنع التأثير البصري</h2>
        <p className="text-gray-500 leading-relaxed text-lg mb-8">
          {business.description || 'نحن فريق من المصممين والمطورين والاستراتيجيين نؤمن بقوة التصميم في بناء علامات تجارية لا تُنسى.'}
        </p>
        <div className="flex items-center justify-center gap-8">
          <div>
            <p className="text-4xl font-bold text-[var(--theme-primary)]">{products.length}</p>
            <p className="text-sm text-gray-500">مشروع</p>
          </div>
          <div className="w-px h-12 bg-black/10" />
          <div>
            <p className="text-4xl font-bold text-[var(--theme-primary)]">{business.reviewCount || 0}</p>
            <p className="text-sm text-gray-500">عميل</p>
          </div>
          <div className="w-px h-12 bg-black/10" />
          <div>
            <p className="text-4xl font-bold text-[var(--theme-primary)]">{business.avgRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">تقييم</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {business.reviews && business.reviews.length > 0 && (
        <section className="py-20 bg-[var(--theme-surface)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center text-[var(--theme-text)] mb-10">آراء العملاء</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {business.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[var(--theme-background)] p-6 border border-black/5">
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-[var(--theme-text)] mt-4 line-clamp-4">{review.comment || 'تعاون ممتاز'}</p>
                  <p className="text-sm font-bold mt-4 text-[var(--theme-primary)]">{review.user?.name || 'عميل'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-[var(--theme-primary)] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">لنبدأ مشروعك القادم</h2>
          <p className="text-white/80 mb-8">تواصل معنا لمناقشة فكرتك وتحويلها إلى واقع.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--theme-primary)] font-bold text-sm">
                <Phone className="w-4 h-4" /> {business.phone}
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="flex items-center gap-2 px-5 py-2.5 border border-white text-white font-bold text-sm hover:bg-white/10">
                <Mail className="w-4 h-4" /> {business.email}
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            {business.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {business.city}</p>}
            {navLinks.slice(0, 4).map((page) => (
              <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="hover:text-white">{page.title}</Link>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/50">
            © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
