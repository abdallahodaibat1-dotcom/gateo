export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).google?.maps) return resolve();

    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-maps', 'true');
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function initAutocomplete(
  input: HTMLInputElement,
  onSelect: (place: google.maps.places.PlaceResult) => void
): google.maps.places.Autocomplete {
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['geocode', 'establishment'],
    fields: ['place_id', 'geometry', 'formatted_address', 'name', 'address_components'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    onSelect(place);
  });

  return autocomplete;
}

export function createMap(
  container: HTMLElement,
  options: google.maps.MapOptions
): google.maps.Map {
  return new google.maps.Map(container, options);
}

export function createMarker(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  options?: google.maps.marker.AdvancedMarkerElementOptions
): google.maps.Marker {
  return new google.maps.Marker({
    map,
    position,
    draggable: true,
    ...(options || {}),
  });
}

export function getAddressFromLatLng(
  lat: number,
  lng: number
): Promise<google.maps.GeocoderResult[]> {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else {
        reject(new Error('Geocoder failed: ' + status));
      }
    });
  });
}
