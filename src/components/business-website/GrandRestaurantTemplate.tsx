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
  Utensils,
  Star,
  ChefHat,
  ArrowLeft,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { StarRating } from './StarRating';
import { formatWorkingHours, type TemplateBusiness, type TemplateProduct } from './template-types';

interface GrandRestaurantTemplateProps {
  business: TemplateBusiness;
}

const heroImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=700&fit=crop';
const galleryImages = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
];

export function GrandRestaurantTemplate({ business }: GrandRestaurantTemplateProps) {
  const { format, convert } = useCurrency();
  const products = business.products || [];
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reservation, setReservation] = useState({ name: '', date: '', time: '', guests: '2' });
  const [activeMenu, setActiveMenu] = useState<string>(categories[0] || 'القائمة');

  const navLinks = business.pages;
  const workingHours = formatWorkingHours(business.workingHours);
  const menuProducts = activeMenu === 'القائمة' ? products : products.filter((p) => p.category === activeMenu);

  return (
    <div className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-text)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <Link href={`/business/${business.slug}`} className="flex items-center gap-2">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--theme-secondary)] flex items-center justify-center text-black font-bold text-xl">
                  <ChefHat className="w-6 h-6" />
                </div>
              )}
              <span className="font-bold text-xl">{business.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-sm">
              <Link href={`/business/${business.slug}`} className="hover:text-[var(--theme-secondary)] transition-colors">الرئيسية</Link>
              <a href="#menu" className="hover:text-[var(--theme-secondary)] transition-colors">القائمة</a>
              <a href="#gallery" className="hover:text-[var(--theme-secondary)] transition-colors">معرض الصور</a>
              <a href="#reservation" className="hover:text-[var(--theme-secondary)] transition-colors">احجز الآن</a>
              {navLinks.slice(0, 3).map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="hover:text-[var(--theme-secondary)] transition-colors">
                  {page.title}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 text-sm">
                  <Phone className="w-4 h-4" /> {business.phone}
                </a>
              )}
              <button className="lg:hidden p-2 hover:bg-white/10 rounded-full" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setMobileMenuOpen(false)}>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="absolute top-0 right-0 h-full w-72 bg-[var(--theme-surface)] p-5 shadow-xl text-[var(--theme-text)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <Link href={`/business/${business.slug}`} className="block hover:text-[var(--theme-primary)]">الرئيسية</Link>
              <a href="#menu" className="block hover:text-[var(--theme-primary)]">القائمة</a>
              <a href="#gallery" className="block hover:text-[var(--theme-primary)]">معرض الصور</a>
              <a href="#reservation" className="block hover:text-[var(--theme-primary)]">احجز الآن</a>
              {navLinks.map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="block hover:text-[var(--theme-primary)]">{page.title}</Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={business.cover || heroImage} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1 rounded-full border border-[var(--theme-secondary)] text-[var(--theme-secondary)] text-sm mb-4">
              تجربة طعام فاخرة
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{business.name}</h1>
            {business.description && <p className="text-lg text-white/80 mb-8 line-clamp-3">{business.description}</p>}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a href="#reservation" className="px-6 py-3 rounded-full bg-[var(--theme-secondary)] text-black font-bold hover:brightness-110">
                احجز طاولة
              </a>
              <a href="#menu" className="px-6 py-3 rounded-full border border-white text-white font-bold hover:bg-white/10">
                استعرض القائمة
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-[var(--theme-surface)] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-3 text-[var(--theme-text)]">
            <Clock className="w-5 h-5 text-[var(--theme-secondary)]" />
            <span className="text-sm">{workingHours || 'مفتوح يومياً 12 ظهراً - 12 منتصف الليل'}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[var(--theme-text)]">
            <MapPin className="w-5 h-5 text-[var(--theme-secondary)]" />
            <span className="text-sm">{business.city || business.address || 'الموقع'}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[var(--theme-text)]">
            <Phone className="w-5 h-5 text-[var(--theme-secondary)]" />
            <span className="text-sm">{business.phone || 'اتصل بنا'}</span>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-[var(--theme-secondary)] text-sm font-bold tracking-wider">قائمتنا</span>
          <h2 className="text-3xl font-bold text-[var(--theme-text)] mt-2">أشهى الأطباق</h2>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveMenu(cat)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  activeMenu === cat
                    ? 'bg-[var(--theme-secondary)] text-black border-[var(--theme-secondary)]'
                    : 'border-white/20 text-[var(--theme-text)] hover:border-[var(--theme-secondary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {menuProducts.length === 0 ? (
          <div className="text-center text-white/50 py-12">لا توجد أطباق متاحة حالياً</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {menuProducts.map((item) => {
              const price = Number(item.price) || 0;
              const image = item.images?.[0]?.url;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ x: -4 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-surface)] border border-white/5"
                >
                  {image ? (
                    <img src={image} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
                      <Utensils className="w-8 h-8 text-[var(--theme-secondary)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[var(--theme-text)] truncate">{item.name}</h3>
                      <span className="font-bold text-[var(--theme-secondary)] whitespace-nowrap">{format(convert(price))}</span>
                    </div>
                    {item.description && <p className="text-sm text-white/60 line-clamp-2 mt-1">{item.description}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--theme-text)]">معرض الصور</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((src, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.03 }} className="aspect-square rounded-2xl overflow-hidden">
                <img src={src} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation */}
      <section id="reservation" className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-secondary)]/20 p-6 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--theme-text)] mb-2">احجز طاولتك</h2>
            <p className="text-white/60">املأ البيانات وسنؤكد لك الحجز في أقرب وقت</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="الاسم"
              value={reservation.name}
              onChange={(e) => setReservation({ ...reservation, name: e.target.value })}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-secondary)]"
            />
            <input
              type="date"
              value={reservation.date}
              onChange={(e) => setReservation({ ...reservation, date: e.target.value })}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-secondary)]"
            />
            <input
              type="time"
              value={reservation.time}
              onChange={(e) => setReservation({ ...reservation, time: e.target.value })}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-secondary)]"
            />
            <select
              value={reservation.guests}
              onChange={(e) => setReservation({ ...reservation, guests: e.target.value })}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-secondary)]"
            >
              {[1, 2, 3, 4, 5, 6, '7+'].map((n) => (
                <option key={n} value={n}>{n} ضيوف</option>
              ))}
            </select>
          </div>
          <button className="w-full mt-6 py-3 rounded-xl bg-[var(--theme-secondary)] text-black font-bold hover:brightness-110">
            تأكيد الحجز
          </button>
        </div>
      </section>

      {/* Reviews */}
      {business.reviews && business.reviews.length > 0 && (
        <section className="py-16 bg-black/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center text-[var(--theme-text)] mb-10">آراء ضيوفنا</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {business.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[var(--theme-surface)] rounded-2xl p-6 border border-white/5">
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-[var(--theme-text)] mt-4 line-clamp-4">{review.comment || 'تجربة رائعة'}</p>
                  <p className="text-sm text-[var(--theme-secondary)] mt-4">{review.user?.name || 'ضيف'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/5 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg text-[var(--theme-secondary)] mb-4">{business.name}</h4>
            <p className="text-sm text-white/60 line-clamp-3">{business.description || ''}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">روابط</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#menu" className="hover:text-white">القائمة</a></li>
              <li><a href="#gallery" className="hover:text-white">معرض الصور</a></li>
              <li><a href="#reservation" className="hover:text-white">الحجز</a></li>
              {navLinks.slice(0, 3).map((page) => (
                <li key={page.slug}><Link href={`/business/${business.slug}/${page.slug}`} className="hover:text-white">{page.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <div className="space-y-2 text-sm text-white/60">
              {business.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {business.phone}</p>}
              {business.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {business.email}</p>}
              {business.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {business.city}</p>}
              {workingHours && <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {workingHours}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">ساعات العمل</h4>
            <p className="text-sm text-white/60">{workingHours || 'يومياً 12 ظهراً - 12 منتصف الليل'}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
