'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, createMap, createMarker } from '@/lib/google-maps';
import { Loader2, MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}

export default function MapPicker({ lat, lng, onChange, height = '300px' }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultLat = lat ?? 24.7136; // Riyadh
  const defaultLng = lng ?? 46.6753;

  useEffect(() => {
    if (!containerRef.current || !GOOGLE_MAPS_API_KEY) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        if (!containerRef.current) return;

        const map = createMap(containerRef.current, {
          center: { lat: defaultLat, lng: defaultLng },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;

        const marker = createMarker(map, { lat: defaultLat, lng: defaultLng });
        markerRef.current = marker;

        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            onChange(pos.lat(), pos.lng());
          }
        });

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            marker.setPosition(e.latLng);
            onChange(e.latLng.lat(), e.latLng.lng());
          }
        });

        setLoading(false);
      } catch (e) {
        console.error('Map init error:', e);
        setLoading(false);
      }
    };

    init();
  }, []);

  // Update marker when props change
  useEffect(() => {
    if (markerRef.current && lat != null && lng != null) {
      markerRef.current.setPosition({ lat, lng });
      mapRef.current?.panTo({ lat, lng });
    }
  }, [lat, lng]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className="rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center text-warning text-sm"
        style={{ height }}
      >
        <MapPin className="w-5 h-5 ml-2" />
        لم يتم تعيين مفتاح Google Maps API
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-border" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
