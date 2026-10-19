import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export function SeniorAtRisk() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = Date.now();
          const atRisk = data.filter(c => c.slaDeadline && c.slaDeadline > now && c.slaDeadline - now <= 24 * 3600 * 1000 && !['Closed', 'Resolved', 'Citizen Verification'].includes(c.status));
          setComplaints(atRisk);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Department At-Risk Cases (&lt; 24h Left)</h1>
        <p className="text-xs text-gray-500 mt-1">Supervise cases at immediate risk of SLA expiration to assign backup crews.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading at-risk cases...</div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No At-Risk Cases</h3>
          <p className="text-xs text-gray-500 mt-1">All complaints have comfortable SLA margins.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-amber-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-[#172033]">{c.complaintNumber}</span>
                  <h3 className="text-sm font-bold text-gray-800 mt-0.5">{c.subject}</h3>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-xs">
                  At Risk
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                <span>Assignee: <strong>{c.assignedOfficerName || 'Unassigned'}</strong></span>
                <Link to={`/senior/complaints/${c.id}`} className="text-xs font-semibold text-[#008C95] hover:underline flex items-center gap-1">
                  <span>Monitor Case</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
