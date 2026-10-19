import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { 
  Home, List, AlertTriangle, Clock, ShieldAlert, Bell, User as UserIcon, Users, TrendingUp, MapPin
} from 'lucide-react';
import { SeniorDashboard } from './senior/SeniorDashboard';
import { SeniorComplaintsList } from './senior/SeniorComplaintsList';
import { SeniorComplaintDetails } from './senior/SeniorComplaintDetails';
import { SeniorMap } from './senior/SeniorMap';
import { SeniorEscalations } from './senior/SeniorEscalations';
import { SeniorOverdue } from './senior/SeniorOverdue';
import { SeniorAtRisk } from './senior/SeniorAtRisk';
import { SeniorReopened } from './senior/SeniorReopened';
import { SeniorOfficersWorkload } from './senior/SeniorOfficersWorkload';
import { SeniorAnalytics } from './senior/SeniorAnalytics';
import { SeniorNotifications } from './senior/SeniorNotifications';
import { SeniorProfile } from './senior/SeniorProfile';
const NAV_ITEMS = [
  { name: 'Dashboard', path: '/senior/dashboard', icon: Home },
  { name: 'Department Map', path: '/senior/map', icon: MapPin },
  { name: 'Department Complaints', path: '/senior/complaints', icon: List },
  { name: 'Escalations', path: '/senior/escalations', icon: ShieldAlert },
  { name: 'Overdue', path: '/senior/overdue', icon: AlertTriangle },
  { name: 'At Risk', path: '/senior/at-risk', icon: Clock },
  { name: 'Reopened', path: '/senior/reopened', icon: ShieldAlert },
  { name: 'Officers Workload', path: '/senior/officers', icon: Users },
  { name: 'Analytics', path: '/senior/analytics', icon: TrendingUp },
  { name: 'Notifications', path: '/senior/notifications', icon: Bell },
  { name: 'Profile', path: '/senior/profile', icon: UserIcon },
];
export function SeniorView() {
  return (
    <Layout navItems={NAV_ITEMS}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SeniorDashboard />} />
        <Route path="map" element={<SeniorMap />} />
        <Route path="complaints" element={<SeniorComplaintsList />} />
        <Route path="complaints/:id" element={<SeniorComplaintDetails />} />
        <Route path="escalations" element={<SeniorEscalations />} />
        <Route path="overdue" element={<SeniorOverdue />} />
        <Route path="at-risk" element={<SeniorAtRisk />} />
        <Route path="reopened" element={<SeniorReopened />} />
        <Route path="officers" element={<SeniorOfficersWorkload />} />
        <Route path="analytics" element={<SeniorAnalytics />} />
        <Route path="notifications" element={<SeniorNotifications />} />
        <Route path="profile" element={<SeniorProfile />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">Module not found.</div>} />
      </Routes>
    </Layout>
  );
}
