'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, Calendar, Home, ChevronDown } from 'lucide-react';
import { BusinessMobileMenu } from './BusinessMobileMenu';

interface NavItem {
  id: string;
  label: string;
  href: string;
  slug?: string | null;
}

interface BusinessHeaderProps {
  business: {
    id: string;
    name: string;
    slug?: string | null;
    logo?: string | null;
    websiteType: 'INTRO' | 'STORE';
  };
  pageSlug: string;
  navItems: NavItem[];
  cartCount?: number;
  onCartOpen?: () => void;
  transparent?: boolean;
}

export function BusinessHeader({
  business,
  pageSlug,
  navItems,
  cartCount = 0,
  onCartOpen,
  transparent = false,
}: BusinessHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const businessSlug = business.slug || business.id;
  const isStore = business.websiteType === 'STORE';

  const visibleItems = navItems.slice(0, 5);
  const moreItems = navItems.slice(5);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          transparent
            ? 'bg-transparent'
            : 'bg-[var(--theme-surface,var(--color-surface))]/95 backdrop-blur-md shadow-sm'
        }`}
        dir="rtl"
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href={`/business/${businessSlug}`} className="flex items-center gap-3 group">
              {business.logo ? (
                <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-[var(--theme-primary,var(--color-primary))]/20 group-hover:border-[var(--theme-primary,var(--color-primary))]/40 transition-colors">
                  <Image
                    src={business.logo}
                    alt={business.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[var(--theme-primary,var(--color-primary))]/10 flex items-center justify-center text-[var(--theme-primary,var(--color-primary))]">
                  <Home className="w-5 h-5" />
                </div>
              )}
              <span
                className={`font-bold text-base lg:text-lg leading-tight transition-opacity ${
                  transparent ? 'text-white' : 'text-[var(--theme-text,var(--color-foreground))]'
                }`}
              >
                {business.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {visibleItems.map((item) => {
                const isActive = item.slug === pageSlug || (item.slug === null && pageSlug === 'home');
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      transparent
                        ? isActive
                          ? 'text-white bg-white/20'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                        : isActive
                        ? 'text-[var(--theme-primary,var(--color-primary))] bg-[var(--theme-primary,var(--color-primary))]/10'
                        : 'text-muted hover:text-[var(--theme-text,var(--color-foreground))] hover:bg-black/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {moreItems.length > 0 && (
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen((v) => !v)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      transparent
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-muted hover:text-[var(--theme-text,var(--color-foreground))] hover:bg-black/5'
                    }`}
                  >
                    المزيد
                    <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {moreOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-[var(--theme-surface,var(--color-surface))] border border-border rounded-xl shadow-xl p-1.5 z-50">
                      {moreItems.map((item) => {
                        const isActive = item.slug === pageSlug || (item.slug === null && pageSlug === 'home');
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setMoreOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'text-[var(--theme-primary,var(--color-primary))] bg-[var(--theme-primary,var(--color-primary))]/10'
                                : 'text-[var(--theme-text,var(--color-foreground))] hover:bg-black/5'
                            }`}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isStore ? (
                <button
                  type="button"
                  onClick={onCartOpen}
                  className={`relative hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                    transparent
                      ? 'bg-white text-[var(--theme-primary,var(--color-primary))] hover:bg-white/90'
                      : 'bg-[var(--theme-primary,var(--color-primary))] text-white hover:brightness-105'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  السلة
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-[var(--theme-accent,var(--color-accent))] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[var(--theme-surface,var(--color-surface))]">
                      {cartCount}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={`/book/${business.id}`}
                  className={`hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                    transparent
                      ? 'bg-white text-[var(--theme-primary,var(--color-primary))] hover:bg-white/90'
                      : 'bg-[var(--theme-primary,var(--color-primary))] text-white hover:brightness-105'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  احجز موعد
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                className={`lg:hidden p-2.5 rounded-lg transition-colors ${
                  transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-[var(--theme-text,var(--color-foreground))] hover:bg-black/5'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <BusinessMobileMenu
        business={business}
        navItems={navItems}
        pageSlug={pageSlug}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onCartOpen={() => {
          setMobileMenuOpen(false);
          onCartOpen?.();
        }}
      />
    </>
  );
}
