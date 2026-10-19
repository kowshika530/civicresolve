import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { HotspotMap } from '../../components/map/HotspotMap';
import { Flame, MapPin, AlertTriangle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export function AdminHotspots() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setComplaints(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const geocodedCount = complaints.filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number').length;
  const criticalCount = complaints.filter(c => c.finalPriority === 'Critical' && typeof c.latitude === 'number').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Geospatial Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-[#172033]">Complaint Hotspots & Recurring Issues</h1>
          <p className="text-xs text-gray-500 mt-1">
            Analyze complaint distribution across wards, identify geographic density clusters, and review potential recurring infrastructure failures.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Geocoded</span>
            <MapPin className="w-4 h-4 text-[#008C95]" />
          </div>
          <p className="text-2xl font-bold text-[#172033] mt-2 font-mono">{geocodedCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Grievances mapped with exact coordinates</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Critical Hazards</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2 font-mono">{criticalCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Emergency & critical priority sites</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Recurring Detection</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800 mt-2 font-mono">Active</p>
          <p className="text-[11px] text-gray-500 mt-1">2.5 km proximity &amp; 14-day temporal clustering</p>
        </div>
      </div>

      {/* Hotspot Interactive Map Component */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 text-gray-500">
          <div className="w-8 h-8 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-medium">Loading geospatial complaint database...</p>
        </div>
      ) : (
        <HotspotMap complaints={complaints} role="ADMIN" />
      )}
    </div>
  );
}
