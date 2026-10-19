import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Search, Navigation, MapPin, X, Check, Loader2, AlertCircle } from 'lucide-react';

export interface LocationPickerValue {
  latitude: number | null;
  longitude: number | null;
  address: string;
  source: 'MAP_SELECTION' | 'CURRENT_LOCATION' | 'SEARCH' | 'MANUAL';
  state?: string;
  district?: string;
  city?: string;
  pin?: string;
}

interface LocationPickerMapProps {
  value: {
    latitude: number | null;
    longitude: number | null;
    address?: string;
    source?: string;
  };
  onChange: (val: LocationPickerValue) => void;
  defaultCenter?: [number, number]; // [lat, lng]
  defaultZoom?: number;
  initialState?: string;
  initialDistrict?: string;
  initialCity?: string;
}

// Custom crisp SVG Pin Icon to eliminate bundler 404 asset bugs
const createPinIcon = (color: string = '#008C95') => {
  return L.divIcon({
    className: 'civic-marker-pin',
    html: `
      <div style="position: relative; transform: translate(-50%, -100%); width: 34px; height: 42px; cursor: grab;">
        <svg viewBox="0 0 24 24" width="34" height="42" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
          <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="3.2" fill="#FFFFFF"/>
        </svg>
        <div style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); width: 8px; height: 3px; background: rgba(0,0,0,0.3); border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -42]
  });
};

// 38 Administrative Districts of Tamil Nadu with precise headquarters coordinates
export const TAMIL_NADU_DISTRICTS = [
  { name: 'Ariyalur', district: 'Ariyalur', city: 'Ariyalur', lat: 11.1401, lng: 79.0786, pin: '621704' },
  { name: 'Chengalpattu', district: 'Chengalpattu', city: 'Chengalpattu', lat: 12.6841, lng: 79.9836, pin: '603001' },
  { name: 'Chennai Central & Corporation', district: 'Chennai', city: 'Chennai', lat: 13.0827, lng: 80.2707, pin: '600003' },
  { name: 'Coimbatore Corporation', district: 'Coimbatore', city: 'Coimbatore', lat: 11.0168, lng: 76.9558, pin: '641001' },
  { name: 'Annur Town (Coimbatore)', district: 'Coimbatore', city: 'Annur', lat: 11.2342, lng: 77.1350, pin: '641653' },
  { name: 'Cuddalore', district: 'Cuddalore', city: 'Cuddalore', lat: 11.7564, lng: 79.7634, pin: '607001' },
  { name: 'Dharmapuri', district: 'Dharmapuri', city: 'Dharmapuri', lat: 12.1357, lng: 78.1584, pin: '636701' },
  { name: 'Dindigul', district: 'Dindigul', city: 'Dindigul', lat: 10.3673, lng: 77.9803, pin: '624001' },
  { name: 'Erode', district: 'Erode', city: 'Erode', lat: 11.3410, lng: 77.7172, pin: '638001' },
  { name: 'Kallakurichi', district: 'Kallakurichi', city: 'Kallakurichi', lat: 11.7383, lng: 78.9639, pin: '606202' },
  { name: 'Kanchipuram', district: 'Kanchipuram', city: 'Kanchipuram', lat: 12.8342, lng: 79.7036, pin: '631501' },
  { name: 'Kanyakumari / Nagercoil', district: 'Kanyakumari', city: 'Nagercoil', lat: 8.1833, lng: 77.4119, pin: '629001' },
  { name: 'Karur', district: 'Karur', city: 'Karur', lat: 10.9601, lng: 78.0766, pin: '639001' },
  { name: 'Krishnagiri / Hosur', district: 'Krishnagiri', city: 'Hosur', lat: 12.7409, lng: 77.8253, pin: '635126' },
  { name: 'Madurai Corporation Zone', district: 'Madurai', city: 'Madurai', lat: 9.9252, lng: 78.1198, pin: '625001' },
  { name: 'Mayiladuthurai', district: 'Mayiladuthurai', city: 'Mayiladuthurai', lat: 11.1075, lng: 79.6522, pin: '609001' },
  { name: 'Nagapattinam', district: 'Nagapattinam', city: 'Nagapattinam', lat: 10.7672, lng: 79.8449, pin: '611001' },
  { name: 'Namakkal', district: 'Namakkal', city: 'Namakkal', lat: 11.2189, lng: 78.1674, pin: '637001' },
  { name: 'Nilgiris / Ooty', district: 'Nilgiris', city: 'Udhagamandalam', lat: 11.4102, lng: 76.7032, pin: '643001' },
  { name: 'Perambalur', district: 'Perambalur', city: 'Perambalur', lat: 11.2333, lng: 78.8833, pin: '621212' },
  { name: 'Pudukkottai', district: 'Pudukkottai', city: 'Pudukkottai', lat: 10.3833, lng: 78.8167, pin: '622001' },
  { name: 'Ramanathapuram', district: 'Ramanathapuram', city: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, pin: '623501' },
  { name: 'Ranipet', district: 'Ranipet', city: 'Ranipet', lat: 12.9272, lng: 79.3331, pin: '632401' },
  { name: 'Salem Corporation', district: 'Salem', city: 'Salem', lat: 11.6643, lng: 78.1460, pin: '636001' },
  { name: 'Sivaganga', district: 'Sivaganga', city: 'Sivaganga', lat: 9.8433, lng: 78.4809, pin: '630561' },
  { name: 'Tenkasi', district: 'Tenkasi', city: 'Tenkasi', lat: 8.9594, lng: 77.3150, pin: '627811' },
  { name: 'Thanjavur', district: 'Thanjavur', city: 'Thanjavur', lat: 10.7870, lng: 79.1378, pin: '613001' },
  { name: 'Theni', district: 'Theni', city: 'Theni', lat: 10.0104, lng: 77.4768, pin: '625531' },
  { name: 'Thoothukudi', district: 'Thoothukudi', city: 'Thoothukudi', lat: 8.7642, lng: 78.1348, pin: '628001' },
  { name: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', city: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, pin: '620001' },
  { name: 'Tirunelveli', district: 'Tirunelveli', city: 'Tirunelveli', lat: 8.7139, lng: 77.7567, pin: '627001' },
  { name: 'Tirupathur', district: 'Tirupathur', city: 'Tirupathur', lat: 12.4958, lng: 78.5678, pin: '635601' },
  { name: 'Tiruppur', district: 'Tiruppur', city: 'Tiruppur', lat: 11.1085, lng: 77.3411, pin: '641601' },
  { name: 'Tiruvallur', district: 'Tiruvallur', city: 'Tiruvallur', lat: 13.1432, lng: 79.9083, pin: '602001' },
  { name: 'Tiruvannamalai', district: 'Tiruvannamalai', city: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, pin: '606601' },
  { name: 'Tiruvarur', district: 'Tiruvarur', city: 'Tiruvarur', lat: 10.7725, lng: 79.6365, pin: '610001' },
  { name: 'Vellore', district: 'Vellore', city: 'Vellore', lat: 12.9165, lng: 79.1325, pin: '632001' },
  { name: 'Viluppuram', district: 'Viluppuram', city: 'Viluppuram', lat: 11.9401, lng: 79.4861, pin: '605602' },
  { name: 'Virudhunagar', district: 'Virudhunagar', city: 'Virudhunagar', lat: 9.5872, lng: 77.9514, pin: '626001' },
];

export function LocationPickerMap({
  value,
  onChange,
  defaultCenter = [11.1271, 78.6569], // Default center: Tamil Nadu Geographic Center
  defaultZoom = 8,
  initialState = 'Tamil Nadu',
  initialDistrict,
  initialCity
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const liveGpsCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [locatingUser, setLocatingUser] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [geoError, setGeoError] = useState('');
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState(value.address || '');
  const [isLocked, setIsLocked] = useState(Boolean(value.latitude && value.longitude));
  const [confirmedToast, setConfirmedToast] = useState(false);
  const [selectedTnDistrict, setSelectedTnDistrict] = useState(initialDistrict || '');

  // Quick preset locations in Tamil Nadu
  const PRESET_LOCATIONS = [
    { name: 'Chennai Central', lat: 13.0827, lng: 80.2707, district: 'Chennai', city: 'Chennai' },
    { name: 'Coimbatore Corp', lat: 11.0168, lng: 76.9558, district: 'Coimbatore', city: 'Coimbatore' },
    { name: 'Madurai Temple', lat: 9.9195, lng: 78.1193, district: 'Madurai', city: 'Madurai' },
    { name: 'Trichy Srirangam', lat: 10.8622, lng: 78.6946, district: 'Tiruchirappalli', city: 'Tiruchirappalli' },
    { name: 'Salem Fairlands', lat: 11.6740, lng: 78.1460, district: 'Salem', city: 'Salem' },
    { name: 'Tirunelveli Town', lat: 8.7139, lng: 77.7567, district: 'Tirunelveli', city: 'Tirunelveli' },
    { name: 'Tiruppur Kumaran', lat: 11.1085, lng: 77.3411, district: 'Tiruppur', city: 'Tiruppur' },
    { name: 'Erode Brough Rd', lat: 11.3410, lng: 77.7172, district: 'Erode', city: 'Erode' },
    { name: 'Vellore Fort', lat: 12.9165, lng: 79.1325, district: 'Vellore', city: 'Vellore' },
    { name: 'Nagercoil / Kanyakumari', lat: 8.1833, lng: 77.4119, district: 'Kanyakumari', city: 'Nagercoil' },
    { name: 'Ooty Nilgiris', lat: 11.4102, lng: 76.7032, district: 'Nilgiris', city: 'Udhagamandalam' },
    { name: 'Annur Ward Center', lat: 11.2342, lng: 77.1350, district: 'Coimbatore', city: 'Annur' },
  ];

  const handleQuickPreset = (lat: number, lng: number, districtName?: string, cityName?: string) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
    }
    setMarkerPosition(lat, lng, true, 'SEARCH');
    reverseGeocode(lat, lng, 'SEARCH', districtName, cityName);
    setIsLocked(true);
    setConfirmedToast(true);
    setTimeout(() => setConfirmedToast(false), 3500);
  };

  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distName = e.target.value;
    setSelectedTnDistrict(distName);
    if (!distName) return;
    const item = TAMIL_NADU_DISTRICTS.find(d => d.name === distName || d.district === distName);
    if (item) {
      handleQuickPreset(item.lat, item.lng, item.district, item.city);
    }
  };

  const handleViewAllTamilNadu = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([11.1271, 78.6569], 7, { animate: true });
    }
  };

  // Reverse Geocode helper
  const reverseGeocode = useCallback(async (
    lat: number, 
    lng: number, 
    source: LocationPickerValue['source'],
    overrideDistrict?: string,
    overrideCity?: string
  ) => {
    setReverseGeocoding(true);
    try {
      const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
      let addrStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      let parsedState = 'Tamil Nadu';
      let parsedDistrict = overrideDistrict || '';
      let parsedCity = overrideCity || '';
      let parsedPin = '';

      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          addrStr = data.display_name;
        }
        if (data.address) {
          const a = data.address;
          parsedState = a.state || 'Tamil Nadu';
          parsedDistrict = overrideDistrict || a.state_district || a.county || '';
          parsedCity = overrideCity || a.city || a.town || a.village || a.suburb || '';
          parsedPin = a.postcode || '';
        }
      }

      setDetectedAddress(addrStr);
      onChange({
        latitude: lat,
        longitude: lng,
        address: addrStr,
        source,
        state: parsedState || initialState,
        district: parsedDistrict || initialDistrict || 'Tamil Nadu',
        city: parsedCity || initialCity,
        pin: parsedPin
      });
    } catch {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setDetectedAddress(fallback);
      onChange({
        latitude: lat,
        longitude: lng,
        address: fallback,
        source,
        state: 'Tamil Nadu',
        district: overrideDistrict || initialDistrict || 'Tamil Nadu',
        city: overrideCity || initialCity
      });
    } finally {
      setReverseGeocoding(false);
    }
  }, [onChange, initialState, initialDistrict, initialCity]);

  // Place or Move Marker helper
  const setMarkerPosition = useCallback((lat: number, lng: number, zoomTo: boolean = false, source: LocationPickerValue['source'] = 'MAP_SELECTION') => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: createPinIcon('#008C95'),
        draggable: true,
        title: 'Complaint Location (Drag to adjust)'
      }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        await reverseGeocode(pos.lat, pos.lng, 'MAP_SELECTION');
      });

      markerRef.current = marker;
    }

    if (zoomTo) {
      map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [reverseGeocode]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = value.latitude ?? defaultCenter[0];
    const initialLng = value.longitude ?? defaultCenter[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: value.latitude ? 15 : defaultZoom,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Click handler to place/move marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      setGeoError('');
      setMarkerPosition(e.latlng.lat, e.latlng.lng, false, 'MAP_SELECTION');
      reverseGeocode(e.latlng.lat, e.latlng.lng, 'MAP_SELECTION');
      setIsLocked(true);
    });

    mapInstanceRef.current = map;

    // Place existing coordinate marker if present
    if (value.latitude && value.longitude) {
      setMarkerPosition(value.latitude, value.longitude, false, (value.source as any) || 'MANUAL');
    }

    // Leaflet needs resize invalidation after container mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      liveGpsCircleRef.current = null;
    };
  }, []);

  // Update marker if props change externally
  useEffect(() => {
    if (value.latitude && value.longitude && mapInstanceRef.current) {
      setMarkerPosition(value.latitude, value.longitude, false, (value.source as any) || 'MANUAL');
      if (value.address) setDetectedAddress(value.address);
    }
  }, [value.latitude, value.longitude, value.address, setMarkerPosition]);

  // Real-Time Continuous GPS Tracking Toggle
  const handleToggleLiveTracking = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please select location manually or choose a Tamil Nadu district.');
      return;
    }

    if (isLiveTracking) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (liveGpsCircleRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(liveGpsCircleRef.current);
        liveGpsCircleRef.current = null;
      }
      setIsLiveTracking(false);
      setAccuracyMeters(null);
      return;
    }

    // Start Live Tracking
    setIsLiveTracking(true);
    setLocatingUser(true);

    const updatePosition = (position: GeolocationPosition) => {
      setLocatingUser(false);
      const { latitude, longitude, accuracy } = position.coords;
      setAccuracyMeters(Math.round(accuracy));

      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;
        map.setView([latitude, longitude], Math.max(map.getZoom(), 16), { animate: true });

        // Update GPS pulse circle
        if (liveGpsCircleRef.current) {
          liveGpsCircleRef.current.setLatLng([latitude, longitude]);
          liveGpsCircleRef.current.setRadius(Math.max(accuracy, 25));
        } else {
          liveGpsCircleRef.current = L.circle([latitude, longitude], {
            radius: Math.max(accuracy, 25),
            color: '#008C95',
            fillColor: '#008C95',
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '4, 4'
          }).addTo(map);
        }
      }

      setMarkerPosition(latitude, longitude, false, 'CURRENT_LOCATION');
      reverseGeocode(latitude, longitude, 'CURRENT_LOCATION');
      setIsLocked(true);
      setConfirmedToast(true);
      setTimeout(() => setConfirmedToast(false), 3000);
    };

    const handleError = (error: GeolocationPositionError) => {
      setLocatingUser(false);
      setIsLiveTracking(false);
      console.warn('Geolocation error:', error);
      // Automatic fallback in Tamil Nadu
      const fallbackLat = 11.2342;
      const fallbackLng = 77.1350;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([fallbackLat, fallbackLng], 15, { animate: true });
      }
      setMarkerPosition(fallbackLat, fallbackLng, true, 'CURRENT_LOCATION');
      reverseGeocode(fallbackLat, fallbackLng, 'CURRENT_LOCATION');
      setIsLocked(true);
      setConfirmedToast(true);
      setTimeout(() => setConfirmedToast(false), 3500);
      setGeoError('GPS location was unavailable or restricted by browser settings. Centered on Tamil Nadu Civic District. You can pan, drag the pin, or pick your district directly.');
    };

    navigator.geolocation.getCurrentPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    watchIdRef.current = navigator.geolocation.watchPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 15000
    });
  };

  // Search Handler
  const handleSearchSubmit = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      if ('preventDefault' in e) e.preventDefault();
      if ('stopPropagation' in e) e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    setSearching(true);
    setGeoError('');
    try {
      const res = await fetch(`/api/geo/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          setSearchResults(results);
          // Pick top result
          const top = results[0];
          const lat = parseFloat(top.lat);
          const lng = parseFloat(top.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
            }
            setMarkerPosition(lat, lng, true, 'SEARCH');
            setDetectedAddress(top.display_name);
            setIsLocked(true);

            onChange({
              latitude: lat,
              longitude: lng,
              address: top.display_name,
              source: 'SEARCH',
              state: top.address?.state || initialState,
              district: top.address?.state_district || top.address?.county || initialDistrict,
              city: top.address?.city || top.address?.town || top.address?.village || initialCity,
              pin: top.address?.postcode
            });
          }
        } else {
          setGeoError(`No results found for "${searchQuery}". You can pan and click anywhere on the map to pinpoint.`);
        }
      }
    } catch {
      setGeoError('Location search failed. Please click directly on the map to select.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      }
      setMarkerPosition(lat, lng, true, 'SEARCH');
      setDetectedAddress(result.display_name);
      setIsLocked(true);
      setSearchResults([]);
      setSearchQuery(result.display_name.split(',')[0]);

      onChange({
        latitude: lat,
        longitude: lng,
        address: result.display_name,
        source: 'SEARCH',
        state: result.address?.state || initialState,
        district: result.address?.state_district || result.address?.county || initialDistrict,
        city: result.address?.city || result.address?.town || result.address?.village || initialCity,
        pin: result.address?.postcode
      });
    }
  };

  const handleConfirmLocation = async () => {
    let lat = value.latitude;
    let lng = value.longitude;

    if (!lat || !lng) {
      if (mapInstanceRef.current) {
        const center = mapInstanceRef.current.getCenter();
        lat = center.lat;
        lng = center.lng;
        setMarkerPosition(lat, lng, true, 'MAP_SELECTION');
      } else {
        lat = 11.2342;
        lng = 77.1350;
      }
    }

    setIsLocked(true);
    setConfirmedToast(true);
    setTimeout(() => setConfirmedToast(false), 3500);

    await reverseGeocode(lat, lng, (value.source as any) || 'MAP_SELECTION');
  };

  const handleClearLocation = () => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setDetectedAddress('');
    setIsLocked(false);
    setSearchQuery('');
    setGeoError('');
    onChange({
      latitude: null,
      longitude: null,
      address: '',
      source: 'MANUAL'
    });
  };

  return (
    <div className="space-y-3">
      {/* Map Control Bar: Search & My Location */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Search location: e.g. Annur, Coimbatore, Indiranagar, landmark..."
              className="w-full pl-9 pr-20 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <button
              type="button"
              onClick={handleSearchSubmit}
              disabled={searching || !searchQuery.trim()}
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#008C95] hover:bg-teal-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Search Dropdown Suggestions */}
          {searchResults.length > 1 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-gray-100 last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#008C95] shrink-0 mt-0.5" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* REAL-TIME LIVE GPS TRACKING BUTTON */}
        <button
          type="button"
          onClick={handleToggleLiveTracking}
          disabled={locatingUser}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer border ${
            isLiveTracking
              ? 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-200 shadow-md ring-2 ring-emerald-400'
              : 'bg-white border-teal-600 text-teal-800 hover:bg-teal-50'
          }`}
          title="Enable continuous live GPS tracking on your device"
        >
          {isLiveTracking ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>🔴 Stop Live GPS</span>
            </>
          ) : locatingUser ? (
            <>
              <Loader2 className="w-4 h-4 text-[#008C95] animate-spin" />
              <span>Locating GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-[#008C95]" />
              <span>📍 Enable Real-Time Location</span>
            </>
          )}
        </button>

        {/* View Entire Tamil Nadu Button */}
        <button
          type="button"
          onClick={handleViewAllTamilNadu}
          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          title="Zoom out to view all of Tamil Nadu"
        >
          <span>🗺️ All Tamil Nadu</span>
        </button>
      </div>

      {/* Real-time Tracking Status Active Pill */}
      {isLiveTracking && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-bold">Real-Time Live GPS Tracking Active</span>
            {accuracyMeters !== null && (
              <span className="text-[11px] font-mono bg-emerald-200/70 px-1.5 py-0.5 rounded text-emerald-950">
                ±{accuracyMeters}m accuracy
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-emerald-800">
            {value.latitude?.toFixed(5)}, {value.longitude?.toFixed(5)}
          </span>
        </div>
      )}

      {/* Tamil Nadu District Dropdown Selector & Quick Town Buttons */}
      <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-[#172033] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#008C95]" />
            <span>Select Location Across Tamil Nadu (38 Districts):</span>
          </span>
          <select
            value={selectedTnDistrict}
            onChange={handleDistrictSelect}
            className="px-2.5 py-1 text-xs bg-white border border-teal-300 rounded-lg font-medium text-gray-800 outline-none focus:ring-1 focus:ring-[#008C95] cursor-pointer"
          >
            <option value="">-- Choose Any Tamil Nadu District (38 Total) --</option>
            {TAMIL_NADU_DISTRICTS.map((d, i) => (
              <option key={i} value={d.district}>
                📍 {d.name} ({d.district} District)
              </option>
            ))}
          </select>
        </div>

        {/* 1-Click Quick Location Presets Across Tamil Nadu */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">Quick Jumps:</span>
          {PRESET_LOCATIONS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickPreset(preset.lat, preset.lng, preset.district, preset.city)}
              className="px-2 py-0.5 bg-white hover:bg-teal-100 hover:text-teal-900 border border-teal-200 rounded text-[11px] font-medium text-gray-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              📍 {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Geolocation Denial / Error Notice */}
      {geoError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-neutral-100">
        <div
          ref={mapContainerRef}
          style={{ height: '320px', width: '100%', zIndex: 1 }}
          className="cursor-crosshair"
        />

        {/* Map Overlay helper tooltip */}
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 shadow-xs border border-gray-200/80 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#008C95]" />
          <span>Click anywhere or drag marker to set location</span>
        </div>

        {reverseGeocoding && (
          <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs text-gray-700 shadow-md border border-gray-200 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-[#008C95] animate-spin" />
            <span>Detecting exact street address...</span>
          </div>
        )}
      </div>

      {/* Selected Location Details Panel */}
      {value.latitude && value.longitude ? (
        <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                Selected Complaint Location
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmLocation}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  confirmedToast
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#008C95] hover:bg-teal-700 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{confirmedToast ? '✓ Location Confirmed!' : 'Use This Location'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearLocation}
                className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-white transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {confirmedToast && (
            <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>✓ Location successfully applied and synced to your complaint form!</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/80 p-2.5 rounded-lg border border-teal-100">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Latitude</span>
              <span className="font-mono font-bold text-gray-800">{Number(value.latitude).toFixed(5)}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Longitude</span>
              <span className="font-mono font-bold text-gray-800">{Number(value.longitude).toFixed(5)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Location Source</span>
              <span className="font-medium text-teal-800">
                {value.source === 'CURRENT_LOCATION' ? '📍 GPS Geolocation' :
                 value.source === 'SEARCH' ? '🔍 Map Search' : '📌 Map Pin Drop'}
              </span>
            </div>
          </div>

          {detectedAddress && (
            <div className="text-xs text-gray-700 bg-white/80 p-2.5 rounded-lg border border-teal-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Detected Address</span>
              <p className="leading-snug">{detectedAddress}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-xs text-gray-500">
          📍 No map location pinned yet. Click on the map or use search above to pin the exact complaint site.
        </div>
      )}
    </div>
  );
}
