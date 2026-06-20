'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Star, MapPin, Heart, Loader2, Filter, Check,
  ChevronDown, X, Search, SlidersHorizontal, StarIcon, ArrowLeft,
  SlidersHorizontalIcon, Globe, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface Subcategory { id: string; name: string; slug: string; }
interface Category { id: string; name: string; slug: string; description: string | null; }
interface Country { id: string; name: string; flagEmoji: string; }
interface City { id: string; name: string; }
interface Business {
  id: string; name: string; slug: string; description: string | null;
  logo: string | null; cover: string | null; city: string | null;
  avgRating: number; reviewCount: number; isVerified: boolean;
  latitude: number | null; longitude: number | null;
  subcategory: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  customSubcategory: string | null;
  distance?: number | null;
  _count: { reviews: number };
}

const sortOptions = [
  { key: 'rating', label: 'الأعلى تقييماً', icon: Star },
  { key: 'nearest', label: 'الأقرب إليك', icon: MapPin },
  { key: 'newest', label: 'الأحدث', icon: Star },
  { key: 'reviews', label: 'الأكثر تقييمات', icon: Star },
  { key: 'bookings', label: 'الأكثر حجوزات', icon: Star },
];

const ratingFilters = [
  { value: 0, label: 'الكل' },
  { value: 3.0, label: '3.0+' },
  { value: 4.0, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
];

function BusinessCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden shadow-sm border border-border">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2.5 border-t border-border">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Countries & Cities
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [sortBy, setSortBy] = useState('rating');
  const [selectedSubcat, setSelectedSubcat] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { showToast } = useToast();

  // Load countries
  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        if (data.countries) setCountries(data.countries);
      })
      .catch(() => {});
  }, []);

  // Load cities when country changes
  useEffect(() => {
    if (!countryFilter) {
      setCities([]);
      setCityFilter('');
      return;
    }
    fetch(`/api/countries/${countryFilter}/cities`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cities) setCities(data.cities);
      })
      .catch(() => setCities([]));
  }, [countryFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, bizRes] = await Promise.all([
        fetch(`/api/categories/${categoryId}/subcategories`),
        fetch(`/api/categories/${categoryId}/businesses?sort=${sortBy}${countryFilter ? `&country=${countryFilter}` : ''}${cityFilter ? `&city=${encodeURIComponent(cityFilter)}` : ''}${minRating > 0 ? `&minRating=${minRating}` : ''}${verifiedOnly ? '&verified=true' : ''}${selectedSubcat ? `&subcategory=${selectedSubcat}` : ''}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}${sortBy === 'nearest' && userLocation ? `&lat=${userLocation.lat}&lng=${userLocation.lng}` : ''}`),
      ]);

      if (!catRes.ok) throw new Error('فشل في تحميل البيانات');
      const catData = await catRes.json();
      setCategory(catData.category);
      setSubcategories(catData.subcategories || []);

      if (bizRes.ok) {
        const bizData = await bizRes.json();
        const all = bizData.businesses || [];
        if (sortBy === 'nearest' && userLocation) {
          all.forEach((b: Business) => {
            if (b.latitude && b.longitude) {
              b.distance = haversine(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
            }
          });
        }
        setBusinesses(all);
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }, [categoryId, sortBy, countryFilter, cityFilter, minRating, verifiedOnly, selectedSubcat, searchQuery, userLocation]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getUserLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => { showToast('لم نتمكن من تحديد موقعك.', 'error'); setLocationLoading(false); }
    );
  };

  const hasActiveFilters = sortBy !== 'rating' || countryFilter || cityFilter || minRating > 0 || verifiedOnly || selectedSubcat || searchQuery;

  const clearAll = () => {
    setSortBy('rating'); setCountryFilter(''); setCityFilter(''); setMinRating(0);
    setVerifiedOnly(false); setSelectedSubcat(''); setSearchQuery('');
  };

  // Filter sidebar content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Country */}
      <CountrySelect
        countries={countries}
        value={countryFilter}
        onChange={(id) => { setCountryFilter(id); setCityFilter(''); }}
        label="الدولة"
        placeholder="جميع الدول"
        autoDetect
        className="[&_button]:px-3 [&_button]:py-2 [&_button]:rounded-md [&_button]:bg-slate-50 [&_button]:text-sm [&_button]:text-foreground [&_button]:border-border"
      />

      {/* City */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted" />
          المدينة
        </h4>
        <select
          id="city-filter"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          disabled={!countryFilter}
          className="w-full px-3 py-2 rounded-md bg-slate-50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border disabled:opacity-50"
        >
          <option value="">جميع المدن</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <SlidersHorizontalIcon className="w-4 h-4 text-muted" />
          ترتيب حسب
        </h4>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setSortBy(opt.key);
                if (opt.key === 'nearest') getUserLocation();
              }}
              className={`w-full text-right px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                sortBy === opt.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-foreground hover:bg-slate-50 border border-transparent'
              }`}
            >
              {sortBy === opt.key && <Check className="w-3.5 h-3.5 text-primary mr-auto" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">التصنيفات الفرعية</h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSubcat('')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedSubcat === '' ? 'bg-primary text-white' : 'bg-slate-100 text-foreground hover:bg-slate-200'
            }`}
          >
            الكل
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcat(sub.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedSubcat === sub.id ? 'bg-primary text-white' : 'bg-slate-100 text-foreground hover:bg-slate-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <StarIcon className="w-4 h-4 text-muted" />
          التقييم الأدنى
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {ratingFilters.map((r) => (
            <button
              key={r.value}
              onClick={() => setMinRating(r.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                minRating === r.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-foreground hover:bg-slate-200'
              }`}
            >
              {r.value > 0 && <StarIcon className="w-3 h-3 fill-current" />}
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verified */}
      <div>
        <label htmlFor="verified-toggle" className="flex items-center gap-2 cursor-pointer select-none">
          <div
            className={`w-10 h-6 rounded-full transition-all relative ${verifiedOnly ? 'bg-primary' : 'bg-slate-200'}`}
            onClick={() => setVerifiedOnly(!verifiedOnly)}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${verifiedOnly ? 'left-[18px]' : 'left-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-foreground">الحسابات الموثق فقط</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 rounded-md border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          مسح جميع الفلاتر
        </button>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        {/* Breadcrumb + Header */}
        <div className="bg-surface border-b border-border pt-24 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/ladies-gate" className="hover:text-primary transition-colors flex items-center gap-1">
                البوابة العامة
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{category?.name || '...'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {category?.name || 'التصنيف'}
            </h1>
            {category?.description && (
              <p className="text-muted mt-2 text-sm max-w-2xl">{category.description}</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="bg-surface rounded-lg border border-border shadow-sm p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    الفلتر
                  </h3>
                  {hasActiveFilters && (
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      {[sortBy !== 'rating', countryFilter, cityFilter, minRating > 0, verifiedOnly, selectedSubcat, searchQuery].filter(Boolean).length}
                    </span>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="bg-surface rounded-lg border border-border shadow-sm p-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      id="category-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث في هذا التصنيف..."
                      className="w-full pr-11 pl-10 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label="مسح البحث">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mobile filter toggle */}
                    <button
                      onClick={() => setShowMobileFilter(!showMobileFilter)}
                      className={`lg:hidden px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                        showMobileFilter || hasActiveFilters
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-foreground hover:bg-slate-200'
                      }`}
                      aria-label="فلترة النتائج"
                      aria-expanded={showMobileFilter}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      فلتر
                      {hasActiveFilters && (
                        <span className="w-5 h-5 rounded-full bg-white text-primary text-xs flex items-center justify-center font-bold">
                          {[sortBy !== 'rating', countryFilter, cityFilter, minRating > 0, verifiedOnly, selectedSubcat, searchQuery].filter(Boolean).length}
                        </span>
                      )}
                    </button>
                    {/* Active filter pills */}
                    <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                      {countryFilter && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                          <Globe className="w-3 h-3" /> {countries.find((c) => c.id === countryFilter)?.name}
                          <button onClick={() => { setCountryFilter(''); setCityFilter(''); }} aria-label="إزالة فلتر الدولة"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {cityFilter && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                          <MapPin className="w-3 h-3" /> {cityFilter}
                          <button onClick={() => setCityFilter('')} aria-label="إزالة فلتر المدينة"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {selectedSubcat && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                          {subcategories.find((s) => s.id === selectedSubcat)?.name}
                          <button onClick={() => setSelectedSubcat('')} aria-label="إزالة فلتر التصنيف الفرعي"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {minRating > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                          <StarIcon className="w-3 h-3 fill-current" /> {minRating}+
                          <button onClick={() => setMinRating(0)} aria-label="إزالة فلتر التقييم"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile filter panel */}
                <AnimatePresence>
                  {showMobileFilter && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border">
                        <FilterContent />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-muted">
                  <span className="font-bold text-foreground text-base">{businesses.length}</span> نتيجة
                  {locationLoading && <span className="text-primary mr-2">• جاري تحديد الموقع...</span>}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-medium">
                    مسح الفلاتر
                  </button>
                )}
              </div>

              {/* Loading */}
              {loading && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <BusinessCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <EmptyState
                  icon={AlertCircle}
                  title="حدث خطأ"
                  description={error}
                  actionLabel="إعادة المحاولة"
                  onAction={fetchData}
                />
              )}

              {/* Empty */}
              {!loading && !error && businesses.length === 0 && (
                <EmptyState
                  icon={Search}
                  title="لا توجد نتائج"
                  description="جربي تعديل الفلتر أو البحث بكلمات مختلفة"
                  actionLabel={hasActiveFilters ? 'مسح الفلاتر' : undefined}
                  onAction={hasActiveFilters ? clearAll : undefined}
                  className="py-20"
                />
              )}

              {/* Grid */}
              {!loading && !error && businesses.length > 0 && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {businesses.map((biz, i) => (
                    <motion.div
                      key={biz.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min((i % 6) * 0.03, 0.15) }}
                      className="group cursor-pointer"
                    >
                      <Link href={`/business/${biz.id}`}>
                        <div className="bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
                          <div className="relative h-44 overflow-hidden">
                            {biz.cover ? (
                              <img src={biz.cover} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            {biz.isVerified && (
                              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-lg flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> موثق
                              </span>
                            )}
                            <button className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-primary transition-colors" onClick={(e) => e.preventDefault()} aria-label="إضافة إلى المفضلة">
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            {biz.subcategory ? (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">{biz.subcategory.name}</span>
                            ) : biz.customSubcategory ? (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">{biz.customSubcategory}</span>
                            ) : (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">{biz.category?.name}</span>
                            )}
                            <h3 className="text-sm font-bold text-foreground mt-2 mb-1 group-hover:text-primary transition-colors truncate">{biz.name}</h3>
                            <p className="text-xs text-muted line-clamp-2 mb-2 leading-relaxed">{biz.description || 'خدمة متميزة مخصصة للجميع'}</p>
                            {biz.city && (
                              <div className="flex items-center gap-1 text-xs text-muted mb-2">
                                <MapPin className="w-3 h-3" />
                                {biz.city}
                                {biz.distance !== undefined && biz.distance !== null && (
                                  <span className="text-primary mr-1">({biz.distance.toFixed(1)} كم)</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-2.5 border-t border-border/50">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="font-bold text-foreground text-sm">{biz.avgRating.toFixed(1)}</span>
                                <span className="text-xs text-muted">({biz.reviewCount})</span>
                              </div>
                              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">مفتوح الآن</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(deg: number): number { return deg * (Math.PI / 180); }
