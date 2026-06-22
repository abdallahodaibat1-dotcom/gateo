'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  Star,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { ProductCard } from './ProductCard';
import { StarRating } from './StarRating';
import type { TemplateBusiness, TemplateProduct } from './template-types';

interface FlatsomeTemplateProps {
  business: TemplateBusiness;
}

const trustFeatures = [
  { icon: Truck, title: 'شحن مجاني', desc: 'على الطلبات فوق 99 ريال' },
  { icon: ShieldCheck, title: 'دفع آمن', desc: 'حماية 100% للمدفوعات' },
  { icon: HeadphonesIcon, title: 'دعم 24/7', desc: 'فريق خدمة العملاء' },
];

const promoImages = {
  left: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
  right: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop',
};

export function FlatsomeTemplate({ business }: FlatsomeTemplateProps) {
  const { format, convert } = useCurrency();
  const products = business.products || [];
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== 'الكل') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, searchQuery]);

  const featuredProducts = filteredProducts.slice(0, 8);
  const newArrivals = filteredProducts.slice(0, 4);

  const navLinks = business.pages;

  return (
    <div className="min-h-screen bg-[var(--theme-background)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Top bar */}
      <div className="bg-[var(--theme-primary)] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="hidden sm:flex items-center gap-1 hover:opacity-90">
                <Phone className="w-3 h-3" /> {business.phone}
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="hidden md:flex items-center gap-1 hover:opacity-90">
                <Mail className="w-3 h-3" /> {business.email}
              </a>
            )}
          </div>
          <span>شحن مجاني للطلبات فوق 99 ريال</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--theme-surface)] border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href={`/business/${business.slug}`} className="flex items-center gap-2 flex-shrink-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white font-bold">
                  {business.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-lg text-[var(--theme-text)] hidden sm:block">{business.name}</span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المنتجات..."
                className="w-full rounded-full border border-black/10 bg-white py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                style={{ borderRadius: '9999px' }}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-black/5 rounded-full">
                <Heart className="w-5 h-5 text-[var(--theme-text)]" />
              </button>
              <button className="p-2 hover:bg-black/5 rounded-full relative">
                <ShoppingCart className="w-5 h-5 text-[var(--theme-text)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--theme-accent)] text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-black/5 rounded-full hidden sm:block">
                <User className="w-5 h-5 text-[var(--theme-text)]" />
              </button>
              <button
                className="md:hidden p-2 hover:bg-black/5 rounded-full"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5 text-[var(--theme-text)]" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 pb-2 text-sm text-[var(--theme-text)]">
            <Link href={`/business/${business.slug}`} className="hover:text-[var(--theme-primary)] transition-colors">
              الرئيسية
            </Link>
            {navLinks.slice(0, 5).map((page) => (
              <Link
                key={page.slug}
                href={`/business/${business.slug}/${page.slug}`}
                className="hover:text-[var(--theme-primary)] transition-colors"
              >
                {page.title}
              </Link>
            ))}
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="hover:text-[var(--theme-primary)] transition-colors"
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="absolute top-0 right-0 h-full w-72 bg-[var(--theme-surface)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <Link href={`/business/${business.slug}`} className="block hover:text-[var(--theme-primary)]">
                الرئيسية
              </Link>
              {navLinks.map((page) => (
                <Link
                  key={page.slug}
                  href={`/business/${business.slug}/${page.slug}`}
                  className="block hover:text-[var(--theme-primary)]"
                >
                  {page.title}
                </Link>
              ))}
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="block hover:text-[var(--theme-primary)]">
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <section
        className="relative py-16 md:py-24 px-4 overflow-hidden"
        style={{
          background: business.cover
            ? `linear-gradient(to right, ${business.theme?.primaryColor}ee, ${business.theme?.secondaryColor}cc), url(${business.cover}) center/cover`
            : `linear-gradient(135deg, ${business.theme?.primaryColor}, ${business.theme?.secondaryColor})`,
        }}
      >
        <div className="max-w-7xl mx-auto text-center text-white relative z-10">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold mb-4">
            {business.name}
          </motion.h1>
          {business.description && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-8"
            >
              {business.description}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3"
          >
            <button
              className="px-6 py-3 rounded-full bg-white text-[var(--theme-primary)] font-bold text-sm hover:shadow-lg transition-shadow"
            >
              تسوق الآن
            </button>
            {business.phone && (
              <a href={`tel:${business.phone}`} className="px-6 py-3 rounded-full border border-white text-white font-bold text-sm hover:bg-white/10">
                اتصل بنا
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-6 bg-[var(--theme-surface)] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trustFeatures.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-[var(--theme-primary)]" />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--theme-text)]">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-[var(--theme-surface)] rounded-xl border border-black/5 p-4">
              <h3 className="font-bold text-[var(--theme-text)] mb-3">التصنيفات</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('الكل')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === 'الكل' ? 'bg-[var(--theme-primary)] text-white' : 'hover:bg-black/5 text-[var(--theme-text)]'
                  }`}
                >
                  الكل
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat ? 'bg-[var(--theme-primary)] text-white' : 'hover:bg-black/5 text-[var(--theme-text)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[var(--theme-surface)] rounded-xl border border-black/5 p-4">
              <h3 className="font-bold text-[var(--theme-text)] mb-3">السعر</h3>
              <div className="space-y-3">
                <input type="range" min="0" max="1000" className="w-full accent-[var(--theme-primary)]" readOnly />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>0 ريال</span>
                  <span>1000+ ريال</span>
                </div>
              </div>
            </div>

            {business.city && (
              <div className="bg-[var(--theme-surface)] rounded-xl border border-black/5 p-4">
                <h3 className="font-bold text-[var(--theme-text)] mb-2">الموقع</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[var(--theme-primary)]" /> {business.city}
                </div>
              </div>
            )}
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--theme-text)]">منتجاتنا</h2>
              <span className="text-sm text-gray-500">{featuredProducts.length} منتج</span>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="bg-[var(--theme-surface)] rounded-xl border border-black/5 p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد منتجات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product as TemplateProduct} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Promo banners */}
        <div className="grid md:grid-cols-2 gap-6 mt-14">
          <div className="relative overflow-hidden rounded-2xl h-56 group">
            <img src={promoImages.left} alt="promo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
              <div className="text-white">
                <p className="text-sm opacity-90">عرض محدود</p>
                <h3 className="text-2xl font-bold mb-2">خصم حتى 30%</h3>
                <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">تسوق الآن</button>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl h-56 group">
            <img src={promoImages.right} alt="promo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
              <div className="text-white">
                <p className="text-sm opacity-90">مجموعة جديدة</p>
                <h3 className="text-2xl font-bold mb-2">وصل حديثاً</h3>
                <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">اكتشف المزيد</button>
              </div>
            </div>
          </div>
        </div>

        {/* New arrivals */}
        {newArrivals.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-6">وصل حديثاً</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {newArrivals.map((product) => (
                <ProductCard key={`new-${product.id}`} product={product as TemplateProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {(business.reviews && business.reviews.length > 0) && (
          <div className="mt-14 bg-[var(--theme-surface)] rounded-2xl border border-black/5 p-6 md:p-8">
            <h2 className="text-xl font-bold text-[var(--theme-text)] mb-6">آراء العملاء</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {business.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[var(--theme-background)] rounded-xl p-4">
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-sm text-[var(--theme-text)] mt-3 line-clamp-3">{review.comment || 'تجربة رائعة'}</p>
                  <p className="text-xs text-gray-500 mt-3">{review.user?.name || 'عميل'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--theme-text)] text-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">{business.name}</h4>
            <p className="text-sm text-white/70 line-clamp-3">{business.description || ''}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {navLinks.slice(0, 5).map((page) => (
                <li key={page.slug}>
                  <Link href={`/business/${business.slug}/${page.slug}`} className="hover:text-white">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>الشحن والإرجاع</li>
              <li>الأسئلة الشائعة</li>
              <li>سياسة الخصوصية</li>
              <li>الشروط والأحكام</li>
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
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
