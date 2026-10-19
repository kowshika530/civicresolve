import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

export function SeniorComplaintsList() {
  const { token } = useAuth();
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

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.complaintNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (statusFilter !== 'ALL') matchesStatus = c.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadgeColor = (priority?: string) => {
    switch(priority) {
      case 'Critical': return 'bg-red-50 text-[#8E2C2C] border-red-200';
      case 'High': return 'bg-orange-50 text-[#C0392B] border-orange-200';
      case 'Medium': return 'bg-yellow-50 text-[#D99A2B] border-yellow-200';
      case 'Low': return 'bg-green-50 text-[#3A7D44] border-green-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#172033]">Department Complaints</h2>
        <p className="text-gray-500 text-sm">View and manage all complaints within your department.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex w-full md:w-auto space-x-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['ALL', 'NEW', 'ASSIGNED', 'ACCEPTED', 'IN PROGRESS', 'REOPENED', 'RESOLVED', 'CLOSED'].map(status => (
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
              placeholder="Search ID or Subject..."
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
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Assigned To</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-[#008C95] border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No complaints found.</td></tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#172033]">{c.complaintNumber}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate">{c.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeColor(c.finalPriority)}`}>
                        {c.finalPriority || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{c.assignedOfficerId || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <Link to={`/senior/complaints/${c.id}`} className="text-[#008C95] hover:underline font-medium">Manage</Link>
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
