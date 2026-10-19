import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export function SeniorOverdue() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = Date.now();
          const overdue = data.filter(c => c.slaDeadline && c.slaDeadline < now && !['Closed', 'Resolved', 'Citizen Verification'].includes(c.status));
          setComplaints(overdue);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Department Overdue Cases</h1>
        <p className="text-xs text-gray-500 mt-1">Cases in your jurisdiction that have breached mandated citizen service SLAs.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading overdue complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No Overdue Cases</h3>
          <p className="text-xs text-gray-500 mt-1">All complaints in your department are within their SLA targets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-red-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-red-700">{c.complaintNumber}</span>
                  <h3 className="text-sm font-bold text-gray-800 mt-0.5">{c.subject}</h3>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-xs">
                  Overdue
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                <span>Assignee: <strong>{c.assignedOfficerName || 'Unassigned'}</strong></span>
                <Link to={`/senior/complaints/${c.id}`} className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1">
                  <span>Reassign Officer</span>
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
