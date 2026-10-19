import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { 
  ClipboardList, AlertTriangle, Clock, CheckCircle2, AlertCircle,
  RefreshCw, MapPin, Phone, UserCheck, Shield, Sparkles, ArrowRight,
  Building2, Layers
} from 'lucide-react';
import { format } from 'date-fns';

export function OfficerDashboard() {
  const { token, user, updateUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<'ALL' | 'MY' | 'DEPT' | 'NEW'>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('MY_CITY');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const [cRes, dRes] = await Promise.all([
        fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        setComplaints(data);
      }
      if (dRes && dRes.ok) {
        setDepartments(await dRes.json());
      }
    } finally { 
      setLoading(false); 
    }
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
    // Always include complaints assigned directly to this officer
    if (isOfficerMatch(c)) return true;

    const uDeptId = String(user.departmentId || '').toLowerCase().trim();
    const uDeptName = String(user.department || '').toLowerCase().trim();
    const cDeptId = String(c.departmentId || '').toLowerCase().trim();
    const cDeptName = String(c.departmentName || '').toLowerCase().trim();
    const cCat = String(c.categoryName || '').toLowerCase().trim();

    // If officer profile has no department set yet, show all
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

  // Grievances assigned to this officer's department (with fallback to complaints if unassigned)
  const matchedComplaints = complaints.filter(isDeptMatch);
  const deptComplaints = matchedComplaints.length > 0 ? matchedComplaints : complaints;

  // Filter complaints based on officer's city scope
  const officerCity = (user?.city || 'Annur').toLowerCase().trim();
  const complaintsByCity = deptComplaints.filter(c => {
    if (cityFilter === 'ALL') return true;
    const cCity = (c.city || '').toLowerCase().trim();
    const cLoc = (c.location_address || c.location || '').toLowerCase();
    return cCity === officerCity || cLoc.includes(officerCity);
  });

  const activePool = cityFilter === 'ALL' ? deptComplaints : (complaintsByCity.length > 0 ? complaintsByCity : deptComplaints);

  const assignedToMe = activePool.filter(c => isOfficerMatch(c) && c.status !== 'Closed');
  const myDept = activePool.filter(c => c.status !== 'Closed');
  const activeCount = activePool.filter(c => !['Closed', 'Resolved'].includes(c.status)).length;
  const newCount = activePool.filter(c => c.status === 'New' || !c.assignedOfficerId).length;
  const inProgress = activePool.filter(c => c.status === 'In Progress').length;
  const atRisk = activePool.filter(c => c.slaDeadline && c.slaDeadline - Date.now() < 24 * 60 * 60 * 1000 && c.slaDeadline > Date.now() && !['Resolved', 'Closed', 'Citizen Verification'].includes(c.status)).length;
  const overdue = activePool.filter(c => c.slaDeadline && c.slaDeadline < Date.now() && !['Resolved', 'Closed', 'Citizen Verification'].includes(c.status)).length;

  const displayList = activePool.filter(c => {
    if (tabFilter === 'MY') return isOfficerMatch(c);
    if (tabFilter === 'DEPT') return true;
    if (tabFilter === 'NEW') return c.status === 'New' || !c.assignedOfficerId;
    return true; // 'ALL' within assigned department & city
  });

  // Recent complaints lodged in last 24 hours within assigned department
  const recentlyLodged = activePool.filter(c => Date.now() - c.createdAt < 24 * 3600 * 1000);

  const officerDeptName = user?.department || departments.find(d => d.id === user?.departmentId)?.name || (
    user?.departmentId === 'd2' ? 'Water Supply' :
    user?.departmentId === 'd1' ? 'Roads & Highways' :
    user?.departmentId === 'd3' ? 'Sanitation & Waste' :
    user?.departmentId === 'dept-elec' ? 'Electricity & Lighting' : 'Municipal Operations'
  );

  const officerPortfolios = user?.jurisdictions && user.jurisdictions.length > 0 
    ? user.jurisdictions 
    : [{ city: user?.city || 'Annur', departmentId: user?.departmentId || 'd2', departmentName: officerDeptName, zone: user?.zone || 'Zone 1' }];

  const handleQuickSwitch = async (targetCity: string, targetDeptId: string, targetZone?: string) => {
    try {
      const res = await fetch('/api/officer/switch-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ city: targetCity, departmentId: targetDeptId, zone: targetZone })
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        await fetchComplaints();
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      {/* Header with quick refresh & active posting jurisdiction */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-[#172033]">Field Officer Operations Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-[#008C95] border border-teal-200">
              Active Inspector
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" />
              <span>{user?.city || 'Annur'} Station</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Logged in as <strong>{user?.name}</strong> • Jurisdiction: <strong className="text-[#008C95]">{user?.city || 'Annur'}</strong> • Department: <strong className="text-[#008C95]">{officerDeptName}</strong> ({user?.zone || 'Zone 1'})
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/officer/profile"
            className="text-[11px] font-bold px-2.5 py-1.5 bg-teal-50 text-[#006D75] hover:bg-teal-100 rounded-lg border border-teal-200 flex items-center gap-1 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Portfolios ({officerPortfolios.length})</span>
          </Link>
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#008C95] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Multi-Jurisdiction Quick Switch Bar (if officer has multiple charges or wants to toggle) */}
      {officerPortfolios.length > 1 && (
        <div className="p-3 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#008C95]" />
            <span className="font-bold text-gray-800">Your Assigned Portfolios:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {officerPortfolios.map((p: any, idx: number) => {
                const isActive = (user?.city || 'Annur').toLowerCase() === (p.city || '').toLowerCase() &&
                  (user?.departmentId || 'd2') === p.departmentId;
                const dName = p.departmentName || departments.find(d => d.id === p.departmentId)?.name || 'Works';
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickSwitch(p.city, p.departmentId, p.zone)}
                    className={`px-2.5 py-1 rounded-md font-bold text-xs border transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#008C95] text-white border-[#008C95] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span>{p.city}</span>
                    <span className="opacity-75">({dName})</span>
                    {isActive && <CheckCircle2 className="w-3 h-3 text-white ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
          <Link to="/officer/profile" className="text-xs font-bold text-[#008C95] hover:underline">
            + Add New Charge
          </Link>
        </div>
      )}

      {/* Real-time Notice if fresh complaints were lodged */}
      {recentlyLodged.length > 0 && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-teal-950">
              {recentlyLodged.length} New {officerDeptName} Grievance{recentlyLodged.length > 1 ? 's' : ''} Lodged Recently
            </span>
            <span className="text-teal-700 hidden sm:inline">• Automated SLA countdown active</span>
          </div>
          <Link
            to="/officer/complaints"
            className="text-xs font-bold text-[#008C95] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Department Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'DEPARTMENT ACTIVE', value: activeCount, color: 'text-[#172033]', hint: `Active in ${officerDeptName}` },
          { label: 'ASSIGNED TO ME', value: assignedToMe.length, color: 'text-[#008C95]', hint: 'Your active workload' },
          { label: 'IN PROGRESS', value: inProgress, color: 'text-[#D9A441]', hint: 'Under inspection/repair' },
          { label: 'AT RISK (24H)', value: atRisk, color: 'text-[#D99A2B]', hint: 'SLA countdown urgency' },
          { label: 'OVERDUE', value: overdue, color: 'text-[#C0392B]', hint: 'Breached SLA window' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-2xs border border-neutral-200 p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-3xl font-bold mt-1.5 ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-gray-400 mt-1">{stat.hint}</span>
          </div>
        ))}
      </div>

      {/* MAIN GRIEVANCES WORKLIST */}
      <div className="bg-white rounded-xl shadow-2xs border border-neutral-200 overflow-hidden">
        {/* Filter Navigation Tabs */}
        <div className="px-5 py-4 border-b border-neutral-200 bg-gray-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTabFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                tabFilter === 'ALL'
                  ? 'bg-[#172033] text-white border-[#172033] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {user?.city || 'Annur'} Station ({activePool.length})
            </button>
            <button
              onClick={() => setTabFilter('MY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                tabFilter === 'MY'
                  ? 'bg-[#008C95] text-white border-[#008C95] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Assigned to Me ({assignedToMe.length})
            </button>
            <button
              onClick={() => setTabFilter('NEW')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                tabFilter === 'NEW'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Unassigned / To Claim ({newCount})
            </button>

            {/* City Scope Filter Toggle */}
            <div className="flex items-center gap-1.5 pl-2 sm:border-l border-gray-300">
              <span className="text-[11px] font-bold text-gray-500">City Scope:</span>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="MY_CITY">{user?.city || 'Annur'} Station Only</option>
                <option value="ALL">All Municipalities ({officerDeptName})</option>
              </select>
            </div>
          </div>

          <Link
            to="/officer/complaints"
            className="text-xs font-bold text-[#008C95] hover:underline flex items-center gap-1"
          >
            <span>Full Complaint Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-5 py-3">Grievance ID</th>
                <th className="px-5 py-3">Citizen Details</th>
                <th className="px-5 py-3">Subject &amp; Location</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assigned Officer</th>
                <th className="px-5 py-3">Date Registered</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#008C95] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading grievance operations feed...
                  </td>
                </tr>
              ) : displayList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No complaints in this filter view.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {tabFilter === 'MY' 
                        ? 'You have no complaints directly assigned to your name. Switch to "All Citizen Grievances" to claim open cases.' 
                        : 'Any complaints registered by citizens appear here in real-time.'}
                    </p>
                  </td>
                </tr>
              ) : (
                displayList.map(c => {
                  const isAssignedToMe = isOfficerMatch(c);
                  const isOverdue = c.slaDeadline && c.slaDeadline < Date.now() && !['Resolved', 'Closed', 'Citizen Verification'].includes(c.status);

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link 
                          to={`/officer/complaints/${c.id}`} 
                          className="font-mono font-bold text-[#172033] hover:text-[#008C95] block"
                        >
                          {c.complaintNumber}
                        </Link>
                        {isOverdue && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded uppercase">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <div className="font-bold text-[#172033]">{c.citizenName || 'Registered Citizen'}</div>
                        <div className="text-[10px] text-gray-500 font-mono">ID: {c.citizenId}</div>
                        {(c.citizenPhone || c.citizenContact) && (
                          <div className="text-[10px] text-[#008C95] font-mono mt-0.5">
                            {c.citizenPhone || c.citizenContact}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 truncate max-w-[140px] mt-0.5">
                          {c.city || 'Annur'}, {c.district || 'Coimbatore'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[280px]">
                        <Link 
                          to={`/officer/complaints/${c.id}`}
                          className="font-medium text-gray-900 hover:text-[#008C95] truncate block"
                          title={c.subject}
                        >
                          {c.subject}
                        </Link>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{c.location_address || c.location || 'Annur, Coimbatore'}</span>
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <div className="font-bold text-gray-800">{c.departmentName || 'General Works'}</div>
                        <div className="text-[11px] text-[#008C95] font-medium mt-0.5">{c.categoryName || 'Civic Issue'}</div>
                        {c.resolvedZone && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">&bull; {c.resolvedZone}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          c.finalPriority === 'Critical' ? 'bg-red-50 text-red-800 border-red-200' :
                          c.finalPriority === 'High' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          c.finalPriority === 'Medium' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                          'bg-green-50 text-green-800 border-green-200'
                        }`}>
                          {c.finalPriority || 'Normal'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {isAssignedToMe ? (
                          <span className="font-bold text-[#008C95] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Assigned to You
                          </span>
                        ) : c.assignedOfficerName ? (
                          <span className="text-gray-700 font-medium">{c.assignedOfficerName}</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        <div>{format(new Date(c.createdAt), 'MMM d, yyyy')}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{format(new Date(c.createdAt), 'p')}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/officer/complaints/${c.id}`}
                            className="px-3 py-1.5 bg-[#008C95] hover:bg-teal-700 text-white text-xs font-bold rounded shadow-2xs transition-colors"
                          >
                            Handle
                          </Link>
                          {!isAssignedToMe && (
                            <button
                              onClick={() => handleClaim(c.id)}
                              disabled={claimingId === c.id}
                              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-medium transition-colors cursor-pointer"
                              title="Assign to myself"
                            >
                              {claimingId === c.id ? 'Claiming...' : 'Claim'}
                            </button>
                          )}
                        </div>
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
