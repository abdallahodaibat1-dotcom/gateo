'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, MapPin, Heart, Sparkles, Scissors, ShoppingBag,
  Gem, Crown, Flower2, Loader2, Store, Dumbbell, Gift, Home,
  BookOpen, Coffee, Tag, ThumbsUp, Clock, Truck, Search,
  X, ChevronDown, SlidersHorizontal, Filter, Check, Globe,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountrySelect from '@/components/CountrySelect';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';

interface Subcategory { id: string; name: string; slug: string; }
interface Category {
  id: string; name: string; slug: string; icon: string | null;
  image: string | null; description: string | null;
  subcategories?: Subcategory[];
  _count: { businesses: number; subcategories: number };
}
interface Country {
  id: string; name: string; flagEmoji: string;
}
interface City {
  id: string; name: string;
}
interface Business {
  id: string; name: string; slug: string; description: string | null;
  logo: string | null; cover: string | null; city: string | null;
  avgRating: number; reviewCount: number; isVerified: boolean;
  latitude: number | null; longitude: number | null;
  category: { id: string; name: string } | null;
  subcategory: { id: string; name: string } | null;
  distance?: number | null;
  _count: { reviews: number };
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Scissors, ShoppingBag, Heart, Gem, Crown, Flower2,
  Star, Store, Dumbbell, Gift, Home, BookOpen, Coffee,
  Tag, ThumbsUp, Clock, Truck,
};
function getIcon(iconName: string | null) {
  if (!iconName) return Sparkles;
  return iconMap[iconName] || Sparkles;
}

const sortOptions = [
  { key: 'rating', label: 'الأعلى تقييماً', icon: Star },
  { key: 'nearest', label: 'الأقرب إليك', icon: MapPin },
  { key: 'newest', label: 'الأحدث', icon: Clock },
  { key: 'reviews', label: 'الأكثر تقييمات', icon: ThumbsUp },
];

const quickFilters = [
  { key: 'top-rated', label: 'الأكثر تقييماً', icon: Star, sort: 'rating' },
  { key: 'nearest', label: 'الأقرب إليك', icon: MapPin, sort: 'nearest' },
  { key: 'newest', label: 'جديد في منطقتك', icon: Clock, sort: 'newest' },
  { key: 'offers', label: 'عروض وخصومات', icon: Tag, sort: 'rating' },
  { key: 'home-service', label: 'خدمات منزلية', icon: Truck, sort: 'rating' },
];

const ratingFilters = [
  { value: 0, label: 'الكل' },
  { value: 4.0, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
];

function CategoryCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-5 border border-border shadow-sm h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-11 h-11 rounded-lg" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-5 w-2/3 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

function BusinessCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden shadow-sm border border-border">
      <Skeleton className="h-40 w-full" />
      <div className="p-3.5 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

export default function LadiesGatePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Countries & Cities
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  // Filters
  const [sortBy, setSortBy] = useState('rating');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{ id: string; title: string; type: string; subtitle?: string; image?: string | null }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
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
      .catch(() => {})
      .finally(() => setCountriesLoading(false));
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
        fetch('/api/categories?ladiesGate=true&withSubs=true'),
        fetch(`/api/businesses?limit=100&sort=power${countryFilter ? `&country=${countryFilter}` : ''}${cityFilter ? `&city=${encodeURIComponent(cityFilter)}` : ''}`),
      ]);
      if (!catRes.ok) throw new Error('فشل في تحميل التصنيفات');
      const catData = await catRes.json();
      setCategories(catData.categories || []);
      if (bizRes.ok) {
        const bizData = await bizRes.json();
        const allBiz = bizData.businesses || [];
        const ladiesBiz = allBiz.filter((b: Business) => {
          const cat = catData.categories?.find((c: Category) => c.id === b.category?.id);
          return cat?.isLadiesGate;
        });
        setBusinesses(ladiesBiz);
        setFilteredBusinesses(ladiesBiz);
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }, [countryFilter, cityFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Smart live search: search on server as user types
  useEffect(() => {
    const query = debouncedSearchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearchSuggestions([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    Promise.all([
      fetch(`/api/search/businesses?q=${encodeURIComponent(query)}&ladiesGate=true&limit=50`).then((r) => r.ok ? r.json() : { businesses: [] }),
      fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&type=businesses&limit=5`).then((r) => r.ok ? r.json() : { suggestions: [] }),
    ])
      .then(([bizData, sugData]) => {
        if (cancelled) return;
        const found = bizData.businesses || [];
        const suggestions = (sugData.suggestions || []).filter((s: any) => s.type === 'business').slice(0, 5);
        setSearchResults(found);
        setSearchSuggestions(suggestions);
      })
      .catch(() => {
        if (!cancelled) {
          setSearchResults([]);
          setSearchSuggestions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => { cancelled = true; };
  }, [debouncedSearchQuery]);

  // Apply all filters (client-side for remaining filters)
  useEffect(() => {
    // Use server search results when user is typing; otherwise use loaded businesses
    const baseResults = debouncedSearchQuery.trim() ? searchResults : businesses;
    let result = [...baseResults];

    if (selectedCategory) result = result.filter((b) => b.category?.id === selectedCategory);
    if (minRating > 0) result = result.filter((b) => b.avgRating >= minRating);
    if (verifiedOnly) result = result.filter((b) => b.isVerified);

    switch (sortBy) {
      case 'rating': result.sort((a, b) => b.avgRating - a.avgRating); break;
      case 'newest': result.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()); break;
      case 'reviews': result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'nearest':
        if (userLocation) {
          result = result.filter((b) => b.latitude && b.longitude)
            .sort((a, b) => {
              const da = haversine(userLocation.lat, userLocation.lng, a.latitude!, a.longitude!);
              const db = haversine(userLocation.lat, userLocation.lng, b.latitude!, b.longitude!);
              return da - db;
            });
        }
        break;
    }
    setFilteredBusinesses(result);
  }, [businesses, searchResults, sortBy, selectedCategory, debouncedSearchQuery, minRating, verifiedOnly, userLocation]);

  const getUserLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy('nearest');
        setLocationLoading(false);
      },
      () => { showToast('لم نتمكن من تحديد موقعك.', 'error'); setLocationLoading(false); }
    );
  };

  const applyQuickFilter = (filter: typeof quickFilters[0]) => {
    setSortBy(filter.sort);
    if (filter.key === 'nearest' && !userLocation) getUserLocation();
    setSearchQuery('');
    setShowFilterPanel(false);
    const el = document.getElementById('results');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const hasActiveFilters = sortBy !== 'rating' || countryFilter || cityFilter || minRating > 0 || verifiedOnly || selectedCategory || searchQuery;

  const clearAllFilters = () => {
    setSortBy('rating'); setCountryFilter(''); setCityFilter(''); setMinRating(0);
    setVerifiedOnly(false); setSelectedCategory(''); setSearchQuery('');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark pt-28 pb-14">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                بوابة عالمية للجميع
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                البوابة <span className="text-white/80">العامة</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                اكتشف عالماً من الخدمات المخصصة للجميع في مكان واحد مصمم خصيصاً لك — في أي دولة كنتِ
              </p>
              {/* Smart Search */}
              <div className="max-w-2xl mx-auto relative">
                <div className="bg-surface rounded-lg p-2 shadow-lg flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      id="ladies-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setShowSuggestions(false);
                          const el = document.getElementById('results');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      placeholder="ابحث عن صالون، عيادة، متجر..."
                      className="w-full pr-11 pl-10 py-3 rounded-md border-0 text-foreground text-sm focus:ring-0 bg-transparent"
                    />
                    {isSearching ? (
                      <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                    ) : searchQuery ? (
                      <button onClick={() => { setSearchQuery(''); setSearchSuggestions([]); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label="مسح البحث">
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`px-5 py-3 rounded-md font-medium text-sm transition-colors flex items-center gap-2 ${
                      showFilterPanel || hasActiveFilters
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-foreground hover:bg-slate-200'
                    }`}
                    aria-label="فلترة النتائج"
                    aria-expanded={showFilterPanel}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">فلتر</span>
                    {hasActiveFilters && (
                      <span className="w-5 h-5 rounded-full bg-white text-primary text-xs flex items-center justify-center font-bold">
                        {[sortBy !== 'rating', countryFilter, cityFilter, minRating > 0, verifiedOnly, selectedCategory, searchQuery].filter(Boolean).length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Live suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-lg shadow-lg border border-border overflow-hidden z-30"
                    >
                      <div className="px-4 py-2 bg-slate-50 border-b border-border text-xs text-muted">
                        اقتراحات البحث
                      </div>
                      {searchSuggestions.map((s) => (
                        <button
                          key={`${s.type}-${s.id}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchQuery(s.title);
                            setShowSuggestions(false);
                            const el = document.getElementById('results');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-right"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                            {s.subtitle && <p className="text-xs text-muted truncate">{s.subtitle}</p>}
                          </div>
                          <ArrowLeft className="w-4 h-4 text-slate-300 -rotate-45" />
                        </button>
                      ))}
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setShowSuggestions(false);
                          const el = document.getElementById('results');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        عرض كل النتائج
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden bg-surface border-b border-border shadow-sm"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Country */}
                  <CountrySelect
                    countries={countries}
                    value={countryFilter}
                    onChange={(id) => { setCountryFilter(id); setCityFilter(''); }}
                    label="الدولة"
                    placeholder="جميع الدول"
                    autoDetect
                    className="[&_button]:px-3 [&_button]:py-2 [&_button]:rounded-md [&_button]:bg-slate-50 [&_button]:text-xs [&_button]:text-foreground [&_button]:border-border"
                  />

                  {/* City (dynamic based on country) */}
                  <div>
                    <label htmlFor="city-filter" className="block text-xs font-medium text-muted mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> المدينة
                    </label>
                    <select
                      id="city-filter"
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      disabled={!countryFilter}
                      className="w-full px-3 py-2 rounded-md bg-slate-50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">جميع المدن</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-2">ترتيب حسب</label>
                    <div className="flex flex-wrap gap-1.5">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setSortBy(opt.key);
                            if (opt.key === 'nearest') getUserLocation();
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                            sortBy === opt.key
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-slate-100 text-foreground hover:bg-slate-200'
                          }`}
                        >
                          <opt.icon className="w-3 h-3" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-2">التقييم</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ratingFilters.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setMinRating(r.value)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                            minRating === r.value
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 text-foreground hover:bg-slate-200'
                          }`}
                        >
                          {r.value > 0 && <Star className="w-3 h-3 fill-current" />}
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category + Verified */}
                  <div>
                    <label htmlFor="category-filter" className="block text-xs font-medium text-muted mb-2">خيارات إضافية</label>
                    <div className="flex flex-wrap gap-2">
                      <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1.5 rounded-md bg-slate-100 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-0"
                      >
                        <option value="">كل التصنيفات</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          verifiedOnly
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-foreground hover:bg-slate-200'
                        }`}
                      >
                        {verifiedOnly && <Check className="w-3 h-3" />}
                        موثق فقط
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active filters tags */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted">الفلاتر النشط:</span>
                    {sortBy !== 'rating' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {sortOptions.find((s) => s.key === sortBy)?.label}
                        <button onClick={() => setSortBy('rating')} aria-label="إزالة فلتر الترتيب"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {countryFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <Globe className="w-3 h-3" /> {countries.find((c) => c.id === countryFilter)?.name}
                        <button onClick={() => { setCountryFilter(''); setCityFilter(''); }} aria-label="إزالة فلتر الدولة"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {cityFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <MapPin className="w-3 h-3" /> {cityFilter}
                        <button onClick={() => setCityFilter('')} aria-label="إزالة فلتر المدينة"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {minRating > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                        <Star className="w-3 h-3 fill-current" /> {minRating}+
                        <button onClick={() => setMinRating(0)} aria-label="إزالة فلتر التقييم"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {verifiedOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <Check className="w-3 h-3" /> موثق
                        <button onClick={() => setVerifiedOnly(false)} aria-label="إزالة فلتر الموثق فقط"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {categories.find((c) => c.id === selectedCategory)?.name}
                        <button onClick={() => setSelectedCategory('')} aria-label="إزالة فلتر التصنيف"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-foreground text-xs font-medium border border-border">
                        <Search className="w-3 h-3" /> &quot;{searchQuery}&quot;
                        <button onClick={() => setSearchQuery('')} aria-label="إزالة فلتر البحث"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-500 hover:text-red-600 font-medium mr-auto"
                    >
                      مسح الكل
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Filters */}
        <section className="py-5 bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {quickFilters.map((qf) => {
                const Icon = qf.icon;
                return (
                  <button
                    key={qf.key}
                    onClick={() => applyQuickFilter(qf)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-50 text-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap border border-border hover:border-primary/30"
                  >
                    <Icon className="w-4 h-4" />
                    {qf.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3 border border-primary/20">
                التصنيفات
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                اختاري <span className="text-primary">تصنيفك</span> المفضل
              </h2>
            </motion.div>

            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={fetchData} className="px-6 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors">إعادة المحاولة</button>
              </div>
            ) : categories.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="لا توجد تصنيفات متاحة حالياً"
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((cat, i) => {
                  const Icon = getIcon(cat.icon);
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.15) }}
                    >
                      <Link href={`/ladies-gate/${cat.id}`} className="group block h-full">
                        <div className="bg-surface rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[11px] font-bold text-muted bg-slate-50 px-2 py-0.5 rounded-full border border-border">
                              {cat._count.businesses} نشاط
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-foreground mb-1">{cat.name}</h3>
                          {cat.description && <p className="text-xs text-muted leading-relaxed mb-2 flex-1 line-clamp-2">{cat.description}</p>}
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-border/50">
                              {cat.subcategories.slice(0, 3).map((sub) => (
                                <span key={sub.id} className="text-[10px] bg-slate-50 text-muted px-1.5 py-0.5 rounded-full border border-border">{sub.name}</span>
                              ))}
                              {cat.subcategories.length > 3 && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">+{cat.subcategories.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section id="results" className="py-14 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {searchQuery ? `نتائج البحث` : 'أعمال مميزة للجميع'}
                </h2>
                <p className="text-muted text-sm mt-1">
                  {filteredBusinesses.length} نتيجة
                  {locationLoading && <span className="text-primary mr-2">• جاري تحديد الموقع...</span>}
                </p>
              </div>
              {userLocation && sortBy === 'nearest' && (
                <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                  <MapPin className="w-3 h-3" /> مرتبة حسب الأقرب
                </span>
              )}
            </div>

            {filteredBusinesses.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  icon={Store}
                  title={searchQuery ? `لم نجد نتائج لـ "${searchQuery}"` : 'لا توجد نتائج'}
                  description={searchQuery
                    ? 'جرب البحث باسم مختلف، أو سجّل عملك إذا كان نشاطك غير موجود في البوابة العامة.'
                    : 'جرب تغيير الفلتر أو البحث بكلمات مختلفة'}
                  actionLabel={hasActiveFilters ? 'مسح الفلاتر' : undefined}
                  onAction={hasActiveFilters ? clearAllFilters : undefined}
                />
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
                  {!hasActiveFilters && (
                    <Link href="/business/apply" className="px-5 py-2 rounded-md bg-surface border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
                      سجّل عملك الآن
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBusinesses.map((biz, i) => (
                  <motion.div
                    key={biz.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: Math.min((i % 4) * 0.03, 0.15) }}
                    className="group cursor-pointer"
                  >
                    <Link href={`/business/${biz.id}`}>
                      <div className="bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
                        <div className="relative h-40 overflow-hidden">
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
                          <button className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-primary transition-colors" onClick={(e) => e.preventDefault()} aria-label="إضافة إلى المفضلة">
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-3.5">
                          {biz.subcategory ? (
                            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{biz.subcategory.name}</span>
                          ) : biz.category ? (
                            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{biz.category.name}</span>
                          ) : null}
                          <h3 className="text-sm font-bold text-foreground mt-1.5 mb-0.5 group-hover:text-primary transition-colors truncate">{biz.name}</h3>
                          {biz.city && (
                            <div className="flex items-center gap-1 text-xs text-muted mb-1.5">
                              <MapPin className="w-3 h-3" />
                              {biz.city}
                              {biz.distance !== undefined && biz.distance !== null && (
                                <span className="text-primary mr-1">({biz.distance.toFixed(1)} كم)</span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-bold text-foreground text-xs">{biz.avgRating.toFixed(1)}</span>
                              <span className="text-[10px] text-muted">({biz.reviewCount})</span>
                            </div>
                            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">مفتوح</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="max-w-4xl mx-auto px-4 relative text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              هل تمتلكين <span className="text-white/80">عملاً عاماً</span>؟
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              انضم إلى البوابة العامة في أي دولة كنت ووصل بآلاف العملاء المهتمين بخدماتك.
            </p>
            <Link href="/business/apply" className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-surface text-primary font-bold text-lg shadow-lg hover:bg-slate-50 transition-colors">
              سجلي عملك الآن
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
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
