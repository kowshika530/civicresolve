import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Complaint } from '../../types';
import { format } from 'date-fns';
import { 
  Filter, Layers, Flame, AlertCircle, RefreshCw, 
  MapPin, CheckCircle2, ShieldAlert, ArrowUpRight, Search, Sparkles
} from 'lucide-react';

interface HotspotMapProps {
  complaints: Complaint[];
  role?: string;
  defaultDepartment?: string;
}

// Custom Leaflet DivIcon for complaints on the hotspot map
const createMarkerIcon = (priority: string = 'Medium', isRecurring: boolean = false) => {
  let bgColor = '#008C95';
  if (priority === 'Critical') bgColor = '#8E2C2C';
  else if (priority === 'High') bgColor = '#C0392B';
  else if (priority === 'Medium') bgColor = '#D99A2B';
  else if (priority === 'Low') bgColor = '#3A7D44';

  const ringStyle = isRecurring 
    ? 'box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.4), 0 4px 10px rgba(0,0,0,0.3); animation: pulse 2s infinite;'
    : 'box-shadow: 0 4px 8px rgba(0,0,0,0.3);';

  return L.divIcon({
    className: 'hotspot-marker-icon',
    html: `
      <div style="position: relative; transform: translate(-50%, -100%);">
        <div style="background-color: ${bgColor}; color: white; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; ${ringStyle} border: 2px solid #FFFFFF;">
          <div style="transform: rotate(45deg); font-size: 11px; font-weight: 800; color: white;">
            ${priority === 'Critical' ? '!' : priority === 'High' ? 'H' : priority === 'Medium' ? 'M' : 'L'}
          </div>
        </div>
        ${isRecurring ? '<div style="position: absolute; top: -6px; right: -6px; background: #DC2626; color: white; font-size: 8px; font-weight: 900; border-radius: 999px; padding: 1px 4px; border: 1px solid white;">CLUSTER</div>' : ''}
        <div style="width: 8px; height: 3px; background: rgba(0,0,0,0.25); border-radius: 50%; margin: 2px auto 0;"></div>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38]
  });
};

export function HotspotMap({ complaints, role = 'ADMIN', defaultDepartment }: HotspotMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatCirclesLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters State
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(defaultDepartment || 'All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all'); // all, 7d, 30d, 90d
  const [showDensityCircles, setShowDensityCircles] = useState<boolean>(true);
  const [recurringClusters, setRecurringClusters] = useState<any[]>([]);

  // Filter distinct values for dropdowns
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach(c => { if (c.state) set.add(c.state); });
    return Array.from(set);
  }, [complaints]);

  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach(c => {
      if ((selectedState === 'All' || c.state === selectedState) && c.district) {
        set.add(c.district);
      }
    });
    return Array.from(set);
  }, [complaints, selectedState]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach(c => {
      if ((selectedDistrict === 'All' || c.district === selectedDistrict) && c.city) {
        set.add(c.city);
      }
    });
    return Array.from(set);
  }, [complaints, selectedDistrict]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach(c => {
      if (c.categoryName) set.add(c.categoryName);
      else if (c.aiCategory) set.add(c.aiCategory);
    });
    return Array.from(set);
  }, [complaints]);

  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach(c => { if (c.departmentName) set.add(c.departmentName); });
    return Array.from(set);
  }, [complaints]);

  // Fetch Recurring Issue Clusters
  useEffect(() => {
    fetch('/api/complaints/recurring')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecurringClusters(data);
      })
      .catch(() => {});
  }, []);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    const now = Date.now();
    return complaints.filter(c => {
      // Must have coordinates for map
      if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number') return false;

      if (selectedState !== 'All' && c.state !== selectedState) return false;
      if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;
      if (selectedCity !== 'All' && c.city !== selectedCity) return false;

      if (selectedCategory !== 'All') {
        const catMatch = (c.categoryName && c.categoryName.toLowerCase().includes(selectedCategory.toLowerCase())) ||
                         (c.aiCategory && c.aiCategory.toLowerCase().includes(selectedCategory.toLowerCase()));
        if (!catMatch) return false;
      }

      if (selectedDepartment !== 'All' && c.departmentName !== selectedDepartment) return false;
      if (selectedPriority !== 'All' && c.finalPriority !== selectedPriority) return false;
      if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;

      if (dateRange === '7d' && now - c.createdAt > 7 * 24 * 3600 * 1000) return false;
      if (dateRange === '30d' && now - c.createdAt > 30 * 24 * 3600 * 1000) return false;
      if (dateRange === '90d' && now - c.createdAt > 90 * 24 * 3600 * 1000) return false;

      return true;
    });
  }, [complaints, selectedState, selectedDistrict, selectedCity, selectedCategory, selectedDepartment, selectedPriority, selectedStatus, dateRange]);

  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [userLocationCoords, setUserLocationCoords] = useState<[number, number] | null>(null);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const userGpsCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map with Statewide Tamil Nadu Bounds
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered at Tamil Nadu Geographic Center (covers Chennai to Kanyakumari, Coimbatore to Nagapattinam)
    const map = L.map(mapContainerRef.current, {
      center: [11.1271, 78.6569],
      zoom: 7,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    heatCirclesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      heatCirclesLayerRef.current = null;
      userGpsMarkerRef.current = null;
      userGpsCircleRef.current = null;
    };
  }, []);

  // Update Markers & Density Circles when filtered complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !heatCirclesLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    const heatGroup = heatCirclesLayerRef.current;

    markersGroup.clearLayers();
    heatGroup.clearLayers();

    if (filteredComplaints.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Recurring IDs set for highlighting
    const recurringIds = new Set<string>();
    recurringClusters.forEach(cluster => {
      cluster.complaints?.forEach((c: any) => recurringIds.add(c.id));
    });

    // Add Hotspot Density Circles if enabled
    if (showDensityCircles) {
      // Group nearby complaints to show density circles
      filteredComplaints.forEach((c) => {
        const isCluster = recurringIds.has(c.id);
        const radius = isCluster ? 600 : 350;
        const color = isCluster ? '#DC2626' : (c.finalPriority === 'Critical' ? '#8E2C2C' : '#008C95');
        
        L.circle([c.latitude!, c.longitude!], {
          radius,
          color,
          fillColor: color,
          fillOpacity: isCluster ? 0.22 : 0.12,
          weight: isCluster ? 2 : 1,
          dashArray: isCluster ? '4, 4' : undefined
        }).addTo(heatGroup);
      });
    }

    // Disambiguate overlapping coordinates so all distinct markers are visible
    const coordCounts: Record<string, number> = {};

    filteredComplaints.forEach((complaint, index) => {
      let lat = complaint.latitude!;
      let lng = complaint.longitude!;

      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      coordCounts[key] = (coordCounts[key] || 0) + 1;
      const count = coordCounts[key];

      // If another marker already occupies this exact point, apply subtle radial dispersion
      if (count > 1) {
        const angle = (count - 1) * (2 * Math.PI / 5);
        const radius = 0.00045 * Math.ceil(count / 5); // ~35 meters
        lat += Math.sin(angle) * radius;
        lng += Math.cos(angle) * radius;
      }

      bounds.extend([lat, lng]);

      const isRecurring = recurringIds.has(complaint.id);
      const isAutoEscalated = Boolean(complaint.isEscalated || complaint.status === 'Escalated' || (complaint.duplicateCount && complaint.duplicateCount > 1));

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(complaint.finalPriority, isRecurring || isAutoEscalated)
      });

      const detailUrl = role === 'SENIOR_OFFICER' 
        ? `/senior/complaints/${complaint.id}` 
        : role === 'OFFICER' 
        ? `/officer/complaints/${complaint.id}` 
        : `/track?id=${encodeURIComponent(complaint.complaintNumber)}`;

      const popupHtml = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 4px; min-width: 230px; max-width: 280px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 13px; color: #172033; font-family: monospace;">
              ${complaint.complaintNumber}
            </span>
            <span style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: ${
              complaint.finalPriority === 'Critical' ? '#FEE2E2; color: #991B1B' :
              complaint.finalPriority === 'High' ? '#FFEDD5; color: #9A3412' : '#E0F2FE; color: #0369A1'
            };">
              ${complaint.finalPriority || 'Medium'}
            </span>
          </div>

          <div style="font-size: 12px; font-weight: 700; color: #1F2937; margin-bottom: 3px; line-height: 1.3;">
            ${complaint.subject}
          </div>

          <div style="font-size: 11px; color: #4B5563; margin-bottom: 4px; line-height: 1.4;">
            <strong>Category:</strong> ${complaint.categoryName || complaint.aiCategory || 'General'}<br/>
            <strong>Dept:</strong> ${complaint.departmentName || 'Public Works'}<br/>
            <strong>Status:</strong> <span style="font-weight: 600; color: #111827;">${complaint.status}</span><br/>
            <strong>Exact Location:</strong> ${complaint.location_address || complaint.location || 'Annur, Coimbatore'}<br/>
            <span style="font-family: monospace; font-size: 10px; color: #64748B;">GPS: ${complaint.latitude?.toFixed(5)}°N, ${complaint.longitude?.toFixed(5)}°E</span><br/>
            <strong>Created:</strong> ${format(new Date(complaint.createdAt), 'dd MMM yyyy')}
          </div>

          ${isAutoEscalated ? `
            <div style="margin: 4px 0; padding: 3px 6px; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 4px; font-size: 10px; font-weight: 700; color: #B91C1C;">
              ⚡ Direct Escalation: Senior Officer Oversight (Multi-Citizen Duplicate Surge)
            </div>
          ` : ''}

          ${isRecurring && !isAutoEscalated ? `
            <div style="margin: 4px 0; padding: 3px 6px; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 4px; font-size: 10px; font-weight: 700; color: #B91C1C;">
              ⚠️ Recurring Hotspot Identified in this Area
            </div>
          ` : ''}

          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #E5E7EB; text-align: right;">
            <a href="${detailUrl}" style="color: #008C95; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center;">
              Open Complaint Record &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(markersGroup);
    });

    if (filteredComplaints.length > 0 && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    if (bounds.isValid() && filteredComplaints.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [filteredComplaints, showDensityCircles, recurringClusters, role]);

  const handleResetFilters = () => {
    setSelectedState('All');
    setSelectedDistrict('All');
    setSelectedCity('All');
    setSelectedCategory('All');
    setSelectedDepartment(defaultDepartment || 'All');
    setSelectedPriority('All');
    setSelectedStatus('All');
    setDateRange('all');
  };

  const handleViewEntireTamilNadu = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([11.1271, 78.6569], 7, { animate: true });
    }
  };

  const handleFindUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocationCoords([latitude, longitude]);

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.setView([latitude, longitude], 14, { animate: true });

          // Remove old GPS marker if present
          if (userGpsMarkerRef.current) {
            map.removeLayer(userGpsMarkerRef.current);
          }
          if (userGpsCircleRef.current) {
            map.removeLayer(userGpsCircleRef.current);
          }

          // Create animated GPS beacon marker
          const gpsIcon = L.divIcon({
            className: 'user-gps-beacon',
            html: `
              <div style="position: relative; width: 24px; height: 24px;">
                <div style="position: absolute; inset: 0; background: #008C95; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; inset: 3px; background: #008C95; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([latitude, longitude], { icon: gpsIcon, zIndexOffset: 1000 }).addTo(map);
          marker.bindPopup(`
            <div style="font-size: 12px; font-weight: bold; color: #172033; padding: 2px;">
              📍 Your Real-Time Location (Live GPS)
              <div style="font-size: 11px; font-weight: normal; color: #64748B; margin-top: 2px;">
                Accuracy: ±${Math.round(accuracy)}m<br/>
                Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}
              </div>
            </div>
          `).openPopup();
          userGpsMarkerRef.current = marker;

          const circle = L.circle([latitude, longitude], {
            radius: Math.max(accuracy, 50),
            color: '#008C95',
            fillColor: '#008C95',
            fillOpacity: 0.12,
            weight: 1.5
          }).addTo(map);
          userGpsCircleRef.current = circle;
        }
      },
      (err) => {
        setLocatingUser(false);
        console.warn('Geolocation error:', err);
        handleViewEntireTamilNadu();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Hotspot Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-[#172033]">
              Geographic Complaint Hotspot Explorer &bull; Tamil Nadu Statewide
            </h3>
            <span className="px-2 py-0.5 bg-teal-50 text-[#008C95] font-bold text-xs rounded-full border border-teal-100">
              {filteredComplaints.length} Geocoded Grievances
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time interactive OpenStreetMap showing civic complaints across all districts of Tamil Nadu.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Entire Tamil Nadu Button */}
          <button
            type="button"
            onClick={handleViewEntireTamilNadu}
            className="px-3 py-1.5 bg-[#172033] hover:bg-[#202D45] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Zoom out to show entire Tamil Nadu state"
          >
            <span>🗺️ Entire Tamil Nadu</span>
          </button>

          {/* Real-Time Live GPS Tracker Button */}
          <button
            type="button"
            onClick={handleFindUserLocation}
            disabled={locatingUser}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Track and pinpoint your real-time GPS location"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>{locatingUser ? 'Locating GPS...' : '📍 Real-Time Location'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDensityCircles(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              showDensityCircles 
                ? 'bg-teal-50 border-[#008C95] text-[#008C95]' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Density Heat Rings: {showDensityCircles ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* RECURRING ISSUE DETECTION ALERT CARD */}
      {recurringClusters.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                  ⚠️ Possible Recurring Issue Detected
                </span>
                <span className="text-xs font-semibold text-amber-800">
                  {recurringClusters.length} Geographic Cluster{recurringClusters.length > 1 ? 's' : ''} Identified
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                Automated geospatial analysis identified multiple related complaints clustered within ~1.5 km over recent days:
              </p>

              {/* Cluster items */}
              <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2">
                {recurringClusters.map(cluster => (
                  <div key={cluster.id} className="bg-white/90 border border-amber-300/80 rounded-lg p-2.5 text-xs text-gray-800 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
                      <span>{cluster.title}</span>
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">
                        {cluster.count} Complaints
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mb-1.5">
                      📍 Area: <strong>{cluster.city}, {cluster.district}</strong> &bull; Dept: {cluster.departmentName || cluster.category}
                    </p>
                    <div className="space-y-1">
                      {cluster.complaints?.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between text-[10px] bg-amber-50/60 px-1.5 py-0.5 rounded border border-amber-100">
                          <span className="font-mono font-bold text-gray-800">{c.complaintNumber}</span>
                          <span className="truncate max-w-[140px] text-gray-600">{c.subject}</span>
                          <span className="text-amber-800 font-medium">{c.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-[#008C95]" />
          <span>Filter Hotspots by Geography, Department & SLA</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* State */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">State</label>
            <select
              value={selectedState}
              onChange={e => { setSelectedState(e.target.value); setSelectedDistrict('All'); setSelectedCity('All'); }}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="All">All States</option>
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={e => { setSelectedDistrict(e.target.value); setSelectedCity('All'); }}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="All">All Districts</option>
              {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* City / Town */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City / Town</label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="All">All Cities</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="All">All Categories</option>
              {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="All">All Depts</option>
              {availableDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Citizen Verification">Verification</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#008C95]"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-300 shadow-md bg-neutral-100">
        <div
          ref={mapContainerRef}
          style={{ height: '520px', width: '100%', zIndex: 1 }}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-gray-200 shadow-md text-xs space-y-1.5">
          <div className="font-bold text-gray-800 text-[11px] uppercase tracking-wider mb-1">Priority Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8E2C2C]"></span>
            <span className="text-gray-700">Critical Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#C0392B]"></span>
            <span className="text-gray-700">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#D99A2B]"></span>
            <span className="text-gray-700">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3A7D44]"></span>
            <span className="text-gray-700">Low Priority</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-red-600 bg-red-100"></span>
            <span className="text-red-700 font-bold text-[10px]">Recurring Hotspot Circle</span>
          </div>
        </div>

        {/* Top-Right Quick Helper */}
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs text-xs font-medium text-gray-700">
          Showing <span className="font-bold text-[#008C95]">{filteredComplaints.length}</span> complaints on map
        </div>
      </div>
    </div>
  );
}
