import { useState, useCallback } from 'react';

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface GeoError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'تم رفض الوصول للموقع — يرجى السماح بالوصول من إعدادات المتصفح',
          2: 'تعذر تحديد الموقع',
          3: 'انتهى الوقت المخصص لتحديد الموقع',
        };
        setError(messages[err.code] || 'حدث خطأ في تحديد الموقع');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return { location, loading, error, getLocation };
}
