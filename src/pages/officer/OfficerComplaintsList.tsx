import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { format } from 'date-fns';
import { Search, CheckCircle2, UserCheck, ShieldAlert, Sparkles, RefreshCw, MapPin } from 'lucide-react';

export function OfficerComplaintsList() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'MY' | 'DEPT' | 'UNASSIGNED'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [departments, setDepartments] = useState<any[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const [cRes, dRes] = await Promise.all([
        fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
      ]);
      if (cRes.ok) setComplaints(await cRes.json());
      if (dRes && dRes.ok) setDepartments(await dRes.json());
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const handleClaim = async (complaintId: string) => {
    setClaimingId(complaintId);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchComplaints();
      }
    } finally {
      setClaimingId(null);
    }
  };

  const isOfficerMatch = (c: Complaint) => {
    if (!user) return false;
    return String(c.assignedOfficerId) === String(user.id) || 
           (c.assignedOfficerEmail && user.email && c.assignedOfficerEmail.toLowerCase() === user.email.toLowerCase()) ||
           (c.assignedOfficerName && user.name && c.assignedOfficerName.toLowerCase() === user.name.toLowerCase());
  };

  const isDeptMatch = (c: Complaint) => {
    if (!user) return false;
    if (isOfficerMatch(c)) return true;

    const uDeptId = String(user.departmentId || '').toLowerCase().trim();
    const uDeptName = String(user.department || '').toLowerCase().trim();
    const cDeptId = String(c.departmentId || '').toLowerCase().trim();
    const cDeptName = String(c.departmentName || '').toLowerCase().trim();
    const cCat = String(c.categoryName || '').toLowerCase().trim();

    if (!uDeptId && !uDeptName) return true;
    if (uDeptId && cDeptId && (uDeptId === cDeptId || uDeptId.includes(cDeptId) || cDeptId.includes(uDeptId))) return true;

    // Strict Water Department Isolation
    const isWaterU = uDeptId === 'd2' || uDeptId === 'dept-water' || uDeptName.includes('water');
    const isWaterC = cDeptId === 'd2' || cDeptId === 'dept-water' || cDeptName.includes('water') || cCat.includes('water') || cCat.includes('leak') || cCat.includes('pipe') || cCat.includes('tanker');
    if (isWaterU && isWaterC) return true;
    if (isWaterU && !isWaterC) return false;
    if (!isWaterU && isWaterC) return false;

    // Strict Roads Department Isolation
    const isRoadsU = uDeptId === 'd1' || uDeptId === 'dept-roads' || uDeptName.includes('road') || uDeptName.includes('highway') || uDeptName.includes('infrastruct');
    const isRoadsC = cDeptId === 'd1' || cDeptId === 'dept-roads' || cDeptName.includes('road') || cDeptName.includes('highway') || cDeptName.includes('infrastruct') || cCat.includes('road') || cCat.includes('pothole') || cCat.includes('highway') || cCat.includes('bridge');
    if (isRoadsU && isRoadsC) return true;
    if (isRoadsU && !isRoadsC) return false;

    // Strict Sanitation Department Isolation
    const isSanitU = uDeptId === 'd3' || uDeptId === 'dept-sanitation' || uDeptName.includes('sanitat') || uDeptName.includes('waste');
    const isSanitC = cDeptId === 'd3' || cDeptId === 'dept-sanitation' || cDeptName.includes('sanitat') || cDeptName.includes('waste') || cCat.includes('garbage') || cCat.includes('waste') || cCat.includes('dump') || cCat.includes('sewage') || cCat.includes('drain');
    if (isSanitU && isSanitC) return true;
    if (isSanitU && !isSanitC) return false;

    // Strict Electricity Department Isolation
    const isElecU = uDeptId === 'dept-elec' || uDeptId === 'd4' || uDeptName.includes('electr') || uDeptName.includes('light');
    const isElecC = cDeptId === 'dept-elec' || cDeptId === 'd4' || cDeptName.includes('electr') || cCat.includes('light') || cCat.includes('wire') || cCat.includes('pole') || cCat.includes('power');
    if (isElecU && isElecC) return true;
    if (isElecU && !isElecC) return false;

    // Strict Animal Husbandry Isolation
    const isAnimalU = uDeptId === 'dept-animal' || uDeptId === 'd5' || uDeptName.includes('animal') || uDeptName.includes('stray');
    const isAnimalC = cDeptId === 'dept-animal' || cDeptId === 'd5' || cDeptName.includes('animal') || cCat.includes('animal') || cCat.includes('dog') || cCat.includes('cattle');
    if (isAnimalU && isAnimalC) return true;
    if (isAnimalU && !isAnimalC) return false;

    // Strict Public Health Isolation
    const isHealthU = uDeptId === 'dept-health' || uDeptId === 'd6' || uDeptName.includes('health');
    const isHealthC = cDeptId === 'dept-health' || cDeptId === 'd6' || cDeptName.includes('health') || cCat.includes('dengue') || cCat.includes('mosquito') || cCat.includes('health') || cCat.includes('clinic');
    if (isHealthU && isHealthC) return true;
    if (isHealthU && !isHealthC) return false;

    // Strict Public Transport
    const isTransU = uDeptId === 'dept-trans' || uDeptId === 'd7' || uDeptName.includes('trans') || uDeptName.includes('bus') || uDeptName.includes('traffic');
    const isTransC = cDeptId === 'dept-trans' || cDeptId === 'd7' || cDeptName.includes('trans') || cCat.includes('bus') || cCat.includes('traffic') || cCat.includes('transport');
    if (isTransU && isTransC) return true;
    if (isTransU && !isTransC) return false;

    if (uDeptName && cDeptName && (uDeptName.includes(cDeptName) || cDeptName.includes(uDeptName))) return true;
    return false;
  };

  // Restrict complaints list strictly to the officer's assigned department (or all complaints if unassigned)
  const matchedComplaints = complaints.filter(isDeptMatch);
  const deptComplaints = matchedComplaints.length > 0 ? matchedComplaints : complaints;

  const basePool = (scopeFilter === 'ALL' && deptFilter === 'ALL') ? deptComplaints : complaints;

  const filteredComplaints = basePool.filter(c => {
    const loc = (c.location_address || c.location || '').toLowerCase();
    const cName = (c.citizenName || '').toLowerCase();
    const cId = (c.citizenId || '').toLowerCase();
    const cPhone = (c.citizenPhone || '').replace(/\D/g, '');
    const cleanSearch = searchTerm.toLowerCase().trim();
    const cleanDigits = searchTerm.replace(/\D/g, '');

    const matchesSearch = (c.complaintNumber || '').toLowerCase().includes(cleanSearch) || 
                          (c.subject || '').toLowerCase().includes(cleanSearch) ||
                          cName.includes(cleanSearch) ||
                          cId.includes(cleanSearch) ||
                          (cleanDigits.length >= 4 && cPhone.includes(cleanDigits)) ||
                          loc.includes(cleanSearch);
    
    let matchesStatus = true;
    if (statusFilter !== 'ALL') matchesStatus = c.status.toUpperCase() === statusFilter;

    let matchesScope = true;
    if (scopeFilter === 'MY') {
      matchesScope = isOfficerMatch(c);
    } else if (scopeFilter === 'DEPT') {
      matchesScope = isDeptMatch(c);
    } else if (scopeFilter === 'UNASSIGNED') {
      matchesScope = (!c.assignedOfficerId || c.status === 'New') && isDeptMatch(c);
    }

    let matchesDept = true;
    if (deptFilter !== 'ALL') {
      matchesDept = c.departmentId === deptFilter || c.departmentName === deptFilter;
    }

    let matchesCity = true;
    if (cityFilter !== 'ALL') {
      const cCity = (c.city || '').toLowerCase().trim();
      const loc = (c.location_address || c.location || '').toLowerCase();
      matchesCity = cCity === cityFilter.toLowerCase().trim() || loc.includes(cityFilter.toLowerCase().trim());
    }

    return matchesSearch && matchesStatus && matchesScope && matchesDept && matchesCity;
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

  const getSLAStatus = (c: Complaint) => {
    if (['Resolved', 'Closed', 'Citizen Verification'].includes(c.status)) return <span className="text-green-600 font-medium text-xs">Resolved</span>;
    if (!c.slaDeadline) return <span className="text-gray-400 text-xs">N/A</span>;
    const now = Date.now();
    if (c.slaDeadline < now) return <span className="text-[#C0392B] font-bold text-xs uppercase border border-red-200 bg-red-50 px-2 py-0.5 rounded">Overdue</span>;
    if (c.slaDeadline - now < 24 * 60 * 60 * 1000) return <span className="text-[#D99A2B] font-bold text-xs uppercase border border-yellow-200 bg-yellow-50 px-2 py-0.5 rounded">At Risk</span>;
    return <span className="text-gray-500 text-xs font-medium">On Track</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#172033]">Municipal Grievance Operations</h2>
          <p className="text-gray-500 text-sm">Review, claim, and inspect field complaints registered by citizens.</p>
        </div>
        <button
          onClick={fetchComplaints}
          className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Scope Selector Tabs & Department Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setScopeFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              scopeFilter === 'ALL'
                ? 'bg-[#172033] text-white border-[#172033] shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Department Grievances ({deptComplaints.length})
          </button>
          <button
            onClick={() => setScopeFilter('MY')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              scopeFilter === 'MY'
                ? 'bg-[#008C95] text-white border-[#008C95] shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Assigned to Me ({deptComplaints.filter(isOfficerMatch).length})
          </button>
          <button
            onClick={() => setScopeFilter('UNASSIGNED')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              scopeFilter === 'UNASSIGNED'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Unassigned / Claim ({deptComplaints.filter(c => !c.assignedOfficerId || c.status === 'New').length})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">City / Area:</span>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="ALL">All Cities</option>
              <option value="Annur">Annur Town Panchayat</option>
              <option value="Coimbatore">Coimbatore Corporation</option>
              <option value="Mettupalayam">Mettupalayam Municipality</option>
              <option value="Pollachi">Pollachi Municipality</option>
              <option value="Sulur">Sulur Town Panchayat</option>
              <option value="Tiruppur">Tiruppur Corporation</option>
              <option value="Erode">Erode Corporation</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Dept:</span>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.length > 0 ? (
                departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))
              ) : (
                <>
                  <option value="d1">Roads &amp; Infrastructure</option>
                  <option value="d2">Water Supply</option>
                  <option value="d3">Sanitation &amp; Waste</option>
                  <option value="d4">Public Safety</option>
                </>
              )}
            </select>
          </div>
        </div>
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
              placeholder="Search ID, Subject, Area..."
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
                <th className="px-6 py-3 font-medium">Grievance No.</th>
                <th className="px-6 py-3 font-medium">Citizen Details</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Officer Assigned</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">SLA Status</th>
                <th className="px-6 py-3 font-medium">Registered Date &amp; Time</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-[#008C95] border-t-transparent rounded-full animate-spin"></div></div>
                    Loading registered grievances...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <p className="font-semibold text-gray-700">No complaints found.</p>
                    <p className="text-xs text-gray-400 mt-1">When citizens submit grievances on the portal, they will appear here in real-time with full AI classification.</p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => {
                  const isAssignedToMe = isOfficerMatch(c);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#172033]">
                        <Link 
                          to={`/officer/complaints/${c.id}`}
                          className="font-mono font-bold text-[#008C95] hover:underline"
                        >
                          {c.complaintNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-[#172033]">{c.citizenName || 'Registered Citizen'}</div>
                        <div className="text-[11px] text-gray-500 font-mono">ID: {c.citizenId}</div>
                        {(c.citizenPhone || c.citizenContact) && (
                          <div className="text-[10px] text-[#008C95] font-mono mt-0.5">
                            {c.citizenPhone || c.citizenContact}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 truncate max-w-[150px] mt-0.5">
                          {c.city || 'Annur'}, {c.district || 'Coimbatore'}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[220px]">
                        <Link 
                          to={`/officer/complaints/${c.id}`}
                          className="font-medium text-gray-900 hover:text-[#008C95] truncate block"
                          title={c.subject}
                        >
                          {c.subject}
                        </Link>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{c.location_address || c.location}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-700">{c.departmentName || 'General Works'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeColor(c.finalPriority)}`}>
                          {c.finalPriority || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {isAssignedToMe ? (
                          <span className="font-bold text-[#008C95] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Assigned to You
                          </span>
                        ) : c.assignedOfficerName ? (
                          <span className="text-gray-700 font-medium">{c.assignedOfficerName}</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getSLAStatus(c)}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-medium text-gray-800">{format(new Date(c.createdAt), 'MMM d, yyyy')}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{format(new Date(c.createdAt), 'h:mm:ss a')}</div>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <Link 
                          to={`/officer/complaints/${c.id}`} 
                          className="px-3 py-1.5 bg-[#008C95] hover:bg-teal-700 text-white text-xs font-bold rounded shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <span>View &bull; Handle</span>
                        </Link>
                        {!isAssignedToMe && (
                          <button
                            onClick={() => handleClaim(c.id)}
                            disabled={claimingId === c.id}
                            className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-medium transition-colors"
                            title="Assign to yourself"
                          >
                            {claimingId === c.id ? 'Claiming...' : 'Claim'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
