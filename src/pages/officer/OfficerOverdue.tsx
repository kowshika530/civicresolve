import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function OfficerOverdue() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = Date.now();
          const overdue = data.filter(c => 
            c.slaDeadline &&
            c.slaDeadline < now &&
            !['Closed', 'Resolved', 'Citizen Verification'].includes(c.status)
          );
          setComplaints(overdue);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>SLA Breach Sentinel</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Overdue Cases (SLA Breached)</h1>
        <p className="text-xs text-gray-500 mt-1">These complaints have exceeded target resolution deadlines and are flagged for Senior Officer audit.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading overdue cases...</div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">Zero Overdue Grievances</h3>
          <p className="text-xs text-gray-500 mt-1">Outstanding performance: 100% of cases are completed or within timeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(c => {
            const hoursOverdue = c.slaDeadline ? Math.round((Date.now() - c.slaDeadline) / 3600000) : 0;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-red-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-red-700">{c.complaintNumber}</span>
                    <h3 className="text-sm font-bold text-gray-800 mt-0.5">{c.subject}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-xs">
                    {hoursOverdue}h Overdue
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>
                
                {/* Citizen Details & Location */}
                <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100 text-xs space-y-1">
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
                  <span>Status: <strong>{c.status}</strong></span>
                  <Link
                    to={`/officer/complaints/${c.id}`}
                    className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1"
                  >
                    <span>Expedite Resolution</span>
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
