import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, ExternalLink, Navigation, Compass } from 'lucide-react';

interface ComplaintLocationViewMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  locationTitle?: string;
  complaintNumber?: string;
  category?: string;
  status?: string;
  priority?: string;
  height?: string;
  showDetails?: boolean;
}

// Custom SVG Pin for viewing complaints
const createComplaintPin = (priority = 'Medium') => {
  let color = '#008C95';
  if (priority === 'Critical') color = '#8E2C2C';
  else if (priority === 'High') color = '#C0392B';
  else if (priority === 'Low') color = '#3A7D44';

  return L.divIcon({
    className: 'complaint-view-marker',
    html: `
      <div style="position: relative; transform: translate(-50%, -100%); width: 34px; height: 42px;">
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

export function ComplaintLocationViewMap({
  latitude,
  longitude,
  address,
  locationTitle,
  complaintNumber,
  category,
  status,
  priority = 'Medium',
  height = '280px',
  showDetails = true
}: ComplaintLocationViewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  useEffect(() => {
    if (!mapContainerRef.current || !hasCoords) return;
    if (mapInstanceRef.current) return;

    const lat = latitude as number;
    const lng = longitude as number;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: createComplaintPin(priority),
      title: complaintNumber || 'Complaint Location'
    }).addTo(map);

    // Interactive popup
    const popupContent = `
      <div style="padding: 4px; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 12px; line-height: 1.4; min-width: 180px;">
        <div style="font-weight: 800; color: #172033; font-size: 13px; margin-bottom: 2px;">
          ${complaintNumber || 'Complaint Site'}
        </div>
        ${category ? `<div style="color: #4B5563; font-weight: 500;">${category}</div>` : ''}
        ${status ? `<div style="margin-top: 4px; display: inline-block; padding: 2px 6px; background: #E5E7EB; color: #1F2937; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${status}</div>` : ''}
        <div style="margin-top: 6px; font-size: 11px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 4px;">
          Lat: ${lat.toFixed(5)}<br/>
          Lng: ${lng.toFixed(5)}
        </div>
      </div>
    `;
    marker.bindPopup(popupContent);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [hasCoords, latitude, longitude, complaintNumber, category, status, priority]);

  const handleOpenExternalMap = (type: 'osm' | 'google') => {
    if (!hasCoords) return;
    const lat = latitude as number;
    const lng = longitude as number;

    const url = type === 'osm'
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!hasCoords) {
    return (
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center">
        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-gray-700">Geographic Coordinates Not Pinned</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          {address || 'Standard street address recorded on file. No GPS coordinates were submitted.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
      {/* Map Header */}
      <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#008C95]" />
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            📍 Complaint Location (Interactive Map)
          </span>
        </div>
        
        {/* Open in Map Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenExternalMap('osm')}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-gray-300 hover:border-[#008C95] text-gray-700 hover:text-[#008C95] text-xs font-medium rounded transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Open coordinates in OpenStreetMap"
          >
            <span>Open in Map (OSM)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenExternalMap('google')}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-gray-300 hover:border-[#008C95] text-gray-700 hover:text-[#008C95] text-xs font-medium rounded transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Open in Google Maps"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Map Display */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          style={{ height, width: '100%', zIndex: 1 }}
        />
        <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-gray-600 font-mono shadow-xs border border-gray-200">
          {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
        </div>
      </div>

      {/* Location Details Footer */}
      {showDetails && (
        <div className="p-4 bg-white border-t border-gray-100 space-y-2 text-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Recorded Address</span>
              <p className="text-gray-800 font-medium leading-relaxed">
                {address || locationTitle || 'Address details on record'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Coordinates</span>
              <span className="font-mono text-gray-800 font-semibold">
                {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
