import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Escalation } from '../../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ShieldAlert, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

export function SeniorEscalations() {
  const { token, user } = useAuth();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEscalations = () => {
    fetch('/api/escalations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEscalations(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEscalations();
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Director Oversight</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172033]">Department Escalation Queue</h1>
        <p className="text-xs text-gray-500 mt-1">Review cases that breached resolution SLAs or required field officer escalation.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading escalations...</div>
      ) : escalations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No Pending Escalations</h3>
          <p className="text-xs text-gray-500 mt-1">All department grievances are operating normally.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {escalations.map(esc => (
            <div key={esc.id} className="bg-white rounded-xl border border-red-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-red-700">{esc.complaintNumber}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                      {esc.type} Escalation
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mt-1">
                    {esc.complaint?.subject || 'Grievance Review Required'}
                  </h3>
                  <p className="text-xs text-red-900 mt-1 bg-red-50/70 p-2.5 rounded-lg border border-red-100">
                    <strong>Reason:</strong> {esc.reason}
                  </p>
                </div>

                <Link
                  to={`/senior/complaints/${esc.complaintId}`}
                  className="px-3 py-1.5 bg-[#008C95] hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Reassign &amp; Handle</span>
                </Link>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                <span>Officer in charge: <strong>{esc.officerName || 'Unassigned'}</strong></span>
                <span>Logged: {format(new Date(esc.timestamp), 'PPp')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
