'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { businessSlug } from '@/lib/utils';

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

interface ProductGridProps {
  business: {
    id: string;
    name: string;
    slug?: string | null;
  };
  products: Product[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function ProductGrid({
  business,
  products,
  title = 'المنتجات',
  subtitle,
  showViewAll = true,
}: ProductGridProps) {
  const slug = businessSlug(business);

  return (
    <section className="container-narrow section-padding" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
          <h2 className="section-title mb-0 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[var(--theme-primary,var(--color-primary))]" />
            {title}
          </h2>
        </div>
        {showViewAll && (
          <Link
            href={`/business/${slug}/shop`}
            className="link-underline text-sm font-semibold text-[var(--theme-primary,var(--color-primary))]"
          >
            عرض جميع المنتجات
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="theme-card p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">لا توجد منتجات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                comparePrice: product.comparePrice ?? undefined,
                description: product.description ?? undefined,
                images: product.images ?? undefined,
                category: product.category ?? undefined,
              }}
              businessId={business.id}
              businessName={business.name}
              businessSlug={slug}
            />
          ))}
        </div>
      )}
    </section>
  );
}
