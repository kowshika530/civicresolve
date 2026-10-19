import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { format } from 'date-fns';
import { 
  PlusCircle, Search, Bell, Clock, ArrowRight, ShieldAlert,
  Building2, CheckCircle2, ChevronRight, FileText, Check, AlertCircle,
  Smartphone, MapPin, Sparkles
} from 'lucide-react';
import { StatusBadge, PriorityBadge, SLABadge } from '../../components/CivicBadges';
import { LoadingState, EmptyState } from '../../components/CivicDataStates';

export function CitizenDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [token]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Strictly filter complaints belonging to this citizen
  const userComplaints = complaints.filter(c => {
    if (!user) return true;
    const uEmail = (user.email || '').toLowerCase().trim();
    const uId = String(user.id || '');
    return String(c.citizenId || '') === uId || (uEmail && c.citizenContact && c.citizenContact.toLowerCase().trim() === uEmail);
  });

  // Find most relevant active complaint for the focused spotlight panel (prioritize resolution verification)
  const activeComplaint = 
    userComplaints.find(c => ['Citizen Verification', 'Resolved'].includes(c.status)) ||
    userComplaints.find(c => ['In Progress', 'Assigned', 'New', 'Accepted', 'Escalated'].includes(c.status)) || 
    userComplaints[0];

  const pendingVerification = userComplaints.filter(c => ['Citizen Verification', 'Resolved'].includes(c.status));

  // Visual progress steps
  const PROGRESS_STAGES = [
    { key: 'Submitted', label: 'Submitted', checkStatus: ['New', 'Assigned', 'Accepted', 'In Progress', 'Citizen Verification', 'Closed'] },
    { key: 'Analyzed', label: 'AI Analyzed', checkStatus: ['Assigned', 'Accepted', 'In Progress', 'Citizen Verification', 'Closed'] },
    { key: 'Assigned', label: 'Dept Assigned', checkStatus: ['Assigned', 'Accepted', 'In Progress', 'Citizen Verification', 'Closed'] },
    { key: 'InProgress', label: 'In Progress', checkStatus: ['In Progress', 'Citizen Verification', 'Closed'] },
    { key: 'Resolved', label: 'Field Resolved', checkStatus: ['Citizen Verification', 'Closed'] },
    { key: 'Verified', label: 'Citizen Verified', checkStatus: ['Closed'] },
  ];

  if (loading) {
    return <LoadingState message="Retrieving your municipal civic records..." rows={5} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* ================================================== */}
      {/* 1. PERSONALIZED CIVIC HEADER                       */}
      {/* ================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E0D5] pb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C95]">
            Citizen Service Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight mt-0.5">
            {greeting}, {user?.name || 'Citizen'}
          </h1>
          <p className="text-sm text-[#596172] mt-1">
            Here is the current operational status of your civic complaints and municipal actions.
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/citizen/complaints/new"
            className="px-4 py-2 bg-[#008C95] hover:bg-[#006D75] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Complaint</span>
          </Link>

          <Link
            to="/track"
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#172033] text-xs font-bold rounded-lg border border-[#E5E0D5] shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-[#008C95]" />
            <span>Track Any Grievance</span>
          </Link>

          <Link
            to="/citizen/notifications"
            className="p-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-[#E5E0D5] shadow-2xs transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Resolution Verification Alert Banner */}
      {pendingVerification.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                Action Required: {pendingVerification.length} Complaint{pendingVerification.length > 1 ? 's are' : ' is'} Awaiting Your Resolution Verification
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                The municipal field team marked {pendingVerification.map(p => p.complaintNumber).join(', ')} as completed. Please confirm whether the problem has been solved on-site.
              </p>
            </div>
          </div>
          <Link
            to={`/citizen/complaints/${pendingVerification[0].id}`}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Verify {pendingVerification[0].complaintNumber}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. ACTIVE COMPLAINT FOCUSED PANEL (Editorial Spotlight) */}
      {/* ================================================== */}
      {activeComplaint ? (
        <section className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[11px] font-mono text-teal-800 font-bold uppercase tracking-wider block">
                Primary Active Grievance &bull; In Lifecycle
              </span>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#172033]">
                  {activeComplaint.complaintNumber}
                </span>
                <StatusBadge status={activeComplaint.status} />
                <PriorityBadge priority={activeComplaint.finalPriority} />
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-gray-500 font-mono block">Target SLA Window</span>
              <SLABadge deadline={activeComplaint.slaDeadline} status={activeComplaint.status} />
            </div>
          </div>

          {/* Issue Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <h2 className="text-lg font-bold text-[#172033] leading-snug">
                {activeComplaint.subject}
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                {activeComplaint.description}
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-[#008C95] shrink-0" />
                <span className="truncate">{activeComplaint.location}</span>
              </div>
            </div>

            <div className="bg-[#F7F3EA]/70 p-4 rounded-xl border border-[#E5E0D5] space-y-2.5 text-xs">
              <div>
                <span className="text-gray-500 text-[11px] block font-mono">Assigned Jurisdiction</span>
                <span className="font-bold text-[#172033] block">{activeComplaint.departmentName || 'Department Queue'}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[11px] block font-mono">Assigned Field Officer</span>
                <span className="font-semibold text-gray-800 block">{activeComplaint.assignedOfficerName || 'Routing in Progress'}</span>
              </div>
              <div className="pt-1 border-t border-gray-200/80 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">SMS Alerts</span>
                <span className="text-emerald-800 font-bold font-mono">Active &bull; Verified</span>
              </div>
            </div>
          </div>

          {/* Visual Progress Timeline */}
          <div className="pt-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-3 font-semibold">
              Grievance Lifecycle Progress
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PROGRESS_STAGES.map((stage, idx) => {
                const isPassed = stage.checkStatus.includes(activeComplaint.status);
                const isCurrent = 
                  (stage.key === 'Submitted' && activeComplaint.status === 'New') ||
                  (stage.key === 'Assigned' && activeComplaint.status === 'Assigned') ||
                  (stage.key === 'InProgress' && activeComplaint.status === 'In Progress') ||
                  (stage.key === 'Resolved' && activeComplaint.status === 'Citizen Verification') ||
                  (stage.key === 'Verified' && activeComplaint.status === 'Closed');

                return (
                  <div 
                    key={stage.key}
                    className={`
                      p-3 rounded-lg border text-xs transition-all relative
                      ${isCurrent 
                        ? 'bg-teal-50/80 border-[#008C95] text-teal-950 shadow-2xs font-bold' 
                        : isPassed 
                        ? 'bg-gray-50 border-gray-200 text-gray-800' 
                        : 'bg-white border-dashed border-gray-200 text-gray-400'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono opacity-75">0{idx + 1}</span>
                      {isPassed && <Check className="w-3 h-3 text-[#3A7D44]" />}
                    </div>
                    <span className="font-semibold block truncate">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View Details Action */}
          <div className="pt-2 flex justify-end">
            <Link
              to={`/citizen/complaints/${activeComplaint.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#172033] hover:bg-[#202D45] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <span>Open Complaint Investigation Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </section>
      ) : (
        <EmptyState
          title="No Active Grievance"
          description="You currently have no complaints registered in the system. If you see a civic defect or infrastructure breakdown, lodge a report now."
          actionText="Submit First Complaint"
          onAction={() => navigate('/citizen/complaints/new')}
        />
      )}

      {/* ================================================== */}
      {/* 3. MY COMPLAINTS DATA TABLE                        */}
      {/* ================================================== */}
      <section className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E5E0D5] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-[#172033]">
              My Registered Complaints
            </h3>
            <p className="text-xs text-gray-500">
              Complete audit ledger of your submitted public issues
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500">
              Total: <strong className="text-gray-900">{userComplaints.length}</strong>
            </span>
            <Link
              to="/citizen/complaints"
              className="text-xs font-bold text-[#008C95] hover:text-[#006D75] hover:underline"
            >
              View Full List &rarr;
            </Link>
          </div>
        </div>

        {userComplaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No complaints recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F7F3EA]/60 text-gray-600 font-mono text-[11px] border-b border-[#E5E0D5]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Complaint ID</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">SLA Window</th>
                  <th className="py-3 px-4 font-semibold">Updated</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {userComplaints.slice(0, 6).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#172033]">
                      <Link to={`/citizen/complaints/${c.id}`} className="hover:text-[#008C95]">
                        {c.complaintNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 max-w-[240px] truncate font-medium text-gray-900">
                      {c.subject}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.departmentName || c.categoryName || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.finalPriority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={c.status} size="sm" />
                        {c.isEscalated && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span>⚡ Auto-Escalated to Senior Officer</span>
                          </span>
                        )}
                        {Boolean(c.isDuplicate || (c.duplicateCount && c.duplicateCount > 1)) && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span>👥 Multi-Citizen Duplicate Surge</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <SLABadge deadline={c.slaDeadline} status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                      {format(new Date(c.updatedAt || c.createdAt), 'MMM d, p')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {['Citizen Verification', 'Resolved'].includes(c.status) ? (
                        <Link
                          to={`/citizen/complaints/${c.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Verify</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/citizen/complaints/${c.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008C95] hover:text-[#006D75] hover:underline"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
