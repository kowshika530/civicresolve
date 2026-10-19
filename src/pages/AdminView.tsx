import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { 
  Home, Users, Clock, Building2, Shield, TrendingUp, Flame, Smartphone
} from 'lucide-react';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminHotspots } from './admin/AdminHotspots';
import { AdminUsers } from './admin/AdminUsers';
import { AdminSla } from './admin/AdminSla';
import { AdminDepartments } from './admin/AdminDepartments';
import { AdminAuditLogs } from './admin/AdminAuditLogs';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminSmsGateway } from './admin/AdminSmsGateway';
const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
  { name: 'SMS Gateway Hub', path: '/admin/sms', icon: Smartphone },
  { name: 'Hotspots & Maps', path: '/admin/hotspots', icon: Flame },
  { name: 'Users & Roles', path: '/admin/users', icon: Users },
  { name: 'SLA Configuration', path: '/admin/sla', icon: Clock },
  { name: 'Departments', path: '/admin/departments', icon: Building2 },
  { name: 'System Logs', path: '/admin/logs', icon: Shield },
  { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
];
export function AdminView() {
  return (
    <Layout navItems={NAV_ITEMS} title="System Administration">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="sms" element={<AdminSmsGateway />} />
        <Route path="hotspots" element={<AdminHotspots />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="sla" element={<AdminSla />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="logs" element={<AdminAuditLogs />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        
        <Route path="*" element={<div className="p-8 text-center text-gray-500">Module not found.</div>} />
      </Routes>
    </Layout>
  );
}
