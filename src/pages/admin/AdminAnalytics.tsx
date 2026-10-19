import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, Star, BarChart3, PieChart, ShieldAlert } from 'lucide-react';
export function AdminAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return <div className="p-8 text-center text-gray-500">Failed to load analytics data.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Municipal Analytics &amp; Reporting</h1>
        <p className="text-xs text-gray-500 mt-1">Cross-departmental performance metrics, SLA compliance rates, and grievance disposition distribution.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Filed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172033] mt-2">{data.totalComplaints}</p>
          <p className="text-[11px] text-gray-500 mt-1">{data.activeComplaints} Active / {data.resolvedComplaints} Resolved</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">SLA Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008C95] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#008C95] mt-2">{data.slaComplianceRate}%</p>
          <p className="text-[11px] text-gray-500 mt-1">{data.overdueComplaints} Breached deadlines</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolution Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{data.resolutionRate}%</p>
          <p className="text-[11px] text-gray-500 mt-1">Verified satisfactory closures</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Citizen CSAT</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{data.averageSatisfactionRating} / 5.0</p>
          <p className="text-[11px] text-gray-500 mt-1">Citizen feedback rating average</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-[#172033] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gray-500" />
            <span>Complaints by Category</span>
          </h2>
          <div className="space-y-3">
            {data.categoriesBreakdown?.map((cat: any) => {
              const pct = data.totalComplaints > 0 ? Math.round((cat.count / data.totalComplaints) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-500">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#008C95] h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Severity Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-[#172033] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <span>Complaints by Priority Level</span>
          </h2>
          <div className="space-y-3">
            {data.prioritiesBreakdown?.map((p: any) => {
              const pct = data.totalComplaints > 0 ? Math.round((p.count / data.totalComplaints) * 100) : 0;
              const barColor = 
                p.name === 'Critical' ? 'bg-red-500' :
                p.name === 'High' ? 'bg-orange-500' :
                p.name === 'Medium' ? 'bg-amber-500' : 'bg-blue-500';
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700 font-bold">{p.name}</span>
                    <span className="text-gray-500">{p.count} complaints ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
