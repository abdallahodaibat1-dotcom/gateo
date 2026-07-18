'use client';

import { useState } from 'react';
import { BusinessThemeProvider } from './BusinessThemeProvider';
import { BusinessHeader } from './BusinessHeader';
import { BusinessFooter } from './BusinessFooter';
import { CartDrawer } from './CartDrawer';
import { useCart } from '@/components/CartProvider';

interface NavItem {
  id: string;
  label: string;
  href: string;
  slug?: string | null;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  isHomePage: boolean;
}

interface Business {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  websiteType: 'INTRO' | 'STORE';
  theme?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    backgroundColor?: string | null;
    surfaceColor?: string | null;
    textColor?: string | null;
    fontFamily?: string | null;
    borderRadius?: string | null;
    homeTemplate?: string | null;
  } | null;
  pages?: PageData[];
}

interface BusinessWebsiteLayoutProps {
  business: Business;
  page: PageData;
  children: React.ReactNode;
  transparentHeader?: boolean;
  showFooter?: boolean;
}

export function BusinessWebsiteLayout({
  business,
  page,
  children,
  transparentHeader = false,
  showFooter = true,
}: BusinessWebsiteLayoutProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalCount } = useCart();

  const navItems: NavItem[] = [
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
      <div className="min-h-screen flex flex-col bg-[var(--theme-background,var(--color-background))]">
        <BusinessHeader
          business={business}
          pageSlug={page.slug}
          navItems={navItems}
          cartCount={totalCount}
          onCartOpen={() => setCartOpen(true)}
          transparent={transparentHeader}
        />

        <div className="flex-1">{children}</div>

        {showFooter && <BusinessFooter business={business} navItems={navItems} />}

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </BusinessThemeProvider>
  );
}
