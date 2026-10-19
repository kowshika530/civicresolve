import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Phone, Award, CheckCircle2, MapPin, Building2, Plus, ArrowRight, Layers, AlertCircle } from 'lucide-react';

export function OfficerProfile() {
  const { user, updateUser, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 9845012345');
  const [city, setCity] = useState(user?.city || 'Annur');
  const [zone, setZone] = useState(user?.zone || 'Zone 1');
  const [departmentId, setDepartmentId] = useState(user?.departmentId || 'd2');
  const [designation, setDesignation] = useState(user?.designation || 'Field Inspector');
  const [departments, setDepartments] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Jurisdiction Modal / Form
  const [showAddJurisdiction, setShowAddJurisdiction] = useState(false);
  const [newCity, setNewCity] = useState('Coimbatore');
  const [newDeptId, setNewDeptId] = useState('d1');
  const [newZone, setNewZone] = useState('Central Zone');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setSaveLoading(true);
    setActionMsg(null);
    try {
      const selectedDept = departments.find(d => d.id === departmentId);
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name, 
          phone, 
          city, 
          zone, 
          departmentId, 
          department: selectedDept ? selectedDept.name : undefined,
          designation 
        })
      });
      if (res.ok) {
        const updated = await res.json();
        updateUser(updated);
        setSaved(true);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSwitchJurisdiction = async (targetCity: string, targetDeptId: string, targetZone?: string) => {
    try {
      const res = await fetch('/api/officer/switch-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ city: targetCity, departmentId: targetDeptId, zone: targetZone })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setCity(targetCity);
        setDepartmentId(targetDeptId);
        if (targetZone) setZone(targetZone);
        setActionMsg({ text: `Switched active posting to ${targetCity} (${data.user.department || 'Department'})!`, type: 'success' });
      } else {
        setActionMsg({ text: data.error || 'Failed to switch jurisdiction.', type: 'error' });
      }
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error occurred.', type: 'error' });
    }
  };

  const handleAddJurisdiction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/officer/add-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ city: newCity, departmentId: newDeptId, zone: newZone })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setShowAddJurisdiction(false);
        setActionMsg({ text: `Added new portfolio: ${newCity} (${departments.find(d => d.id === newDeptId)?.name || 'Department'})!`, type: 'success' });
      } else {
        setActionMsg({ text: data.error || 'Could not add jurisdiction.', type: 'error' });
      }
    } finally {
      setAddLoading(false);
    }
  };

  const activeDeptName = user?.department || departments.find(d => d.id === (user?.departmentId || departmentId))?.name || 'Municipal Department';
  const officerJurisdictions = user?.jurisdictions && user.jurisdictions.length > 0 
    ? user.jurisdictions 
    : [{ city: user?.city || 'Annur', departmentId: user?.departmentId || 'd2', departmentName: activeDeptName, zone: user?.zone || 'Zone 1', isPrimary: true }];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Field Officer Official Profile &amp; Postings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Municipal credentials, designated City &amp; Department posting, and multi-jurisdiction charge portfolio.
        </p>
      </div>

      {actionMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Primary Credentials Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 bg-teal-50/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#008C95] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {name.charAt(0) || 'O'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#172033]">{name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 bg-[#172033] text-white rounded-full">
                  {designation}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Badge #CR-OFF-0{user?.id || '2'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-teal-200 text-xs">
            <MapPin className="w-4 h-4 text-[#008C95]" />
            <div>
              <span className="font-bold text-[#172033]">{user?.city || 'Annur'}</span>
              <span className="text-gray-400"> • </span>
              <span className="text-[#008C95] font-semibold">{activeDeptName}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Officer credentials &amp; station posting updated successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Officer Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Official Gov Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-sm bg-gray-100 border border-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Official Duty Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Official Designation</label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] outline-none"
              />
            </div>
          </div>

          {/* Active Posting Details */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#006D75] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Current Posting Jurisdiction</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Active City / Municipality</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#008C95]"
                >
                  <option value="Annur">Annur Town Panchayat</option>
                  <option value="Coimbatore">Coimbatore Corporation</option>
                  <option value="Mettupalayam">Mettupalayam Municipality</option>
                  <option value="Pollachi">Pollachi Municipality</option>
                  <option value="Sulur">Sulur Town Panchayat</option>
                  <option value="Tiruppur">Tiruppur Corporation</option>
                  <option value="Erode">Erode Corporation</option>
                  <option value="Chennai">Greater Chennai Corporation</option>
                  <option value="Madurai">Madurai Corporation</option>
                  <option value="Salem">Salem Corporation</option>
                  <option value="Trichy">Tiruchirappalli Corporation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Active Department</label>
                <select
                  value={departmentId}
                  onChange={e => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#008C95]"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ward / Zone Area</label>
                <input
                  type="text"
                  value={zone}
                  onChange={e => setZone(e.target.value)}
                  placeholder="Zone 1 / Central"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-2 bg-[#008C95] hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
            >
              {saveLoading ? 'Saving Changes...' : 'Save Officer Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Jurisdiction Portfolio Switcher & Addition */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#008C95]" />
              <span>Multi-City &amp; Multi-Department Portfolios</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Officers holding multiple municipal charges can switch their active operating dashboard or add a new posting area.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddJurisdiction(!showAddJurisdiction)}
            className="px-3.5 py-1.5 bg-teal-50 text-[#008C95] hover:bg-teal-100 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Additional Charge</span>
          </button>
        </div>

        {/* Existing Portfolios Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {officerJurisdictions.map((j: any, idx: number) => {
            const isCurrentActive = (user?.city || 'Annur').toLowerCase() === (j.city || '').toLowerCase() &&
              (user?.departmentId || 'd2') === j.departmentId;
            const deptTitle = j.departmentName || departments.find(d => d.id === j.departmentId)?.name || 'Municipal Works';

            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentActive 
                    ? 'border-[#008C95] bg-teal-50/50 ring-1 ring-teal-200' 
                    : 'border-gray-200 bg-gray-50/40 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-white border border-gray-200 text-[#008C95]">
                      <Building2 className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-[#172033]">{j.city}</h3>
                      <p className="text-[11px] text-[#008C95] font-semibold">{deptTitle}</p>
                    </div>
                  </div>
                  {isCurrentActive ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active Posting
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchJurisdiction(j.city, j.departmentId, j.zone)}
                      className="px-2.5 py-1 bg-white hover:bg-[#172033] hover:text-white text-gray-700 border border-gray-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Switch to This</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Zone: <strong>{j.zone || 'All Zones'}</strong></span>
                  <span className="text-[10px] text-gray-400">Auto-routes matching complaints</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Additional Jurisdiction Drawer / Form */}
        {showAddJurisdiction && (
          <form onSubmit={handleAddJurisdiction} className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Enroll Additional Municipal Jurisdiction
              </h4>
              <button
                type="button"
                onClick={() => setShowAddJurisdiction(false)}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target City / Taluk</label>
                <select
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                >
                  <option value="Coimbatore">Coimbatore Corporation</option>
                  <option value="Annur">Annur Town Panchayat</option>
                  <option value="Mettupalayam">Mettupalayam Municipality</option>
                  <option value="Pollachi">Pollachi Municipality</option>
                  <option value="Sulur">Sulur Town Panchayat</option>
                  <option value="Tiruppur">Tiruppur Corporation</option>
                  <option value="Erode">Erode Corporation</option>
                  <option value="Chennai">Greater Chennai Corporation</option>
                  <option value="Madurai">Madurai Corporation</option>
                  <option value="Salem">Salem Corporation</option>
                  <option value="Trichy">Tiruchirappalli Corporation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                <select
                  value={newDeptId}
                  onChange={e => setNewDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Zone Assignment</label>
                <input
                  type="text"
                  value={newZone}
                  onChange={e => setNewZone(e.target.value)}
                  placeholder="e.g. Central Zone"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={addLoading}
                className="px-4 py-2 bg-[#172033] hover:bg-[#202D45] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {addLoading ? 'Enrolling...' : 'Confirm Additional Charge'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
