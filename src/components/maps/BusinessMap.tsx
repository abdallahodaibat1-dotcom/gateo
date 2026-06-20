'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '@/lib/google-maps';
import { MapPin } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export interface BusinessMarker {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  cover?: string | null;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  category?: string | null;
  distance?: number;
  address?: string | null;
}

interface BusinessMapProps {
  markers: BusinessMarker[];
  center?: { lat: number; lng: number };
  highlightedId?: string | null;
  height?: string;
  radius?: number; // km
  onMarkerClick?: (id: string) => void;
}

export default function BusinessMap({
  markers,
  center,
  highlightedId,
  height = '400px',
  radius,
  onMarkerClick,
}: BusinessMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const circleRef = useRef<google.maps.Circle | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || !GOOGLE_MAPS_API_KEY) return;

    let mounted = true;
    const init = async () => {
      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        if (!mounted || !containerRef.current) return;

        const g = (window as any).google as typeof google;
        const initialCenter = center || (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 24.7136, lng: 46.6753 });
        const initialZoom = markers.length === 1 ? 15 : 12;

        const newMap = new g.maps.Map(containerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        infoWindowRef.current = new g.maps.InfoWindow({ maxWidth: 300 });
        setMap(newMap);
      } catch (e) {
        console.error('BusinessMap init error:', e);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Render markers when map or markers change
  useEffect(() => {
    const g = (window as any).google as typeof google | undefined;
    if (!g?.maps || !map) return;

    // Clear existing markers and listeners
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    listenersRef.current.forEach((l) => l.remove());
    markersRef.current = {};
    listenersRef.current = [];

    const bounds = new g.maps.LatLngBounds();
    const infoWindow = infoWindowRef.current;

    markers.forEach((m) => {
      const marker = new g.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map,
        title: m.name,
      });

      const listener = marker.addListener('click', () => {
        if (infoWindow) {
          infoWindow.setContent(createInfoContent(m));
          infoWindow.open(map, marker);
        }
        onMarkerClick?.(m.id);
      });

      markersRef.current[m.id] = marker;
      listenersRef.current.push(listener);
      bounds.extend({ lat: m.lat, lng: m.lng });
    });

    if (markers.length > 1) {
      map.fitBounds(bounds);
    } else if (markers.length === 1) {
      const pos = { lat: markers[0].lat, lng: markers[0].lng };
      map.setCenter(pos);
      map.setZoom(15);
      if (infoWindow) {
        infoWindow.setContent(createInfoContent(markers[0]));
        infoWindow.open(map, markersRef.current[markers[0].id]);
      }
    }
  }, [map, markers, onMarkerClick]);

  // Draw/refresh radius circle
  useEffect(() => {
    const g = (window as any).google as typeof google | undefined;
    if (!g?.maps || !map) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    if (radius && center) {
      circleRef.current = new g.maps.Circle({
        center,
        radius: radius * 1000,
        map,
        fillColor: '#1e40af',
        fillOpacity: 0.08,
        strokeColor: '#1e40af',
        strokeOpacity: 0.35,
        strokeWeight: 1,
      });
    }
  }, [map, radius, center]);

  // React to highlightedId from parent
  useEffect(() => {
    const g = (window as any).google as typeof google | undefined;
    if (!g?.maps || !map || !highlightedId) return;

    const marker = markersRef.current[highlightedId];
    const business = markers.find((m) => m.id === highlightedId);
    const infoWindow = infoWindowRef.current;

    if (marker && business && infoWindow) {
      infoWindow.setContent(createInfoContent(business));
      infoWindow.open(map, marker);
      map.panTo(marker.getPosition()!);
    }
  }, [map, highlightedId, markers]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{ height }} className="flex items-center justify-center px-4">
        <EmptyState
          icon={MapPin}
          title="مفتاح Google Maps API غير مضبوط"
          description="يمكنك عرض الاتجاهات عبر زر Google Maps."
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden w-full h-full"
      style={{ height }}
    />
  );
}

function createInfoContent(m: BusinessMarker): HTMLElement {
  const container = document.createElement('div');
  container.className = 'font-sans text-right bg-surface text-foreground';
  container.dir = 'rtl';

  // Header: logo + name
  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-2';

  if (m.logo) {
    const img = document.createElement('img');
    img.src = m.logo;
    img.alt = '';
    img.className = 'w-9 h-9 rounded-lg object-cover border border-border bg-surface';
    header.appendChild(img);
  }

  const name = document.createElement('div');
  name.className = 'font-bold text-foreground text-sm leading-tight';
  name.textContent = m.name;
  header.appendChild(name);

  container.appendChild(header);

  // Category / distance / rating
  const meta = document.createElement('div');
  meta.className = 'space-y-1 mb-3';

  if (m.category || m.distance != null) {
    const row = document.createElement('div');
    row.className = 'flex flex-wrap items-center gap-2 text-xs text-muted';

    if (m.category) {
      const cat = document.createElement('span');
      cat.className = 'bg-primary/10 text-primary px-2 py-0.5 rounded-full';
      cat.textContent = m.category;
      row.appendChild(cat);
    }

    if (m.distance != null) {
      const dist = document.createElement('span');
      dist.className = 'text-muted';
      dist.textContent = m.distance < 1 ? `${Math.round(m.distance * 1000)} م` : `${m.distance.toFixed(1)} كم`;
      row.appendChild(dist);
    }

    meta.appendChild(row);
  }

  if (m.rating != null) {
    const rating = document.createElement('div');
    rating.className = 'text-xs text-accent font-medium';
    rating.textContent = `${m.rating.toFixed(1)} · ${m.reviewCount || 0} تقييم`;
    meta.appendChild(rating);
  }

  if (m.address) {
    const addr = document.createElement('div');
    addr.className = 'text-xs text-muted line-clamp-1';
    addr.textContent = m.address;
    meta.appendChild(addr);
  }

  container.appendChild(meta);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'flex items-center gap-2';

  const profileLink = document.createElement('a');
  profileLink.href = `/business/${m.slug || m.id}`;
  profileLink.className = 'px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors';
  profileLink.textContent = 'عرض الملف';
  actions.appendChild(profileLink);

  const dirLink = document.createElement('a');
  dirLink.href = `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;
  dirLink.target = '_blank';
  dirLink.rel = 'noopener';
  dirLink.className = 'px-3 py-1.5 rounded-lg bg-slate-100 text-foreground text-xs font-medium hover:bg-slate-200 transition-colors';
  dirLink.textContent = 'الاتجاهات';
  actions.appendChild(dirLink);

  container.appendChild(actions);

  return container;
}
