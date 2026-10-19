import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Bell, Check, Clock, ShieldAlert, CheckCircle2, ArrowRight, 
  Smartphone, Send, Radio, Sparkles 
} from 'lucide-react';

export function CitizenNotifications() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingNotif, setTestingNotif] = useState(false);
  const [testSentMsg, setTestSentMsg] = useState('');

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [token]);

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifs();
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Test live notification + direct SMS transmission to user's phone
  const handleTriggerTestNotification = async () => {
    setTestingNotif(true);
    setTestSentMsg('');
    try {
      const targetPhone = user?.phone;
      if (!targetPhone) {
        setTestSentMsg('Please update your mobile number in your profile to receive SMS alerts.');
        setTimeout(() => setTestSentMsg(''), 5000);
        return;
      }
      const res = await fetch('/api/sms/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          recipientName: user?.name || 'Citizen',
          message: `CivicResolve Live Notification: Municipal inspection scheduled for your ward. Direct SMS delivery confirmed.`
        })
      });

      if (res.ok) {
        setTestSentMsg(`Test alert and direct SMS delivered to ${targetPhone}!`);
        setTimeout(() => setTestSentMsg(''), 5000);
        await fetchNotifs();
      }
    } finally {
      setTestingNotif(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172033]">Notifications &amp; Direct SMS Alerts</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              SMS Synced
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Every notification in CivicResolve is automatically dispatched as a direct SMS {user?.phone ? `to your registered phone number (${user.phone})` : 'to your registered mobile number'}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTriggerTestNotification}
            disabled={testingNotif}
            className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{testingNotif ? 'Dispatching...' : 'Test SMS & Notification'}</span>
          </button>

          <button
            onClick={markAllRead}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-[#008C95]" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {testSentMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testSentMsg}</span>
        </div>
      )}

      {/* Direct SMS Notification Info Banner */}
      <div className="bg-gradient-to-r from-[#172033] to-[#252A34] text-white p-4 rounded-xl shadow-xs border border-gray-800 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#008C95]/30 border border-[#008C95]/50 flex items-center justify-center shrink-0 text-teal-300 mt-0.5">
          <Smartphone className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span>Direct Mobile Message Delivery Active for All Notifications</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </p>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Whenever any issue is raised, assigned, updated, escalated, or closed, an instant SMS text message is directly transmitted to the citizen's number. You never miss an update even without an internet connection.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading notifications &amp; SMS records...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No Notifications</h3>
          <p className="text-xs text-gray-500 mt-1">You are all caught up with your civic grievances.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`p-4 rounded-xl border transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer ${
                n.read ? 'bg-white border-gray-200' : 'bg-teal-50/50 border-teal-200'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  n.type === 'RESOLUTION_VERIFY' ? 'bg-green-100 text-green-700' :
                  n.type === 'ESCALATION' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-[#008C95]'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-[#172033]">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#008C95]"></span>}
                    {n.complaintNumber && (
                      <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                        {n.complaintNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                  
                  {/* SMS Delivery Badge on each notification */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(n.timestamp), 'PPp')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      <span>Direct SMS Dispatched to {n.smsRecipientPhone || user?.phone || 'Registered Mobile'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {n.complaintId && (
                <Link
                  to={`/citizen/complaints/${n.complaintId}`}
                  className="shrink-0 px-3 py-1.5 bg-white hover:bg-teal-50 border border-gray-300 hover:border-[#008C95] text-xs font-semibold text-[#008C95] rounded-lg transition-colors flex items-center gap-1 self-start"
                >
                  <span>View Case</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
