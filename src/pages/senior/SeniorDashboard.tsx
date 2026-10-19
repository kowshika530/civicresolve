import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { 
  Users, AlertTriangle, TrendingUp, ShieldAlert, FileText, CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function SeniorDashboard() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, escRes] = await Promise.all([
          fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/escalations', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (compRes.ok) setComplaints(await compRes.json());
        if (escRes.ok) setEscalations(await escRes.json());
      } finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin"></div></div>;

  const activeEscalations = escalations.filter(e => {
    const c = complaints.find(comp => comp.id === e.complaintId);
    return c && !['Resolved', 'Closed', 'Citizen Verification'].includes(c.status);
  });

  const overdue = complaints.filter(c => c.slaDeadline && c.slaDeadline < Date.now() && !['Resolved', 'Closed', 'Citizen Verification'].includes(c.status));
  const reopened = complaints.filter(c => c.status === 'Reopened');

  const statusData = [
    { name: 'Pending', value: complaints.filter(c => ['New', 'Assigned', 'Accepted'].includes(c.status)).length },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'In Progress' || c.status === 'Reopened').length },
    { name: 'Resolved/Closed', value: complaints.filter(c => ['Resolved', 'Closed', 'Citizen Verification'].includes(c.status)).length },
  ];
  const COLORS = ['#D9A441', '#008C95', '#3A7D44'];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#172033]">Senior Officer Dashboard</h2>
        <p className="text-gray-500">Department overview and critical escalations.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL COMPLAINTS', value: complaints.length, color: 'text-[#172033]' },
          { label: 'ACTIVE ESCALATIONS', value: activeEscalations.length, color: 'text-[#C0392B]' },
          { label: 'OVERDUE (SLA BREACH)', value: overdue.length, color: 'text-[#8E2C2C]' },
          { label: 'REOPENED', value: reopened.length, color: 'text-[#D99A2B]' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-[#172033] flex items-center"><ShieldAlert className="w-4 h-4 mr-2 text-[#C0392B]" /> Critical Escalations</h3>
            <Link to="/senior/escalations" className="text-sm text-[#008C95] hover:underline font-medium">View All</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {activeEscalations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No active escalations.</div>
            ) : (
              activeEscalations.slice(0, 5).map(esc => {
                const c = complaints.find(comp => comp.id === esc.complaintId);
                if (!c) return null;
                return (
                  <div key={esc.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-[#172033]">{c.complaintNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${esc.type === 'AUTOMATIC' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                          {esc.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{esc.reason}</p>
                    </div>
                    <Link to={`/senior/complaints/${c.id}`} className="px-3 py-1.5 bg-[#172033] text-white text-xs font-medium rounded hover:bg-gray-800 shadow-sm whitespace-nowrap">
                      Review
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-[#172033] mb-4">Department Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 text-xs font-medium text-gray-500">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
