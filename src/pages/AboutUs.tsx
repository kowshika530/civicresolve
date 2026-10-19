import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Shield, Users, Clock, CheckCircle2, ArrowRight, 
  MapPin, Smartphone, Sparkles, FileText, Activity, ShieldCheck, 
  PhoneCall, HeartHandshake, Eye, Award
} from 'lucide-react';

export function AboutUs() {
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
            <Link to="/about" className="text-teal-300 font-bold border-b border-teal-400 pb-0.5">About Us</Link>
            <Link to="/services" className="text-gray-300 hover:text-white transition-colors">Citizen Services</Link>
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
      <section className="bg-gradient-to-b from-[#132238] to-[#1c2e4a] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Public Infrastructure for Municipal Redressal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            About CivicResolve
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An integrated, technology-enabled grievance management platform designed for the Municipal Administration and Urban Development Department, Government of Tamil Nadu.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008C95] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#132238]">Transparency</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every complaint is tagged with precise geographic coordinates, timestamped on the public ledger, and accessible without login via reference number.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#132238]">Guaranteed SLAs</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Strict statutory timeframes (4h to 48h) backed by automated multi-level escalation to Senior Regional Directors if complaints are delayed.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#132238]">Direct SMS Alerts</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Citizens receive automated SMS updates at every stage: registration, field officer dispatch, inspection, and photo-verified completion.
            </p>
          </div>
        </div>

        {/* Citizen Charter & SLA Table */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#132238] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#008C95]" />
              <span>Tamil Nadu Municipal Citizen Charter &amp; Resolution Timeframes</span>
            </h2>
            <p className="text-xs text-gray-500">
              Guaranteed resolution deadlines defined by the Municipal Administration Department.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Civic Category</th>
                  <th className="py-3 px-4">Responsible Authority</th>
                  <th className="py-3 px-4">Standard SLA</th>
                  <th className="py-3 px-4">Escalation Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-[#132238]">Water Supply &amp; Main Leaks</td>
                  <td className="py-3 px-4">Water Supply &amp; Drainage Board</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">24 Hours</td>
                  <td className="py-3 px-4 text-amber-700">Auto-escalates at 18h</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-[#132238]">Dangerous Potholes &amp; Road Damage</td>
                  <td className="py-3 px-4">Roads &amp; Public Works Department</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">48 Hours</td>
                  <td className="py-3 px-4 text-amber-700">Auto-escalates at 36h</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-[#132238]">Garbage Clearance &amp; Open Drains</td>
                  <td className="py-3 px-4">Sanitation &amp; Solid Waste Wing</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">12 Hours</td>
                  <td className="py-3 px-4 text-amber-700">Auto-escalates at 8h</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-[#132238]">Street Lighting &amp; Public Safety</td>
                  <td className="py-3 px-4">Electrical Engineering Wing</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">24 Hours</td>
                  <td className="py-3 px-4 text-amber-700">Auto-escalates at 18h</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-red-700">Emergency &amp; Hazard Hazards</td>
                  <td className="py-3 px-4">Rapid Municipal Response Squad</td>
                  <td className="py-3 px-4 text-red-700 font-bold">4 Hours</td>
                  <td className="py-3 px-4 text-red-700">Immediate Director Alert</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions Strip */}
        <div className="bg-gradient-to-r from-[#132238] to-[#1e3455] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Have a civic grievance in your neighborhood?</h3>
            <p className="text-xs text-gray-300">Submit in under 60 seconds with photos and map geocoding.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/register-complaint"
              className="px-5 py-2.5 bg-[#008C95] hover:bg-[#006D75] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Lodge Complaint Now
            </Link>
            <Link
              to="/track"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all border border-white/20"
            >
              Track Existing Complaint
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
        <p>&copy; {new Date().getFullYear()} Government of Tamil Nadu &bull; Municipal Administration DPI &bull; Helpline: 1913</p>
      </footer>
    </div>
  );
}
