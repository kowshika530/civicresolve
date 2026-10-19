import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Bell, Check, ArrowRight, Smartphone } from 'lucide-react';

export function OfficerNotifications() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Officer Notifications</h1>
          <p className="text-xs text-gray-500 mt-1">Assignments, citizen reopens, SLA reminders, and senior officer notes.</p>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 text-[#008C95]" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Loading officer notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-700">No Notifications</h3>
          <p className="text-xs text-gray-500 mt-1">You have no pending system alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-colors shadow-2xs flex items-start justify-between gap-4 ${
                n.read ? 'bg-white border-gray-200' : 'bg-teal-50/50 border-teal-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-[#008C95] shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">{format(new Date(n.timestamp), 'PPp')}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      <span>Direct SMS Dispatched to {n.smsRecipientPhone || user?.phone || 'Official Mobile'}</span>
                    </span>
                  </div>
                </div>
              </div>
              {n.complaintId && (
                <Link
                  to={`/officer/complaints/${n.complaintId}`}
                  className="shrink-0 px-3 py-1 bg-white hover:bg-teal-50 border border-gray-300 hover:border-[#008C95] text-xs font-semibold text-[#008C95] rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Open Case</span>
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
