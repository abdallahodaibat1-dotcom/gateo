'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ChevronLeft, LayoutGrid, List } from 'lucide-react';
import { FashionOneLayout } from './FashionOneLayout';
import { FashionOneProductCard } from './FashionOneProductCard';
import { useCurrency } from '@/hooks/useCurrency';
import type { TemplateBusiness } from '@/components/business-website/template-types';
import { getSectionSettings, getSetting } from '../section-settings';
import { FASHION_ONE_DEFAULTS } from '@/lib/fashion-one-content';
import styles from './fashion-one.module.css';

interface FashionOneShopProps {
  business: TemplateBusiness;
}

const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colorsList = [
  { name: 'أبيض', hex: '#fff' },
  { name: 'عاجي', hex: '#f8f5ed' },
  { name: 'شامبانيا', hex: '#f0e0d0' },
  { name: 'وردي', hex: '#e8d4d0' },
  { name: 'أحمر', hex: '#c41e3a' },
  { name: 'أسود', hex: '#000' },
  { name: 'أزرق ملكي', hex: '#1e3a8a' },
  { name: 'ذهبي', hex: '#c9a96e' },
];

export function FashionOneShop({ business }: FashionOneShopProps) {
  const searchParams = useSearchParams();
  const { format } = useCurrency();
  const slug = business.slug || business.id;
  const products = useMemo(() => business.products || [], [business.products]);

  const preselectedCategory = searchParams.get('cat') || 'all';

  const maxProductPrice = useMemo(() => {
    return products.reduce((max, p) => Math.max(max, p.price, p.comparePrice || 0), 3000);
  }, [products]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([preselectedCategory]);
  const [selectedServices, setSelectedServices] = useState<string[]>(['all']);
  const [priceMax, setPriceMax] = useState<number>(maxProductPrice);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sort, setSort] = useState<string>('default');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState<number>(1);
  const perPage = getSetting<number>(getSectionSettings(business, 'shop'), 'productsPerPage', FASHION_ONE_DEFAULTS.shop.productsPerPage);

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    cats.set('all', products.length);
    products.forEach((p) => {
      const cat = (p.category || 'all').toLowerCase();
      cats.set(cat, (cats.get(cat) || 0) + 1);
    });
    return [
      { key: 'all', label: 'الكل' },
      { key: 'wedding', label: 'فساتين الزفاف' },
      { key: 'evening', label: 'فساتين السهرة' },
      { key: 'accessories', label: 'مستلزمات' },
    ].map((c) => ({ ...c, count: cats.get(c.key) || 0 }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (!selectedCategories.includes('all')) {
      result = result.filter((p) => selectedCategories.some((cat) => (p.category || '').toLowerCase().includes(cat)));
    }

    if (!selectedServices.includes('all')) {
      // Placeholder service type filter based on price heuristic or category
      result = result.filter((p) => {
        const mode = p.price > 500 ? 'buy' : 'rent';
        if (selectedServices.includes('both')) return true;
        if (selectedServices.includes('buy') && mode === 'buy') return true;
        if (selectedServices.includes('rent') && mode === 'rent') return true;
        return false;
      });
    }

    result = result.filter((p) => p.price <= priceMax && (p.comparePrice || 0) <= priceMax);

    if (selectedSizes.length) {
      result = result.filter(() => true); // No size data available in type
    }

    if (selectedColors.length) {
      result = result.filter(() => true); // No color data available in type
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategories, selectedServices, priceMax, selectedSizes, selectedColors, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) => {
      if (key === 'all') return ['all'];
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev.filter((k) => k !== 'all'), key];
      return next.length ? next : ['all'];
    });
    setPage(1);
  };

  const toggleService = (key: string) => {
    setSelectedServices((prev) => {
      if (key === 'all') return ['all'];
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev.filter((k) => k !== 'all'), key];
      return next.length ? next : ['all'];
    });
    setPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
    setPage(1);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCategories(['all']);
    setSelectedServices(['all']);
    setPriceMax(maxProductPrice);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSort('default');
    setPage(1);
  };

  const catLabel =
    {
      all: 'المتجر',
      wedding: 'فساتين الزفاف',
      evening: 'فساتين السهرة',
      accessories: 'مستلزمات العروس',
    }[preselectedCategory] || 'المتجر';

  const pageTitle = preselectedCategory === 'all' ? 'Our Collection' : catLabel;
  const pageSub =
    preselectedCategory === 'all'
      ? 'اكتشفي تشكيلتنا الكاملة من فساتين الزفاف والسهرة'
      : `تشكيلة مختارة من ${catLabel}`;

  return (
    <FashionOneLayout business={business} activeCategory={preselectedCategory === 'all' ? 'shop' : preselectedCategory}>
      <div className={styles['fashionOne']}>
        {/* Breadcrumb */}
        <div className={styles['breadcrumb']}>
          <div className={styles['container']}>
            <Link href={`/business/${slug}`}>
              <i className="fas fa-home" /> الرئيسية
            </Link>
            <span className={styles['bc-sep']}>
              <ChevronLeft size={9} />
            </span>
            <span className={styles['bc-current']}>{catLabel}</span>
          </div>
        </div>

        {/* Page Header */}
        <div className={styles['shop-page-header']}>
          <div className={styles['container']}>
            <h1 className={styles['shop-page-title']}>
              {preselectedCategory === 'all' ? 'Our ' : ''}
              <em>{preselectedCategory === 'all' ? 'Collection' : pageTitle}</em>
            </h1>
            <p className={styles['shop-page-sub']}>{pageSub}</p>
          </div>
        </div>

        {/* Shop Content */}
        <section className={styles['shop-content']}>
          <div className={`${styles['container']} ${styles['shop-grid']}`}>
            {/* Sidebar */}
            <aside className={styles['shop-sidebar']}>
              <div className={styles['filter-block']}>
                <h4 className={styles['filter-title']}>
                  الفئة <i className="fas fa-chevron-down" />
                </h4>
                <ul className={styles['filter-list']}>
                  {categories.map((cat) => (
                    <li key={cat.key}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.key)}
                          onChange={() => toggleCategory(cat.key)}
                        />
                        {cat.label} <span>({cat.count})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles['filter-block']}>
                <h4 className={styles['filter-title']}>
                  نوع الخدمة <i className="fas fa-chevron-down" />
                </h4>
                <ul className={styles['filter-list']}>
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'buy', label: 'للبيع فقط' },
                    { key: 'rent', label: 'للإيجار فقط' },
                    { key: 'both', label: 'بيع + إيجار' },
                  ].map((s) => (
                    <li key={s.key}>
                      <label>
                        <input type="checkbox" checked={selectedServices.includes(s.key)} onChange={() => toggleService(s.key)} />
                        {s.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles['filter-block']}>
                <h4 className={styles['filter-title']}>
                  السعر <i className="fas fa-chevron-down" />
                </h4>
                <div className={styles['price-range']}>
                  <input
                    type="range"
                    min={0}
                    max={maxProductPrice}
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                  />
                  <div className={styles['price-display']}>
                    <span>{format(0)}</span>
                    <span>{format(priceMax)}</span>
                  </div>
                </div>
              </div>

              <div className={styles['filter-block']}>
                <h4 className={styles['filter-title']}>
                  المقاس <i className="fas fa-chevron-down" />
                </h4>
                <div className={styles['size-grid']}>
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      className={`${styles['size-chip']} ${selectedSizes.includes(size) ? styles['active'] : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles['filter-block']}>
                <h4 className={styles['filter-title']}>
                  اللون <i className="fas fa-chevron-down" />
                </h4>
                <div className={styles['color-grid']}>
                  {colorsList.map((color) => (
                    <button
                      key={color.name}
                      className={`${styles['color-chip']} ${selectedColors.includes(color.name) ? styles['active'] : ''}`}
                      style={{ background: color.hex }}
                      title={color.name}
                      onClick={() => toggleColor(color.name)}
                    />
                  ))}
                </div>
              </div>

              <button className={styles['btn-outline']} style={{ width: '100%', marginTop: 8 }} onClick={resetFilters}>
                إعادة تعيين الفلاتر
              </button>
            </aside>

            {/* Products Area */}
            <div className={styles['shop-main']}>
              <div className={styles['shop-toolbar']}>
                <div className={styles['shop-results']}>
                  <span>
                    عرض {paginatedProducts.length} من أصل {filteredProducts.length} منتج
                  </span>
                </div>
                <div className={styles['shop-sort']}>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="default">ترتيب حسب: الافتراضي</option>
                    <option value="price-asc">السعر: من الأقل للأعلى</option>
                    <option value="price-desc">السعر: من الأعلى للأقل</option>
                    <option value="newest">الأحدث</option>
                    <option value="popular">الأكثر مبيعاً</option>
                  </select>
                  <div className={styles['view-toggle']}>
                    <button className={`${styles['vt']} ${view === 'grid' ? styles['active'] : ''}`} onClick={() => setView('grid')} aria-label="شبكة">
                      <LayoutGrid size={14} />
                    </button>
                    <button className={`${styles['vt']} ${view === 'list' ? styles['active'] : ''}`} onClick={() => setView('list')} aria-label="قائمة">
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={`${styles['shop-products']} ${styles[view]}`}>
                {paginatedProducts.length ? (
                  paginatedProducts.map((product) => (
                    <FashionOneProductCard key={product.id} product={product} business={business} variant={view} />
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-soft)' }}>
                    لا توجد منتجات مطابقة للفلاتر
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <div className={styles['shop-pagination']}>
                  <button
                    className={styles['page-btn']}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`${styles['page-btn']} ${p === page ? styles['active'] : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className={styles['page-btn']}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </FashionOneLayout>
  );
}
