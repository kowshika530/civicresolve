import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Escalation } from '../../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

export function OfficerEscalations() {
  const { token } = useAuth();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/escalations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEscalations(data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Supervisory Escalations</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Escalated Complaints</h1>
        <p className="text-xs text-gray-500 mt-1">Grievances escalated automatically via SLA breach or flagged manually for Senior Officer intervention.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading escalations...</div>
      ) : escalations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No Active Escalations</h3>
          <p className="text-xs text-gray-500 mt-1">All department cases are proceeding without supervisor escalations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {escalations.map(esc => (
            <div key={esc.id} className="bg-white rounded-xl border border-red-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-red-700">{esc.complaintNumber}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                      {esc.type} Escalation
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-semibold mt-1">{esc.reason}</p>
                </div>
                <Link
                  to={`/officer/complaints/${esc.complaintId}`}
                  className="px-3 py-1 bg-white hover:bg-red-50 border border-red-200 text-xs font-semibold text-red-700 rounded-lg flex items-center gap-1 shrink-0"
                >
                  <span>Review Case</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                Triggered on: {format(new Date(esc.timestamp), 'PPp')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
