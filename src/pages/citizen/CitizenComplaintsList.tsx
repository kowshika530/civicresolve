import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpDown, CheckCircle2, AlertCircle } from 'lucide-react';
export function CitizenComplaintsList() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setComplaints(await res.json());
      } finally { setLoading(false); }
    };
    fetchComplaints();
  }, [token]);
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'New':
      case 'Assigned':
      case 'Accepted': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'In Progress': return 'bg-teal-50 text-[#008C95] border-teal-200';
      case 'Resolved': 
      case 'Citizen Verification': return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'Closed': return 'bg-gray-100 text-gray-600 border-gray-200 font-semibold';
      case 'Reopened': return 'bg-red-50 text-[#C0392B] border-red-200';
      case 'Escalated': return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority?: string) => {
    switch(priority) {
      case 'Critical': return 'bg-red-50 text-[#8E2C2C] border-red-200';
      case 'High': return 'bg-orange-50 text-[#C0392B] border-orange-200';
      case 'Medium': return 'bg-yellow-50 text-[#D99A2B] border-yellow-200';
      case 'Low': return 'bg-green-50 text-[#3A7D44] border-green-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  // Strictly ensure only logged-in citizen's complaints are displayed
  const userComplaints = complaints.filter(c => {
    if (!user) return true;
    const uEmail = (user.email || '').toLowerCase().trim();
    const uId = String(user.id || '');
    return String(c.citizenId || '') === uId || (uEmail && c.citizenContact && c.citizenContact.toLowerCase().trim() === uEmail);
  });

  const pendingVerificationCount = userComplaints.filter(c => ['Citizen Verification', 'Resolved'].includes(c.status)).length;

  const filteredComplaints = userComplaints.filter(c => {
    const matchesSearch = c.complaintNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'PENDING') matchesStatus = ['New', 'Assigned', 'Accepted', 'Escalated'].includes(c.status);
    else if (statusFilter === 'IN PROGRESS') matchesStatus = c.status === 'In Progress';
    else if (statusFilter === 'RESOLVED') matchesStatus = ['Resolved', 'Citizen Verification', 'Closed'].includes(c.status);
    else if (statusFilter === 'CLOSED') matchesStatus = c.status === 'Closed';
    else if (statusFilter !== 'ALL') matchesStatus = c.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#172033]">My Complaints</h2>
          <p className="text-gray-500 text-sm">View and track all your registered issues.</p>
        </div>
        <Link 
          to="/citizen/complaints/new" 
          className="px-4 py-2 bg-[#008C95] text-white text-sm font-medium rounded-lg hover:bg-teal-700 shadow-sm"
        >
          New Complaint
        </Link>
      </div>

      {pendingVerificationCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-950">
                Action Required: {pendingVerificationCount} complaint{pendingVerificationCount > 1 ? 's are' : ' is'} awaiting your resolution verification!
              </p>
              <p className="text-xs text-emerald-800">
                The municipal team has reported field resolution. Please check and confirm if the issue is solved satisfactorily.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex w-full md:w-auto space-x-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['ALL', 'PENDING', 'IN PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors border ${
                  statusFilter === status 
                    ? 'bg-[#172033] text-white border-[#172033]' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search by ID or Subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Complaint No.</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created Date</th>
                <th className="px-6 py-3 font-medium">Last Updated</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-[#008C95] border-t-transparent rounded-full animate-spin"></div></div>
                    Loading complaints...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No complaints found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#172033]">{c.complaintNumber}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={c.subject}>{c.subject}</td>
                    <td className="px-6 py-4 text-gray-500">{c.categoryName || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeColor(c.finalPriority)}`}>
                        {c.finalPriority || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(c.status)}`}>
                          {c.status}
                        </span>
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
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      <div>{format(new Date(c.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{format(new Date(c.createdAt), 'h:mm:ss a')}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>{format(new Date(c.updatedAt), 'MMM d, yyyy')}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{format(new Date(c.updatedAt), 'h:mm a')}</div>
                    </td>
                    <td className="px-6 py-4">
                      {c.status === 'Citizen Verification' || c.status === 'Resolved' ? (
                        <Link 
                          to={`/citizen/complaints/${c.id}`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-xs animate-pulse"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify Resolution</span>
                        </Link>
                      ) : (
                        <Link 
                          to={`/citizen/complaints/${c.id}`} 
                          className="inline-flex items-center px-3 py-1.5 bg-teal-50 hover:bg-[#008C95] text-[#008C95] hover:text-white border border-teal-200 hover:border-transparent rounded text-xs font-medium transition-colors shadow-2xs"
                        >
                          View Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
