'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Loader2,
  ArrowRight,
  Home,
  Phone,
  MapPin,
  Calendar,
  Menu,
  X,
  ShoppingBag,
  Tag,
  ShoppingCart,
} from 'lucide-react';
import { BusinessThemeProvider } from '@/components/business-website/BusinessThemeProvider';
import { PortoShop1Template } from '@/components/business-website/PortoShop1Template';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  quantity: number;
  images: { url: string; alt?: string }[] | null;
  category: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  websiteType: 'INTRO' | 'STORE';
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
    heroLayout: string;
    navbarStyle: string;
    homeTemplate?: string;
    isPublished: boolean;
  } | null;
  pages: { id: string; slug: string; title: string; isHomePage: boolean }[];
  products?: Product[];
  posts?: { id: string; title: string; content?: string | null; image?: string | null; createdAt: string }[];
  cover?: string | null;
  address?: string | null;
  workingHours?: Record<string, string> | string | null;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  isHomePage: boolean;
}

function StoreHome({ business, pageSlug }: { business: Business; pageSlug: string }) {
  const { format, convert } = useCurrency();
  const products = business.products || [];
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  if (business.theme?.homeTemplate === 'porto-shop1') {
    return <PortoShop1Template business={business} />;
  }

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-16 md:py-24 px-4 sm:px-6"
        style={{
          background: `linear-gradient(135deg, ${business.theme?.primaryColor || '#7c3aed'}, ${business.theme?.secondaryColor || '#ec4899'})`,
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            {business.name}
          </motion.h1>
          {business.description && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-6"
            >
              {business.description}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            {business.city && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 text-white text-sm">
                <MapPin className="w-4 h-4" /> {business.city}
              </span>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 text-white text-sm hover:bg-white/30 transition-colors"
              >
                <Phone className="w-4 h-4" /> {business.phone}
              </a>
            )}
          </motion.div>
        </div>
      </section>

      <main className="py-12 min-h-screen bg-[var(--theme-background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Categories */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                التصنيفات
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                      color: 'var(--theme-secondary)',
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              المنتجات
            </h2>

            {products.length === 0 ? (
              <div className="bg-[var(--theme-surface)] rounded-lg border border-border p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted">لا توجد منتجات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => {
                  const price = Number(product.price) || 0;
                  const comparePrice = product.comparePrice ? Number(product.comparePrice) : 0;
                  const discount = comparePrice > 0 ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
                  const image = product.images?.[0]?.url;
                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -4 }}
                      className="bg-[var(--theme-surface)] rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                      style={{ borderRadius: business.theme?.borderRadius || '1rem' }}
                    >
                      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                        {image ? (
                          <img src={image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                        {discount > 0 && (
                          <span
                            className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full text-white"
                            style={{ backgroundColor: 'var(--theme-accent)' }}
                          >
                            خصم {discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col min-h-[140px]">
                        {product.category && (
                          <span className="text-[10px] text-muted mb-1">{product.category}</span>
                        )}
                        <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-2">{product.name}</h3>
                        {product.description ? (
                          <p className="text-xs text-muted line-clamp-2 mb-2 flex-1">{product.description}</p>
                        ) : (
                          <div className="flex-1" />
                        )}
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-lg font-bold" style={{ color: 'var(--theme-primary)' }}>
                            {format(convert(price))}
                          </span>
                          {comparePrice > 0 && (
                            <span className="text-sm text-muted line-through">
                              {format(convert(comparePrice))}
                            </span>
                          )}
                        </div>
                        <button
                          className="mt-3 w-full py-2 rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2"
                          style={{ backgroundColor: 'var(--theme-primary)' }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          أضف للسلة
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}

export default function BusinessCustomPage() {
  const { id, pageSlug } = useParams<{ id: string; pageSlug: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [businessRes, pageRes] = await Promise.all([
        fetch(`/api/businesses/${id}`),
        fetch(`/api/businesses/${id}/pages/by-slug/${pageSlug}`),
      ]);

      if (!businessRes.ok || !pageRes.ok) {
        router.push(`/business/${id}`);
        return;
      }

      const businessData = await businessRes.json();
      const pageData = await pageRes.json();

      setBusiness(businessData.business);
      setPage(pageData.page);
    } catch (e) {
      console.error(e);
      router.push(`/business/${id}`);
    } finally {
      setLoading(false);
    }
  }, [id, pageSlug, router]);

  useEffect(() => {
    if (!id || !pageSlug) return;
    fetchData();
  }, [id, pageSlug, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--theme-primary)]" />
      </div>
    );
  }

  if (!business || !page) return null;

  const navItems = [
    { id: 'home', label: 'الرئيسية', href: `/business/${business.slug || business.id}`, slug: null },
    ...(business.pages || [])
      .filter((p) => !p.isHomePage)
      .map((p) => ({
        id: `page-${p.slug}`,
        label: p.title,
        href: `/business/${business.slug || business.id}/${p.slug}`,
        slug: p.slug,
      })),
  ];

  return (
    <BusinessThemeProvider theme={business.theme}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--theme-primary)]/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href={`/business/${business.slug || business.id}`}>
                {business.logo ? (
                  <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                )}
              </Link>
              <Link href={`/business/${business.slug || business.id}`}>
                <h1 className="text-white font-bold text-lg leading-tight hover:opacity-80 transition-opacity">
                  {business.name}
                </h1>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    item.slug === pageSlug
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {business.websiteType === 'STORE' ? (
                <button
                  type="button"
                  className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  السلة
                </button>
              ) : (
                <Link
                  href={`/book/${business.id}`}
                  className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  احجز موعد
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--theme-primary)] border-t border-white/10 overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block w-full text-right px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {business.websiteType === 'STORE' && page.isHomePage ? (
        <StoreHome business={business} pageSlug={pageSlug} />
      ) : (
        <main className="pt-24 pb-16 min-h-screen bg-[var(--theme-background)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--theme-surface)] rounded-lg border border-border shadow-sm p-8 md:p-12"
              style={{ borderRadius: business.theme?.borderRadius || '1rem' }}
            >
              <Link
                href={`/business/${business.slug || business.id}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark mb-6"
              >
                <ArrowRight className="w-4 h-4" />
                العودة للرئيسية
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{page.title}</h1>
              <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                {page.content || 'لا يوجد محتوى لهذه الصفحة بعد.'}
              </div>
            </motion.div>
          </div>
        </main>
      )}

      <footer className="bg-[var(--theme-primary)] text-white/80 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">{business.name}</h4>
              <p className="text-sm text-white/70 leading-relaxed">
                {business.description ? business.description.slice(0, 120) + '...' : ''}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-sm">
                {business.phone && <p>{business.phone}</p>}
                {business.email && <p>{business.email}</p>}
                {business.city && <p>{business.city}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-sm text-white/50">
            © {new Date().getFullYear()} {business.name}. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </BusinessThemeProvider>
  );
}
