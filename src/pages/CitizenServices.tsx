import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, Search, PlusCircle, Clock, MapPin, 
  Smartphone, ArrowRight, PhoneCall, CheckCircle2, Sparkles, FileText,
  AlertTriangle, Wrench, Droplets, Trash2, Lightbulb
} from 'lucide-react';

export function CitizenServices() {
  const services = [
    {
      title: 'Lodge Public Grievance',
      desc: 'Submit a new civic complaint with interactive OpenStreetMap geocoding, photo upload, and instant tracking reference.',
      icon: PlusCircle,
      color: 'bg-teal-50 text-[#008C95] border-teal-200',
      btnText: 'Lodge Complaint',
      link: '/register-complaint',
      badge: 'Public & Free'
    },
    {
      title: 'Track Grievance Status',
      desc: 'Check live lifecycle status, assigned inspection officer, SLA timer, and resolution photo without requiring login.',
      icon: Search,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      btnText: 'Track Grievance',
      link: '/track',
      badge: 'Instant Search'
    },
    {
      title: 'Citizen Portal Account',
      desc: 'Sign in or register using mobile SMS OTP to access your personalized complaint dashboard, feedback submission, and history.',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      btnText: 'Citizen Portal',
      link: '/login?tab=citizen',
      badge: 'SMS OTP Verified'
    },
    {
      title: 'Water Supply & Leakage Redressal',
      desc: 'Report broken mains, drinking water contamination, erratic supply schedules, or low water pressure in your ward.',
      icon: Droplets,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      btnText: 'Report Water Issue',
      link: '/register-complaint',
      badge: '24h SLA'
    },
    {
      title: 'Road Damage & Pothole Repair',
      desc: 'Pin dangerous craters, uneven pavers, open trenches, and asphalt deterioration directly on the municipal map.',
      icon: Wrench,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      btnText: 'Report Road Issue',
      link: '/register-complaint',
      badge: '48h SLA'
    },
    {
      title: 'Sanitation & Solid Waste Clearance',
      desc: 'Request clearance for overflowing community bins, open drain overflows, stray animal carcasses, or missed collections.',
      icon: Trash2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      btnText: 'Report Sanitation',
      link: '/register-complaint',
      badge: '12h SLA'
    },
    {
      title: 'Street Lighting & Public Safety',
      desc: 'Report dark zones, non-functional sodium/LED streetlights, leaning utility poles, or exposed live cables.',
      icon: Lightbulb,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      btnText: 'Report Lighting',
      link: '/register-complaint',
      badge: '24h SLA'
    },
    {
      title: '24x7 Municipal Helpline 1913',
      desc: 'Direct telephone assistance for urgent emergencies, senior citizen support, or telephonic grievance registration.',
      icon: PhoneCall,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      btnText: 'Contact Helpline',
      link: '/contact',
      badge: 'Toll-Free'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-[#172033] flex flex-col">
      {/* Top Header */}
      <header className="bg-[#132238] text-white border-b border-[#1f3454] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#008C95] flex items-center justify-center font-bold text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">CivicResolve</span>
              <p className="text-[10px] text-teal-300 font-medium">Tamil Nadu Municipal Public Grievance DPI</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
            <Link to="/services" className="text-teal-300 font-bold border-b border-teal-400 pb-0.5">Citizen Services</Link>
            <Link to="/track" className="text-gray-300 hover:text-white transition-colors">Track Grievance</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Help &amp; Contact</Link>
            <Link
              to="/register-complaint"
              className="ml-2 px-3 py-1.5 bg-[#008C95] hover:bg-[#006D75] text-white rounded-md font-bold transition-all shadow-xs"
            >
              Lodge Complaint
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#132238] to-[#1c2e4a] text-white py-14 px-4 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Integrated Municipal Services Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Citizen Services &amp; Civic Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Access all public grievance lodging, status tracking, emergency helplines, and department resolution channels from a single portal.
        </p>
      </section>

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#132238] leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <Link
                  to={item.link}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#008C95] text-slate-700 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-gray-200 hover:border-teal-600"
                >
                  <span>{item.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
        <p>&copy; {new Date().getFullYear()} Government of Tamil Nadu &bull; Municipal Administration DPI &bull; Helpline: 1913</p>
      </footer>
    </div>
  );
}
