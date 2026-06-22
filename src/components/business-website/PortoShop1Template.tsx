'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Send,
  Home,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import { ProductCard, ProductCardProduct } from './ProductCard';
import { StarRating } from './StarRating';

interface BusinessPage {
  id: string;
  slug: string;
  title: string;
  isHomePage: boolean;
}

interface BusinessPost {
  id: string;
  title: string;
  content?: string | null;
  image?: string | null;
  createdAt: string;
  _count?: { Comment?: number; Like?: number };
}

interface BusinessReview {
  id: string;
  rating: number;
  comment?: string | null;
  user?: { name?: string | null; avatar?: string | null } | null;
  createdAt: string;
}

interface PortoShop1Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover?: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address?: string | null;
  workingHours?: Record<string, string> | string | null;
  avgRating: number;
  reviewCount: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: string;
    buttonStyle: string;
    homeTemplate?: string;
  } | null;
  pages: BusinessPage[];
  products?: ProductCardProduct[];
  posts?: BusinessPost[];
  reviews?: BusinessReview[];
}

interface PortoShop1TemplateProps {
  business: PortoShop1Business;
}

const heroSlides = [
  {
    title: 'أزياء الموسم الجديد',
    subtitle: 'Summer Sale',
    discount: '70%',
    cta: 'تسوق الآن',
  },
  {
    title: 'أكثر من 200 منتج بخصومات',
    subtitle: 'عروض رائعة',
    discount: '50%',
    cta: 'احصل عليها',
  },
  {
    title: 'وصل حديثاً',
    subtitle: 'NEW ARRIVALS',
    discount: '70%',
    cta: 'اكتشف المزيد',
  },
];

const trustFeatures = [
  { icon: Truck, title: 'شحن مجاني وإرجاع', desc: 'شحن مجاني للطلبات فوق 99 ريال' },
  { icon: ShieldCheck, title: 'ضمان استرداد', desc: 'استرداد 100% ضمن الشروط' },
  { icon: HeadphonesIcon, title: 'دعم 24/7', desc: 'فريق دعم متواصل' },
];

const promoCards = [
  { title: 'ساعات بوتو', subtitle: '20% - 30% Off', cta: 'تسوق الآن', gradient: 'from-slate-800 to-slate-600' },
  { title: 'حقائب يد', subtitle: 'يبدأ من 99 ريال', cta: 'تسوق الآن', gradient: 'from-rose-500 to-pink-500' },
  { title: 'الأكثر رواجاً', subtitle: 'يبدأ من 99 ريال', cta: 'تسوق الآن', gradient: 'from-amber-500 to-orange-500' },
];

const categoryBlocks = [
  { name: 'أزياء', items: ['فساتين', 'بلايز وتنانير', 'إكسسوارات', 'أحذية'] },
  { name: 'إلكترونيات', items: ['كاميرات', 'سماعات', 'لابتوبات', 'شواحن'] },
  { name: 'هدايا', items: ['له', 'لها', 'للأطفال', 'أعياد الميلاد'] },
  { name: 'المنزل والحديقة', items: ['أثاث', 'إضاءة', 'ديكور', 'حديقة'] },
];

const extraPromos = [
  { title: 'خصم حتى 50%', subtitle: 'حقائب، ملابس، تيشيرتات، أحذية، ساعات...', cta: 'عرض التخفيضات', color: 'bg-rose-500' },
  { title: 'طائرات + كاميرات', subtitle: 'خصم حتى 100 ريال', cta: 'عرض التخفيضات', color: 'bg-indigo-600' },
  { title: 'تخفيضات سماعات', subtitle: 'خصم حتى 50%', cta: 'عرض التخفيضات', color: 'bg-amber-500' },
];

export function PortoShop1Template({ business }: PortoShop1TemplateProps) {
  const products = useMemo(() => business.products || [], [business.products]);
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(0);
  const [email, setEmail] = useState('');

  const homeHref = `/business/${business.slug || business.id}`;

  const featuredProducts = products.slice(0, 8);
  const latestProducts = products.slice(0, 6);
  const bestSelling = [...products].sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 4);
  const topRated = [...products]
    .filter((p) => (p.rating || 0) > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  const workingHoursText = useMemo(() => {
    if (!business.workingHours) return null;
    if (typeof business.workingHours === 'string') {
      try {
        const parsed = JSON.parse(business.workingHours);
        return parsed;
      } catch {
        return null;
      }
    }
    return business.workingHours;
  }, [business.workingHours]);

  const nextSlide = () => setCurrentSlide((s) => (s + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length);

  const navItems = [
    { label: 'الرئيسية', href: homeHref },
    ...categories.slice(0, 6).map((cat) => ({ label: cat, href: `${homeHref}?category=${encodeURIComponent(cat)}` })),
    ...(business.pages || [])
      .filter((p) => !p.isHomePage)
      .slice(0, 4)
      .map((p) => ({ label: p.title, href: `/business/${business.slug || business.id}/${p.slug}` })),
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-background)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Top Bar */}
      <div
        className="text-white text-xs py-2"
        style={{ backgroundColor: 'var(--theme-primary)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="hidden sm:block">احصل على خصم يصل إلى 40% على تشكيلة الموسم الجديد</p>
          <div className="flex items-center gap-4 ms-auto">
            <span className="opacity-90">التوصيل مجاني للطلبات فوق 99 ريال</span>
            <span className="opacity-70">|</span>
            <span className="opacity-90">العملة: ريال</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[var(--theme-surface)] border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href={homeHref} className="flex items-center gap-3 flex-shrink-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Home className="w-6 h-6" />
                </div>
              )}
              <h1 className="text-xl font-bold text-foreground hidden md:block">{business.name}</h1>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative flex">
                <select className="px-3 py-2.5 rounded-r-lg border-y border-r border-border bg-slate-50 text-sm text-foreground focus:outline-none">
                  <option>كل التصنيفات</option>
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحثي عن منتج..."
                  className="flex-1 px-4 py-2.5 border-y border-border bg-white text-sm text-foreground focus:outline-none"
                />
                <button
                  type="button"
                  className="px-5 rounded-l-lg text-white"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 ms-auto">
              {business.phone && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-foreground">
                  <Phone className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                  <span dir="ltr">{business.phone}</span>
                </div>
              )}
              <button type="button" className="relative p-2 text-foreground hover:text-primary transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button type="button" className="relative p-2 text-foreground hover:text-primary transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: 'var(--theme-accent)' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              <button type="button" className="p-2 text-foreground hover:text-primary transition-colors">
                <User className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-foreground"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:block border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1">
              {navItems.slice(0, 8).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-border overflow-hidden bg-[var(--theme-surface)]"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-2.5 text-foreground hover:bg-slate-50 rounded-lg text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Slider */}
        <section className="relative h-[420px] md:h-[500px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center"
              style={{
                background: `linear-gradient(135deg, ${business.theme?.primaryColor || '#1e40af'}, ${business.theme?.secondaryColor || '#0f766e'})`,
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                <div className="max-w-xl text-white">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm md:text-base font-medium opacity-90 mb-2"
                  >
                    {heroSlides[currentSlide].subtitle}
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-5xl font-bold mb-4"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <span className="text-5xl md:text-6xl font-bold">{heroSlides[currentSlide].discount}</span>
                    <span className="text-xl md:text-2xl font-medium opacity-90 leading-tight">
                      %<br />خصم
                    </span>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="px-8 py-3 rounded-full bg-white text-foreground font-bold hover:scale-105 transition-transform"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    {heroSlides[currentSlide].cta}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={prevSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </section>

        {/* Promo Cards */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-5">
              {promoCards.map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-xl overflow-hidden p-6 md:p-8 text-white bg-gradient-to-br ${card.gradient} shadow-lg`}
                  style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
                >
                  <div className="relative z-10">
                    <p className="text-sm opacity-90 mb-1">{card.subtitle}</p>
                    <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                    <button
                      type="button"
                      className="px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-bold transition-colors"
                    >
                      {card.cta}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Tag className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
                  منتجات مميزة
                </h2>
                <Link href={`${homeHref}?filter=featured`} className="text-sm font-medium hover:underline" style={{ color: 'var(--theme-primary)' }}>
                  عرض الكل
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products Split Sections */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Top Rated */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">
                  الأعلى تقييماً
                </h3>
                <div className="space-y-3">
                  {topRated.length > 0 ? (
                    topRated.map((product) => <ProductCard key={product.id} product={product} variant="list" />)
                  ) : (
                    <p className="text-sm text-muted">لا توجد منتجات مصنفة بعد</p>
                  )}
                </div>
              </div>

              {/* Best Selling */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">
                  الأكثر مبيعاً
                </h3>
                <div className="space-y-3">
                  {bestSelling.length > 0 ? (
                    bestSelling.map((product) => <ProductCard key={product.id} product={product} variant="list" />)
                  ) : (
                    <p className="text-sm text-muted">لا توجد منتجات مبيعاً بعد</p>
                  )}
                </div>
              </div>

              {/* Latest */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">
                  أحدث المنتجات
                </h3>
                <div className="space-y-3">
                  {latestProducts.length > 0 ? (
                    latestProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} variant="list" />)
                  ) : (
                    <p className="text-sm text-muted">لا توجد منتجات جديدة</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-10 border-y border-border bg-[var(--theme-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-6">
              {trustFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)' }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Blocks */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">تصفحي حسب التصنيف</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categoryBlocks.map((block, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="bg-[var(--theme-surface)] rounded-xl border border-border p-5 shadow-sm"
                  style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
                >
                  <h3 className="font-bold text-foreground mb-3">{block.name}</h3>
                  <ul className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item}>
                        <Link
                          href={`${homeHref}?category=${encodeURIComponent(item)}`}
                          className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Extra Promos */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-5">
              {extraPromos.map((promo, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className={`${promo.color} rounded-xl p-6 text-white shadow-lg`}
                  style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
                >
                  <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                  <p className="text-sm opacity-90 mb-4">{promo.subtitle}</p>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-bold transition-colors"
                  >
                    {promo.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">آراء العملاء</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="bg-[var(--theme-surface)] rounded-xl border border-border p-6 shadow-sm text-center"
                  style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
                >
                  <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto mb-4 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${business.name}${i}`}
                      alt="عميل"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <StarRating rating={5} size={14} showValue={false} />
                  <p className="text-sm text-muted my-4 leading-relaxed">
                    تجربة رائعة مع {business.name}، المنتجات بجودة ممتازة والتوصيل سريع. أنصح الجميع بالتعامل معهم.
                  </p>
                  <h4 className="font-bold text-foreground">عميلة سعيدة</h4>
                  <span className="text-xs text-muted">مشتري دائم</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog / Posts */}
        {business.posts && business.posts.length > 0 && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">أحدث المنشورات</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {business.posts.slice(0, 3).map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ y: -4 }}
                    className="bg-[var(--theme-surface)] rounded-xl border border-border overflow-hidden shadow-sm"
                    style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
                  >
                    <div className="aspect-video bg-slate-100">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-muted mb-2">{new Date(post.createdAt).toLocaleDateString('ar-SA')}</p>
                      <h3 className="font-bold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted line-clamp-2">{post.content?.slice(0, 120) || ''}...</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div
              className="rounded-2xl p-8 md:p-12 text-center text-white"
              style={{
                background: `linear-gradient(135deg, ${business.theme?.primaryColor || '#1e40af'}, ${business.theme?.secondaryColor || '#0f766e'})`,
                borderRadius: 'var(--theme-radius, 1rem)',
              }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">اشتركي في نشرتنا البريدية</h2>
              <p className="opacity-90 mb-6">احصلي على أحدث العروض والمنتجات الجديدة مباشرة على بريدك</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-4 py-3 rounded-lg text-foreground text-sm focus:outline-none"
                />
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg bg-white font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  <Send className="w-4 h-4" />
                  اشتراك
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* About */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4">عن {business.name}</h4>
              <p className="text-sm leading-relaxed mb-4">
                {business.description ? business.description.slice(0, 160) + '...' : 'متجر إلكتروني يقدم منتجات متميزة بجودة عالية وأسعار منافسة.'}
              </p>
              <div className="flex gap-3">
                {['ف', 'ت', 'ي', 'و'].map((label, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-sm font-bold"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4">خدمة العملاء</h4>
              <ul className="space-y-2 text-sm">
                {(business.pages || [])
                  .filter((p) => !p.isHomePage)
                  .map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/business/${business.slug || business.id}/${p.slug}`}
                        className="hover:text-white transition-colors"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                <li>
                  <Link href={`${homeHref}?filter=featured`} className="hover:text-white transition-colors">
                    المنتجات المميزة
                  </Link>
                </li>
                <li>
                  <Link href={`${homeHref}?filter=new`} className="hover:text-white transition-colors">
                    أحدث المنتجات
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4">معلومات التواصل</h4>
              <ul className="space-y-3 text-sm">
                {business.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{business.address}</span>
                  </li>
                )}
                {business.city && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{business.city}</span>
                  </li>
                )}
                {business.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span dir="ltr">{business.phone}</span>
                  </li>
                )}
                {business.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>{business.email}</span>
                  </li>
                )}
                {workingHoursText && (
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>أيام العمل: {JSON.stringify(workingHoursText)}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-white font-bold text-lg mb-4">كلمات مفتاحية</h4>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <span key={cat} className="px-3 py-1 rounded-full bg-white/10 text-xs hover:bg-white/20 transition-colors">
                    {cat}
                  </span>
                ))}
                {categories.length === 0 &&
                  ['أزياء', 'إلكترونيات', 'هدايا', 'منزل'].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-xs">
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-sm text-white/50">
            © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
