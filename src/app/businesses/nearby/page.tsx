'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GeolocationButton from '@/components/maps/GeolocationButton';
import BusinessMap, { BusinessMarker } from '@/components/maps/BusinessMap';
import { motion } from 'framer-motion';
import {
  Loader2, MapPin, Store, Star, Navigation, ChevronLeft,
  Crosshair, SlidersHorizontal, ArrowUpDown, LayoutList, Map as MapIcon
} from 'lucide-react';
import Link from 'next/link';
import { EmptyState, Skeleton } from '@/components/ui';

interface NearbyBusiness {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  cover: string | null;
  avgRating: number;
  reviewCount: number;
  category: { name: string } | null;
  city: string | null;
  distance: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

const radiusOptions = [
  { value: 1, label: '1 كم' },
  { value: 5, label: '5 كم' },
  { value: 10, label: '10 كم' },
  { value: 25, label: '25 كم' },
  { value: 50, label: '50 كم' },
];

type ViewMode = 'list' | 'map';

export default function NearbyBusinessesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<NearbyBusiness[]>([]);
  const [total, setTotal] = useState(0);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [radius, setRadius] = useState(10);
  const [geoError, setGeoError] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Try to get saved user location first
  useEffect(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) {
      try {
        const loc = JSON.parse(saved);
        setUserLat(loc.lat);
        setUserLng(loc.lng);
      } catch {}
    }
  }, []);

  // Fetch nearby when location or radius changes
  useEffect(() => {
    if (userLat && userLng) {
      fetchNearby(userLat, userLng, radius);
    }
  }, [userLat, userLng, radius]);

  // Scroll to highlighted card when in list view
  useEffect(() => {
    if (highlightedId && view === 'list') {
      const el = cardRefs.current[highlightedId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedId, view]);

  const fetchNearby = async (lat: number, lng: number, r: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/businesses/nearby?lat=${lat}&lng=${lng}&radius=${r}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = (lat: number, lng: number) => {
    setUserLat(lat);
    setUserLng(lng);
    localStorage.setItem('user_location', JSON.stringify({ lat, lng }));
  };

  const openDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} م`;
    return `${km.toFixed(1)} كم`;
  };

  const handleMarkerClick = (id: string) => {
    setHighlightedId(id);
    // On mobile, jump back to the list to see details
    setView((current) => (current === 'map' ? 'list' : current));
  };

  const handleCardClick = (id: string) => {
    setHighlightedId(id);
    setView('map');
  };

  const markers: BusinessMarker[] = businesses
    .filter((b) => b.latitude != null && b.longitude != null)
    .map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      cover: b.cover,
      lat: b.latitude!,
      lng: b.longitude!,
      rating: b.avgRating,
      reviewCount: b.reviewCount,
      category: b.category?.name || null,
      distance: b.distance,
      address: b.address,
    }));

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-3"
            >
              <ChevronLeft className="w-4 h-4" />
              العودة للأعمال
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">الأنشطة القريبة مني</h1>
                <p className="text-muted text-sm">اكتشف الأعمال حول موقعك الحالي</p>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <GeolocationButton
                  onLocate={handleLocate}
                  className="flex-shrink-0"
                />
                {userLat && userLng && (
                  <div className="flex items-center gap-1.5 text-sm text-success bg-success/10 px-3 py-1.5 rounded-md">
                    <MapPin className="w-3.5 h-3.5" />
                    موقعك محدد
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted" />
                  <span className="text-sm text-foreground">نطاق البحث:</span>
                  <div className="flex items-center gap-1">
                    {radiusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setRadius(opt.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          radius === opt.value
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 text-foreground hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile view toggle */}
                <div className="flex items-center gap-1 lg:hidden">
                  <button
                    onClick={() => setView('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      view === 'list'
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-foreground hover:bg-slate-200'
                    }`}
                    aria-label="عرض القائمة"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    قائمة
                  </button>
                  <button
                    onClick={() => setView('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      view === 'map'
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-foreground hover:bg-slate-200'
                    }`}
                    aria-label="عرض الخريطة"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    خريطة
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content: List + Map */}
          {!userLat || !userLng ? (
            <EmptyState
              icon={Crosshair}
              title="حدد موقعك"
              description='اضغط على زر "استخدام موقعي الحالي" لعرض الأعمال القريبة منك'
            />
          ) : loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-[500px] lg:h-[calc(100vh-200px)] rounded-lg" />
            </div>
          ) : businesses.length === 0 ? (
            <EmptyState
              icon={Store}
              title="لا توجد أعمال قريبة"
              description="جرب زيادة نطاق البحث أو تغيير موقعك"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* List Column */}
              <div className={view === 'list' ? 'block' : 'hidden lg:block'}>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted">
                    <ArrowUpDown className="w-3.5 h-3.5 inline-block ml-1" />
                    مرتبة حسب: الأقرب
                  </p>
                  <span className="text-sm text-muted">{total} نتيجة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {businesses.map((business, index) => (
                    <motion.div
                      key={business.id}
                      ref={(el) => { cardRefs.current[business.id] = el; }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleCardClick(business.id)}
                      className={`bg-surface rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all group cursor-pointer ${
                        highlightedId === business.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border'
                      }`}
                    >
                      {/* Cover */}
                      <div className="h-40 bg-slate-100 relative overflow-hidden">
                        {business.cover && (
                          <img
                            src={business.cover}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                        {/* Distance Badge */}
                        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                          <Navigation className="w-3 h-3 text-primary" />
                          <span className="text-xs font-bold text-foreground">
                            {formatDistance(business.distance)}
                          </span>
                        </div>

                        <div className="absolute bottom-3 right-3">
                          <img
                            src={business.logo || '/logo/favicon.svg'}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover border-2 border-surface shadow-md bg-surface"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <Link
                          href={`/business/${business.slug || business.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h3 className="font-bold text-foreground mb-1 hover:text-primary transition-colors">
                            {business.name}
                          </h3>
                        </Link>
                        {business.category && (
                          <span className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                            {business.category.name}
                          </span>
                        )}

                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-foreground">{business.avgRating.toFixed(1)}</span>
                            <span className="text-xs text-muted">({business.reviewCount})</span>
                          </div>
                          {business.city && (
                            <span className="flex items-center gap-1 text-xs text-muted">
                              <MapPin className="w-3 h-3" />
                              {business.city}
                            </span>
                          )}
                        </div>

                        {/* Address & Directions */}
                        {business.address && (
                          <p className="text-xs text-muted mt-2 line-clamp-1">{business.address}</p>
                        )}

                        {business.latitude && business.longitude && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDirections(business.latitude!, business.longitude!);
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            الاتجاهات في Google Maps
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map Column */}
              <div
                className={`${view === 'map' ? 'block' : 'hidden lg:block'} lg:sticky lg:top-24`}
              >
                <div className="h-[500px] lg:h-[calc(100vh-200px)] rounded-lg overflow-hidden border border-border shadow-sm bg-surface p-1">
                  <BusinessMap
                    markers={markers}
                    center={{ lat: userLat, lng: userLng }}
                    highlightedId={highlightedId}
                    radius={radius}
                    onMarkerClick={handleMarkerClick}
                    height="100%"
                  />
                </div>
                <p className="text-xs text-muted mt-2 text-center">
                  انقر على أي دبوس لعرض تفاصيل النشاط
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
