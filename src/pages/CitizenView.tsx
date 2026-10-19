import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { 
  Home, PlusCircle, List, MapPin, Bell, User as UserIcon, HelpCircle
} from 'lucide-react';

import { CitizenDashboard } from './citizen/CitizenDashboard';
import { CitizenSubmit } from './citizen/CitizenSubmit';
import { CitizenComplaintsList } from './citizen/CitizenComplaintsList';
import { CitizenComplaintDetails } from './citizen/CitizenComplaintDetails';
import { CitizenNotifications } from './citizen/CitizenNotifications';
import { CitizenProfile } from './citizen/CitizenProfile';
import { CitizenHelp } from './citizen/CitizenHelp';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/citizen/dashboard', icon: Home },
  { name: 'Submit Complaint', path: '/citizen/complaints/new', icon: PlusCircle },
  { name: 'My Complaints', path: '/citizen/complaints', icon: List },
  { name: 'Track Complaint', path: '/track', icon: MapPin },
  { name: 'Notifications', path: '/citizen/notifications', icon: Bell },
  { name: 'Profile', path: '/citizen/profile', icon: UserIcon },
  { name: 'Help / FAQ', path: '/citizen/help', icon: HelpCircle },
];

export function CitizenView() {
  return (
    <Layout navItems={NAV_ITEMS}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="complaints/new" element={<CitizenSubmit />} />
        <Route path="complaints" element={<CitizenComplaintsList />} />
        <Route path="complaints/:id" element={<CitizenComplaintDetails />} />
        <Route path="notifications" element={<CitizenNotifications />} />
        <Route path="profile" element={<CitizenProfile />} />
        <Route path="help" element={<CitizenHelp />} />
        
        <Route path="*" element={<div className="p-8 text-center text-gray-500">Module not found.</div>} />
      </Routes>
    </Layout>
  );
}
