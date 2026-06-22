'use client';

import { useMemo, useState } from 'react';
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
  Heart,
  Sparkles,
  Leaf,
  Flower2,
  Star,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { StarRating } from './StarRating';
import { formatWorkingHours, type TemplateBusiness, type TemplateProduct } from './template-types';

interface JacquelineTemplateProps {
  business: TemplateBusiness;
}

const heroImage = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=700&fit=crop';

const serviceIcons = [Sparkles, Leaf, Flower2, Heart];

export function JacquelineTemplate({ business }: JacquelineTemplateProps) {
  const { format, convert } = useCurrency();
  const products = business.products || [];
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booking, setBooking] = useState({ name: '', service: '', date: '', time: '' });

  const navLinks = business.pages;
  const workingHours = formatWorkingHours(business.workingHours);
  const featuredServices = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--theme-background)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Header */}
      <header className="bg-[var(--theme-background)]/90 backdrop-blur sticky top-0 z-40 border-b border-[var(--theme-primary)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href={`/business/${business.slug}`} className="flex items-center gap-2">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
              <span className="font-bold text-[var(--theme-text)]">{business.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm text-[var(--theme-text)]">
              <Link href={`/business/${business.slug}`} className="hover:text-[var(--theme-primary)]">الرئيسية</Link>
              <a href="#services" className="hover:text-[var(--theme-primary)]">خدماتنا</a>
              <a href="#booking" className="hover:text-[var(--theme-primary)]">احجزي موعد</a>
              <a href="#reviews" className="hover:text-[var(--theme-primary)]">آراء العملاء</a>
              {navLinks.slice(0, 3).map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="hover:text-[var(--theme-primary)]">{page.title}</Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--theme-primary)] text-white text-sm font-bold">
                  <Phone className="w-4 h-4" /> احجزي الآن
                </a>
              )}
              <button className="lg:hidden p-2 hover:bg-black/5 rounded-full" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-5 h-5 text-[var(--theme-text)]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="absolute top-0 right-0 h-full w-72 bg-[var(--theme-surface)] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-[var(--theme-text)]">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm text-[var(--theme-text)]">
              <Link href={`/business/${business.slug}`} className="block hover:text-[var(--theme-primary)]">الرئيسية</Link>
              <a href="#services" className="block hover:text-[var(--theme-primary)]">خدماتنا</a>
              <a href="#booking" className="block hover:text-[var(--theme-primary)]">احجزي موعد</a>
              <a href="#reviews" className="block hover:text-[var(--theme-primary)]">آراء العملاء</a>
              {navLinks.map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="block hover:text-[var(--theme-primary)]">{page.title}</Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[520px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={business.cover || heroImage} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[var(--theme-primary)]/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center text-white">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold mb-4 drop-shadow">
            {business.name}
          </motion.h1>
          {business.description && (
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/90 max-w-2xl mx-auto mb-8">
              {business.description}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-3">
            <a href="#booking" className="px-6 py-3 rounded-full bg-white text-[var(--theme-primary)] font-bold hover:shadow-lg">
              احجزي موعد
            </a>
            <a href="#services" className="px-6 py-3 rounded-full border border-white text-white font-bold hover:bg-white/10">
              اكتشفي الخدمات
            </a>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-[var(--theme-primary)] font-bold text-sm">رحلة استرخاء</span>
        <h2 className="text-3xl font-bold text-[var(--theme-text)] mt-2 mb-4">دللي نفسك بأفضل العلاجات</h2>
        <p className="text-gray-500 leading-relaxed">
          نقدم لك تجربة فريدة من العناية والاسترخاء، حيث تجمع خدماتنا بين الطبيعة والرفاهية لإظهار جمالك الداخلي والخارجي.
        </p>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-[var(--theme-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--theme-text)]">خدماتنا</h2>
            <p className="text-sm text-gray-500 mt-2">اختري ما يناسبك من باقات العناية</p>
          </div>

          {featuredServices.length === 0 ? (
            <div className="text-center text-gray-400 py-12">لا توجد خدمات متاحة حالياً</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service, idx) => {
                const price = Number(service.price) || 0;
                const Icon = serviceIcons[idx % serviceIcons.length];
                return (
                  <motion.div
                    key={service.id}
                    whileHover={{ y: -6 }}
                    className="bg-[var(--theme-background)] rounded-3xl p-6 border border-[var(--theme-primary)]/10 text-center"
                  >
                    <div className="w-14 h-14 mx-auto rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-[var(--theme-primary)]" />
                    </div>
                    <h3 className="font-bold text-[var(--theme-text)] mb-2">{service.name}</h3>
                    {service.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>}
                    <p className="font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>{format(convert(price))}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[var(--theme-primary)] font-bold text-sm">احجزي الآن</span>
            <h2 className="text-3xl font-bold text-[var(--theme-text)] mt-2 mb-4">جددي حيويتك في خطوات بسيطة</h2>
            <p className="text-gray-500 mb-6">اختري الخدمة والموعد المناسب، وفريقنا جاهز لاستقبالك.</p>
            <div className="space-y-3 text-sm text-gray-600">
              {workingHours && <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--theme-primary)]" /> {workingHours}</p>}
              {business.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--theme-primary)]" /> {business.phone}</p>}
              {business.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--theme-primary)]" /> {business.city}</p>}
            </div>
          </div>
          <div className="bg-[var(--theme-surface)] rounded-3xl p-6 md:p-8 border border-[var(--theme-primary)]/10">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم"
                value={booking.name}
                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                className="w-full rounded-xl border border-[var(--theme-primary)]/20 bg-[var(--theme-background)] px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              />
              <select
                value={booking.service}
                onChange={(e) => setBooking({ ...booking, service: e.target.value })}
                className="w-full rounded-xl border border-[var(--theme-primary)]/20 bg-[var(--theme-background)] px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              >
                <option value="">اختري الخدمة</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  className="w-full rounded-xl border border-[var(--theme-primary)]/20 bg-[var(--theme-background)] px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                />
                <input
                  type="time"
                  value={booking.time}
                  onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                  className="w-full rounded-xl border border-[var(--theme-primary)]/20 bg-[var(--theme-background)] px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                />
              </div>
              <button className="w-full py-3 rounded-xl bg-[var(--theme-primary)] text-white font-bold hover:opacity-90">
                تأكيد الحجز
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {business.reviews && business.reviews.length > 0 && (
        <section id="reviews" className="py-16 bg-[var(--theme-surface)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center text-[var(--theme-text)] mb-10">آراء ضيوفنا</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {business.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[var(--theme-background)] rounded-3xl p-6 border border-[var(--theme-primary)]/10">
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-[var(--theme-text)] mt-4 line-clamp-4">{review.comment || 'تجربة رائعة'}</p>
                  <p className="text-sm mt-4" style={{ color: 'var(--theme-primary)' }}>{review.user?.name || 'عميلة'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[var(--theme-text)] text-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">{business.name}</h4>
            <p className="text-sm text-white/70 line-clamp-3">{business.description || ''}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">روابط</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#services" className="hover:text-white">خدماتنا</a></li>
              <li><a href="#booking" className="hover:text-white">الحجز</a></li>
              <li><a href="#reviews" className="hover:text-white">آراء العملاء</a></li>
              {navLinks.slice(0, 3).map((page) => (
                <li key={page.slug}><Link href={`/business/${business.slug}/${page.slug}`} className="hover:text-white">{page.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <div className="space-y-2 text-sm text-white/70">
              {business.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {business.phone}</p>}
              {business.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {business.email}</p>}
              {business.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {business.city}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">ساعات العمل</h4>
            <p className="text-sm text-white/70">{workingHours || 'يومياً 10 ص - 10 م'}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
