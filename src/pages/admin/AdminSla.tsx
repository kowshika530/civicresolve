import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, CheckCircle2, Save, RotateCcw } from 'lucide-react';

export function AdminSla() {
  const { token } = useAuth();
  const [slaConfig, setSlaConfig] = useState<Record<string, number>>({
    Critical: 24,
    High: 72,
    Medium: 120,
    Low: 168
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchSla = async () => {
    try {
      const res = await fetch('/api/admin/sla', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSlaConfig(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSla();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setError('');
    try {
      const res = await fetch('/api/admin/sla', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(slaConfig)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update SLA configuration');
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const priorityColors: Record<string, { bg: string; text: string; badge: string }> = {
    Critical: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    High: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
    Medium: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    Low: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' }
  };

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
          <h1 className="text-2xl font-bold text-[#172033]">SLA Window Configuration</h1>
          <p className="text-xs text-gray-500 mt-1">Configure resolution timeline thresholds (in hours) enforced across municipal grievance escalations.</p>
        </div>
        <button
          onClick={fetchSla}
          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Current</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>SLA parameters updated successfully. New grievances will automatically inherit these deadlines.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Critical', 'High', 'Medium', 'Low'] as const).map(p => {
            const colors = priorityColors[p];
            return (
              <div key={p} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${colors.badge}`}>
                    {p} Priority
                  </span>
                  <Clock className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Resolution Time (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    required
                    value={slaConfig[p] ?? 24}
                    onChange={e => setSlaConfig({ ...slaConfig, [p]: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono font-bold text-[#172033] outline-none focus:border-[#008C95]"
                  />
                </div>
                <div className="text-[11px] text-gray-500">
                  Equivalent to ≈ <span className="font-semibold">{Math.round(((slaConfig[p] ?? 24) / 24) * 10) / 10} days</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Automated SLA Monitoring Behavior</p>
            <p className="mt-0.5 text-amber-800">
              When a grievance exceeds its designated SLA timeframe without reaching &quot;Citizen Verification&quot; or &quot;Closed&quot; status, the CivicResolve automated background cron immediately dispatches an <strong>SLA Breached</strong> escalation alert to the Senior Officer.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#008C95] hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save SLA Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
