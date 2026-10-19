/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { CitizenView } from './pages/CitizenView';
import { OfficerView } from './pages/OfficerView';
import { SeniorView } from './pages/SeniorView';
import { AdminView } from './pages/AdminView';
import { TrackComplaint } from './pages/TrackComplaint';
import { PublicLodgeComplaint } from './pages/PublicLodgeComplaint';
import { LandingPage } from './pages/LandingPage';
import { AboutUs } from './pages/AboutUs';
import { CitizenServices } from './pages/CitizenServices';
import { HelpContact } from './pages/HelpContact';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, token, isReady } = useAuth();
  
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Verifying municipal session...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access wrong role
    switch (user.role) {
      case 'CITIZEN': return <Navigate to="/citizen" replace />;
      case 'OFFICER': return <Navigate to="/officer" replace />;
      case 'SENIOR_OFFICER': return <Navigate to="/senior" replace />;
      case 'ADMIN': return <Navigate to="/admin" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login defaultTab="register" />} />
      <Route path="/register-complaint" element={<PublicLodgeComplaint />} />
      <Route path="/lodge" element={<PublicLodgeComplaint />} />
      <Route path="/lodge-complaint" element={<PublicLodgeComplaint />} />
      <Route path="/public/lodge" element={<PublicLodgeComplaint />} />
      <Route path="/track" element={<TrackComplaint />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/services" element={<CitizenServices />} />
      <Route path="/citizen-services" element={<CitizenServices />} />
      <Route path="/track" element={<TrackComplaint />} />
      <Route path="/track-grievance" element={<TrackComplaint />} />
      <Route path="/contact" element={<HelpContact />} />
      <Route path="/help" element={<HelpContact />} />
      <Route path="/help-contact" element={<HelpContact />} />
      <Route path="/help-and-contact" element={<HelpContact />} />
      
      <Route path="/citizen/*" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}>
          <CitizenView />
        </ProtectedRoute>
      } />
      
      <Route path="/officer/*" element={
        <ProtectedRoute allowedRoles={['OFFICER']}>
          <OfficerView />
        </ProtectedRoute>
      } />
      
      <Route path="/senior/*" element={
        <ProtectedRoute allowedRoles={['SENIOR_OFFICER']}>
          <SeniorView />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminView />
        </ProtectedRoute>
      } />

      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
