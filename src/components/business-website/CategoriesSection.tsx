'use client';

import Link from 'next/link';
import { Tag } from 'lucide-react';
import { businessSlug } from '@/lib/utils';

interface CategoriesSectionProps {
  business: {
    id: string;
    slug?: string | null;
    websiteType: 'INTRO' | 'STORE';
  };
  categories: string[];
}

export function CategoriesSection({ business, categories }: CategoriesSectionProps) {
  if (!categories || categories.length === 0) return null;
  const slug = businessSlug(business);

  return (
    <section className="container-narrow section-padding" dir="rtl">
      <div className="text-center mb-10">
        <h2 className="section-title flex items-center justify-center gap-2">
          <Tag className="w-6 h-6 text-[var(--theme-primary,var(--color-primary))]" />
          التصنيفات
        </h2>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={business.websiteType === 'STORE' ? `/business/${slug}/shop?category=${encodeURIComponent(cat)}` : `/business/${slug}/shop`}
            className="px-6 py-3 rounded-full text-sm font-semibold transition-all bg-[var(--theme-background,var(--color-background))] text-[var(--theme-text,var(--color-foreground))] border border-border hover:border-[var(--theme-primary,var(--color-primary))] hover:text-[var(--theme-primary,var(--color-primary))]"
          >
            {cat}
          </Link>
        ))}
      </div>
    </section>
  );
}
