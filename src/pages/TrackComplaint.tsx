import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Complaint } from '../types';
import { format } from 'date-fns';
import { ComplaintLocationViewMap } from '../components/map/ComplaintLocationViewMap';
import { Search, MapPin, Tag, ShieldAlert, Check, ArrowLeft, Clock, LogIn, PlusCircle, UserPlus, Sparkles } from 'lucide-react';

export function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [complaintNumber, setComplaintNumber] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentList, setRecentList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/track-recent')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentList(data);
      })
      .catch(() => {});
  }, []);

  const performSearch = async (queryNumber: string) => {
    if (!queryNumber.trim()) return;
    
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const cleanQuery = encodeURIComponent(queryNumber.trim());
      const res = await fetch(`/api/track/${cleanQuery}`);
      if (res.ok) {
        setComplaint(await res.json());
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Complaint not found. Please check the tracking number and try again.');
      }
    } catch (err) {
      setError('An error occurred while tracking the complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setComplaintNumber(idParam);
      performSearch(idParam);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(complaintNumber);
  };

  const handleSelectSample = (id: string) => {
    setComplaintNumber(id);
    performSearch(id);
  };

  const steps = [
    { label: 'Submitted', done: true },
    { label: 'Assigned', done: complaint ? ['Assigned', 'Accepted', 'In Progress', 'Resolved', 'Citizen Verification', 'Closed'].includes(complaint.status) : false },
    { label: 'In Progress', done: complaint ? ['In Progress', 'Resolved', 'Citizen Verification', 'Closed'].includes(complaint.status) : false },
    { label: 'Resolved', done: complaint ? ['Resolved', 'Citizen Verification', 'Closed'].includes(complaint.status) : false },
    { label: 'Closed', done: complaint ? complaint.status === 'Closed' : false }
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/login" 
            className="text-[#008C95] hover:underline flex items-center font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login / Home
          </Link>
          <div className="flex items-center space-x-2">
            <Link
              to="/register"
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1 text-[#008C95]" /> Register as Citizen
            </Link>
            <Link
              to="/register-complaint"
              className="text-xs font-semibold px-3 py-1.5 bg-[#008C95] text-white hover:bg-teal-700 rounded-lg flex items-center transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Lodge Complaint
            </Link>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#172033] mb-2">Track Grievance Status</h1>
          <p className="text-gray-600 text-sm">Enter your complaint tracking ID, partial number, or click a demo sample below.</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={complaintNumber}
                onChange={(e) => setComplaintNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] outline-none text-sm transition-colors"
                placeholder="Enter ID, e.g. CR-2026-1001, 1002, or pothole"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#008C95] text-white font-semibold text-sm rounded-xl hover:bg-teal-700 shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Searching...' : 'Track Grievance'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Clickable Pills */}
          <div className="mt-5 pt-4 border-t border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Quick Track Live Demo Complaints:
            </span>
            <div className="flex flex-wrap gap-2">
              {(recentList.length > 0 ? recentList : [
                { complaintNumber: 'CR-2026-1001', subject: 'Pothole on 100ft Road' },
                { complaintNumber: 'CR-2026-1002', subject: 'Water main leakage' },
                { complaintNumber: 'CR-2026-1003', subject: 'Fallen tree branch' },
                { complaintNumber: 'CR-2026-1004', subject: 'Street light broken' },
                { complaintNumber: 'CR-2026-1005', subject: 'Garbage accumulation' }
              ]).map((item) => (
                <button
                  key={item.complaintNumber}
                  type="button"
                  onClick={() => handleSelectSample(item.complaintNumber)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-teal-50 hover:border-[#008C95] text-neutral-700 hover:text-[#008C95] transition-colors flex items-center cursor-pointer font-mono"
                >
                  <span className="font-semibold">{item.complaintNumber}</span>
                  <span className="text-[10px] text-neutral-400 font-sans ml-1.5 truncate max-w-[120px]">
                    ({item.subject})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>

        {complaint && (
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3 bg-neutral-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-[#172033]">{complaint.complaintNumber}</span>
                  {complaint.emergencyFlag && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-md flex items-center">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Emergency
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-neutral-800 mt-1">{complaint.subject}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Submitted on {format(new Date(complaint.createdAt), 'PPpp')}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <span className="px-3 py-1 bg-[#172033] text-white rounded-full text-xs font-bold tracking-wide">
                  {complaint.status.toUpperCase()}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 font-medium">Priority: {complaint.finalPriority || 'Medium'}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-6 py-8 border-b border-neutral-100 bg-white">
              <div className="flex items-center justify-between relative max-w-xl mx-auto">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-neutral-200 -z-0 -translate-y-1/2"></div>
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-white px-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.done 
                        ? 'bg-[#008C95] border-[#008C95] text-white shadow-xs' 
                        : 'bg-white border-neutral-300 text-neutral-300'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-semibold mt-2 ${step.done ? 'text-[#172033]' : 'text-neutral-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Category & Department</span>
                <p className="text-xs font-semibold text-[#172033]">{complaint.categoryName || 'General Civic Issue'}</p>
                <p className="text-xs text-neutral-600">{complaint.departmentName || 'Public Works'}</p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Location</span>
                <p className="text-xs font-semibold text-[#172033] flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#008C95]" /> {complaint.location || 'Reported Location'}
                </p>
                <p className="text-[11px] text-neutral-500">Updated: {format(new Date(complaint.updatedAt), 'PPpp')}</p>
              </div>
            </div>

            {/* 📍 Interactive Map Section for Public Tracking */}
            <div className="px-6 pb-6 bg-white">
              <ComplaintLocationViewMap
                latitude={complaint.latitude}
                longitude={complaint.longitude}
                address={complaint.location_address || complaint.location}
                complaintNumber={complaint.complaintNumber}
                category={complaint.categoryName}
                status={complaint.status}
                priority={complaint.finalPriority}
                height="240px"
              />
            </div>

            <div className="px-6 py-4 bg-teal-50/60 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-teal-900 font-medium">
                Want to receive SMS/Email updates & full history?
              </span>
              <Link 
                to="/register" 
                className="text-xs font-bold text-white bg-[#008C95] hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Register as Citizen
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
