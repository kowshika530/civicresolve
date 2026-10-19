import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, BarChart3, PieChart, CheckCircle2, ShieldAlert, Award } from 'lucide-react';

export function SeniorAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-12 text-center text-gray-400 text-xs">Loading department analytics...</div>;
  if (!data) return <div className="p-12 text-center text-gray-500">No analytics data available.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Department Analytics &amp; SLA Compliance</h1>
        <p className="text-xs text-gray-500 mt-1">Real-time metrics calculated directly from active complaint database records.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Department Grievances</span>
          <p className="text-2xl font-bold font-mono text-[#172033] mt-1">{data.totalComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Resolution Rate</span>
          <p className="text-2xl font-bold font-mono text-green-700 mt-1">{data.resolutionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">SLA Compliance Rate</span>
          <p className="text-2xl font-bold font-mono text-[#008C95] mt-1">{data.slaComplianceRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Citizen Satisfaction</span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{data.averageSatisfactionRating} / 5</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-[#008C95]" /> Complaints by Priority
          </h3>
          <div className="space-y-2">
            {data.prioritiesBreakdown?.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-gray-700">{p.name} Priority</span>
                <span className="font-mono font-bold text-[#172033]">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#008C95]" /> Complaints by Status
          </h3>
          <div className="space-y-2">
            {data.statusesBreakdown?.map((s: any) => (
              <div key={s.name} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-gray-700">{s.name}</span>
                <span className="font-mono font-bold text-[#172033]">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
