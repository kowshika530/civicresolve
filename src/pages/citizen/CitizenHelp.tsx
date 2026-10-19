import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Phone, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';

export function CitizenHelp() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does CivicResolve track and escalate my complaint?',
      a: 'Every complaint is assigned an official Service Level Agreement (SLA) based on priority: Critical (24h), High (72h), Medium (5 days), Low (7 days). If an officer does not resolve the issue within the allotted window, the system automatically triggers an escalation directly to the Senior Officer.'
    },
    {
      q: 'Can I submit a grievance anonymously?',
      a: 'Yes. Check the "Submit Anonymously" option in the complaint form. Your name and contact details will be completely concealed from field officers and public tracking records.'
    },
    {
      q: 'What happens if I am not satisfied with the resolution?',
      a: 'When an officer marks an issue as resolved, the complaint enters "Citizen Verification". You can review their resolution remarks and proof. If the issue persists, select "Issue Not Resolved" with your reasoning to reopen the case and alert supervisory officers.'
    },
    {
      q: 'How does the map location picker work?',
      a: 'You can search for an address, click anywhere on the OpenStreetMap, or click "Use My Current Location" to fetch GPS coordinates. This ensures the municipal inspection crew visits the exact geographical site.'
    },
    {
      q: 'Who do I contact for immediate life-threatening emergencies?',
      a: 'For live electrical sparking, burst gas pipelines, or structural building collapses, call the District Disaster Management Helpline at 1077 or Emergency Services at 112 immediately.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Help & Grievance Guidelines</h1>
        <p className="text-xs text-gray-500 mt-1">Frequently asked questions, escalation protocols, and emergency helpline contacts.</p>
      </div>

      {/* Emergency Contact Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-900">Emergency Services Quick Contact</h3>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            CivicResolve is designed for non-emergency public works grievances. For immediate emergencies, dial:
          </p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-amber-950">
            <span>🚨 Police & General Emergency: 112</span>
            <span>🚒 Fire & Rescue: 101</span>
            <span>💧 Water Emergency Control Room: 1916</span>
          </div>
        </div>
      </div>

      {/* SLA Guidelines */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#008C95]" /> Resolution SLA Timelines
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="font-bold text-red-800 block">Critical Priority</span>
            <span className="text-lg font-mono font-extrabold text-red-900 mt-1 block">24 Hours</span>
            <span className="text-[10px] text-red-700">Immediate hazard</span>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="font-bold text-orange-800 block">High Priority</span>
            <span className="text-lg font-mono font-extrabold text-orange-900 mt-1 block">72 Hours</span>
            <span className="text-[10px] text-orange-700">Major infrastructure</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="font-bold text-amber-800 block">Medium Priority</span>
            <span className="text-lg font-mono font-extrabold text-amber-900 mt-1 block">5 Days</span>
            <span className="text-[10px] text-amber-700">Routine maintenance</span>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="font-bold text-green-800 block">Low Priority</span>
            <span className="text-lg font-mono font-extrabold text-green-900 mt-1 block">7 Days</span>
            <span className="text-[10px] text-green-700">General civic works</span>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#008C95]" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left font-semibold text-xs md:text-sm text-[#172033] bg-gray-50/70 hover:bg-gray-100 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 text-xs text-gray-600 bg-white leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
