'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import {
  Search, MapPin, Building2, Filter, ChevronDown, ShieldCheck, X, User, ArrowRight,
} from 'lucide-react';
import { EmptyState } from '@/components/ui';
import ProfessionalDirectoryCard from '@/components/ProfessionalDirectoryCard';
import ProfessionalDirectoryCardSkeleton from '@/components/ProfessionalDirectoryCardSkeleton';

interface Professional {
  id: string;
  title: string | null;
  bio: string | null;
  personalLogo: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  experienceYears: number | null;
  completedProjectsCount: number;
  clientsCount: number;
  isVerified: boolean;
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
  country: { id: string; name: string; flagEmoji: string } | null;
  user: { id: string; name: string | null; avatar: string | null; createdAt: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Country {
  id: string;
  name: string;
  flagEmoji: string;
}

interface City {
  id: string;
  name: string;
}

type SortType = 'newest' | 'experience' | 'projects';

const sortLabels: Record<SortType, string> = {
  newest: 'الأحدث',
  experience: 'الأكثر خبرة',
  projects: 'الأكثر مشاريع',
};

export default function CategoryProfessionalsPage() {
  const params = useParams<{ categorySlug: string }>();
  const categorySlug = params.categorySlug;

  const [category, setCategory] = useState<Category | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [countryId, setCountryId] = useState('');
  const [city, setCity] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((data) => {
        if (data.countries) setCountries(data.countries);
      })
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!countryId) {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    fetch(`/api/countries/${countryId}/cities`)
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, [countryId]);

  const fetchCategory = useCallback(async () => {
    try {
      const res = await fetch('/api/categories?type=PROFESSIONAL');
      const data = await res.json();
      const cat = (data.categories || []).find((c: Category) => c.slug === categorySlug);
      setCategory(cat || null);
    } catch (e) {
      console.error(e);
    }
  }, [categorySlug]);

  const buildQuery = useCallback(
    (pageNum: number) => {
      const query = new URLSearchParams();
      query.set('type', 'PROFESSIONAL');
      if (categorySlug) query.set('category', categorySlug);
      query.set('sort', sortBy);
      query.set('page', String(pageNum));
      query.set('limit', '12');
      if (countryId) query.set('country', countryId);
      if (city) query.set('city', city);
      if (verifiedOnly) query.set('verified', 'true');
      return query;
    },
    [categorySlug, sortBy, countryId, city, verifiedOnly]
  );

  const fetchProfessionals = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/professionals?${buildQuery(pageNum).toString()}`);
        const data = await res.json();
        setProfessionals(data.professionals || []);
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  useEffect(() => {
    fetchProfessionals(1);
  }, [categorySlug, sortBy, countryId, city, verifiedOnly, fetchProfessionals]);

  const handleSortChange = (sort: SortType) => {
    setSortBy(sort);
    setShowSortMenu(false);
  };

  const handlePageChange = (pageNum: number) => {
    fetchProfessionals(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setCountryId('');
    setCity('');
    setVerifiedOnly(false);
    setSortBy('newest');
  };

  const activeFiltersCount =
    (countryId ? 1 : 0) + (city ? 1 : 0) + (verifiedOnly ? 1 : 0);

  const selectedCountry = countries.find((c) => c.id === countryId);

  const filteredProfessionals = professionals.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const name = (p.user?.name || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    const subcategoryName = (p.subcategory?.name || '').toLowerCase();
    const cityName = (p.city || '').toLowerCase();
    return (
      name.includes(q) ||
      title.includes(q) ||
      subcategoryName.includes(q) ||
      cityName.includes(q)
    );
  });

  if (!category && !loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-10 min-h-screen bg-slate-50 text-center" dir="rtl">
          <h1 className="text-2xl font-bold text-foreground">التصنيف غير موجود</h1>
          <Link href="/businesses" className="text-primary mt-4 inline-block hover:underline">
            العودة إلى دليل الأعمال الاحترافية
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
              <Link href="/businesses" className="hover:text-white transition-colors">دليل الأعمال الاحترافية</Link>
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-white font-medium">{category?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{category?.name}</h1>
                <p className="text-white/80 text-sm mt-1">
                  {category?.description || `تصفح الملفات الاحترافية في ${category?.name}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Search + Filters */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-4 mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، التخصص، المدينة..."
                className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CountrySelect
                  countries={countries}
                  value={countryId}
                  onChange={(id) => {
                    setCountryId(id);
                    setCity('');
                  }}
                  label="الدولة"
                  autoDetect={false}
                />
                <div>
                  <label htmlFor="city-select" className="block text-sm font-medium text-foreground mb-1.5">المدينة</label>
                  <select
                    id="city-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!countryId || citiesLoading}
                    className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:bg-slate-100 disabled:text-muted text-sm"
                  >
                    <option value="">{citiesLoading ? 'جاري التحميل...' : 'كل المدن'}</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <label htmlFor="verified-only" className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground cursor-pointer hover:bg-slate-50 transition-colors self-end h-[42px]">
                  <input
                    id="verified-only"
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  موثق فقط
                </label>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium text-foreground hover:bg-slate-50 transition-colors"
                    aria-label="ترتيب النتائج"
                  >
                    <Filter className="w-4 h-4" />
                    {sortLabels[sortBy]}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showSortMenu && (
                    <div className="absolute left-0 top-full mt-2 bg-surface rounded-lg shadow-lg border border-border py-2 min-w-[180px] z-20">
                      {(Object.keys(sortLabels) as SortType[]).map((sort) => (
                        <button
                          key={sort}
                          onClick={() => handleSortChange(sort)}
                          className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                            sortBy === sort ? 'text-primary bg-primary/5 font-medium' : 'text-foreground hover:bg-slate-50'
                          }`}
                        >
                          {sortLabels[sort]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-md bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* Active chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
                {selectedCountry && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {selectedCountry.flagEmoji} {selectedCountry.name}
                    <button
                      onClick={() => { setCountryId(''); setCity(''); }}
                      aria-label="إزالة فلتر الدولة"
                      className="hover:text-primary-dark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <MapPin className="w-3 h-3" /> {city}
                    <button
                      onClick={() => setCity('')}
                      aria-label="إزالة فلتر المدينة"
                      className="hover:text-primary-dark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {verifiedOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" /> موثق
                    <button
                      onClick={() => setVerifiedOnly(false)}
                      aria-label="إزالة فلتر الموثقية"
                      className="hover:text-primary-dark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">
              إجمالي النتائج: <span className="font-bold text-foreground">{pagination.total}</span>
            </p>
            <p className="text-sm text-muted">
              صفحة {pagination.page} من {pagination.pages || 1}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProfessionalDirectoryCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredProfessionals.length === 0 && (
            <EmptyState
              icon={User}
              title="لا توجد نتائج"
              description="جرب تعديل الفلاتر أو البحث"
              actionLabel="مسح الفلاتر"
              onAction={handleClearFilters}
            />
          )}

          {/* Professional Cards */}
          {!loading && filteredProfessionals.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProfessionals.map((professional, index) => (
                  <ProfessionalDirectoryCard
                    key={professional.id}
                    professional={professional}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    السابق
                  </button>
                  <span className="text-sm text-muted">
                    صفحة {pagination.page} من {pagination.pages}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
