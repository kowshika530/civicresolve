import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Plus, Mail, Users, FileText, CheckCircle2, ShieldAlert, X,
  Shuffle, MapPin, Gauge, Play, ArrowRight, ShieldCheck, ToggleLeft, ToggleRight,
  Edit2, Trash2, RefreshCw, Sparkles, Check, AlertCircle, Info, ChevronRight, Layers
} from 'lucide-react';

export function AdminDepartments() {
  const { token } = useAuth();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'mappings' | 'officers' | 'simulator'>('departments');
  
  // Data States
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [officerAssignments, setOfficerAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    headName: '',
    headEmail: '',
    status: 'Active',
    serviceAreas: 'Annur, Coimbatore, Zone 1, Zone 2'
  });

  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    code: '',
    description: '',
    defaultPriority: 'Medium',
    keywords: '',
    departmentId: ''
  });

  const [showMapModal, setShowMapModal] = useState(false);
  const [editingMap, setEditingMap] = useState<any | null>(null);
  const [mapForm, setMapForm] = useState({
    categoryId: '',
    departmentId: '',
    zoneOverride: 'All Zones',
    priority: 1,
    active: true,
    description: ''
  });

  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<any | null>(null);
  const [officerForm, setOfficerForm] = useState({
    officerName: '',
    officerEmail: '',
    officerPhone: '+91 ',
    departmentId: '',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Annur',
    zone: 'Zone 1',
    areaWard: 'Central Ward',
    maxWorkload: 15,
    active: true
  });

  // Simulator State
  const [simCategory, setSimCategory] = useState('');
  const [simText, setSimText] = useState('There are many stray dogs barking and menacing children near the primary school.');
  const [simZone, setSimZone] = useState('Zone 1');
  const [simCity, setSimCity] = useState('Annur');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dRes, cRes, mRes, oRes] = await Promise.all([
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/mappings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/officer-assignments', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (dRes.ok) setDepartments(await dRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (mRes.ok) setMappings(await mRes.json());
      if (oRes.ok) setOfficerAssignments(await oRes.json());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch municipal routing configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Alert dismiss
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ==========================================
  // DEPARTMENT HANDLERS
  // ==========================================
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      code: '',
      description: '',
      headName: '',
      headEmail: '',
      status: 'Active',
      serviceAreas: 'Annur, Coimbatore, Zone 1, Zone 2'
    });
    setShowDeptModal(true);
  };

  const openEditDept = (d: any) => {
    setEditingDept(d);
    setDeptForm({
      name: d.name,
      code: d.code || '',
      description: d.description || '',
      headName: d.headName || '',
      headEmail: d.headEmail || '',
      status: d.status || 'Active',
      serviceAreas: Array.isArray(d.serviceAreas) ? d.serviceAreas.join(', ') : d.serviceAreas || ''
    });
    setShowDeptModal(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingDept ? `/api/admin/departments/${editingDept.id}` : '/api/admin/departments';
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(deptForm)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save department');
      }

      setShowDeptModal(false);
      setSuccess(editingDept ? 'Department updated successfully.' : 'New department registered and active.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleDeptStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/departments/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to toggle department status');
      setSuccess('Department status updated.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete department');
      setSuccess(`Department ${name} removed.`);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ==========================================
  // CATEGORY HANDLERS
  // ==========================================
  const openAddCat = () => {
    setEditingCat(null);
    setCatForm({
      name: '',
      code: '',
      description: '',
      defaultPriority: 'Medium',
      keywords: '',
      departmentId: departments[0]?.id || ''
    });
    setShowCatModal(true);
  };

  const openEditCat = (c: any) => {
    setEditingCat(c);
    setCatForm({
      name: c.name,
      code: c.code || '',
      description: c.description || '',
      defaultPriority: c.defaultPriority || 'Medium',
      keywords: Array.isArray(c.keywords) ? c.keywords.join(', ') : c.keywords || '',
      departmentId: ''
    });
    setShowCatModal(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingCat ? `/api/admin/categories/${editingCat.id}` : '/api/admin/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(catForm)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save category');
      }

      setShowCatModal(false);
      setSuccess(editingCat ? 'Category updated.' : 'Category created and mapped.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCat = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete category');
      setSuccess(`Category "${name}" removed.`);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ==========================================
  // MAPPING HANDLERS
  // ==========================================
  const openAddMap = () => {
    setEditingMap(null);
    setMapForm({
      categoryId: categories[0]?.id || '',
      departmentId: departments[0]?.id || '',
      zoneOverride: 'All Zones',
      priority: 1,
      active: true,
      description: ''
    });
    setShowMapModal(true);
  };

  const openEditMap = (m: any) => {
    setEditingMap(m);
    setMapForm({
      categoryId: m.categoryId,
      departmentId: m.departmentId,
      zoneOverride: m.zoneOverride || 'All Zones',
      priority: m.priority || 1,
      active: m.active !== false,
      description: m.description || ''
    });
    setShowMapModal(true);
  };

  const handleSaveMap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingMap ? `/api/admin/mappings/${editingMap.id}` : '/api/admin/mappings';
      const method = editingMap ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(mapForm)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save mapping');
      }

      setShowMapModal(false);
      setSuccess('Category to Department routing mapping saved.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleMap = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/mappings/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to toggle mapping');
      setSuccess('Mapping active status updated.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteMap = async (id: string) => {
    if (!confirm('Remove this routing mapping rule?')) return;
    try {
      const res = await fetch(`/api/admin/mappings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete mapping');
      setSuccess('Mapping removed.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ==========================================
  // OFFICER ASSIGNMENT HANDLERS
  // ==========================================
  const openAddOfficer = () => {
    setEditingOfficer(null);
    setOfficerForm({
      officerName: '',
      officerEmail: '',
      officerPhone: '+91 ',
      departmentId: departments[0]?.id || '',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      city: 'Annur',
      zone: 'Zone 1',
      areaWard: 'Ward 1-5',
      maxWorkload: 15,
      active: true
    });
    setShowOfficerModal(true);
  };

  const openEditOfficer = (a: any) => {
    setEditingOfficer(a);
    setOfficerForm({
      officerName: a.officerName,
      officerEmail: a.officerEmail,
      officerPhone: a.officerPhone || '+91 ',
      departmentId: a.departmentId,
      state: a.state || 'Tamil Nadu',
      district: a.district || 'Coimbatore',
      city: a.city || 'Annur',
      zone: a.zone || 'Zone 1',
      areaWard: a.areaWard || 'Central Ward',
      maxWorkload: a.maxWorkload || 15,
      active: a.active !== false
    });
    setShowOfficerModal(true);
  };

  const handleSaveOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingOfficer ? `/api/admin/officer-assignments/${editingOfficer.id}` : '/api/admin/officer-assignments';
      const method = editingOfficer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(officerForm)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save officer assignment');
      }

      setShowOfficerModal(false);
      setSuccess(editingOfficer ? 'Officer assignment updated.' : 'Officer assigned to jurisdiction and provisioned for login.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleOfficer = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/officer-assignments/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to toggle officer status');
      setSuccess('Officer status toggled.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteOfficer = async (id: string, name: string) => {
    if (!confirm(`Remove jurisdiction assignment for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/officer-assignments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete officer assignment');
      setSuccess(`Assignment for ${name} removed.`);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ==========================================
  // SIMULATOR HANDLER
  // ==========================================
  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/simulate-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          categoryName: simCategory || undefined,
          subject: simText,
          description: simText,
          location: {
            state: 'Tamil Nadu',
            district: 'Coimbatore',
            city: simCity,
            zone: simZone,
            address: `${simZone}, ${simCity}, Coimbatore`
          }
        })
      });
      if (!res.ok) throw new Error('Failed to run routing simulation');
      const data = await res.json();
      setSimResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="w-9 h-9 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading municipal routing system...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172033]">ADMIN CONTROL CENTER</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-[#008C95] border border-teal-200">
              Dynamic Routing Architecture
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Separation of Concerns: Category → Responsible Department → Jurisdiction Zone → Eligible Officers → Workload Balancing.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#008C95]" />
          <span>Refresh Config</span>
        </button>
      </div>

      {/* FEEDBACK BANNERS */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ARCHITECTURE PIPELINE BANNER */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-[#132238] rounded-xl text-white shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-teal-300" />
            CivicResolve Scalable Complaint Routing Pipeline
          </span>
          <span className="text-[10px] text-slate-300 font-mono">No hardcoded officer-category bindings</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-200">
          <div className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/15">Citizen Grievance</div>
          <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <div className="px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">AI Category</div>
          <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <div className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">Category → Dept Mapping</div>
          <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <div className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">Location Zone</div>
          <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <div className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">Eligible Officers</div>
          <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <div className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">Workload Balancer</div>
          <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <div className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold shadow-xs">Auto-Assignment</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-xl shadow-2xs p-1">
        {[
          { key: 'departments', label: `Departments (${departments.length})`, icon: Building2 },
          { key: 'categories', label: `Categories (${categories.length})`, icon: FileText },
          { key: 'mappings', label: `Category → Dept Mappings (${mappings.length})`, icon: Shuffle },
          { key: 'officers', label: `Officer Area Assignments (${officerAssignments.length})`, icon: Users },
          { key: 'simulator', label: 'Pipeline Simulator & Test', icon: Play },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#172033] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: DYNAMIC DEPARTMENTS MANAGEMENT
      ========================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Municipal Departments</h2>
              <p className="text-xs text-gray-500">
                Admin can add, edit, activate/deactivate departments dynamically without code changes.
              </p>
            </div>
            <button
              onClick={openAddDept}
              className="px-3.5 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Department Name &amp; Code</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Supervising Head</th>
                    <th className="p-3.5">Service Areas / Jurisdiction</th>
                    <th className="p-3.5 text-center">Officers</th>
                    <th className="p-3.5 text-center">Active Cases</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departments.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#172033] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#008C95]" />
                          <span>{d.name}</span>
                          {d.code && (
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                              {d.code}
                            </span>
                          )}
                        </div>
                        {d.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{d.description}</p>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleDeptStatus(d.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                            d.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                          <span>{d.status || 'Active'}</span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-gray-800">{d.headName || 'Not designated'}</div>
                        {d.headEmail && (
                          <div className="text-[11px] font-mono text-gray-500">{d.headEmail}</div>
                        )}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(d.serviceAreas) && d.serviceAreas.length > 0 ? (
                            d.serviceAreas.map((sa: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.2 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-medium">
                                {sa}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[11px]">All Zones</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-bold text-gray-700">
                        {d.officerCount ?? 0}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 bg-teal-50 text-[#008C95] font-bold rounded-full font-mono">
                          {d.activeComplaintsCount ?? 0}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditDept(d)}
                          className="p-1.5 text-gray-500 hover:text-[#008C95] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Edit department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(d.id, d.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: SEPARATE COMPLAINT CATEGORIES TAXONOMY
      ========================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Complaint Categories (Decoupled Taxonomy)</h2>
              <p className="text-xs text-gray-500">
                Categories define what the issue is (e.g. Broken road, Streetlight not working, Stray animal). AI only identifies categories.
              </p>
            </div>
            <button
              onClick={openAddCat}
              className="px-3.5 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Category Name</th>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Default SLA Priority</th>
                    <th className="p-3.5">Active Routing Mappings</th>
                    <th className="p-3.5">NLP Keywords</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#172033] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>{c.name}</span>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 max-w-sm">{c.description}</p>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-gray-600">
                        {c.code || 'CAT_GEN'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.defaultPriority === 'Critical' ? 'bg-red-100 text-red-800' :
                          c.defaultPriority === 'High' ? 'bg-orange-100 text-orange-800' :
                          c.defaultPriority === 'Low' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.defaultPriority || 'Medium'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {Array.isArray(c.mappedDepartments) && c.mappedDepartments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.mappedDepartments.map((deptName: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-semibold">
                                &rarr; {deptName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium text-[11px]">Unmapped (needs routing rule)</span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-500 font-mono text-[11px] max-w-xs truncate">
                        {Array.isArray(c.keywords) ? c.keywords.join(', ') : c.keywords || 'corpus trained'}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditCat(c)}
                          className="p-1.5 text-gray-500 hover:text-[#008C95] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCat(c.id, c.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: CONFIGURABLE CATEGORY → DEPARTMENT MAPPINGS
      ========================================================= */}
      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Category → Department Mappings Table</h2>
              <p className="text-xs text-gray-500">
                Maps complaint categories to responsible departments. Supports multiple mappings and area/zone overrides!
              </p>
            </div>
            <button
              onClick={openAddMap}
              className="px-3.5 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mapping Rule</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Complaint Category</th>
                    <th className="p-3.5">&rarr; Responsible Department</th>
                    <th className="p-3.5">Zone / Area Condition</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Active Rule</th>
                    <th className="p-3.5">Notes</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mappings.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-[#172033]">
                        {m.categoryName}
                      </td>
                      <td className="p-3.5 font-bold text-teal-800">
                        <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md inline-block">
                          {m.departmentName}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-mono">
                          {m.zoneOverride || 'All Zones'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold font-mono text-gray-700">
                        P{m.priority ?? 1}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleMap(m.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                            m.active !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${m.active !== false ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                          <span>{m.active !== false ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-gray-500 text-[11px] max-w-xs truncate">
                        {m.description || 'Configured routing rule'}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditMap(m)}
                          className="p-1.5 text-gray-500 hover:text-[#008C95] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Edit mapping"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMap(m.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete mapping"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: OFFICER AREA ASSIGNMENTS & WORKLOAD BALANCER
      ========================================================= */}
      {activeTab === 'officers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Officer Area Assignments &amp; Workload Balancer</h2>
              <p className="text-xs text-gray-500">
                Maps field officers to departments, districts, and zones. The routing engine checks workload &amp; availability to assign cases automatically!
              </p>
            </div>
            <button
              onClick={openAddOfficer}
              className="px-3.5 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Officer</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Officer Name &amp; Contact</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Jurisdiction (District &gt; City &gt; Zone)</th>
                    <th className="p-3.5">Ward / Area</th>
                    <th className="p-3.5">Live Workload &amp; Capacity</th>
                    <th className="p-3.5">Availability</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {officerAssignments.map(a => {
                    const activeCount = a.currentWorkload ?? 0;
                    const maxCap = a.maxWorkload ?? 15;
                    const pct = Math.min(Math.round((activeCount / maxCap) * 100), 100);
                    const isAvail = a.isAvailable !== false;

                    return (
                      <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#172033] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#008C95]" />
                            <span>{a.officerName}</span>
                          </div>
                          <div className="text-[11px] font-mono text-gray-500">{a.officerEmail}</div>
                          {a.officerPhone && (
                            <div className="text-[10px] text-gray-400">{a.officerPhone}</div>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-gray-700">
                          {a.departmentName}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-gray-800">{a.district || 'Coimbatore'} &bull; {a.city || 'Annur'}</div>
                          <div className="text-teal-700 font-bold text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-teal-600" />
                            <span>{a.zone || 'Zone 1'}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-600">
                          {a.areaWard || 'All Wards'}
                        </td>
                        <td className="p-3.5 w-44">
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                            <span className="text-gray-700">{activeCount} active cases</span>
                            <span className="text-gray-400">Cap: {maxCap}</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleOfficer(a.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                              isAvail && a.active !== false
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isAvail && a.active !== false ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                            <span>{isAvail && a.active !== false ? 'Ready for Dispatch' : 'At Capacity / Off'}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openEditOfficer(a)}
                            className="p-1.5 text-gray-500 hover:text-[#008C95] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                            title="Edit assignment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOfficer(a.id, a.officerName)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: INTERACTIVE PIPELINE ROUTING SIMULATOR
      ========================================================= */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Play className="w-4 h-4 text-[#008C95]" />
                <span>Live Dynamic Routing Pipeline Simulator</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Test grievance dispatch against the active database configuration. Verify how complaints route to departments and officers automatically!
              </p>
            </div>

            <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Grievance Subject / Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={simText}
                    onChange={e => setSimText(e.target.value)}
                    placeholder="Enter sample grievance text e.g. 'Streetlight not working on main street' or 'Stray dogs menace near school'..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-[#008C95]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category (Optional Pre-selection)</label>
                    <select
                      value={simCategory}
                      onChange={e => setSimCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="">Let AI Classify Automatically</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Jurisdiction Zone</label>
                    <select
                      value={simZone}
                      onChange={e => setSimZone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="Zone 1">Zone 1 (Central / Bazaar)</option>
                      <option value="Zone 2">Zone 2 (South Ward)</option>
                      <option value="Zone 3">Zone 3 (Rural Outer Belt)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Simulation Target</span>
                  <p className="font-bold text-[#172033] mt-1 text-sm">Annur Municipality</p>
                  <p className="text-gray-500 text-[11px]">Coimbatore District, Tamil Nadu</p>
                  <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-gray-600 space-y-1">
                    <div>&bull; Active Departments: <strong>{departments.filter(d=>d.status==='Active').length}</strong></div>
                    <div>&bull; Configured Mappings: <strong>{mappings.filter(m=>m.active).length}</strong></div>
                    <div>&bull; Field Officers Ready: <strong>{officerAssignments.filter(o=>o.active).length}</strong></div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={simLoading}
                  className="w-full mt-4 py-2.5 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {simLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>Run Routing Pipeline Simulation</span>
                </button>
              </div>
            </form>
          </div>

          {/* SIMULATION RESULT VISUALIZER */}
          {simResult && (
            <div className="bg-white rounded-xl border border-teal-300 shadow-md p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Live Pipeline Simulation Execution Log
                  </span>
                  <h3 className="text-lg font-bold text-[#172033] mt-1">
                    Grievance Routed to: <span className="text-[#008C95]">{simResult.routingResult?.departmentName}</span>
                  </h3>
                </div>
                {simResult.routingResult?.assignedOfficerName && (
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Assigned Field Officer</span>
                    <p className="text-sm font-bold text-gray-900">{simResult.routingResult.assignedOfficerName}</p>
                    <p className="text-[10px] text-teal-600 font-mono">{simResult.routingResult.assignedOfficerEmail}</p>
                  </div>
                )}
              </div>

              {/* Step by Step Timeline */}
              <div className="space-y-4">
                {simResult.routingResult?.pipelineTrace?.map((step: any, i: number) => (
                  <div key={i} className="flex items-start gap-3.5 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      step.status === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      step.status === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-teal-100 text-[#008C95] border border-teal-300'
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-xs">{step.title}</h4>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          step.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODALS
      ========================================================= */}

      {/* DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#172033] text-base">
                {editingDept ? 'Edit Municipal Department' : 'Register New Department'}
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Name *</label>
                <input
                  required
                  type="text"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Animal Husbandry & Stray Control"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={deptForm.code}
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="e.g. AH"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={deptForm.status}
                    onChange={e => setDeptForm({ ...deptForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Head / Director</label>
                <input
                  type="text"
                  value={deptForm.headName}
                  onChange={e => setDeptForm({ ...deptForm, headName: e.target.value })}
                  placeholder="e.g. Dr. Balasubramanian"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={deptForm.headEmail}
                  onChange={e => setDeptForm({ ...deptForm, headEmail: e.target.value })}
                  placeholder="e.g. animal.director@civic.gov"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Service Areas / Zones (comma-separated)</label>
                <input
                  type="text"
                  value={deptForm.serviceAreas}
                  onChange={e => setDeptForm({ ...deptForm, serviceAreas: e.target.value })}
                  placeholder="Annur, Coimbatore, Zone 1, Zone 2"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Scope &amp; Description</label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Brief description of municipal duties..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#172033] text-base">
                {editingCat ? 'Edit Grievance Category' : 'Add Grievance Category'}
              </h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCat} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Label *</label>
                <input
                  required
                  type="text"
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Stray Animal Control"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              {!editingCat && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Target Department</label>
                  <select
                    value={catForm.departmentId}
                    onChange={e => setCatForm({ ...catForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                  >
                    <option value="">Do not map yet (configure later)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Taxonomy Code</label>
                  <input
                    type="text"
                    value={catForm.code}
                    onChange={e => setCatForm({ ...catForm, code: e.target.value })}
                    placeholder="CAT_ANIMAL"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Default SLA Priority</label>
                  <select
                    value={catForm.defaultPriority}
                    onChange={e => setCatForm({ ...catForm, defaultPriority: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">NLP Training Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={catForm.keywords}
                  onChange={e => setCatForm({ ...catForm, keywords: e.target.value })}
                  placeholder="stray dog, rabies, dog bite, cattle, barking"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Details of complaint taxonomy..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAPPING MODAL */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#172033] text-base">
                {editingMap ? 'Edit Routing Mapping' : 'Create Category → Department Mapping'}
              </h3>
              <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMap} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Complaint Category *</label>
                <select
                  required
                  disabled={Boolean(editingMap)}
                  value={mapForm.categoryId}
                  onChange={e => setMapForm({ ...mapForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-bold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Responsible Department *</label>
                <select
                  required
                  value={mapForm.departmentId}
                  onChange={e => setMapForm({ ...mapForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-bold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Zone Condition</label>
                  <select
                    value={mapForm.zoneOverride}
                    onChange={e => setMapForm({ ...mapForm, zoneOverride: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                  >
                    <option value="All Zones">All Zones</option>
                    <option value="Zone 1">Zone 1 Only</option>
                    <option value="Zone 2">Zone 2 Only</option>
                    <option value="Zone 3">Zone 3 Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority Rule (1 = Highest)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={mapForm.priority}
                    onChange={e => setMapForm({ ...mapForm, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Rule Notes / Authority Reference</label>
                <input
                  type="text"
                  value={mapForm.description}
                  onChange={e => setMapForm({ ...mapForm, description: e.target.value })}
                  placeholder="e.g. Government Order No. 42 / Municipal Resolution"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="map-active-check"
                  checked={mapForm.active}
                  onChange={e => setMapForm({ ...mapForm, active: e.target.checked })}
                  className="rounded text-[#008C95]"
                />
                <label htmlFor="map-active-check" className="font-bold text-gray-700">
                  Enable this routing mapping rule immediately
                </label>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Mapping Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICER ASSIGNMENT MODAL */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#172033] text-base">
                {editingOfficer ? 'Edit Officer Jurisdiction' : 'Assign Field Officer to Jurisdiction'}
              </h3>
              <button onClick={() => setShowOfficerModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Officer Name *</label>
                <input
                  required
                  type="text"
                  value={officerForm.officerName}
                  onChange={e => setOfficerForm({ ...officerForm, officerName: e.target.value })}
                  placeholder="e.g. Officer Anitha"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email (Official Login)</label>
                  <input
                    type="email"
                    value={officerForm.officerEmail}
                    onChange={e => setOfficerForm({ ...officerForm, officerEmail: e.target.value })}
                    placeholder="anitha.animal@civic.gov"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Phone (Direct SMS)</label>
                  <input
                    type="tel"
                    value={officerForm.officerPhone}
                    onChange={e => setOfficerForm({ ...officerForm, officerPhone: e.target.value })}
                    placeholder="+91 9845012345"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Department *</label>
                <select
                  required
                  value={officerForm.departmentId}
                  onChange={e => setOfficerForm({ ...officerForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-bold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Zone</label>
                  <select
                    value={officerForm.zone}
                    onChange={e => setOfficerForm({ ...officerForm, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                  >
                    <option value="All Zones">All Zones</option>
                    <option value="Zone 1">Zone 1 (Central / Bazaar)</option>
                    <option value="Zone 2">Zone 2 (South Ward)</option>
                    <option value="Zone 3">Zone 3 (Outer Rural)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Active Cases Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={officerForm.maxWorkload}
                    onChange={e => setOfficerForm({ ...officerForm, maxWorkload: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ward / Beat Area</label>
                <input
                  type="text"
                  value={officerForm.areaWard}
                  onChange={e => setOfficerForm({ ...officerForm, areaWard: e.target.value })}
                  placeholder="e.g. Ward 1-5, Bazaar & Highway Belt"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-900">
                &bull; Automatic Login Provisioned: Password is <strong>password</strong>. The officer can immediately log in and access their dispatched grievances queue!
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfficerModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Officer Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
