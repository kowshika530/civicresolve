import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export function SeniorReopened() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setComplaints(data.filter(c => c.status === 'Reopened'));
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Citizen-Reopened Cases</h1>
        <p className="text-xs text-gray-500 mt-1">Grievances where citizen rejected officer resolution and demanded re-inspection.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading reopened cases...</div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No Reopened Cases</h3>
          <p className="text-xs text-gray-500 mt-1">All verified resolutions were accepted by complainants.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-amber-300 p-5 shadow-2xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#172033]">{c.complaintNumber}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded">
                      Citizen Disputed Resolution
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mt-1">{c.subject}</h3>
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 mt-2">
                    <strong>Citizen Reason:</strong> "{c.reopenReason || 'Citizen marked work as unsatisfactory'}"
                  </div>
                </div>
                <Link
                  to={`/senior/complaints/${c.id}`}
                  className="px-3 py-1.5 bg-[#008C95] hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0"
                >
                  <span>Re-evaluate &amp; Assign</span>
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
