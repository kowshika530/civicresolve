import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, ArrowRight, Search, PlusCircle, CheckCircle2, 
  Clock, ShieldAlert, Sparkles, Layers, Users, MapPin, Eye,
  Building2, Phone, AlertTriangle, ChevronRight, Activity, Flame,
  Shield
} from 'lucide-react';
import { ComplaintLocationViewMap } from '../components/map/ComplaintLocationViewMap';
import { HotspotMap } from '../components/map/HotspotMap';

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active step in interactive lifecycle visualizer
  const [activeStep, setActiveStep] = useState(0);

  // Live stats from backend
  const [stats, setStats] = useState({
    total: 1007,
    resolved: 2,
    active: 5,
    escalated: 1,
    slaCompliance: 92
  });

  // Public sample complaints for Tamil Nadu map preview
  const [sampleComplaints, setSampleComplaints] = useState<any[]>([]);
  const [quickTrackId, setQuickTrackId] = useState('');

  useEffect(() => {
    // Fetch live system stats
    fetch('/api/analytics/system')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStats({
            total: data.totalComplaints || 1007,
            resolved: data.resolvedComplaints || 2,
            active: data.activeComplaints || 5,
            escalated: data.escalatedComplaints || 1,
            slaCompliance: data.slaComplianceRate || 92
          });
        }
      })
      .catch(() => {});

    // Fetch all complaints across Tamil Nadu for statewide map preview
    fetch('/api/complaints-public')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSampleComplaints(data);
        } else {
          // Fallback to /api/complaints
          fetch('/api/complaints')
            .then(r => r.ok ? r.json() : [])
            .then(d => { if (Array.isArray(d)) setSampleComplaints(d); })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const LIFECYCLE_STEPS = [
    {
      id: 'report',
      label: 'REPORT',
      title: 'Geotagged Citizen Submission',
      desc: 'Citizen pins precise OpenStreetMap coordinates, adds photo evidence, and enters issue specifics with direct SMS updates enabled.',
      role: 'Citizen / Public',
      sla: 'Immediate',
      metric: '0.0s latency'
    },
    {
      id: 'analyze',
      label: 'ANALYZE',
      title: 'AI Classification & Duplicate Filter',
      desc: 'TF-IDF NLP model determines municipal department and predicts urgency. Geospatial algorithm clusters reports within 1.5km to prevent duplicate field dispatches.',
      role: 'CivicResolve AI Engine',
      sla: '< 1 sec',
      metric: '88% confidence'
    },
    {
      id: 'assign',
      label: 'ASSIGN',
      title: 'Direct Department Routing',
      desc: 'Complaint automatically assigned to field officer queue based on department jurisdiction. Target SLA deadline computed and locked in audit ledger.',
      role: 'Department Operations',
      sla: 'SLA Clock Starts',
      metric: '24h - 120h'
    },
    {
      id: 'resolve',
      label: 'RESOLVE',
      title: 'Field Team Rectification & Proof',
      desc: 'Municipal crew inspects site, resolves physical defect, and uploads photographic resolution proof. Officer cannot unilaterally mark case closed.',
      role: 'Field Engineer',
      sla: 'Milestone Locked',
      metric: 'Proof Mandatory'
    },
    {
      id: 'verify',
      label: 'VERIFY',
      title: 'Citizen Verification Guarantee',
      desc: 'Citizen inspects resolution proof. If satisfactory, complaint is permanently closed; if unsatisfactory, citizen reopens case directly to Senior Director.',
      role: 'Citizen Mandate',
      sla: 'Anti-False-Closure',
      metric: '100% Accountable'
    }
  ];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackId.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#252A34] font-sans selection:bg-[#008C95]/20 selection:text-[#172033]">
      
      {/* Top Navigation */}
      <header className="bg-[#172033] text-white border-b border-[#2A364F] sticky top-0 z-50">
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
            <span className="text-teal-300">All 4 Departments Active</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#008C95] flex items-center justify-center text-white shadow-sm border border-teal-400/30">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white">CivicResolve</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    Gov
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 tracking-wider uppercase -mt-0.5 font-medium">
                  Municipal Operations
                </p>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs text-gray-300">
              <Link to="/" className="text-white font-bold hover:text-teal-300 transition-colors">Home</Link>
              <Link to="/about" className="hover:text-teal-300 transition-colors">About Us</Link>
              <Link to="/services" className="hover:text-teal-300 transition-colors">Citizen Services</Link>
              <Link to="/track" className="hover:text-teal-300 transition-colors">Track Grievance</Link>
              <Link to="/contact" className="hover:text-teal-300 transition-colors">Help &amp; Contact</Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                to="/track"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Grievance</span>
              </Link>

              {user ? (
                <button
                  onClick={() => {
                    switch (user.role) {
                      case 'CITIZEN': navigate('/citizen'); break;
                      case 'OFFICER': navigate('/officer'); break;
                      case 'SENIOR_OFFICER': navigate('/senior'); break;
                      case 'ADMIN': navigate('/admin'); break;
                      default: navigate('/citizen');
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#008C95] hover:bg-[#006D75] text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Go to My Dashboard ({user.role.replace('_', ' ')})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/login?tab=citizen"
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    Citizen Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-300 hover:text-white hover:bg-white/10 rounded-md transition-colors border border-teal-500/30"
                  >
                    <span>Register (OTP)</span>
                  </Link>
                  <Link
                    to="/login?tab=official"
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-white/10 rounded-md transition-colors"
                  >
                    Official Portal
                  </Link>
                  <Link
                    to="/register-complaint"
                    className="px-3.5 py-1.5 text-xs font-bold bg-[#008C95] hover:bg-[#006D75] text-white rounded-md shadow-xs transition-colors border border-teal-400/40"
                  >
                    Lodge Complaint
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* 1. HERO SECTION                                    */}
      {/* ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#172033] to-[#202D45] text-white py-16 lg:py-24 border-b border-[#2A364F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Mission & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700/60 text-teal-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span>Tamil Nadu Municipal Digital Public Infrastructure</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Smart. Transparent. <br />
                  <span className="text-[#D9A441]">Accountable.</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-300 max-w-xl font-normal leading-relaxed pt-2">
                  An integrated digital platform for reporting, managing and resolving public complaints with intelligent routing, SLA monitoring and accountable resolution.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register-complaint"
                  className="px-5 py-3.5 bg-[#008C95] hover:bg-[#006D75] text-white font-bold rounded-lg text-sm transition-all shadow-md flex items-center gap-2 border border-teal-400/50 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit a Complaint</span>
                </Link>

                <Link
                  to="/login?tab=citizen"
                  className="px-5 py-3.5 bg-[#1F2D44] hover:bg-[#2A3B57] text-white font-bold rounded-lg text-sm transition-all border border-teal-400/30 flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-teal-300" />
                  <span>Citizen Portal (Login / Register)</span>
                </Link>

                <Link
                  to="/track"
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg text-sm transition-all border border-white/10 flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-teal-300" />
                  <span>Track a Complaint</span>
                </Link>
              </div>

              {/* Quick Tracking Search Bar */}
              <form onSubmit={handleTrackSubmit} className="pt-2 max-w-md">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={quickTrackId}
                    onChange={(e) => setQuickTrackId(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. CR-2026-1002)..."
                    className="w-full pl-3.5 pr-24 py-2.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:bg-white/15 font-mono"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 px-3 py-1.5 bg-[#008C95] hover:bg-teal-600 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
                  >
                    Track
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Sophisticated Process Lifecycle Visualizer */}
            <div className="lg:col-span-6">
              <div className="bg-[#0F1626]/90 border border-white/15 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-teal-400 tracking-wider block font-semibold">
                      Accountable Public Lifecycle
                    </span>
                    <h3 className="text-base font-bold text-white">How Grievances Move from Report to Solution</h3>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 px-2 py-1 rounded bg-white/5 border border-white/10">
                    Step {activeStep + 1} of 5
                  </span>
                </div>

                {/* Horizontal Step Indicator Strip */}
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {LIFECYCLE_STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      className={`
                        py-2 px-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer border text-center
                        ${activeStep === idx 
                          ? 'bg-[#008C95] text-white border-teal-400 shadow-sm' 
                          : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-gray-200'}
                      `}
                    >
                      <span className="block text-[10px] opacity-75">{`0${idx + 1}`}</span>
                      <span className="truncate block">{step.label}</span>
                    </button>
                  ))}
                </div>

                {/* Active Step Showcase Card */}
                <div className="bg-[#172033] rounded-xl p-5 border border-white/10 space-y-3 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-300 font-mono font-bold uppercase tracking-wider">
                      {LIFECYCLE_STEPS[activeStep].label} PHASE
                    </span>
                    <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      {LIFECYCLE_STEPS[activeStep].sla}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white leading-snug">
                    {LIFECYCLE_STEPS[activeStep].title}
                  </h4>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {LIFECYCLE_STEPS[activeStep].desc}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span>Actor: <strong className="text-white">{LIFECYCLE_STEPS[activeStep].role}</strong></span>
                    <span>Standard: <strong className="text-teal-300">{LIFECYCLE_STEPS[activeStep].metric}</strong></span>
                  </div>
                </div>

                {/* Visual Image Anchor */}
                <div className="relative rounded-xl overflow-hidden border border-white/10 h-36">
                  <img 
                    src="/src/assets/images/hero_civic_command_1790842440089.jpg" 
                    alt="Civic operations dispatch room"
                    className="w-full h-full object-cover brightness-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1626] via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] text-gray-300 font-mono">
                      Civic Command Console &bull; Coimbatore District Ward Operations
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. LIVE CIVIC OVERVIEW (Horizontal Statistics)     */}
      {/* ================================================== */}
      <section className="bg-white border-b border-[#E5E0D5] py-6 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#172033] block">
                  Live Operations Status
                </span>
                <span className="text-[11px] text-gray-500">Real-time municipal grievance metrics</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 w-full sm:w-auto text-left">
              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">Total Received</span>
                <span className="text-2xl font-mono font-extrabold text-[#172033] tabular-nums">
                  {stats.total.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">Active Workload</span>
                <span className="text-2xl font-mono font-extrabold text-[#008C95] tabular-nums">
                  {stats.active}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">Verified Resolved</span>
                <span className="text-2xl font-mono font-extrabold text-[#3A7D44] tabular-nums">
                  {stats.resolved}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">Under Escalation</span>
                <span className="text-2xl font-mono font-extrabold text-[#D99A2B] tabular-nums">
                  {stats.escalated}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. HOW CIVICRESOLVE WORKS (Horizontal Journey)     */}
      {/* ================================================== */}
      <section className="py-16 bg-[#F7F3EA] border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C95]">
              Guaranteed Process Architecture
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#172033]">
              How CivicResolve Works
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every reported issue traverses an automated, transparent pipeline. No complaint gets lost in paperwork or closed without citizen review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="bg-white p-5 rounded-xl border border-[#E5E0D5] space-y-2 shadow-2xs">
              <span className="text-xs font-mono font-bold text-[#008C95] block">01 / SUBMISSION</span>
              <h4 className="text-sm font-bold text-[#172033]">Geocoded Report</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pinpoint issue on map with photos and receive instant SMS confirmation with unique tracking ID.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E5E0D5] space-y-2 shadow-2xs">
              <span className="text-xs font-mono font-bold text-[#008C95] block">02 / AI ROUTING</span>
              <h4 className="text-sm font-bold text-[#172033]">NLP Classification</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                NLP algorithm identifies department and predicts urgency level (Critical, High, Medium, Low).
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E5E0D5] space-y-2 shadow-2xs">
              <span className="text-xs font-mono font-bold text-[#008C95] block">03 / SLA ENFORCEMENT</span>
              <h4 className="text-sm font-bold text-[#172033]">Target SLA Clock</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Automated 24h to 120h countdown begins. Overdue cases escalate automatically to Senior Director.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E5E0D5] space-y-2 shadow-2xs">
              <span className="text-xs font-mono font-bold text-[#008C95] block">04 / FIELD RESOLUTION</span>
              <h4 className="text-sm font-bold text-[#172033]">Proof Documentation</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Municipal officers inspect, repair the defect, and submit required photographic resolution evidence.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E5E0D5] space-y-2 shadow-2xs border-l-4 border-l-[#3A7D44]">
              <span className="text-xs font-mono font-bold text-[#3A7D44] block">05 / CITIZEN MANDATE</span>
              <h4 className="text-sm font-bold text-[#172033]">Resolution Verification</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Citizen reviews the completed work. Case permanently closes only upon citizen approval.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 4. INTELLIGENT FEATURES (Editorial Split Sections) */}
      {/* ================================================== */}
      <section className="py-16 bg-white border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C95]">
                Civic Intelligence System
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#172033]">
                Six Engineered Pillars for Municipal Accountability
              </h2>
            </div>
            <Link to="/register-complaint" className="text-xs font-bold text-[#008C95] hover:text-[#006D75] flex items-center gap-1">
              <span>Experience the Intelligent Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-[#F7F3EA]/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#008C95]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">1. AI Department Classification</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Trained TF-IDF Naive Bayes NLP model categorizes subject titles and descriptions into Roads, Water Supply, Sanitation, or Public Safety with high confidence scoring.
              </p>
              <div className="pt-2 text-[11px] font-mono text-teal-800 font-semibold">
                &bull; Zero manual sorting delays
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-[#F7F3EA]/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D99A2B]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">2. AI Priority &amp; SLA Prediction</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Urgency detection engine correlates keywords (sparks, burst, contamination, flooding) with citizen emergency flags to assign Critical, High, Medium, or Low SLA timers.
              </p>
              <div className="pt-2 text-[11px] font-mono text-amber-800 font-semibold">
                &bull; 24h Critical to 120h Routine
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-[#F7F3EA]/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">3. Duplicate Complaint Detection</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Geospatial 1.5km proximity indexing combined with text token Jaccard similarity groups duplicate citizen reports under one cluster ID to prevent duplicate team dispatch.
              </p>
              <div className="pt-2 text-[11px] font-mono text-purple-900 font-semibold">
                &bull; Auto-links co-complainants
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-[#F7F3EA]/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[#C0392B]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">4. Smart SLA Escalation Protocol</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Active daemon monitors deadlines every 60 seconds. When an issue exceeds its SLA target, it is automatically escalated to the Department Senior Director with priority audit logging.
              </p>
              <div className="pt-2 text-[11px] font-mono text-rose-900 font-semibold">
                &bull; Director intervention trigger
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-[#F7F3EA]/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#3A7D44]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">5. Citizen Resolution Verification</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Eliminates false closures. When an officer marks a task resolved, the citizen must examine the photographic proof and confirm resolution before the complaint status changes to Closed.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-900 font-semibold">
                &bull; Anti-false closure mandate
              </div>
            </div>

            {/* Pillar 6 */}
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-[#F7F3EA]/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">6. Recurring Issue &amp; Hotspot Registry</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tracks recurring failures across ward coordinates. When multiple complaints occur within 200m over 30 days, system flags an infrastructure hotspot for permanent capital replacement.
              </p>
              <div className="pt-2 text-[11px] font-mono text-orange-900 font-semibold">
                &bull; Proactive civic maintenance
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 5. TRANSPARENCY SECTION (Audit Timeline Preview)   */}
      {/* ================================================== */}
      <section className="py-16 bg-[#F7F3EA] border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C95]">
                Accountability in Action
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#172033]">
                Full Audit Trail Transparency
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every state transition, officer remark, timestamp, and photographic proof is recorded in the immutable public timeline. Citizens know exactly who handled their grievance and when.
              </p>

              <div className="pt-2">
                <img 
                  src="/src/assets/images/civic_field_inspection_1790842453438.jpg" 
                  alt="Municipal inspector verifying repair"
                  className="rounded-xl border border-[#E5E0D5] shadow-xs object-cover h-48 w-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-sm space-y-4">
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-teal-800 font-bold uppercase">Case Audit Trail</span>
                    <h4 className="text-sm font-bold text-[#172033]">CR-2026-1002 &bull; Water Main Pipeline Rupture</h4>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Verified Resolved
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200 pl-8 text-xs">
                  
                  <div className="relative">
                    <span className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-1 ring-blue-300"></span>
                    <span className="text-[10px] font-mono text-gray-400 block">Sep 28, 08:30 AM &bull; Citizen</span>
                    <p className="font-bold text-gray-900 mt-0.5">Grievance Registered via Mobile</p>
                    <p className="text-gray-600 mt-0.5">Reported main pipe break near Annur Market Road. Geocoded at 11.2342, 77.1350.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white ring-1 ring-teal-300"></span>
                    <span className="text-[10px] font-mono text-gray-400 block">Sep 28, 08:31 AM &bull; AI Classifier</span>
                    <p className="font-bold text-gray-900 mt-0.5">Assigned to Water Supply Department</p>
                    <p className="text-gray-600 mt-0.5">Predicted High priority based on water loss velocity. Target SLA: 72 hours.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white ring-1 ring-amber-300"></span>
                    <span className="text-[10px] font-mono text-gray-400 block">Sep 28, 10:15 AM &bull; Officer Rajesh</span>
                    <p className="font-bold text-gray-900 mt-0.5">Work In Progress &bull; Excavation Crew Dispatched</p>
                    <p className="text-gray-600 mt-0.5">Repairs underway with 150mm cast iron replacement sleeve.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-300"></span>
                    <span className="text-[10px] font-mono text-gray-400 block">Sep 29, 04:00 PM &bull; Citizen Verification</span>
                    <p className="font-bold text-gray-900 mt-0.5">Citizen Approved Resolution</p>
                    <p className="text-gray-600 mt-0.5">Work inspected on site. Pressure restored, road patch asphalted. Case closed.</p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. MAP / CIVIC ISSUES PREVIEW SECTION              */}
      {/* ================================================== */}
      <section className="py-16 bg-white border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C95]">
                Geospatial Transparency &bull; Tamil Nadu Statewide
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#172033]">
                Live Civic Issues Map Across Tamil Nadu
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Examine active complaints geocoded across Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, Tirunelveli, Tiruppur, Erode, Vellore, Thanjavur, Kanyakumari, Nilgiris & all 38 districts). Track real-time GPS location, filter by department, or inspect recurring hotspot clusters.
              </p>
            </div>

            <Link
              to="/track"
              className="px-4 py-2 bg-[#172033] hover:bg-[#202D45] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Track Specific Grievance</span>
            </Link>
          </div>

          {/* Statewide Interactive Hotspot & Location Map */}
          <div className="rounded-2xl border border-[#E5E0D5] overflow-hidden shadow-xs bg-white p-2 sm:p-4">
            <HotspotMap 
              complaints={sampleComplaints} 
              role="PUBLIC" 
            />
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 7. PORTAL ACCESS DIRECTORY                         */}
      {/* ================================================== */}
      <section className="py-16 bg-[#F7F3EA] border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C95]">
              Integrated Multi-Stakeholder Access
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#172033]">
              Civic Services &amp; Administrative Portals
            </h2>
            <p className="text-sm text-gray-600">
              Access designated portals for citizens, field officers, department directors, and municipal administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Citizen Services Portal */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-[#008C95] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-teal-800 tracking-wider">Public Access</span>
                  <h3 className="text-base font-bold text-[#172033]">Citizen Services Portal</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Log in to manage your registered grievances, track live status, receive direct SMS updates, and verify photographic repair proof before case closure.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 border-t border-gray-100">
                <Link
                  to="/login?tab=citizen"
                  className="flex-1 text-center py-2 px-3 bg-[#172033] hover:bg-[#202D45] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Citizen Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2 px-3 bg-[#008C95] hover:bg-[#006D75] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Register (OTP)
                </Link>
              </div>
            </div>

            {/* 2. Public Lodge Grievance */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-700 tracking-wider">Instant Reporting</span>
                  <h3 className="text-base font-bold text-[#172033]">Lodge Civic Complaint</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pinpoint road potholes, pipe bursts, uncollected garbage, or street light failures on interactive map with photo evidence and immediate AI routing.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/register-complaint"
                  className="w-full text-center py-2 px-3 bg-[#008C95] hover:bg-[#006D75] text-white text-xs font-bold rounded-lg transition-colors block cursor-pointer"
                >
                  Lodge Complaint Now &rarr;
                </Link>
              </div>
            </div>

            {/* 3. Track Grievance Without Login */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-800 tracking-wider">Public Ledger</span>
                  <h3 className="text-base font-bold text-[#172033]">Track Any Grievance</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Look up any municipal case by tracking reference number to inspect the live audit timeline, assigned officer notes, and SLA countdown clock.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/track"
                  className="w-full text-center py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors block cursor-pointer"
                >
                  Open Tracker &rarr;
                </Link>
              </div>
            </div>

            {/* 4. Field Officer Console */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-[#D99A2B] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-800 tracking-wider">Operations</span>
                  <h3 className="text-base font-bold text-[#172033]">Field Officer Console</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Authorized field inspectors and municipal engineers: manage assigned ward grievances, log inspection remarks, and upload resolution proof.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/login?tab=official"
                  className="w-full text-center py-2 px-3 bg-[#172033] hover:bg-[#202D45] text-white text-xs font-bold rounded-lg transition-colors block cursor-pointer"
                >
                  Officer Sign In &rarr;
                </Link>
              </div>
            </div>

            {/* 5. Senior Director Operations */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-[#C0392B] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-800 tracking-wider">Supervisory</span>
                  <h3 className="text-base font-bold text-[#172033]">Senior Director Console</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Supervise departmental SLA compliance rates, intervene on critical overdue escalations, reallocate field staff, and review reopening disputes.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/login?tab=official"
                  className="w-full text-center py-2 px-3 bg-[#172033] hover:bg-[#202D45] text-white text-xs font-bold rounded-lg transition-colors block cursor-pointer"
                >
                  Director Access &rarr;
                </Link>
              </div>
            </div>

            {/* 6. System Administration */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#008C95]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-700 tracking-wider">Administration</span>
                  <h3 className="text-base font-bold text-[#172033]">System Admin Console</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Configure SLA countdown policies, provision officer user roles, manage SMS gateway delivery logs, and inspect immutable audit ledgers.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/login?tab=official"
                  className="w-full text-center py-2 px-3 bg-[#172033] hover:bg-[#202D45] text-white text-xs font-bold rounded-lg transition-colors block cursor-pointer"
                >
                  Admin Console &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. CTA STRIP                                       */}
      {/* ================================================== */}
      <section className="py-14 bg-[#172033] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to lodge a municipal grievance?
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Report any public infrastructure failure, track progress in real time via direct SMS, and verify final resolution before closure.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/register-complaint"
              className="px-6 py-3 bg-[#008C95] hover:bg-[#006D75] text-white font-bold rounded-lg text-sm shadow-md transition-all cursor-pointer"
            >
              Submit a Complaint Now
            </Link>
            <Link
              to="/track"
              className="px-6 py-3 bg-[#202D45] hover:bg-[#2A364F] text-white font-semibold rounded-lg text-sm border border-white/10 transition-all"
            >
              Track an Existing Case
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1626] text-gray-400 border-t border-[#2A364F] py-8 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#008C95]" />
            <span className="font-bold text-white">CivicResolve &bull; Government Digital Service Portal</span>
          </div>
          <p className="font-mono text-[11px] text-gray-500">
            Emergency Hotline: 112 &bull; Coimbatore District &bull; &copy; 2026 CivicResolve
          </p>
        </div>
      </footer>

    </div>
  );
}
