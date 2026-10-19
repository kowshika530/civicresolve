import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint, User } from '../../types';
import { format } from 'date-fns';
import { ComplaintLocationViewMap } from '../../components/map/ComplaintLocationViewMap';
import { ArrowLeft, UserPlus, Clock, Tag, ShieldAlert, MapPin } from 'lucide-react';

export function SeniorComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, offRes] = await Promise.all([
          fetch(`/api/complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/officers', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (compRes.ok) setComplaint(await compRes.json());
        if (offRes.ok) setOfficers(await offRes.json());
      } finally { setLoading(false); }
    };
    if (id) fetchData();
  }, [id, token]);

  const handleReassign = async () => {
    if (!selectedOfficer) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assignedOfficerId: selectedOfficer, status: complaint?.status === 'New' ? 'Assigned' : complaint?.status })
      });
      if (res.ok) {
        const updated = await fetch(`/api/complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        setComplaint(updated);
        setSelectedOfficer('');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!complaint) return <div className="p-12 text-center text-gray-500">Complaint not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link to="/senior/complaints" className="hover:text-[#008C95] flex items-center"><ArrowLeft className="w-4 h-4 mr-1"/> Back to Department List</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-start flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-[#172033] flex items-center">
              {complaint.complaintNumber}
              {complaint.emergencyFlag && <ShieldAlert className="w-5 h-5 text-red-600 ml-3" title="Emergency Concern" />}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{complaint.subject}</p>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold border border-gray-200">
            {complaint.status.toUpperCase()}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            </div>

            {Boolean(complaint.isEscalated || (complaint.duplicateCount && complaint.duplicateCount > 1) || complaint.isDuplicate) && (
              <div className="p-4 bg-red-50/90 border border-red-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Senior Officer Direct Escalation Alert</span>
                  </span>
                  <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded uppercase">
                    {(complaint.duplicateCount && complaint.duplicateCount > 1) ? 'Duplicate Surge' : 'Critical Escalation'}
                  </span>
                </div>
                <p className="text-xs text-red-950 leading-relaxed">
                  {complaint.escalationReason || `Multi-citizen community surge: ${complaint.duplicateCount || 2} citizens have reported identical issues in this neighborhood.`}
                </p>
                {Boolean(complaint.duplicateCount && complaint.duplicateCount > 1) && (
                  <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-[11px] text-red-900 font-medium">
                    <span>Linked Community Reports: <strong>{complaint.duplicateCount} Citizens</strong></span>
                    <span>Cluster ID: <strong>{complaint.duplicateGroupId || `cluster-${complaint.id}`}</strong></span>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                <UserPlus className="w-4 h-4 mr-2" /> Assignment Management
              </h3>
              <div className="mb-4 text-sm text-blue-800">
                <span className="font-semibold text-blue-900">Current Assignee: </span> 
                {complaint.assignedOfficerId ? officers.find(o => o.id === complaint.assignedOfficerId)?.name || complaint.assignedOfficerId : 'Unassigned'}
              </div>
              <div className="flex space-x-3">
                <select 
                  value={selectedOfficer}
                  onChange={e => setSelectedOfficer(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="">Select Officer to Reassign...</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.id})</option>
                  ))}
                </select>
                <button 
                  onClick={handleReassign}
                  disabled={!selectedOfficer || actionLoading}
                  className="px-4 py-2 bg-[#008C95] text-white text-sm font-medium rounded hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {actionLoading ? 'Saving...' : 'Reassign'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <ComplaintLocationViewMap
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              address={complaint.location_address || complaint.location}
              complaintNumber={complaint.complaintNumber}
              category={complaint.categoryName}
              status={complaint.status}
              priority={complaint.finalPriority}
              height="220px"
            />

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-gray-500" /> Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium text-gray-900">{complaint.categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className="font-medium text-gray-900">{complaint.finalPriority}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" /> Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium text-gray-900">{format(new Date(complaint.createdAt), 'MMM d, p')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline:</span>
                  <span className="font-medium text-[#C0392B]">{complaint.slaDeadline ? format(new Date(complaint.slaDeadline), 'MMM d, p') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
