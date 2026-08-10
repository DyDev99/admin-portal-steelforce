/**
 * Thin loader + styling layer for the Google Maps JS API.
 *
 * The API is only ever touched in the browser and typed loosely on purpose:
 * pulling in @types/google.maps would add a dependency for a demo module that
 * uses a handful of constructors.
 */


export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function hasGoogleMapsKey(): boolean {
  return GOOGLE_MAPS_KEY.trim().length > 0;
}

const CALLBACK_NAME = '__steelforceMapsReady';
let loadPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser'));
  }
  const w = window as any;
  if (w.google?.maps) return Promise.resolve(w.google);
  if (loadPromise) return loadPromise;
  if (!hasGoogleMapsKey()) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set'));
  }

  loadPromise = new Promise((resolve, reject) => {
    w[CALLBACK_NAME] = () => resolve(w.google);
    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}` +
      `&libraries=geometry&loading=async&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.onerror = () => {
      // Let the next mount retry rather than caching a rejected promise forever.
      loadPromise = null;
      reject(new Error('Failed to load the Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Light basemap tuned to the portal surface colours. */
export const LIGHT_MAP_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcfce7' }, { visibility: 'on' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
];

/** Dark basemap matched to `--surface-bg: #0F172A`. */
export const DARK_MAP_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#14532d' }, { visibility: 'on' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#273449' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c2436' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1e5b7a' }] },
];

function svgUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Teardrop pin in the module's palette. Carries the route sequence when the
 * stop belongs to the highlighted route, so the map reads like the timeline.
 */
export function stopPinIcon(color: string, seq?: number, selected = false): string {
  const ring = selected ? 3 : 2;
  const inner = seq
    ? `<circle cx="16" cy="16" r="7.5" fill="#ffffff"/>
       <text x="16" y="19.4" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif"
             font-size="10" font-weight="700" fill="${color}">${seq}</text>`
    : `<circle cx="16" cy="16" r="5" fill="#ffffff" fill-opacity="0.95"/>`;

  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
       <path d="M16 41C16 41 29 25.6 29 16A13 13 0 1 0 3 16C3 25.6 16 41 16 41Z"
             fill="${color}" stroke="#ffffff" stroke-width="${ring}" stroke-linejoin="round"/>
       ${inner}
     </svg>`
  );
}

/** Depot marker — square shoulders so it never reads as a customer stop. */
export function depotPinIcon(color = '#0F172A'): string {
  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="40" viewBox="0 0 34 40">
       <path d="M17 39 L9.5 29.5 H5.5A3.5 3.5 0 0 1 2 26V6.5A3.5 3.5 0 0 1 5.5 3h23A3.5 3.5 0 0 1 32 6.5V26a3.5 3.5 0 0 1-3.5 3.5h-4Z"
             fill="${color}" stroke="#ffffff" stroke-width="2.4" stroke-linejoin="round"/>
       <path d="M10 20.5v-6l7-4 7 4v6" fill="none" stroke="#ffffff" stroke-width="2.2"
             stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M13.5 20.5v-4h7v4" fill="none" stroke="#ffffff" stroke-width="2.2"
             stroke-linecap="round" stroke-linejoin="round"/>
     </svg>`
  );
}

/** Small dot for a rep's live position; the halo is drawn as a Circle overlay. */
export function repDotIcon(color: string): string {
  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
       <circle cx="9" cy="9" r="6" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
     </svg>`
  );
}
