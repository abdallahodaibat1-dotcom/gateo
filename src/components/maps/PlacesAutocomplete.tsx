'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, initAutocomplete } from '@/lib/google-maps';
import { MapPin, Loader2 } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export interface PlaceData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

interface PlacesAutocompleteProps {
  value?: string;
  onSelect: (place: PlaceData) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

export default function PlacesAutocomplete({
  value = '',
  onSelect,
  placeholder = 'ابحث عن عنوان...',
  label = 'العنوان',
  id = 'places-autocomplete',
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (!inputRef.current || !GOOGLE_MAPS_API_KEY) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;

    const setup = async () => {
      try {
        setLoading(true);
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        if (inputRef.current) {
          autocomplete = initAutocomplete(inputRef.current, (place) => {
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            if (lat != null && lng != null) {
              const city = place.address_components?.find((c) =>
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
              )?.long_name;
              const country = place.address_components?.find((c) =>
                c.types.includes('country')
              )?.long_name;

              const data: PlaceData = {
                name: place.name || place.formatted_address || '',
                address: place.formatted_address || '',
                lat,
                lng,
                city,
                country,
              };
              setInputValue(data.address);
              onSelect(data);
            }
          });
        }
      } catch (e) {
        console.error('Failed to load Google Maps:', e);
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onSelect]);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
        />
        {loading && (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
        )}
      </div>
      {!GOOGLE_MAPS_API_KEY && (
        <p className="text-xs text-warning mt-1">
          لم يتم تعيين مفتاح Google Maps API
        </p>
      )}
    </div>
  );
}
