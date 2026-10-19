import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, Shield, Bell, User as UserIcon, LogOut, Search, 
  Menu, X, PlusCircle, CheckCircle2, ChevronDown, ExternalLink,
  MapPin, AlertTriangle, Activity
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon?: React.ElementType;
}

interface AppShellProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  pageTitle?: string;
  pageSubtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export function AppShell({ 
  children, 
  navItems, 
  pageTitle, 
  pageSubtitle, 
  breadcrumbs, 
  actions 
}: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Compute role-specific primary navigation if not custom provided
  const getRoleNavItems = (): NavItem[] => {
    if (navItems && navItems.length > 0) return navItems;
    if (!user) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Lodge Complaint', path: '/register-complaint' },
        { name: 'Track Grievance', path: '/track' },
        { name: 'Officer Login', path: '/login' },
      ];
    }
    switch (user.role) {
      case 'CITIZEN':
        return [
          { name: 'Home', path: '/citizen/dashboard' },
          { name: 'My Complaints', path: '/citizen/complaints' },
          { name: 'Track', path: '/track' },
          { name: 'Notifications', path: '/citizen/notifications' },
          { name: 'Profile', path: '/citizen/profile' },
        ];
      case 'OFFICER':
        return [
          { name: 'Dashboard', path: '/officer/dashboard' },
          { name: 'Assigned Complaints', path: '/officer/complaints' },
          { name: 'SLA Monitor', path: '/officer/at-risk' },
          { name: 'Overdue Queue', path: '/officer/overdue' },
          { name: 'Escalations', path: '/officer/escalations' },
          { name: 'Notifications', path: '/officer/notifications' },
        ];
      case 'SENIOR_OFFICER':
        return [
          { name: 'Command Center', path: '/senior/dashboard' },
          { name: 'Escalations', path: '/senior/escalations' },
          { name: 'Department Complaints', path: '/senior/complaints' },
          { name: 'Map', path: '/senior/map' },
          { name: 'Analytics', path: '/senior/analytics' },
          { name: 'Workload', path: '/senior/officers' },
        ];
      case 'ADMIN':
        return [
          { name: 'Overview', path: '/admin/dashboard' },
          { name: 'Hotspots & Map', path: '/admin/hotspots' },
          { name: 'Users', path: '/admin/users' },
          { name: 'Departments', path: '/admin/departments' },
          { name: 'SLA', path: '/admin/sla' },
          { name: 'Analytics', path: '/admin/analytics' },
          { name: 'Audit Logs', path: '/admin/logs' },
        ];
      default:
        return [
          { name: 'Home', path: '/' },
          { name: 'Track', path: '/track' },
        ];
    }
  };

  const primaryNav = getRoleNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#252A34] flex flex-col font-sans selection:bg-[#008C95]/20 selection:text-[#172033]">
      
      {/* ================================================== */}
      {/* 1. CIVIC DIGITAL SERVICE TOP NAVIGATION BAR        */}
      {/* ================================================== */}
      <header className="bg-[#172033] text-white border-b border-[#2A364F] sticky top-0 z-50">
        
        {/* Sub-header Government Registry Ribbon */}
        <div className="bg-[#0F1626] px-4 sm:px-6 py-1 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008C95]"></span>
              <span>Civic Digital Service Platform</span>
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline">District Municipal Administration &bull; Annur / Coimbatore</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-300 font-medium">Emergency Hotline: 112</span>
            <span className="hidden md:inline text-gray-600">|</span>
            <Link to="/track" className="hidden md:inline text-teal-300 hover:text-teal-200 transition-colors">
              Quick Track
            </Link>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Identity Seal */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C95]">
                <div className="w-9 h-9 rounded-lg bg-[#008C95] flex items-center justify-center text-white shadow-sm border border-teal-400/30 group-hover:bg-[#006D75] transition-colors">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg tracking-tight text-white font-sans">CivicResolve</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800/80">
                      Gov
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 tracking-wider uppercase -mt-0.5 font-medium">
                    Municipal Operations
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
                {primaryNav.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && item.path !== '/citizen' && item.path !== '/officer' && item.path !== '/senior' && item.path !== '/admin' && location.pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap
                        ${isActive 
                          ? 'bg-[#202D45] text-white shadow-xs border border-white/10' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'}
                      `}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Actions & User Control Center */}
            <div className="flex items-center gap-3">
              
              {/* Quick Submit Action (for Citizens or Public) */}
              {(!user || user.role === 'CITIZEN') && (
                <Link
                  to={user ? '/citizen/complaints/new' : '/register-complaint'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-[#008C95] hover:bg-[#006D75] text-white shadow-xs transition-colors border border-teal-400/40 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit Complaint</span>
                </Link>
              )}

              {/* Notifications Indicator */}
              {user && (
                <Link
                  to={
                    user.role === 'CITIZEN' ? '/citizen/notifications' :
                    user.role === 'OFFICER' ? '/officer/notifications' :
                    user.role === 'SENIOR_OFFICER' ? '/senior/notifications' : '/admin/dashboard'
                  }
                  className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9A441] ring-2 ring-[#172033]"></span>
                </Link>
              )}

              {/* User Account Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#202D45] hover:bg-[#2A364F] border border-white/10 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C95]"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#008C95] flex items-center justify-center text-white text-xs font-bold font-mono">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left leading-tight">
                      <span className="text-xs font-semibold text-white block max-w-[120px] truncate">{user.name}</span>
                      <span className="text-[10px] text-teal-300 font-mono block">
                        {user.role === 'OFFICER' && user.city ? `${user.city} • ${user.role}` : user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 text-[#252A34] text-xs divide-y divide-gray-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 bg-gray-50/60">
                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-gray-500 font-mono text-[11px] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#008C95] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link 
                          to={
                            user.role === 'CITIZEN' ? '/citizen/profile' :
                            user.role === 'OFFICER' ? '/officer/profile' :
                            user.role === 'SENIOR_OFFICER' ? '/senior/profile' : '/admin/users'
                          } 
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 font-medium text-gray-700"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                          <span>Account &amp; Role Settings</span>
                        </Link>
                        <Link 
                          to="/track" 
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 font-medium text-gray-700"
                        >
                          <Search className="w-3.5 h-3.5 text-gray-500" />
                          <span>Track Any Grievance</span>
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-700 font-medium cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/login?tab=official"
                    className="px-2.5 py-1.5 text-xs font-semibold bg-teal-900/60 hover:bg-teal-800 text-teal-200 hover:text-white rounded-md border border-teal-500/50 transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                    <span>Officer Login</span>
                  </Link>
                  <Link
                    to="/login?tab=citizen"
                    className="px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:text-white rounded-md transition-colors"
                  >
                    Citizen Sign In
                  </Link>
                  <Link
                    to="/login?tab=register"
                    className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md border border-white/20 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white rounded-md hover:bg-white/10"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F1626] border-t border-[#2A364F] px-4 pt-3 pb-5 space-y-1 text-sm">
            {primaryNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-gray-200 hover:bg-[#172033] hover:text-white"
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-400 font-medium hover:bg-[#172033] rounded-md mt-2 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* ================================================== */}
      {/* 2. CONTEXTUAL PAGE HEADER & BREADCRUMBS            */}
      {/* ================================================== */}
      {(pageTitle || breadcrumbs || actions) && (
        <section className="bg-white border-b border-[#E5E0D5] py-4 px-4 sm:px-6 lg:px-8 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 font-mono">
                  {breadcrumbs.map((bc, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-gray-400">/</span>}
                      {bc.href ? (
                        <Link to={bc.href} className="hover:text-[#008C95] transition-colors">
                          {bc.label}
                        </Link>
                      ) : (
                        <span className="text-gray-800 font-medium">{bc.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
              {pageTitle && (
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
                  {pageTitle}
                </h1>
              )}
              {pageSubtitle && (
                <p className="text-sm text-[#596172] mt-0.5 max-w-3xl leading-relaxed">
                  {pageSubtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex items-center gap-2.5 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 3. PRIMARY CONTENT VIEWPORT                        */}
      {/* ================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* ================================================== */}
      {/* 4. CIVIC DIGITAL SERVICE FOOTER                    */}
      {/* ================================================== */}
      <footer className="bg-[#172033] text-gray-400 border-t border-[#2A364F] py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#008C95]" />
              <span>CivicResolve &bull; Smart Civic Service Platform</span>
            </div>
            <p className="text-xs text-gray-400 max-w-md leading-relaxed">
              Integrated municipal grievance management with NLP-assisted department assignment, automated SLA escalation safeguards, OpenStreetMap geocoding, and citizen verification mandates.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-teal-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All 4 Municipal Service Departments Operational &bull; Gateway Active</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Citizens &amp; Public</h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li><Link to="/register-complaint" className="hover:text-white">Lodge a Grievance</Link></li>
              <li><Link to="/track" className="hover:text-white">Track Grievance Live</Link></li>
              <li><Link to="/login" className="hover:text-white">Citizen Dashboard</Link></li>
              <li><span className="text-gray-500">Citizen Verification Guarantee</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Municipal Administration</h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li><Link to="/login?tab=officer_register" className="hover:text-white text-teal-300 font-semibold">Field Officer Registration &rarr;</Link></li>
              <li><Link to="/login" className="hover:text-white">Field Officer Operations</Link></li>
              <li><Link to="/login" className="hover:text-white">Department Command Center</Link></li>
              <li><Link to="/login" className="hover:text-white">System Administration</Link></li>
              <li className="text-amber-400 font-mono text-[11px] pt-1">Direct SMS Alerts: Active</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
          <p>&copy; 2026 CivicResolve. Government Digital Service Platform. All rights reserved.</p>
          <p className="font-mono">Standards: WCAG AA &bull; OpenStreetMap &bull; 60-30-10 Civic Palette</p>
        </div>
      </footer>

    </div>
  );
}
