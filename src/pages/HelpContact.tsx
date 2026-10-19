import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, PhoneCall, Mail, MapPin, Clock, 
  HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle,
  Sparkles, MessageSquare, Shield, FileText
} from 'lucide-react';

export function HelpContact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How long does it take for my grievance to be resolved?',
      a: 'Resolution timelines follow the statutory Citizen Charter: Sanitation issues are addressed within 12 hours, Water supply leaks within 24 hours, Road damage/potholes within 48 hours, and Emergency electrical hazards within 4 hours. If an SLA expires, the complaint is automatically escalated to the Senior Regional Director.'
    },
    {
      q: 'Do I need to sign in or create an account to lodge a complaint?',
      a: 'No! You can lodge a complaint directly without signing in via our Public Lodge Portal. You will receive an SMS with your complaint tracking number (e.g. CR-2026-XXXX) which allows you to track real-time progress anytime.'
    },
    {
      q: 'How does the SMS OTP registration work?',
      a: 'When you register as a citizen, a 4-digit verification code is generated and dispatched to your 10-digit mobile number via our cellular SMS gateway. In development/testing mode, you can also use master test code 1234.'
    },
    {
      q: 'Can I lodge a complaint anonymously?',
      a: 'Yes. On the complaint submission form, check the "Submit complaint anonymously" checkbox. Your name, email, and contact details will be completely hidden from field inspection officers.'
    },
    {
      q: 'What should I do if my complaint is not resolved in time?',
      a: 'Our system automatically monitors complaint lifecycles. When a deadline passes, the system flags the issue as "Escalated" and triggers an SMS alert to the Department Director. You can also call the toll-free helpline 1913.'
    }
  ];

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryMsg.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMsg('');
    }, 1000);
  };

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
            <Link to="/services" className="text-gray-300 hover:text-white transition-colors">Citizen Services</Link>
            <Link to="/track" className="text-gray-300 hover:text-white transition-colors">Track Grievance</Link>
            <Link to="/contact" className="text-teal-300 font-bold border-b border-teal-400 pb-0.5">Help &amp; Contact</Link>
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
          <span>24x7 Citizen Assistance &amp; Help Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Help, FAQs &amp; Contact Information
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Need assistance filing or tracking your complaint? Connect with our dedicated municipal grievance helpdesk.
        </p>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1">
        
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#132238]">Toll-Free Helpline</h3>
            <p className="text-2xl font-extrabold text-[#132238] font-mono">1913</p>
            <p className="text-xs text-gray-500">Available 24 Hours, 7 Days a week across all Tamil Nadu municipalities.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008C95] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#132238]">Official Grievance Email</h3>
            <p className="text-sm font-bold text-teal-800 font-mono">grievance@civicresolve.tn.gov</p>
            <p className="text-xs text-gray-500">Official written correspondence &amp; administrative escalations.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#132238]">Directorate Office</h3>
            <p className="text-xs text-gray-700 leading-snug">
              Commissioner of Municipal Administration,<br />
              Urban Governance Complex, Raja Annamalai Road, Chennai - 600028.
            </p>
          </div>
        </div>

        {/* FAQs & Citizen Support Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FAQs Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#132238] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#008C95]" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-gray-500">
                Common questions about grievance lodging, tracking, and SLA escalation.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left text-xs sm:text-sm font-bold text-[#132238] flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#008C95] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Support Inquiry Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#132238] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#008C95]" />
                <span>Submit a Quick Help Inquiry</span>
              </h3>
              <p className="text-xs text-gray-500">
                Our support team responds within 2 business hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Inquiry Submitted Successfully!</span>
                </div>
                <p>A helpdesk representative will contact you shortly.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-emerald-700 underline font-bold cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#008C95] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={e => setInquiryPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#008C95] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">How can we help? *</label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryMsg}
                    onChange={e => setInquiryMsg(e.target.value)}
                    placeholder="Describe your inquiry or grievance reference number..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#008C95] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#008C95] hover:bg-[#006D75] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Help Inquiry</span>
                </button>
              </form>
            )}
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
