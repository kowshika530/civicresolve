import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Shield, Award, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export function SeniorOfficersWorkload() {
  const { token } = useAuth();
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/senior/officers-workload', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOfficers(data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Officers Workload &amp; Performance Roster</h1>
        <p className="text-xs text-gray-500 mt-1">Monitor case distribution, active caseloads, and resolution efficiency across your department squad.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading officer roster...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officers.map(off => (
            <div key={off.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-base">
                  {off.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">{off.name}</h3>
                  <p className="text-xs text-gray-500">{off.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Active Cases</span>
                  <span className="text-base font-bold text-[#172033]">{off.activeCases}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Resolved Cases</span>
                  <span className="text-base font-bold text-green-700">{off.resolvedCases}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Overdue Breaches</span>
                  <span className={`text-base font-bold ${off.overdueCases > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                    {off.overdueCases}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Efficiency</span>
                  <span className="text-base font-bold text-[#008C95]">{off.efficiencyScore}%</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#008C95] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, off.efficiencyScore)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
