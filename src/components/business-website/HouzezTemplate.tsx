'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  BedDouble,
  Bath,
  Maximize,
  Home,
  Building2,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { StarRating } from './StarRating';
import type { TemplateBusiness, TemplateProduct } from './template-types';

interface HouzezTemplateProps {
  business: TemplateBusiness;
}

const heroImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=700&fit=crop';

export function HouzezTemplate({ business }: HouzezTemplateProps) {
  const { format, convert } = useCurrency();
  const products = business.products || [];
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [purpose, setPurpose] = useState('للبيع');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)));
  }, [products, searchQuery]);

  const featured = filteredProducts.slice(0, 6);
  const navLinks = business.pages;

  return (
    <div className="min-h-screen bg-[var(--theme-background)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href={`/business/${business.slug}`} className="flex items-center gap-2">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <span className="font-bold text-[var(--theme-text)]">{business.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm text-[var(--theme-text)]">
              <Link href={`/business/${business.slug}`} className="hover:text-[var(--theme-primary)]">الرئيسية</Link>
              <a href="#listings" className="hover:text-[var(--theme-primary)]">العقارات</a>
              <a href="#about" className="hover:text-[var(--theme-primary)]">من نحن</a>
              <a href="#contact" className="hover:text-[var(--theme-primary)]">تواصل</a>
              {navLinks.slice(0, 3).map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="hover:text-[var(--theme-primary)]">{page.title}</Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--theme-primary)] text-white text-sm font-bold">
                  <Phone className="w-4 h-4" /> اتصل الآن
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
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="absolute top-0 right-0 h-full w-72 bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-[var(--theme-text)]">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm text-[var(--theme-text)]">
              <Link href={`/business/${business.slug}`} className="block hover:text-[var(--theme-primary)]">الرئيسية</Link>
              <a href="#listings" className="block hover:text-[var(--theme-primary)]">العقارات</a>
              <a href="#about" className="block hover:text-[var(--theme-primary)]">من نحن</a>
              <a href="#contact" className="block hover:text-[var(--theme-primary)]">تواصل</a>
              {navLinks.map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="block hover:text-[var(--theme-primary)]">{page.title}</Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero with search */}
      <section className="relative h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img src={business.cover || heroImage} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        </div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center text-white">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold mb-4">
            {business.name}
          </motion.h1>
          {business.description && (
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/80 max-w-2xl mx-auto mb-8">
              {business.description}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setPurpose('للبيع')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold ${purpose === 'للبيع' ? 'bg-[var(--theme-primary)] text-white' : 'text-gray-600'}`}
                >
                  للبيع
                </button>
                <button
                  onClick={() => setPurpose('للإيجار')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold ${purpose === 'للإيجار' ? 'bg-[var(--theme-primary)] text-white' : 'text-gray-600'}`}
                >
                  للإيجار
                </button>
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="المدينة أو الحي"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pr-10 pl-4 text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                />
              </div>
              <select className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">
                <option>نوع العقار</option>
                {categories.map((cat) => <option key={cat}>{cat}</option>)}
              </select>
              <button className="px-6 py-2.5 rounded-xl bg-[var(--theme-primary)] text-white font-bold text-sm flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> بحث
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-[var(--theme-primary)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">{products.length}+</p>
            <p className="text-sm opacity-80">عقار معروض</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{business.reviewCount || 0}</p>
            <p className="text-sm opacity-80">تقييم</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{business.avgRating.toFixed(1)}</p>
            <p className="text-sm opacity-80">متوسط التقييم</p>
          </div>
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-sm opacity-80">دعم العملاء</p>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--theme-text)]">عقارات مميزة</h2>
            <p className="text-sm text-gray-500">اختر من بين أفضل العروض</p>
          </div>
          <span className="text-sm text-gray-500">{featured.length} نتيجة</span>
        </div>

        {featured.length === 0 ? (
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-black/5 p-12 text-center">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد عقارات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((property) => {
              const price = Number(property.price) || 0;
              const image = property.images?.[0]?.url;
              return (
                <motion.div
                  key={property.id}
                  whileHover={{ y: -5 }}
                  className="bg-[var(--theme-surface)] rounded-2xl border border-black/5 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="relative h-52">
                    {image ? (
                      <img src={image} alt={property.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[var(--theme-primary)] text-white text-xs font-bold">{purpose}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" /> {business.city || 'الموقع'}
                    </div>
                    <h3 className="font-bold text-[var(--theme-text)] mb-2 line-clamp-1">{property.name}</h3>
                    {property.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{property.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> 3</span>
                      <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> 2</span>
                      <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> 200 م²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>{format(convert(price))}</span>
                      <button className="px-3 py-1.5 rounded-lg bg-[var(--theme-primary)] text-white text-xs font-bold">التفاصيل</button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* About / CTA */}
      <section id="about" className="py-16 bg-[var(--theme-surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[var(--theme-primary)] font-bold text-sm">من نحن</span>
            <h2 className="text-3xl font-bold text-[var(--theme-text)] mt-2 mb-4">شريكك الموثوق في عالم العقارات</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{business.description || 'نقدم لك خدمات عقارية متكاملة تشمل البيع، الشراء، والإيجار بأعلى معايير الجودة والشفافية.'}</p>
            <div className="flex gap-3">
              <a href="#listings" className="px-5 py-2.5 rounded-lg bg-[var(--theme-primary)] text-white font-bold text-sm">تصفح العقارات</a>
              <a href="#contact" className="px-5 py-2.5 rounded-lg border border-[var(--theme-primary)] text-[var(--theme-primary)] font-bold text-sm">تواصل معنا</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--theme-background)] rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-[var(--theme-primary)]">+500</p>
              <p className="text-sm text-gray-500">عميل سعيد</p>
            </div>
            <div className="bg-[var(--theme-background)] rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-[var(--theme-primary)]">+120</p>
              <p className="text-sm text-gray-500">صفقة ناجحة</p>
            </div>
            <div className="bg-[var(--theme-background)] rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-[var(--theme-primary)]">+15</p>
              <p className="text-sm text-gray-500">سنة خبرة</p>
            </div>
            <div className="bg-[var(--theme-background)] rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-[var(--theme-primary)]">+30</p>
              <p className="text-sm text-gray-500">وسيط عقاري</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {business.reviews && business.reviews.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center text-[var(--theme-text)] mb-8">آراء العملاء</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {business.reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-[var(--theme-surface)] rounded-2xl border border-black/5 p-5">
                <StarRating rating={review.rating} size={14} />
                <p className="text-[var(--theme-text)] mt-3 line-clamp-3">{review.comment || 'تجربة ممتازة'}</p>
                <p className="text-sm text-[var(--theme-primary)] mt-3">{review.user?.name || 'عميل'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact / Footer */}
      <footer id="contact" className="bg-[var(--theme-text)] text-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">{business.name}</h4>
            <p className="text-sm text-white/70 line-clamp-3">{business.description || ''}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">روابط</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {navLinks.slice(0, 5).map((page) => (
                <li key={page.slug}><Link href={`/business/${business.slug}/${page.slug}`} className="hover:text-white">{page.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">تواصل</h4>
            <div className="space-y-2 text-sm text-white/70">
              {business.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {business.phone}</p>}
              {business.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {business.email}</p>}
              {business.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {business.city}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">النشرة البريدية</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="بريدك" className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none" />
              <button className="px-3 py-2 rounded-lg bg-[var(--theme-primary)] text-white text-sm font-bold">إرسال</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
