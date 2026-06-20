'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

interface MapProps {
  latitude: number;
  longitude: number;
  name?: string;
  height?: string;
}

export default function Map({ latitude, longitude, name, height = '300px' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError(true);
      return;
    }

    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      });

      new (window as any).google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        title: name || 'الموقع',
      });
    };

    if ((window as any).google) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    }
  }, [latitude, longitude, name]);

  if (error) {
    return (
      <div style={{ height }} className="flex items-center justify-center px-4">
        <EmptyState
          icon={MapPin}
          title="تعذر تحميل الخريطة"
          description={`الموقع: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
          className="w-full"
        />
      </div>
    );
  }

  return <div ref={mapRef} className="rounded-xl overflow-hidden bg-slate-50" style={{ height }} />;
}
