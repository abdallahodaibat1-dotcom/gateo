'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { arabicDayName } from '@/lib/utils';
import { BusinessThemeProvider } from '@/components/business-website/BusinessThemeProvider';
import { BusinessWebsiteLayout } from '@/components/business-website/BusinessWebsiteLayout';
import { StoreHero } from '@/components/business-website/StoreHero';
import { ContactInfoCards } from '@/components/business-website/ContactInfoCards';
import { ServicesSection } from '@/components/business-website/ServicesSection';
import { ProductGrid } from '@/components/business-website/ProductGrid';
import { CategoriesSection } from '@/components/business-website/CategoriesSection';
import { GallerySection } from '@/components/business-website/GallerySection';
import { WorkingHoursSection } from '@/components/business-website/WorkingHoursSection';
import { PromoSection } from '@/components/business-website/PromoSection';
import { BusinessServicesSection } from '@/components/business-website/BusinessServicesSection';

const AboutPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.AboutPageTemplate));
const ContactPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.ContactPageTemplate));
const FaqPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.FaqPageTemplate));
const TermsPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.TermsPageTemplate));
const PrivacyPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.PrivacyPageTemplate));
const CustomPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.CustomPageTemplate));
const ShopPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.ShopPageTemplate));
const OffersPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.OffersPageTemplate));
const CartPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.CartPageTemplate));
const WishlistPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.WishlistPageTemplate));
const AccountPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.AccountPageTemplate));
const CheckoutPageTemplate = dynamic(() => import('@/components/business-website/pages').then((m) => m.CheckoutPageTemplate));

const EnfoldSpaTemplate = dynamic(() => import('@/components/business-website/EnfoldSpaTemplate').then((m) => m.EnfoldSpaTemplate));
const BeautySalonTemplate = dynamic(() => import('@/components/business-website/BeautySalonTemplate').then((m) => m.BeautySalonTemplate));
const ModernIntroTemplate = dynamic(() => import('@/components/business-website/ModernIntroTemplate').then((m) => m.ModernIntroTemplate));
const FashionOneHome = dynamic(() => import('@/components/business-website/fashion-1/FashionOneHome').then((m) => m.FashionOneHome));
const FashionOneShop = dynamic(() => import('@/components/business-website/fashion-1/FashionOneShop').then((m) => m.FashionOneShop));
const FashionOneLayout = dynamic(() => import('@/components/business-website/fashion-1/FashionOneLayout').then((m) => m.FashionOneLayout));

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
  services?: { id: string; name: string; description: string | null; price: number | string | null; duration: number | null; image: string | null }[];
  products?: Product[];
  posts?: { id: string; title: string; content?: string | null; image?: string | null; createdAt: string }[];
  cover?: string | null;
  address?: string | null;
  images?: { url: string; type?: string; caption?: string }[] | null;
  workingHours?: { day: string; open: string; close: string }[] | Record<string, string> | string | null;
  assets?: { type: string; url: string; role?: string | null; altText?: string | null }[];
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

interface WorkingHourEntry {
  day: string;
  open: string;
  close: string;
}

function isWorkingHourEntry(entry: unknown): entry is { open: unknown; close: unknown } {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'open' in entry &&
    'close' in entry
  );
}

function normalizeWorkingHours(value: Business['workingHours']): WorkingHourEntry[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as WorkingHourEntry[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return normalizeWorkingHours(parsed);
    } catch {
      return [];
    }
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).map(([day, entry]) => {
      const arabicDay = arabicDayName(day);
      if (isWorkingHourEntry(entry)) {
        return { day: arabicDay, open: String(entry.open), close: String(entry.close) };
      }
      if (typeof entry === 'string') {
        const [open, close] = entry.split(/[-–]/);
        return { day: arabicDay, open: open?.trim() || '', close: close?.trim() || '' };
      }
      return { day: arabicDay, open: '', close: '' };
    });
  }
  return [];
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

function splitDescriptionIntoServices(description: string | null | undefined) {
  if (!description) return [];
  const sentences = description
    .split(/[\.\.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  if (sentences.length === 0) return [];
  const titles = ['من نحن', 'رسالتنا', 'خدماتنا'];
  return sentences.slice(0, 3).map((sentence, idx) => ({
    title: titles[idx] || `خدمة ${idx + 1}`,
    description: sentence,
  }));
}

function DefaultStoreHome({ business }: { business: Business }) {
  const products = business.products || [];
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  const workingHours = normalizeWorkingHours(business.workingHours);
  const galleryImages =
    business.images?.filter((img) => !img.type || img.type === 'gallery').map((img) => img.url) || [];

  const businessServices = business.services || [];

  const productServices = categories.slice(0, 6).map((cat) => ({
    title: cat,
    description: `تصفح تشكيلة ${cat} المميزة من ${business.name}`,
  }));

  const fallbackServices =
    productServices.length > 0
      ? productServices
      : splitDescriptionIntoServices(business.description);

  return (
    <>
      <StoreHero business={business} />
      <ContactInfoCards business={{ ...business, workingHours }} />
      {businessServices.length > 0 ? (
        <BusinessServicesSection
          title="خدماتنا"
          subtitle="ما نقدمه لكم"
          services={businessServices}
        />
      ) : fallbackServices.length > 0 ? (
        <ServicesSection
          title="ما نقدمه"
          subtitle="خدماتنا المميزة"
          services={fallbackServices}
        />
      ) : null}
      <PromoSection business={business} />
      {business.websiteType === 'STORE' && (
        <ProductGrid
          business={business}
          products={products.slice(0, 8)}
          title="منتجاتنا"
          subtitle="اختر من أجود المنتجات"
        />
      )}
      {categories.length > 0 && <CategoriesSection business={business} categories={categories} />}
      <GallerySection images={galleryImages} />
      {workingHours.length > 0 && <WorkingHoursSection workingHours={workingHours} />}
    </>
  );
}

export default function BusinessCustomPage() {
  const { id, pageSlug } = useParams<{ id: string; pageSlug: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

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
      <BusinessThemeProvider theme={null}>
        <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background,var(--color-background))]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--theme-primary,var(--color-primary))] mx-auto mb-4" />
            <p className="text-muted text-sm">جارٍ تحميل {id}/{pageSlug}</p>
          </div>
        </div>
      </BusinessThemeProvider>
    );
  }

  if (!business || !page) return null;

  const fullPageTemplates = ['enfold-spa', 'beauty-salon-1', 'fashion-1', 'modern-intro'];
  const isBeautyIntroTemplate =
    (business.theme?.homeTemplate === 'enfold-spa' || business.theme?.homeTemplate === 'beauty-salon-1') &&
    business.websiteType === 'INTRO';
  const isModernIntroTemplate = business.theme?.homeTemplate === 'modern-intro' && business.websiteType === 'INTRO';
  const isFashionStoreTemplate = business.theme?.homeTemplate === 'fashion-1' && business.websiteType === 'STORE';
  const useTemplateShell =
    fullPageTemplates.includes(business.theme?.homeTemplate || '') &&
    ((business.websiteType === 'STORE' && page.isHomePage) || isBeautyIntroTemplate || isModernIntroTemplate || isFashionStoreTemplate);

  if (useTemplateShell) {
    return (
      <BusinessThemeProvider theme={business.theme}>
        {business.websiteType === 'STORE' && page.isHomePage ? (
          <FullPageTemplate business={business} />
        ) : isFashionStoreTemplate && page.slug === 'shop' ? (
          <FashionOneShop business={business} />
        ) : isFashionStoreTemplate ? (
          <FashionOneLayout business={business}>
            {renderPageTemplate({ business, page })}
          </FashionOneLayout>
        ) : business.theme?.homeTemplate === 'beauty-salon-1' ? (
          <BeautySalonTemplate business={business} />
        ) : business.theme?.homeTemplate === 'modern-intro' ? (
          <ModernIntroTemplate business={business} />
        ) : (
          <EnfoldSpaTemplate business={business} page={page} />
        )}
      </BusinessThemeProvider>
    );
  }

  return (
    <BusinessWebsiteLayout business={business} page={page}>
      {page.isHomePage ? (
        <DefaultStoreHome business={business} />
      ) : (
        <main className="pt-24 lg:pt-28 pb-16 min-h-screen">
          <div className="container-wide">
            {renderPageTemplate({ business, page })}
          </div>
        </main>
      )}
    </BusinessWebsiteLayout>
  );
}

function FullPageTemplate({ business }: { business: Business }) {
  switch (business.theme?.homeTemplate) {
    case 'enfold-spa':
      return <EnfoldSpaTemplate business={business} />;
    case 'beauty-salon-1':
      return <BeautySalonTemplate business={business} />;
    case 'fashion-1':
      return <FashionOneHome business={business} />;
    case 'modern-intro':
      return <ModernIntroTemplate business={business} />;
    default:
      return null;
  }
}
