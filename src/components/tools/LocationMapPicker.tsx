// Fallback for when text search doesn't find a place: a full-screen
// pin-drop map (free OpenStreetMap tiles, no API key) so the user can
// point at the exact spot directly. Kept in its own file and imported
// via React.lazy from Reminders.tsx so Leaflet (and its CSS) is only
// downloaded the moment someone actually opens the picker, not just for
// visiting the Location reminder type.
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, LocateFixed } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { reverseGeocode } from '../../services/places';
import {
  checkLocationPermission,
  requestForegroundLocationPermission,
  getCurrentLocationOnce,
} from '../../services/geofences';

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]; // Kathmandu
const REVERSE_GEOCODE_DEBOUNCE_MS = 700;

interface LocationMapPickerProps {
  language: Language;
  initialCenter: { lat: number; lng: number } | null;
  onConfirm: (result: { name: string; lat: number; lng: number }) => void;
  onCancel: () => void;
}

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  language,
  initialCenter,
  onConfirm,
  onCancel,
}) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    initialCenter || { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
  );
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const lookupPreview = (lat: number, lng: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPreviewLoading(true);
    debounceRef.current = setTimeout(() => {
      reverseGeocode(lat, lng).then((name) => {
        setPreviewName(name);
        setPreviewLoading(false);
      });
    }, REVERSE_GEOCODE_DEBOUNCE_MS);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('moveend', () => {
      const c = map.getCenter();
      setCenter({ lat: c.lat, lng: c.lng });
      lookupPreview(c.lat, c.lng);
    });

    mapRef.current = map;
    lookupPreview(center.lat, center.lng);

    return () => {
      map.remove();
      mapRef.current = null;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best-effort auto-center on the device's current location when the
  // picker opens fresh (not editing an existing pinned reminder) and
  // permission is already granted from an earlier reminder — silent on
  // any failure/denial, since Kathmandu is still a reasonable default
  // and this should never pop a permission prompt just for opening the
  // map. The explicit locate button below is what asks, if needed.
  useEffect(() => {
    if (initialCenter) return;
    (async () => {
      const permission = await checkLocationPermission();
      if (!permission.foregroundGranted) return;
      const position = await getCurrentLocationOnce();
      if (position) {
        mapRef.current?.setView([position.lat, position.lng], 15);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseMyLocation = async () => {
    setLocating(true);
    setLocateError(null);
    let granted = (await checkLocationPermission()).foregroundGranted;
    if (!granted) {
      granted = await requestForegroundLocationPermission();
    }
    if (!granted) {
      setLocating(false);
      setLocateError(
        isNe ? 'स्थान अनुमति दिइएको छैन। सेटिङ्समा गई अनुमति दिनुहोस्।' : 'Location permission denied. Enable it in Settings.'
      );
      return;
    }
    const position = await getCurrentLocationOnce();
    setLocating(false);
    if (position) {
      mapRef.current?.setView([position.lat, position.lng], 16);
    } else {
      setLocateError(isNe ? 'हालको स्थान फेला परेन।' : "Couldn't get your current location.");
    }
  };

  const handleConfirm = () => {
    const name = previewName || `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`;
    onConfirm({ name, lat: center.lat, lng: center.lng });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <h2 className="font-black text-slate-900 dark:text-white">
          {isNe ? 'नक्सामा स्थान छान्नुहोस्' : 'Pick location on map'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative flex-1 min-h-0">
        <div ref={mapContainerRef} className="absolute inset-0" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[500]">
          <MapPin className="w-9 h-9 text-violet-600 drop-shadow-md" fill="currentColor" />
        </div>

        <button
          onClick={handleUseMyLocation}
          disabled={locating}
          className="absolute top-3 right-3 z-[500] p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50"
        >
          <LocateFixed className={`w-5 h-5 ${locating ? 'animate-pulse' : ''}`} />
        </button>

        {locateError && (
          <div className="absolute top-16 right-3 left-3 z-[500] px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md">
            {locateError}
          </div>
        )}
      </div>

      <div className="p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
          {previewLoading
            ? isNe ? 'ठेगाना खोज्दै...' : 'Looking up address...'
            : previewName || `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            {isNe ? 'यो स्थान प्रयोग गर्नुहोस्' : 'Use this location'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationMapPicker;
