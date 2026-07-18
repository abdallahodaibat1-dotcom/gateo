'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Calendar, Home } from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  id: string;
  label: string;
  href: string;
  slug?: string | null;
}

interface BusinessMobileMenuProps {
  business: {
    id: string;
    name: string;
    slug?: string | null;
    logo?: string | null;
    websiteType: 'INTRO' | 'STORE';
  };
  navItems: NavItem[];
  pageSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onCartOpen?: () => void;
}

export function BusinessMobileMenu({
  business,
  navItems,
  pageSlug,
  isOpen,
  onClose,
  onCartOpen,
}: BusinessMobileMenuProps) {
  const businessSlug = business.slug || business.id;
  const isStore = business.websiteType === 'STORE';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[70] bg-[var(--theme-surface,var(--color-surface))] shadow-xl lg:hidden"
            dir="rtl"
          >
            <div className="container-wide">
              <div className="flex items-center justify-between h-16 border-b border-border">
                <Link href={`/business/${businessSlug}`} className="flex items-center gap-3" onClick={onClose}>
                  {business.logo ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border">
                      <Image src={business.logo} alt={business.name} fill className="object-cover" sizes="36px" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--theme-primary,var(--color-primary))]/10 flex items-center justify-center text-[var(--theme-primary,var(--color-primary))]">
                      <Home className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-bold text-[var(--theme-text,var(--color-foreground))]">{business.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق القائمة"
                  className="p-2 rounded-lg text-muted hover:bg-black/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = item.slug === pageSlug || (item.slug === null && pageSlug === 'home');
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-[var(--theme-primary,var(--color-primary))] bg-[var(--theme-primary,var(--color-primary))]/10'
                          : 'text-[var(--theme-text,var(--color-foreground))] hover:bg-black/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pb-5 pt-2">
                {isStore ? (
                  <button
                    type="button"
                    onClick={onCartOpen}
                    className="w-full py-3 rounded-xl bg-[var(--theme-primary,var(--color-primary))] text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    عرض السلة
                  </button>
                ) : (
                  <Link
                    href={`/book/${business.id}`}
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-[var(--theme-primary,var(--color-primary))] text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    احجز موعد
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
