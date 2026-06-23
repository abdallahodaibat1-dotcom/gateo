'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Loader2,
  Home,
  Phone,
  MapPin,
  Calendar,
  Menu,
  X,
  ShoppingBag,
  Tag,
  ShoppingCart,
  Mail,
  Clock,
  Images,
} from 'lucide-react';
import { BusinessThemeProvider } from '@/components/business-website/BusinessThemeProvider';
import { CartDrawer } from '@/components/business-website/CartDrawer';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { PortoShop1Template } from '@/components/business-website/PortoShop1Template';
import { FlatsomeTemplate } from '@/components/business-website/FlatsomeTemplate';
import { ElessiTemplate } from '@/components/business-website/ElessiTemplate';
import { GrandRestaurantTemplate } from '@/components/business-website/GrandRestaurantTemplate';
import { HouzezTemplate } from '@/components/business-website/HouzezTemplate';
import { JacquelineTemplate } from '@/components/business-website/JacquelineTemplate';
import { OhioTemplate } from '@/components/business-website/OhioTemplate';
import {
  AboutPageTemplate,
  ContactPageTemplate,
  FaqPageTemplate,
  TermsPageTemplate,
  PrivacyPageTemplate,
  CustomPageTemplate,
  ShopPageTemplate,
  OffersPageTemplate,
  CartPageTemplate,
  WishlistPageTemplate,
  AccountPageTemplate,
  CheckoutPageTemplate,
} from '@/components/business-website/pages';

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
  pages: { id: string; slug: string; title: string; isHomePage: boolean; pageTemplate: string }[];
  products?: Product[];
  posts?: { id: string; title: string; content?: string | null; image?: string | null; createdAt: string }[];
  cover?: string | null;
  address?: string | null;
  images?: { url: string; type?: string; caption?: string }[] | null;
  workingHours?: { day: string; open: string; close: string }[] | Record<string, string> | string | null;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  pageTemplate: string;
  content: string | null;
  sections?: any;
  isHomePage: boolean;
}

function normalizeWorkingHours(value: Business['workingHours']) {
  if (!value) return [] as { day: string; open: string; close: string }[];
  if (Array.isArray(value)) return value as { day: string; open: string; close: string }[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as { day: string; open: string; close: string }[]) : [];
    } catch {
      return [] as { day: string; open: string; close: string }[];
    }
  }
  return [] as { day: string; open: string; close: string }[];
}

function renderPageTemplate({ business, page }: { business: Business; page: PageData }) {
  const templateProps = {
    business,
    page: { ...page, sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections },
    products: business.products || [],
  };

  switch (page.pageTemplate) {
    case 'SHOP':
      return <ShopPageTemplate {...templateProps} />;
    case 'OFFERS':
      return <OffersPageTemplate {...templateProps} />;
    case 'ABOUT':
      return <AboutPageTemplate business={business} page={templateProps.page} />;
    case 'CONTACT':
      return <ContactPageTemplate business={business} page={templateProps.page} />;
    case 'FAQ':
      return <FaqPageTemplate business={business} page={templateProps.page} />;
    case 'TERMS':
      return <TermsPageTemplate business={business} page={templateProps.page} />;
    case 'PRIVACY':
      return <PrivacyPageTemplate business={business} page={templateProps.page} />;
    case 'CART':
      return <CartPageTemplate business={business} page={templateProps.page} />;
    case 'WISHLIST':
      return <WishlistPageTemplate {...templateProps} />;
    case 'ACCOUNT':
      return <AccountPageTemplate business={business} page={templateProps.page} />;
    case 'CHECKOUT':
      return <CheckoutPageTemplate business={business} page={templateProps.page} />;
    case 'CUSTOM':
    default:
      return <CustomPageTemplate business={business} page={templateProps.page} />;
  }
}

function StoreHome({ business, pageSlug }: { business: Business; pageSlug: string }) {
  const { format, convert } = useCurrency();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const products = business.products || [];
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  switch (business.theme?.homeTemplate) {
    case 'porto-shop1':
      return <PortoShop1Template business={business} />;
    case 'flatsome':
      return <FlatsomeTemplate business={business} />;
    case 'elessi':
      return <ElessiTemplate business={business} />;
    case 'grand-restaurant':
      return <GrandRestaurantTemplate business={business} />;
    case 'houzez':
      return <HouzezTemplate business={business} />;
    case 'jacqueline':
      return <JacquelineTemplate business={business} />;
    case 'ohio':
      return <OhioTemplate business={business} />;
    default:
      break;
  }

  const workingHours = normalizeWorkingHours(business.workingHours);
  const galleryImages =
    business.images?.filter((img) => !img.type || img.type === 'gallery').map((img) => img.url) || [];

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-16 md:py-24 px-4 sm:px-6 overflow-hidden"
        style={
          business.cover
            ? {
                backgroundImage: `url(${business.cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {
                background: `linear-gradient(135deg, ${business.theme?.primaryColor || '#7c3aed'}, ${business.theme?.secondaryColor || '#ec4899'})`,
              }
        }
      >
        <div
          className="absolute inset-0"
          style={{
            background: business.cover
              ? `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.35))`
              : undefined,
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          {business.logo && (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={business.logo}
              alt={business.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white/30 shadow-lg mx-auto mb-4"
            />
          )}
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
              className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-6"
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
            {(business.city || business.address) && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 text-white text-sm">
                <MapPin className="w-4 h-4" /> {[business.city, business.address].filter(Boolean).join(' - ')}
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

          {business.websiteType === 'STORE' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 flex-wrap mt-6"
            >
              <Link
                href={`/business/${business.slug || business.id}/shop`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-foreground font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                تسوق الآن
              </Link>
              <Link
                href={`/business/${business.slug || business.id}/offers`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white font-bold text-sm hover:bg-white/30 transition-colors"
              >
                <Tag className="w-4 h-4" />
                العروض
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <main className="py-12 min-h-screen bg-[var(--theme-background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Contact & Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {business.phone && (
              <a
                href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--theme-surface)] border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">الهاتف</p>
                  <p className="text-sm font-bold text-foreground truncate">{business.phone}</p>
                </div>
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--theme-surface)] border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: 'var(--theme-secondary)' }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">البريد الإلكتروني</p>
                  <p className="text-sm font-bold text-foreground truncate">{business.email}</p>
                </div>
              </a>
            )}
            {(business.city || business.address) && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--theme-surface)] border border-border shadow-sm">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">العنوان</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {[business.city, business.address].filter(Boolean).join(' - ')}
                  </p>
                </div>
              </div>
            )}
            {workingHours.length > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--theme-surface)] border border-border shadow-sm">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">أوقات العمل</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {workingHours[0].day}: {workingHours[0].open} - {workingHours[0].close}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Working Hours Table */}
          {workingHours.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[var(--theme-surface)] rounded-xl border border-border shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                أوقات العمل
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {workingHours.map((wh) => (
                  <div
                    key={wh.day}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--theme-background)] border border-border"
                  >
                    <span className="font-medium text-foreground">{wh.day}</span>
                    <span className="text-sm text-muted">
                      {wh.open} - {wh.close}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.15 }}
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
                  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
                  const image = product.images?.[0]?.url;
                  const businessSlug = business.slug || business.id;
                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -4 }}
                      className="bg-[var(--theme-surface)] rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                      style={{ borderRadius: business.theme?.borderRadius || '1rem' }}
                    >
                      <Link href={`/business/${businessSlug}/product/${product.id}`} className="block aspect-[4/3] bg-slate-100 relative overflow-hidden">
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
                      </Link>
                      <div className="p-4 flex-1 flex flex-col min-h-[140px]">
                        {product.category && (
                          <span className="text-[10px] text-muted mb-1">{product.category}</span>
                        )}
                        <Link href={`/business/${businessSlug}/product/${product.id}`}>
                          <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                        </Link>
                        {product.description ? (
                          <p className="text-xs text-muted line-clamp-2 mb-2 flex-1">{product.description}</p>
                        ) : (
                          <div className="flex-1" />
                        )}
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-lg font-bold" style={{ color: 'var(--theme-primary)' }}>
                            {format(convert(price))}
                          </span>
                          {comparePrice > price && (
                            <span className="text-sm text-muted line-through">
                              {format(convert(comparePrice))}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            addItem({
                              productId: product.id,
                              businessId: business.id,
                              businessName: business.name,
                              businessSlug: business.slug,
                              name: product.name,
                              price,
                              image: image || null,
                            });
                            showToast('تمت إضافة المنتج للسلة', 'success');
                          }}
                          className="mt-3 w-full py-2 rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
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

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Images className="w-5 h-5 text-primary" />
                معرض الصور
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((url, idx) => (
                  <motion.div
                    key={`${url}-${idx}`}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-slate-100"
                    style={{ borderRadius: business.theme?.borderRadius || '1rem' }}
                  >
                    <img src={url} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
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
  const [cartOpen, setCartOpen] = useState(false);
  const { totalCount } = useCart();

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

  useEffect(() => {
    if (business && page) {
      document.title = `${business.name} | ${page.title}`;
    }
  }, [business, page]);

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

  const fullPageTemplates = ['porto-shop1', 'flatsome', 'elessi', 'grand-restaurant', 'houzez', 'jacqueline', 'ohio'];
  const useTemplateShell =
    fullPageTemplates.includes(business.theme?.homeTemplate || '') &&
    business.websiteType === 'STORE' &&
    page.isHomePage;

  return (
    <BusinessThemeProvider theme={business.theme}>
      {!useTemplateShell && (
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
                    onClick={() => setCartOpen(true)}
                    className="relative hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    السلة
                    {totalCount > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-[var(--theme-accent)] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[var(--theme-primary)]">
                        {totalCount}
                      </span>
                    )}
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
      )}

      {business.websiteType === 'STORE' && page.isHomePage ? (
        <StoreHome business={business} pageSlug={pageSlug} />
      ) : (
        <main className="pt-24 pb-16 min-h-screen bg-[var(--theme-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {renderPageTemplate({ business, page })}
          </div>
        </main>
      )}

      {!useTemplateShell && (
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
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </BusinessThemeProvider>
  );
}
