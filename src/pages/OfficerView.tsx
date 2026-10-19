import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { 
  Home, List, AlertTriangle, Clock, ShieldAlert, Bell, User as UserIcon
} from 'lucide-react';

import { OfficerDashboard } from './officer/OfficerDashboard';
import { OfficerComplaintsList } from './officer/OfficerComplaintsList';
import { OfficerComplaintDetails } from './officer/OfficerComplaintDetails';
import { OfficerAtRisk } from './officer/OfficerAtRisk';
import { OfficerOverdue } from './officer/OfficerOverdue';
import { OfficerEscalations } from './officer/OfficerEscalations';
import { OfficerNotifications } from './officer/OfficerNotifications';
import { OfficerProfile } from './officer/OfficerProfile';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/officer/dashboard', icon: Home },
  { name: 'Assigned Complaints', path: '/officer/complaints', icon: List },
  { name: 'At Risk', path: '/officer/at-risk', icon: Clock },
  { name: 'Overdue', path: '/officer/overdue', icon: AlertTriangle },
  { name: 'Escalations', path: '/officer/escalations', icon: ShieldAlert },
  { name: 'Notifications', path: '/officer/notifications', icon: Bell },
  { name: 'Profile', path: '/officer/profile', icon: UserIcon },
];

export function OfficerView() {
  return (
    <Layout navItems={NAV_ITEMS}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="complaints" element={<OfficerComplaintsList />} />
        <Route path="complaints/:id" element={<OfficerComplaintDetails />} />
        <Route path="at-risk" element={<OfficerAtRisk />} />
        <Route path="overdue" element={<OfficerOverdue />} />
        <Route path="escalations" element={<OfficerEscalations />} />
        <Route path="notifications" element={<OfficerNotifications />} />
        <Route path="profile" element={<OfficerProfile />} />
        
        <Route path="*" element={<div className="p-8 text-center text-gray-500">Module not found.</div>} />
      </Routes>
    </Layout>
  );
}
