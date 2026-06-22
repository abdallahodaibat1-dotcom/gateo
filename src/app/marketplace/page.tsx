'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  Search,
  ShoppingBag,
  Store,
  MapPin,
  Filter,
  ChevronDown,
  Star,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useCurrency } from '@/hooks/useCurrency';

interface Listing {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice: number | null;
    images: { url: string; alt?: string }[] | null;
    category: string | null;
    business: {
      id: string;
      name: string;
      slug: string;
      city: string | null;
      logo: string | null;
      isVerified: boolean;
    };
  };
}

function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 flex-1 flex flex-col space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
          <Skeleton circle className="w-4 h-4" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { format, convert } = useCurrency();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      params.set('sort', sort);
      params.set('page', page.toString());

      const res = await fetch(`/api/marketplace?${params.toString()}`);
      if (!res.ok) throw new Error('فشل في جلب المنتجات');
      const data = await res.json();
      setListings(data.listings);
      setTotal(data.total);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, [search, category, city, sort, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const categories = Array.from(new Set(listings.map((l) => l.product.category).filter((c): c is string => !!c)));

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              متجر Gateo المركزي
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              اكتشف منتجات مميزة من مختلف الأنشطة التجارية، واطلب مباشرة من موقع صاحب النشاط.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg border border-border shadow-sm p-4 mb-6"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                id="marketplace-search"
                type="text"
                placeholder="البحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>
            <select
              id="marketplace-category"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            >
              <option value="">كل التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat} value={cat || ''}>{cat}</option>
              ))}
            </select>
            <select
              id="marketplace-sort"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            >
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
              <option value="popular">الأكثر زيارة</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              بحث
            </button>
          </form>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="لا توجد منتجات متاحة حالياً"
            description="جرّب البحث بكلمات مختلفة أو تصفح لاحقاً"
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.15) }}
                >
                  <Link href={`/marketplace/${listing.id}`}>
                    <div className="bg-surface rounded-lg border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group h-full flex flex-col">
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                        {listing.product.images && listing.product.images[0] ? (
                          <img
                            src={listing.product.images[0].url}
                            alt={listing.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                        {listing.product.comparePrice && (
                          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            خصم
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="text-xs text-muted mb-1">{listing.product.category || 'منتج'}</div>
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2">{listing.product.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-primary font-bold">{format(convert(listing.product.price))}</span>
                          {listing.product.comparePrice && (
                            <span className="text-muted text-sm line-through">
                              {format(convert(listing.product.comparePrice))}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
                          <Store className="w-4 h-4 text-muted" />
                          <span className="text-sm text-foreground truncate flex-1">{listing.product.business.name}</span>
                          {listing.product.business.isVerified && (
                            <span className="text-primary text-xs" aria-label="موثق">
                              <CheckCircle className="w-3.5 h-3.5 inline" />
                            </span>
                          )}
                        </div>
                        {listing.product.business.city && (
                          <div className="flex items-center gap-1 text-xs text-muted mt-1">
                            <MapPin className="w-3 h-3" />
                            {listing.product.business.city}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-md border border-border hover:bg-slate-50 disabled:opacity-50"
                aria-label="الصفحة السابقة"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 rounded-md bg-surface border border-border text-sm text-foreground">
                صفحة {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 24 >= total}
                className="p-2 rounded-md border border-border hover:bg-slate-50 disabled:opacity-50"
                aria-label="الصفحة التالية"
              >
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
