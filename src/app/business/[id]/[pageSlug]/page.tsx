'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  Home,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { BusinessThemeProvider } from '@/components/business-website/BusinessThemeProvider';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
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
    isPublished: boolean;
  } | null;
  pages: { id: string; slug: string; title: string; isHomePage: boolean }[];
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string | null;
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
              <Link
                href={`/book/${business.id}`}
                className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Calendar className="w-4 h-4" />
                احجز موعد
              </Link>
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
