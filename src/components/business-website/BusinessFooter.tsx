'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface BusinessFooterProps {
  business: {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    city?: string | null;
    address?: string | null;
  };
  navItems: NavItem[];
}

export function BusinessFooter({ business, navItems }: BusinessFooterProps) {
  const businessSlug = business.slug || business.id;
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[var(--theme-primary,var(--color-primary))] text-white/80"
      dir="rtl"
    >
      <div className="container-wide py-14 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* About */}
          <div>
            <h4 className="text-white font-bold text-lg mb-5">{business.name}</h4>
            <p className="text-sm text-white/70 leading-relaxed">
              {business.description
                ? business.description.slice(0, 160) + (business.description.length > 160 ? '...' : '')
                : 'نحن هنا لنقدم لك أفضل الخدمات بأعلى معايير الجودة.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-5">روابط سريعة</h4>
            <ul className="space-y-3">
              {navItems.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white transition-colors inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-5">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              {business.phone && (
                <li>
                  <a
                    href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {business.phone}
                  </a>
                </li>
              )}
              {business.email && (
                <li>
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {business.email}
                  </a>
                </li>
              )}
              {(business.city || business.address) && (
                <li>
                  <span className="flex items-center gap-2 text-white/70">
                    <MapPin className="w-4 h-4" />
                    {[business.city, business.address].filter(Boolean).join(' - ')}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide py-5">
          <p className="text-center text-sm text-white/50">
            © {currentYear} {business.name}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
