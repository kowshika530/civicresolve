import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function OfficerAtRisk() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = Date.now();
          // At risk: remaining SLA < 24h and not yet expired and not closed
          const atRisk = data.filter(c => 
            c.slaDeadline &&
            c.slaDeadline > now &&
            c.slaDeadline - now <= 24 * 3600 * 1000 &&
            !['Closed', 'Resolved', 'Citizen Verification'].includes(c.status)
          );
          setComplaints(atRisk);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>SLA Urgency Monitor</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">At-Risk Cases (&lt; 24h SLA Remaining)</h1>
        <p className="text-xs text-gray-500 mt-1">Cases requiring immediate field action to prevent automatic senior escalation.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading at-risk cases...</div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">Zero Cases At Risk</h3>
          <p className="text-xs text-gray-500 mt-1">All assigned complaints are currently on track within SLA windows.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(c => {
            const remainingHours = c.slaDeadline ? Math.max(0, Math.round((c.slaDeadline - Date.now()) / 3600000)) : 0;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-amber-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#172033]">{c.complaintNumber}</span>
                    <h3 className="text-sm font-bold text-gray-800 mt-0.5">{c.subject}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-xs">
                    {remainingHours}h Left
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>
                
                {/* Citizen Details & Location */}
                <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span>Citizen: {c.citizenName || 'Registered Citizen'}</span>
                    <span className="font-mono text-[10px] text-gray-500 bg-white px-1.5 py-0.2 rounded border border-gray-200">ID: {c.citizenId}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-2">
                    {c.citizenPhone && <span className="text-[#008C95] font-mono font-semibold">{c.citizenPhone}</span>}
                    <span className="truncate max-w-[280px]">{c.location_address || c.street_address || c.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <span>Priority: <strong className="text-red-700">{c.finalPriority}</strong></span>
                  <Link
                    to={`/officer/complaints/${c.id}`}
                    className="text-xs font-semibold text-[#008C95] hover:underline flex items-center gap-1"
                  >
                    <span>Open Case</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
