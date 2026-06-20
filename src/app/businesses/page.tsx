'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  Star,
  MapPin,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Filter,
  ChevronDown,
  ArrowRight,
  User,
  ShieldCheck,
  X,
  Briefcase,
  Globe,
  Building2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

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

function ProfessionalCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm p-5">
      <div className="flex items-start gap-4">
        <Skeleton circle className="w-20 h-20 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
    </div>
  );
}

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

  const formatPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  };

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

          {/* Filters */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-4 mb-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProfessionalCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && professionals.length === 0 && (
            <EmptyState
              icon={User}
              title="لا توجد نتائج"
              description="جرب تعديل الفلاتر أو التخصص المختار"
              actionLabel="مسح الفلاتر"
              onAction={handleClearFilters}
              className="py-16"
            />
          )}

          {/* Grid */}
          {!loading && professionals.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {professionals.map((professional, index) => {
                  const profileUrl = `/business/${professional.user?.id}`;
                  const displayName = professional.user?.name || 'محترف';
                  const displayTitle = professional.title || displayName;
                  const avatarUrl =
                    professional.personalLogo || professional.user?.avatar || '/logo/favicon.svg';
                  const phone = formatPhone(professional.whatsapp || professional.phone);

                  return (
                    <motion.div
                      key={professional.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min((index % 6) * 0.03, 0.15) }}
                      className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <Link href={profileUrl}>
                            <div className="relative shrink-0">
                              <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-20 h-20 rounded-full object-cover border-2 border-primary/10 bg-surface shadow-sm"
                              />
                              {professional.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link href={profileUrl}>
                              <h3 className="font-bold text-foreground text-lg hover:text-primary transition-colors truncate">
                                {displayName}
                              </h3>
                            </Link>
                            {professional.title && (
                              <p className="text-sm text-primary font-medium mb-1 truncate">
                                {professional.title}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                              {professional.category && (
                                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                  {professional.category.name}
                                </span>
                              )}
                              {professional.subcategory && (
                                <span className="text-xs text-muted bg-slate-100 px-2 py-0.5 rounded-full">
                                  {professional.subcategory.name}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                              {professional.experienceYears ? (
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                  <span className="font-medium text-foreground">
                                    {professional.experienceYears}
                                  </span>
                                  <span>سنة خبرة</span>
                                </span>
                              ) : null}
                              {professional.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {professional.city}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                {professional.completedProjectsCount} مشروع
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                {professional.clientsCount} عميل
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                          <Link
                            href={profileUrl}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-slate-50 text-foreground text-sm font-medium hover:bg-slate-100 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            الملف
                          </Link>
                          {phone ? (
                            <>
                              <a
                                href={`tel:${phone}`}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                              >
                                <ArrowRight className="w-4 h-4 rotate-90" />
                                اتصال
                              </a>
                              <a
                                href={`https://wa.me/${phone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" />
                                واتساب
                              </a>
                            </>
                          ) : (
                            <Link
                              href={`${profileUrl}#contact`}
                              className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              تواصل
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
