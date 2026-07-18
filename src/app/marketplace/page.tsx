'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Search,
  ShoppingBag,
  Store,
  MapPin,
  Filter,
  ChevronDown,
  Star,
  ArrowLeft,
  ChevronLeft,
  CheckCircle,
  X,
  SlidersHorizontal,
  Percent,
  Flame,
  Sparkles,
  Clock,
  TrendingUp,
  ChevronRight,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { MarketplaceCartDrawer } from '@/components/marketplace/MarketplaceCartDrawer';

interface Listing {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice: number | null;
    images: { url: string; alt?: string }[] | null;
    category: string | null;
    business: {
      id: string;
      name: string;
      slug: string;
      city: string | null;
      logo: string | null;
      isVerified: boolean;
    };
  };
}

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  color: string;
  icon: React.ElementType;
  href: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'mega-sale',
    title: 'تخفيضات كبرى',
    subtitle: 'خصومات تصل إلى 50% على منتجات مختارة',
    cta: 'تسوق الآن',
    color: 'from-rose-500 to-pink-600',
    icon: Percent,
    href: '/marketplace?sort=discount',
  },
  {
    id: 'new-arrivals',
    title: 'وصل حديثاً',
    subtitle: 'أحدث المنتجات المضافة هذا الأسبوع',
    cta: 'اكتشفها',
    color: 'from-violet-500 to-purple-600',
    icon: Sparkles,
    href: '/marketplace?sort=newest',
  },
  {
    id: 'trending',
    title: 'الأكثر مبيعاً',
    subtitle: 'منتجات لاقت إقبالاً كبيراً',
    cta: 'شاهد المزيد',
    color: 'from-amber-500 to-orange-600',
    icon: Flame,
    href: '/marketplace?sort=popular',
  },
];

// Professional category groups (Shein-style)
const CATEGORY_GROUPS = [
  {
    id: 'fashion',
    label: 'أزياء',
    icon: '👗',
    categories: ['فساتين', 'عباية سوداء', 'عباية', 'ملابس رياضية', 'سروال جينز', 'قميص قطني', 'حذاء كلاسيك', 'حقيبة يد', 'حقيبة', 'إكسسوار', 'إكسسوار شعر', 'طقم مجوهرات', 'عقد فضة', 'ساعة أنيقة'],
  },
  {
    id: 'beauty',
    label: 'جمال',
    icon: '💄',
    categories: ['مكياج', 'مكياج عيون', 'فرشاة مكياج', 'أداة تجميل', 'جهاز تجميل', 'مستحضرات تجميل', 'منتجات تجميل'],
  },
  {
    id: 'care',
    label: 'عناية',
    icon: '🧴',
    categories: ['العناية بالبشرة', 'منتج بشرة', 'كريم ترطيب', 'صن بلوك', 'العناية بالشعر', 'منتج شعر', 'مستحضر شعر', 'مجموعة عناية', 'منتج عناية'],
  },
  {
    id: 'fragrance',
    label: 'عطور',
    icon: '🌸',
    categories: ['عطر', 'عطر فاخر'],
  },
  {
    id: 'gifts',
    label: 'هدايا',
    icon: '🎁',
    categories: ['بوكس هدية', 'هدية فاخرة', 'ورد طبيعي', 'حلويات', 'حلويات مشكلة', 'شوكولاتة', 'شوكولاتة بلجيكية', 'قهوة', 'قهوة مختصة', 'الباقات المميزة'],
  },
  {
    id: 'wellness',
    label: 'صحة',
    icon: '💚',
    categories: ['مكمل غذائي', 'جهاز طبي صغير', 'جلسات التدليك والاسترخاء'],
  },
  {
    id: 'deals',
    label: 'عروض',
    icon: '🔥',
    categories: ['عرض خاص', 'منتج مميز'],
  },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'popular', label: 'الأكثر مبيعاً' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'السعر: من الأعلى' },
  { value: 'discount', label: 'أكبر خصم' },
];

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-3 flex-1 flex flex-col space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center gap-2">
          <Skeleton circle className="w-4 h-4" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, label: 'منتجات موثقة', desc: 'بائعون معتمدون' },
    { icon: Truck, label: 'توصيل سريع', desc: 'من موقع البائع' },
    { icon: RotateCcw, label: 'دعم مباشر', desc: 'تواصل مع البائع' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <b.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">{b.label}</div>
            <div className="text-xs text-muted">{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const { format, convert } = useCurrency();
  const { addItem, totalCount } = useCart();
  const { showToast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      if (priceRange.min) params.set('minPrice', priceRange.min);
      if (priceRange.max) params.set('maxPrice', priceRange.max);
      params.set('sort', sort);
      params.set('page', page.toString());

      const res = await fetch(`/api/marketplace?${params.toString()}`);
      if (!res.ok) throw new Error('فشل في جلب المنتجات');
      const data = await res.json();
      setListings(data.listings);
      setTotal(data.total);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, [search, category, city, sort, page, priceRange]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Sync sort from URL promo banners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSort = params.get('sort');
      if (urlSort && SORT_OPTIONS.some((o) => o.value === urlSort)) {
        setSort(urlSort);
      }
      const urlCategory = params.get('category');
      if (urlCategory) setCategory(urlCategory);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (city) count++;
    if (priceRange.min || priceRange.max) count++;
    if (sort !== 'newest') count++;
    return count;
  }, [category, city, priceRange, sort]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCity('');
    setSort('newest');
    setPriceRange({ min: '', max: '' });
    setActiveGroup(null);
    setPage(1);
  };

  const groupCategories = useMemo(() => {
    const group = CATEGORY_GROUPS.find((g) => g.id === activeGroup);
    return group ? group.categories : [];
  }, [activeGroup]);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Floating cart button */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary-dark transition hover:scale-105"
        aria-label="فتح السلة"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      <MarketplaceCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-slate-900 text-white py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              متجر Gateo المركزي
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              اكتشف منتجات مميزة من كل المجالات
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-base md:text-lg">
              آلاف المنتجات من بائعين موثقين، مع خيارات دفع آمنة وتوصيل مباشر.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Trust badges */}
        <TrustBadges />

        {/* Promo banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PROMO_BANNERS.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={promo.href}
                className={`group block relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.color} p-5 text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="relative z-10 flex flex-col h-full min-h-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <promo.icon className="w-5 h-5" />
                    <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">عروض</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                  <p className="text-sm text-white/90 mb-4 flex-1">{promo.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold">
                    {promo.cta}
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
                <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Search & filters bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث عن منتج، ماركة، أو قسم..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>

            <div className="relative min-w-[160px]">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className={`px-5 py-3 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                showFilters || activeFiltersCount > 0
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلتر
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
            >
              بحث
            </button>
          </form>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">المدينة</label>
                    <input
                      type="text"
                      placeholder="مثلاً: الرياض"
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setPage(1); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">السعر الأدنى</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceRange.min}
                      onChange={(e) => { setPriceRange((p) => ({ ...p, min: e.target.value })); setPage(1); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1.5">السعر الأقصى</label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={priceRange.max}
                      onChange={(e) => { setPriceRange((p) => ({ ...p, max: e.target.value })); setPage(1); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {category}
                <button onClick={() => { setCategory(''); setActiveGroup(null); setPage(1); }} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {city}
                <button onClick={() => { setCity(''); setPage(1); }} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                السعر: {priceRange.min || '0'} - {priceRange.max || '∞'}
                <button onClick={() => { setPriceRange({ min: '', max: '' }); setPage(1); }} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sort !== 'newest' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                <button onClick={() => { setSort('newest'); setPage(1); }} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-muted hover:text-primary font-medium underline underline-offset-4"
            >
              مسح الكل
            </button>
          </div>
        )}

        {/* Shein-style category horizontal nav */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
            <button
              onClick={() => { setActiveGroup(null); setCategory(''); setPage(1); }}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition min-w-[84px] ${
                activeGroup === null
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-foreground hover:border-primary/30'
              }`}
            >
              <span className="text-2xl">🏪</span>
              <span className="text-xs font-bold whitespace-nowrap">الكل</span>
            </button>
            {CATEGORY_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setActiveGroup(activeGroup === group.id ? null : group.id);
                  setCategory('');
                  setPage(1);
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition min-w-[84px] ${
                  activeGroup === group.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 bg-white text-foreground hover:border-primary/30'
                }`}
              >
                <span className="text-2xl">{group.icon}</span>
                <span className="text-xs font-bold whitespace-nowrap">{group.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-categories chips */}
          <AnimatePresence>
            {activeGroup && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  <button
                    onClick={() => { setCategory(''); setPage(1); }}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition ${
                      category === ''
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-foreground border-slate-200 hover:border-primary/30'
                    }`}
                  >
                    كل {CATEGORY_GROUPS.find((g) => g.id === activeGroup)?.label}
                  </button>
                  {groupCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setPage(1); }}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition ${
                        category === cat
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-foreground border-slate-200 hover:border-primary/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {category || activeGroup
              ? `نتائج ${category || CATEGORY_GROUPS.find((g) => g.id === activeGroup)?.label}`
              : 'منتجات مميزة'}
          </h2>
          <span className="text-sm text-muted">{total} منتج</span>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="لا توجد منتجات متاحة حالياً"
            description="جرّب البحث بكلمات مختلفة أو تصفح التصنيفات"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listings.map((listing, index) => {
                const discount = listing.product.comparePrice
                  ? Math.round(((listing.product.comparePrice - listing.product.price) / listing.product.comparePrice) * 100)
                  : 0;

                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.15) }}
                  >
                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all group h-full flex flex-col">
                      <Link href={`/marketplace/${listing.id}`}>
                        <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                          {listing.product.images && listing.product.images[0] ? (
                            <img
                              src={listing.product.images[0].url}
                              alt={listing.product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-10 h-10 text-slate-300" />
                            </div>
                          )}
                          {discount > 0 && (
                            <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                              -{discount}%
                            </span>
                          )}
                          <button
                            type="button"
                            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="إضافة للمفضلة"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </Link>
                      <div className="p-3 flex-1 flex flex-col">
                        <Link href={`/marketplace/${listing.id}`}>
                          <div className="text-[11px] text-muted mb-1 truncate">{listing.product.category || 'منتج'}</div>
                          <h3 className="font-bold text-foreground text-sm mb-2 line-clamp-2 leading-snug hover:text-primary transition-colors">{listing.product.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-primary font-bold text-sm">{format(convert(listing.product.price))}</span>
                            {listing.product.comparePrice && (
                              <span className="text-slate-400 text-xs line-through">
                                {format(convert(listing.product.comparePrice))}
                              </span>
                            )}
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              productId: listing.product.id,
                              businessId: listing.product.business.id,
                              businessName: listing.product.business.name,
                              businessSlug: listing.product.business.slug || listing.product.business.id,
                              name: listing.product.name,
                              price: listing.product.price,
                              image: listing.product.images?.[0]?.url || null,
                            });
                            showToast('تمت إضافة المنتج للسلة', 'success');
                          }}
                          className="mt-auto w-full py-2 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          أضف للسلة
                        </button>
                        <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-muted" />
                          <span className="text-xs text-foreground truncate flex-1">{listing.product.business.name}</span>
                          {listing.product.business.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        {listing.product.business.city && (
                          <div className="flex items-center gap-1 text-[11px] text-muted mt-1">
                            <MapPin className="w-3 h-3" />
                            {listing.product.business.city}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                aria-label="الصفحة السابقة"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-foreground font-bold">
                صفحة {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 24 >= total}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                aria-label="الصفحة التالية"
              >
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
