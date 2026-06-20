'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  ShieldCheck,
  X,
  Briefcase,
  Globe,
  Building2,
  Filter,
  ChevronDown,
  User,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import EmptyState from '@/components/ui/EmptyState';
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



export default function BusinessesDirectoryPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [categorySlug, setCategorySlug] = useState('');
  const [countryId, setCountryId] = useState('');
  const [city, setCity] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/categories?type=PROFESSIONAL')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => setCategories([]));

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
      } catch (error) {
        console.error('Failed to fetch professionals:', error);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

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
    setCategorySlug('');
    setCountryId('');
    setCity('');
    setVerifiedOnly(false);
    setSortBy('newest');
  };

  const activeFiltersCount =
    (categorySlug ? 1 : 0) + (countryId ? 1 : 0) + (city ? 1 : 0) + (verifiedOnly ? 1 : 0);

  const selectedCountry = countries.find((c) => c.id === countryId);
  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  const filteredProfessionals = professionals.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const name = (p.user?.name || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    const categoryName = (p.category?.name || '').toLowerCase();
    const subcategoryName = (p.subcategory?.name || '').toLowerCase();
    const cityName = (p.city || '').toLowerCase();
    return (
      name.includes(q) ||
      title.includes(q) ||
      categoryName.includes(q) ||
      subcategoryName.includes(q) ||
      cityName.includes(q)
    );
  });

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">دليل الأعمال الاحترافية</h1>
                <p className="text-white/80 mt-1">
                  اكتشف خبراء ومتخصصين من مختلف المجالات المهنية
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Professional category chips */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCategorySlug('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !categorySlug
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-foreground hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    categorySlug === cat.slug
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-foreground hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

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
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="category-filter" className="block text-sm font-medium text-foreground mb-1.5">
                    التخصص
                  </label>
                  <select
                    id="category-filter"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  >
                    <option value="">كل التخصصات</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                  <label htmlFor="city-filter" className="block text-sm font-medium text-foreground mb-1.5">
                    المدينة
                  </label>
                  <select
                    id="city-filter"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!countryId || citiesLoading}
                    className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:bg-slate-100 disabled:text-muted"
                  >
                    <option value="">{citiesLoading ? 'جاري التحميل...' : 'كل المدن'}</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <label htmlFor="verified-filter" className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground cursor-pointer hover:bg-slate-50 transition-colors self-end h-[42px]">
                  <input
                    id="verified-filter"
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
                    aria-expanded={showSortMenu}
                  >
                    <Filter className="w-4 h-4" />
                    {sortLabels[sortBy]}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showSortMenu && (
                    <div className="absolute left-0 top-full mt-2 bg-surface rounded-lg shadow-lg border border-border py-2 min-w-[180px] z-20">
                      {(Object.keys(sortLabels) as SortType[]).map((sort) => (
                        <button
                          key={sort}
                          onClick={() => handleSortChange(sort)}
                          className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                            sortBy === sort
                              ? 'text-primary bg-primary/5 font-medium'
                              : 'text-foreground hover:bg-slate-50'
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
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <Briefcase className="w-3 h-3" /> {selectedCategory.name}
                    <button onClick={() => setCategorySlug('')} aria-label="إزالة فلتر التخصص">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCountry && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <Globe className="w-3 h-3" /> {selectedCountry.name}
                    <button onClick={() => { setCountryId(''); setCity(''); }} aria-label="إزالة فلتر الدولة">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <MapPin className="w-3 h-3" /> {city}
                    <button onClick={() => setCity('')} aria-label="إزالة فلتر المدينة">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {verifiedOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <ShieldCheck className="w-3 h-3" /> موثق
                    <button onClick={() => setVerifiedOnly(false)} aria-label="إزالة فلتر الموثق فقط">
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
              إجمالي النتائج:{' '}
              <span className="font-bold text-foreground">{pagination.total}</span>
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
              className="py-16"
            />
          )}

          {/* Grid */}
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
                    className="px-4 py-2 rounded-md border border-border text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    السابق
                  </button>
                  <span className="text-sm text-muted">
                    صفحة {pagination.page} من {pagination.pages}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-4 py-2 rounded-md border border-border text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
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
