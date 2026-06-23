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
  Star,
  ChevronDown,
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
  workingHours?: { day: string; open: string; close: string }[] | Record<string, string> | string | null;
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

const DEMO_IMAGES = {
  heroModel: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
  heroSlide2: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop',
  promoWatches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop',
  promoBags: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop',
  promoTrending: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop',
  saleBanner: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=500&fit=crop',
  testimonial: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  blogTrends: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop',
};

const sidebarCategories = [
  { name: 'أزياء', icon: '👗', count: 45 },
  { name: 'إلكترونيات', icon: '📱', count: 32 },
  { name: 'هدايا', icon: '🎁', count: 18 },
  { name: 'المنزل والحديقة', icon: '🏠', count: 24 },
  { name: 'موسيقى', icon: '🎧', count: 12 },
  { name: 'رياضة', icon: '⚽', count: 28 },
  { name: 'تصنيفات', icon: '📂', count: 0 },
  { name: 'منتجات', icon: '🛍️', count: 0 },
  { name: 'مميزات', icon: '✨', count: 0 },
];

const trustFeatures = [
  { icon: Truck, title: 'شحن مجاني وإرجاع', desc: 'شحن مجاني على الطلبات فوق 99 ريال' },
  { icon: ShieldCheck, title: 'ضمان استرداد الأموال', desc: 'ضمان استرداد 100% ضمن الشروط' },
  { icon: HeadphonesIcon, title: 'دعم عبر الإنترنت 24/7', desc: 'فريق دعم متفاني في خدمتك' },
];

const paymentIcons = ['VISA', 'MasterCard', 'PayPal', 'Stripe'];

const popularTags = ['حقيبة', 'أسود', 'أزرق', 'ملابس', 'أزياء', 'سماعات', 'جينز', 'قميص', 'تنورة', 'رياضة', 'سترة', 'شتاء'];

const heroSlides = [
  {
    pretitle: 'Find the Boundaries. Push Through!',
    title: 'Summer Sale',
    discount: '70%',
    suffix: 'OFF',
    price: '199.99',
    cta: 'تسوقي الآن',
    image: DEMO_IMAGES.heroModel,
  },
  {
    pretitle: 'New Season Collection',
    title: 'Fashion Week',
    discount: '50%',
    suffix: 'OFF',
    price: '149.99',
    cta: 'اكتشفي المزيد',
    image: DEMO_IMAGES.heroSlide2,
  },
];

const promoBanners = [
  {
    title: 'Porto Watches',
    subtitle: '20%',
    suffix: '30% OFF',
    cta: 'SHOP NOW',
    image: DEMO_IMAGES.promoWatches,
    color: '#1e293b',
  },
  {
    title: 'Handbags',
    subtitle: '40%',
    suffix: 'OFF',
    extra: 'STARTING AT $99',
    cta: 'SHOP NOW',
    image: DEMO_IMAGES.promoBags,
    color: '#e11d48',
  },
  {
    title: 'Trending Now',
    subtitle: '',
    suffix: 'STARTING AT $99',
    cta: 'SHOP NOW',
    image: DEMO_IMAGES.promoTrending,
    color: '#0891b2',
  },
];

function formatWorkingHours(
  workingHours?: { day: string; open: string; close: string }[] | Record<string, string> | string | null
): string | null {
  if (!workingHours) return null;
  let parsed: any = workingHours;
  if (typeof workingHours === 'string') {
    try {
      parsed = JSON.parse(workingHours);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(parsed)) return null;
  const days = parsed.filter((item: any) => item.open && item.close);
  if (days.length === 0) return null;
  return days.map((item: any) => `${item.day}: ${item.open} - ${item.close}`).join(' | ');
}

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

  const featuredProducts = products.slice(0, 3).map((p) => ({ ...p, badge: 'hot' as const }));
  const latestProducts = products.slice(0, 6);
  const bestSelling = [...products].sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 3);
  const topRated = [...products]
    .filter((p) => (p.rating || 0) > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const workingHoursText = useMemo(() => formatWorkingHours(business.workingHours), [business.workingHours]);

  const nextSlide = () => setCurrentSlide((s) => (s + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length);

  const navItems = [
    { label: 'الرئيسية', href: homeHref },
    ...categories.slice(0, 6).map((cat) => ({ label: cat, href: `${homeHref}?category=${encodeURIComponent(cat)}` })),
    ...(business.pages || [])
      .filter((p) => !p.isHomePage)
      .slice(0, 3)
      .map((p) => ({ label: p.title, href: `/business/${business.slug || business.id}/${p.slug}` })),
  ];

  const primaryColor = business.theme?.primaryColor || '#0284c7';

  return (
    <div className="min-h-screen bg-[var(--theme-background)]" style={{ fontFamily: 'var(--theme-font, Cairo)' }}>
      {/* Top Bar */}
      <div className="text-white text-xs py-2" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="hidden sm:block">مرحباً بك في {business.name} | توصيل مجاني للطلبات فوق 99 ريال</p>
          <div className="flex items-center gap-4 ms-auto">
            <Link href="#" className="hover:opacity-80 transition-opacity">تواصل معنا</Link>
            <span className="opacity-60">|</span>
            <Link href="#" className="hover:opacity-80 transition-opacity">حسابي</Link>
            <span className="opacity-60">|</span>
            <Link href="#" className="hover:opacity-80 transition-opacity">المفضلة</Link>
            <span className="opacity-60">|</span>
            <span>العملة: ريال</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[var(--theme-surface)] border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href={homeHref} className="flex items-center gap-3 flex-shrink-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Home className="w-6 h-6" />
                </div>
              )}
              <div className="hidden md:block">
                <h1 className="text-2xl font-extrabold text-foreground leading-none">{business.name}</h1>
                <span className="text-[10px] text-muted tracking-widest">eCommerce</span>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative flex rounded-lg overflow-hidden border border-border">
                <select className="px-4 py-2.5 bg-slate-50 text-sm text-foreground focus:outline-none border-l border-border">
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
                  className="flex-1 px-4 py-2.5 bg-white text-sm text-foreground focus:outline-none"
                />
                <button type="button" className="px-5 text-white" style={{ backgroundColor: primaryColor }}>
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 ms-auto">
              {business.phone && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-foreground">
                  <Phone className="w-5 h-5" style={{ color: primaryColor }} />
                  <div className="leading-tight">
                    <span className="block text-[10px] text-muted">اتصلي بنا الآن</span>
                    <span dir="ltr" className="font-bold">{business.phone}</span>
                  </div>
                </div>
              )}
              <button type="button" className="relative p-2 text-foreground hover:text-primary transition-colors">
                <User className="w-6 h-6" />
              </button>
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

      {/* Trust Badges */}
      <section className="border-b border-border bg-[var(--theme-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border">
            {trustFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 py-4 px-4">
                <feature.icon className="w-8 h-8 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase">{feature.title}</h4>
                  <p className="text-xs text-muted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6">
              {/* Categories */}
              <div className="bg-[var(--theme-surface)] border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-slate-50">
                  <h3 className="font-bold text-foreground text-sm">التصنيفات</h3>
                </div>
                <ul>
                  {sidebarCategories.map((cat) => (
                    <li key={cat.name}>
                      <Link
                        href={`${homeHref}?category=${encodeURIComponent(cat.name)}`}
                        className="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-slate-50 hover:text-primary transition-colors border-b border-border last:border-0"
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          {cat.name}
                        </span>
                        {cat.count > 0 && <ChevronLeft className="w-4 h-4 text-muted" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sale Banner */}
              <div
                className="relative rounded-lg overflow-hidden p-6 text-center text-white min-h-[320px] flex flex-col items-center justify-center"
                style={{ background: `linear-gradient(180deg, ${primaryColor}, #0ea5e9)` }}
              >
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">SALE</span>
                </div>
                <p className="text-sm opacity-90 mb-1">MANY ITEM</p>
                <div className="text-5xl font-extrabold mb-1">50%</div>
                <p className="text-lg font-bold mb-4">OFF</p>
                <p className="text-xs opacity-90 mb-6 px-2">Bags, Clothing, T-Shirts, Shoes, Watches and much more...</p>
                <button type="button" className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase rounded hover:bg-slate-800 transition-colors">
                  View Sale
                </button>
                <img
                  src={DEMO_IMAGES.saleBanner}
                  alt="Sale"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10"
                />
              </div>

              {/* Newsletter */}
              <div className="bg-[var(--theme-surface)] border border-border rounded-lg p-5 text-center">
                <h3 className="font-bold text-foreground text-sm uppercase mb-2">Subscribe Newsletter</h3>
                <p className="text-xs text-muted mb-4">Get all the latest information on Events, Sales and Offers.</p>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:border-primary bg-white"
                  />
                  <button type="button" className="w-full py-2 text-white text-xs font-bold uppercase rounded" style={{ backgroundColor: primaryColor }}>
                    Subscribe
                  </button>
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-[var(--theme-surface)] border border-border rounded-lg p-5 text-center border-t-4" style={{ borderTopColor: primaryColor }}>
                <img
                  src={DEMO_IMAGES.testimonial}
                  alt="Customer"
                  className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                />
                <h4 className="font-bold text-foreground text-sm">سارة أحمد</h4>
                <p className="text-[11px] text-muted mb-3">CEO & Founder</p>
                <p className="text-xs text-muted leading-relaxed italic">
                  "تجربة تسوق رائعة! المنتجات بجودة عالية والتوصيل سريع جداً. أنصح الجميع بالتعامل مع {business.name}."
                </p>
              </div>

              {/* Blog */}
              <div className="bg-[var(--theme-surface)] border border-border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-slate-100">
                  <img src={DEMO_IMAGES.blogTrends} alt="Fashion Trends" className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-sm mb-2">Fashion Trends</h3>
                  <p className="text-xs text-muted line-clamp-3 mb-3">
                    اكتشفي أحدث صيحات الموضة لهذا الموسم مع تشكيلة متنوعة من الأزياء والإكسسوارات.
                  </p>
                  <Link href="#" className="text-xs font-bold hover:underline" style={{ color: primaryColor }}>
                    1 Comment
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-6">
              {/* Hero Slider */}
              <section className="relative h-[360px] md:h-[440px] overflow-hidden rounded-lg bg-[#f1f1f1]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex"
                  >
                    <div className="flex-1 flex items-center px-8 md:px-14">
                      <div className="max-w-md">
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          dir="ltr"
                          className="text-sm md:text-base text-slate-600 mb-2 text-left"
                        >
                          {heroSlides[currentSlide].pretitle}
                        </motion.p>
                        <motion.h2
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-4xl md:text-6xl font-bold text-slate-900 mb-2 italic"
                        >
                          {heroSlides[currentSlide].title}
                        </motion.h2>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex items-center gap-3 mb-6"
                        >
                          <span className="text-5xl md:text-7xl font-extrabold text-slate-900">{heroSlides[currentSlide].discount}</span>
                          <span className="text-xl md:text-2xl font-bold text-slate-900">{heroSlides[currentSlide].suffix}</span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center gap-3 dir-ltr"
                        >
                          <span className="text-xs text-slate-600 uppercase tracking-wide">Starting At</span>
                          <span className="px-2 py-1 bg-rose-500 text-white font-bold text-sm">${heroSlides[currentSlide].price}</span>
                          <button type="button" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold uppercase hover:bg-slate-800 transition-colors">
                            {heroSlides[currentSlide].cta}
                          </button>
                        </motion.div>
                      </div>
                    </div>
                    <div className="hidden md:flex w-[45%] items-end justify-center pe-8">
                      <img
                        src={heroSlides[currentSlide].image}
                        alt="Hero"
                        className="h-[90%] w-auto object-contain"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/60 text-slate-700 hover:bg-white flex items-center justify-center shadow-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/60 text-slate-700 hover:bg-white flex items-center justify-center shadow-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentSlide(i)}
                      className={`w-3 h-3 rounded-full border-2 border-slate-400 transition-all ${i === currentSlide ? 'bg-slate-800 border-slate-800' : 'bg-transparent'}`}
                    />
                  ))}
                </div>
              </section>

              {/* Promo Banners */}
              <section>
                <div className="grid sm:grid-cols-3 gap-4">
                  {promoBanners.map((promo, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -3 }}
                      className="relative rounded-lg overflow-hidden min-h-[140px] flex items-center p-5 text-white"
                      style={{ backgroundColor: promo.color }}
                    >
                      <div className="relative z-10 flex-1">
                        <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                        <div className="flex items-baseline gap-1 mb-1">
                          {promo.subtitle && <span className="text-2xl font-bold">{promo.subtitle}</span>}
                          <span className="text-sm font-bold">{promo.suffix}</span>
                        </div>
                        {promo.extra && <p className="text-xs opacity-90 mb-2">{promo.extra}</p>}
                        <button type="button" className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded hover:bg-slate-800 transition-colors">
                          {promo.cta}
                        </button>
                      </div>
                      <img src={promo.image} alt={promo.title} className="absolute left-0 bottom-0 h-full w-1/2 object-cover opacity-80" />
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Featured Products */}
              {featuredProducts.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                    <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wide">Featured Products</h2>
                    <Link href={`${homeHref}?filter=featured`} className="text-xs text-muted hover:text-primary transition-colors">
                      View All
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featuredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              )}

              {/* Product Columns */}
              <section>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Top Rated */}
                  <div>
                    <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wide mb-4 pb-2 border-b border-border">
                      Top Rated Products
                    </h3>
                    <div className="space-y-3">
                      {topRated.length > 0 ? (
                        topRated.map((product) => <ProductCard key={product.id} product={product} variant="list" />)
                      ) : (
                        <p className="text-xs text-muted">لا توجد منتجات مصنفة بعد</p>
                      )}
                    </div>
                  </div>

                  {/* Best Selling */}
                  <div>
                    <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wide mb-4 pb-2 border-b border-border">
                      Best Selling Products
                    </h3>
                    <div className="space-y-3">
                      {bestSelling.length > 0 ? (
                        bestSelling.map((product) => <ProductCard key={product.id} product={product} variant="list" />)
                      ) : (
                        <p className="text-xs text-muted">لا توجد منتجات مبيعاً بعد</p>
                      )}
                    </div>
                  </div>

                  {/* Latest */}
                  <div>
                    <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wide mb-4 pb-2 border-b border-border">
                      Latest Products
                    </h3>
                    <div className="space-y-3">
                      {latestProducts.length > 0 ? (
                        latestProducts.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} variant="list" />)
                      ) : (
                        <p className="text-xs text-muted">لا توجد منتجات جديدة</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white/70 py-14 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* About */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase mb-4">About Us</h4>
              <p className="leading-relaxed mb-4 text-xs">
                {business.description ? business.description.slice(0, 180) + '...' : 'متجر إلكتروني يقدم منتجات متميزة بجودة عالية وأسعار منافسة.'}
              </p>
              <Link href="#" className="text-xs font-bold hover:text-white transition-colors" style={{ color: primaryColor }}>
                read more...
              </Link>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase mb-4">Contact Info</h4>
              <ul className="space-y-3 text-xs">
                {business.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{business.address}</span>
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
                    <span>{workingHoursText}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase mb-4">Customer Service</h4>
              <ul className="space-y-2 text-xs">
                {(business.pages || [])
                  .filter((p) => !p.isHomePage)
                  .map((p) => (
                    <li key={p.id}>
                      <Link href={`/business/${business.slug || business.id}/${p.slug}`} className="hover:text-white transition-colors">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                <li><Link href="#" className="hover:text-white transition-colors">Help & FAQs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Order Tracking</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">My Account</Link></li>
              </ul>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase mb-4">Popular Tags</h4>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-sm bg-white/10 text-[11px] hover:bg-white/20 transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} {business.name}. All Rights Reserved
            </p>
            <div className="flex items-center gap-3">
              {paymentIcons.map((icon) => (
                <span key={icon} className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white/80">
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
