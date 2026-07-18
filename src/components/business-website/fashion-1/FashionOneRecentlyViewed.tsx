'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { FashionOneProductCard } from './FashionOneProductCard';
import { useRecentlyViewed } from '@/components/RecentlyViewedProvider';
import type { TemplateBusiness } from '@/components/business-website/template-types';
import styles from './fashion-one.module.css';

interface RecentlyViewedProps {
  business: TemplateBusiness;
  excludeProductId?: string;
}

export function FashionOneRecentlyViewed({ business, excludeProductId }: RecentlyViewedProps) {
  const { items } = useRecentlyViewed();
  const slug = business.slug || business.id;

  const products = useMemo(() => {
    const lookup = new Map((business.products || []).map((p) => [p.id, p]));
    return items
      .filter((i) => i.businessId === business.id && i.productId !== excludeProductId)
      .map((i) => lookup.get(i.productId))
      .filter(Boolean)
      .slice(0, 4);
  }, [items, business.products, business.id, excludeProductId]);

  if (products.length === 0) return null;

  return (
    <section className={styles['recently-viewed']}>
      <div className={styles['container']}>
        <div className={styles['section-head-simple']}>
          <h2 className={styles['section-title-simple']}>
            Recently <em>Viewed</em>
          </h2>
          <p className={styles['section-sub-simple']}>شاهدتِها مؤخراً وقد يعجبكِ أيضاً</p>
        </div>
        <div className={styles['recently-grid']}>
          {products.map((p) => (
            <FashionOneProductCard key={p!.id} product={p!} business={business} />
          ))}
        </div>
      </div>
    </section>
  );
}
