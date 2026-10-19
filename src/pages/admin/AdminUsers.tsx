import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';
import { 
  Users, UserPlus, Trash2, Edit2, Shield, Check, X, Search, 
  Smartphone, Send, Edit3, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminUsers() {
  const { token } = useAuth();
  const [userList, setUserList] = useState<User[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: 'password',
    role: 'OFFICER' as Role,
    departmentId: 'd1',
    phone: '+91 '
  });
  const [error, setError] = useState('');

  // Quick Edit Phone state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  // Quick single test SMS
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testSuccessId, setTestSuccessId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const [uRes, dRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (uRes.ok) setUserList(await uRes.json());
      if (dRes.ok) setDepartments(await dRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUserData)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create user');
      }
      setShowAddModal(false);
      setNewUserData({ name: '', email: '', password: 'password', role: 'OFFICER', departmentId: 'd1', phone: '+91 ' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this user from the system?')) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchUsers();
  };

  const handleSendTestSms = async (user: User) => {
    if (!user.phone) {
      alert(`No mobile number registered for ${user.name}. Click Edit Phone to set one.`);
      return;
    }
    setTestingId(user.id);
    try {
      const res = await fetch('/api/sms/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          recipientName: user.name,
          message: `CivicResolve Alert: SMS verification successful for ${user.name}. All complaint lifecycle notifications active.`
        })
      });
      if (res.ok) {
        setTestSuccessId(user.id);
        setTimeout(() => setTestSuccessId(null), 4000);
      }
    } finally {
      setTestingId(null);
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingPhone(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: newPhone.trim() })
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } finally {
      setSavingPhone(false);
    }
  };

  const filtered = userList.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search)) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">User &amp; Role Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage platform accounts, phone numbers for SMS updates, and department roster assignments.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/sms"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>SMS Gateway Hub</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* SMS Gateway Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#172033]">Live Multi-Stakeholder SMS Notifications Operational</h3>
            <p className="text-[11px] text-emerald-900 mt-0.5">
              All registered citizens, field inspection officers, senior directors, and administrators receive immediate SMS updates on case creation, status changes, and escalations.
            </p>
          </div>
        </div>

        <Link
          to="/admin/sms"
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 shrink-0 self-start sm:self-auto"
        >
          <span>Open SMS Broadcaster</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone number, or role..."
          className="w-full text-xs bg-transparent outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Mobile (SMS Updates)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-[#172033] flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>

                  <td className="p-3.5 text-gray-600 font-mono">{u.email}</td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'SENIOR_OFFICER' ? 'bg-red-100 text-red-800' :
                      u.role === 'OFFICER' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-3.5 text-gray-600">
                    {departments.find(d => d.id === u.departmentId)?.name || 'General Governance'}
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Smartphone className="w-3.5 h-3.5 text-[#008C95]" />
                      <span className="font-semibold text-gray-900">{u.phone || <span className="text-gray-400 italic">No phone</span>}</span>
                      {u.phone && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                          SMS ACTIVE
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {testSuccessId === u.id ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> SMS Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendTestSms(u)}
                          disabled={testingId === u.id}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Send test SMS to this person"
                        >
                          <Send className="w-3 h-3" />
                          <span>{testingId === u.id ? 'Sending...' : 'Test SMS'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setNewPhone(u.phone || '+91 ');
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#008C95] hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="Edit Phone Number"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {u.email !== 'admin@example.com' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#172033] text-base">Provision New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  value={newUserData.name}
                  onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. Officer Raman"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={newUserData.email}
                  onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                  placeholder="raman@civic.gov"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number (SMS Enabled) *</label>
                <input
                  required
                  type="tel"
                  value={newUserData.phone}
                  onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono"
                  placeholder="+91 9789012345"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">Enables automatic SMS updates on grievance registration, assignments, and resolution.</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="text"
                  value={newUserData.password}
                  onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Role</label>
                  <select
                    value={newUserData.role}
                    onChange={e => setNewUserData({ ...newUserData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                  >
                    <option value="CITIZEN">Citizen</option>
                    <option value="OFFICER">Field Officer</option>
                    <option value="SENIOR_OFFICER">Senior Officer</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={newUserData.departmentId}
                    onChange={e => setNewUserData({ ...newUserData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Phone Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#172033] text-sm">Update Mobile Phone</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-3 text-xs">
              <p className="text-gray-600">
                Updating mobile number for <span className="font-bold text-[#172033]">{editingUser.name}</span> ({editingUser.role.replace('_', ' ')}).
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number *</label>
                <input
                  required
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+91 9789012345"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPhone}
                  className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {savingPhone ? 'Saving...' : 'Save Phone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
