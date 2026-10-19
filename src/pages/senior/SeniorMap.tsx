import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { HotspotMap } from '../../components/map/HotspotMap';
import { MapPin, RefreshCw, Layers } from 'lucide-react';

export function SeniorMap() {
  const { token, user } = useAuth();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#008C95] uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Jurisdictional Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-[#172033]">Department Geographic Distribution Map</h1>
          <p className="text-xs text-gray-500 mt-1">
            Analyze geographical concentration of complaints across your division to optimize field team dispatch and identify recurring hotspots.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Map</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 text-gray-500">
          <div className="w-8 h-8 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-medium">Loading department spatial data...</p>
        </div>
      ) : (
        <HotspotMap complaints={complaints} role="SENIOR_OFFICER" />
      )}
    </div>
  );
}
