'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Heart,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  ArrowLeft,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { ProductCard } from './ProductCard';
import { StarRating } from './StarRating';
import type { TemplateBusiness, TemplateProduct } from './template-types';

interface ElessiTemplateProps {
  business: TemplateBusiness;
}

const heroImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=900&fit=crop';

export function ElessiTemplate({ business }: ElessiTemplateProps) {
  const { format, convert } = useCurrency();
  const products = business.products || [];
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [email, setEmail] = useState('');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'الكل') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const featured = filteredProducts.slice(0, 6);
  const navLinks = business.pages;

  return (
    <div className="min-h-screen bg-[var(--theme-background)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--theme-background)]/90 backdrop-blur border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href={`/business/${business.slug}`} className="flex items-center gap-2">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-white font-bold">
                  {business.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-[var(--theme-text)]">{business.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm text-[var(--theme-text)]">
              <Link href={`/business/${business.slug}`} className="hover:text-[var(--theme-primary)]">الرئيسية</Link>
              {navLinks.slice(0, 4).map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="hover:text-[var(--theme-primary)]">
                  {page.title}
                </Link>
              ))}
              {categories.slice(0, 4).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="hover:text-[var(--theme-primary)]">
                  {cat}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-black/5 rounded-full"><Search className="w-5 h-5 text-[var(--theme-text)]" /></button>
              <button className="p-2 hover:bg-black/5 rounded-full"><Heart className="w-5 h-5 text-[var(--theme-text)]" /></button>
              <button className="p-2 hover:bg-black/5 rounded-full relative">
                <ShoppingBag className="w-5 h-5 text-[var(--theme-text)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--theme-accent)] text-white text-[10px] rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </button>
              <button className="hidden sm:block p-2 hover:bg-black/5 rounded-full"><User className="w-5 h-5 text-[var(--theme-text)]" /></button>
              <button className="lg:hidden p-2 hover:bg-black/5 rounded-full" onClick={() => setMobileMenuOpen(true)}><Menu className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="absolute top-0 right-0 h-full w-72 bg-[var(--theme-surface)] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <Link href={`/business/${business.slug}`} className="block hover:text-[var(--theme-primary)]">الرئيسية</Link>
              {navLinks.map((page) => (
                <Link key={page.slug} href={`/business/${business.slug}/${page.slug}`} className="block hover:text-[var(--theme-primary)]">{page.title}</Link>
              ))}
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="block hover:text-[var(--theme-primary)]">{cat}</button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center bg-[var(--theme-surface)] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-8 md:p-12 order-2 md:order-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-xs font-bold mb-4">
              مجموعة جديدة
            </span>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold text-[var(--theme-text)] mb-4 leading-tight">
              {business.name}
            </motion.h1>
            {business.description && (
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-8 line-clamp-3">
                {business.description}
              </motion.p>
            )}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
              <button className="px-6 py-3 rounded-full bg-[var(--theme-primary)] text-white font-bold text-sm hover:opacity-90">
                تسوقي الآن
              </button>
              <button className="px-6 py-3 rounded-full border border-[var(--theme-primary)] text-[var(--theme-primary)] font-bold text-sm hover:bg-[var(--theme-primary)]/5">
                اكتشفي المزيد
              </button>
            </motion.div>
          </div>
          <div className="relative h-80 md:h-[460px] order-1 md:order-2">
            <img src={business.cover || heroImage} alt={business.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat, idx) => (
              <motion.button
                key={cat}
                whileHover={{ y: -4 }}
                onClick={() => setActiveCategory(cat)}
                className="relative h-36 rounded-2xl overflow-hidden group"
                style={{ backgroundColor: idx % 2 === 0 ? 'var(--theme-primary)' : 'var(--theme-secondary)' }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-4 right-4 text-white font-bold text-lg">{cat}</div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-[var(--theme-surface)] rounded-2xl border border-black/5 p-5 sticky top-24">
              <h3 className="font-bold text-[var(--theme-text)] mb-4">تصفية المنتجات</h3>
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveCategory('الكل')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm ${activeCategory === 'الكل' ? 'bg-[var(--theme-primary)] text-white' : 'hover:bg-black/5 text-[var(--theme-text)]'}`}
                >
                  الكل
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm ${activeCategory === cat ? 'bg-[var(--theme-primary)] text-white' : 'hover:bg-black/5 text-[var(--theme-text)]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <h4 className="font-bold text-[var(--theme-text)] mb-3 text-sm">السعر</h4>
              <input type="range" min="0" max="1000" className="w-full accent-[var(--theme-primary)]" readOnly />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0</span>
                <span>1000+</span>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--theme-text)]">{activeCategory === 'الكل' ? 'جميع المنتجات' : activeCategory}</h2>
              <span className="text-sm text-gray-500">{featured.length} منتج</span>
            </div>
            {featured.length === 0 ? (
              <div className="bg-[var(--theme-surface)] rounded-2xl border border-black/5 p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد منتجات</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product as TemplateProduct} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Promo strip */}
        <div className="mt-14 rounded-2xl overflow-hidden relative h-64" style={{ background: `linear-gradient(135deg, ${business.theme?.primaryColor}, ${business.theme?.secondaryColor})` }}>
          <div className="absolute inset-0 flex items-center justify-between p-8 md:p-12">
            <div className="text-white max-w-md">
              <p className="text-sm opacity-90 mb-2">تنزيلات موسمية</p>
              <h3 className="text-2xl md:text-4xl font-bold mb-4">خصم يصل إلى 50%</h3>
              <button className="px-5 py-2.5 rounded-full bg-white text-[var(--theme-primary)] font-bold text-sm">اكتشفي العروض</button>
            </div>
            <div className="hidden md:block">
              <ShoppingBag className="w-32 h-32 text-white/20" />
            </div>
          </div>
        </div>

        {/* Reviews */}
        {business.reviews && business.reviews.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-6 text-center">آراء العملاء</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {business.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[var(--theme-surface)] rounded-2xl border border-black/5 p-5 text-center">
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-sm text-[var(--theme-text)] mt-4 line-clamp-3">{review.comment || 'تجربة رائعة'}</p>
                  <p className="text-xs text-gray-500 mt-4">{review.user?.name || 'عميل'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Newsletter */}
      <section className="bg-[var(--theme-surface)] border-t border-black/5 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-[var(--theme-text)] mb-2">اشتركي في النشرة البريدية</h3>
          <p className="text-sm text-gray-500 mb-5">كني أول من يعلم بالعروض والتشكيلات الجديدة</p>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="flex-1 rounded-full border border-black/10 bg-white py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
            />
            <button className="px-5 py-2.5 rounded-full bg-[var(--theme-primary)] text-white font-bold text-sm">اشتراك</button>
          </div>
        </div>
      </section>

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
              {navLinks.slice(0, 5).map((page) => (
                <li key={page.slug}><Link href={`/business/${business.slug}/${page.slug}`} className="hover:text-white">{page.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">المساعدة</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>الشحن والتوصيل</li>
              <li>سياسة الإرجاع</li>
              <li>الأسئلة الشائعة</li>
              <li>تواصل معنا</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">اتصلي بنا</h4>
            <div className="space-y-2 text-sm text-white/70">
              {business.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {business.phone}</p>}
              {business.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {business.email}</p>}
              {business.city && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {business.city}</p>}
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
