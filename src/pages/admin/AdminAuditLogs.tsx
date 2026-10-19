import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Search, RefreshCw, Filter, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function AdminAuditLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      (l.user && l.user.toLowerCase().includes(search.toLowerCase())) ||
      (l.action && l.action.toLowerCase().includes(search.toLowerCase())) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
      (l.entityId && l.entityId.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">System Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-1">Immutable trail of administrative events, status changes, privilege transitions, and user actions.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by actor, action, details, entity ID..."
            className="w-full text-xs bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-3">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="text-xs bg-transparent text-gray-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Event Types ({logs.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor &amp; Role</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Audit Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 font-sans">
                    No audit records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 text-gray-500 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5 font-sans">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{format(new Date(l.timestamp), 'dd MMM yyyy, HH:mm:ss')}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-700 font-sans">
                      <div className="font-bold text-[#172033]">{l.user || 'System'}</div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">{l.role || 'SYSTEM'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-sans ${
                        l.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-800' :
                        l.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                        l.action.includes('UPDATE') || l.action.includes('STATUS') ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-600 text-[11px]">
                      <span className="font-semibold text-gray-800 font-sans">{l.entity}</span>
                      {l.entityId && <span className="block text-gray-400 truncate max-w-[140px]">#{l.entityId}</span>}
                    </td>
                    <td className="p-3.5 text-gray-600 text-[11px] max-w-xs font-sans">
                      {l.details || '—'}
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
