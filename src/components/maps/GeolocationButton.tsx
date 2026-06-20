'use client';

import { useGeolocation } from '@/lib/use-geolocation';
import { Crosshair, Loader2, CheckCircle2 } from 'lucide-react';

interface GeolocationButtonProps {
  onLocate: (lat: number, lng: number) => void;
  className?: string;
}

export default function GeolocationButton({ onLocate, className = '' }: GeolocationButtonProps) {
  const { location, loading, error, getLocation } = useGeolocation();

  const handleClick = () => {
    getLocation();
  };

  // Auto-call onLocate when location is obtained
  if (location && !loading) {
    onLocate(location.lat, location.lng);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : location ? (
          <CheckCircle2 className="w-4 h-4 text-success" />
        ) : (
          <Crosshair className="w-4 h-4" />
        )}
        {loading ? 'جاري تحديد الموقع...' : location ? 'تم تحديد الموقع' : 'استخدام موقعي الحالي'}
      </button>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
