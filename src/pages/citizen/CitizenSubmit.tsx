import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LocationPickerMap, LocationPickerValue } from '../../components/map/LocationPickerMap';
import { 
  AlertTriangle, Upload, CheckCircle2, AlertCircle, MapPin, 
  Sparkles, ShieldAlert, Layers, Clock, ArrowRight, ArrowLeft,
  ShieldCheck, Flame, Smartphone, Send, MessageSquare, Check,
  FileText, Shield, Eye, HelpCircle
} from 'lucide-react';
import { StatusBadge, PriorityBadge, SLABadge } from '../../components/CivicBadges';
import { nlpClassifier } from '../../services/nlpClassifier';

export function CitizenSubmit() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Multi-step form step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [formError, setFormError] = useState('');
  
  // Submitted complaint response state
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Live AI and Duplicate Pre-check state
  const [aiPrediction, setAiPrediction] = useState<{
    category: string;
    departmentName: string;
    confidence: number;
    recommendedPriority: string;
    slaHours: number;
    slaDays: number;
    reasoning?: string;
  } | null>(null);

  const [duplicateCheck, setDuplicateCheck] = useState<{
    isDuplicate: boolean;
    count: number;
    primaryMatch?: {
      complaintNumber: string;
      subject: string;
      status: string;
      distanceMeters?: number;
      categoryName?: string;
    };
  } | null>(null);

  const [analyzingAi, setAnalyzingAi] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  // Form State
  const [formData, setFormData] = useState<{
    subject: string;
    description: string;
    category: string;
    
    // Step 2: Location
    state: string;
    district: string;
    city: string;
    pin: string;
    address: string;
    landmark: string;
    latitude: number;
    longitude: number;
    location_address: string;
    location_source: 'MAP_SELECTION' | 'CURRENT_LOCATION' | 'SEARCH' | 'MANUAL';

    // Step 3: Evidence
    attachments: any[];

    // Step 4: Safety & Privacy & SMS
    emergencyFlag: boolean;
    isAnonymous: boolean;
    phone: string;
    additionalPhone: string;
    sendSms: boolean;
  }>({
    subject: '',
    description: '',
    category: '',
    
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Annur',
    pin: '641653',
    address: '',
    landmark: '',
    latitude: 11.2342,
    longitude: 77.1350,
    location_address: 'Annur, Coimbatore, Tamil Nadu - 641653',
    location_source: 'MAP_SELECTION',

    attachments: [],

    emergencyFlag: false,
    isAnonymous: false,
    phone: user?.phone || '',
    additionalPhone: '',
    sendSms: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const classified = nlpClassifier.classify(val, formData.description || '', formData.emergencyFlag);
    setFormData(prev => ({
      ...prev,
      subject: val,
      category: classified.category
    }));
  };

  const handleLocationChange = (val: LocationPickerValue) => {
    setLocationError('');
    const streetAddr = val.address ? val.address.split(',')[0].trim() : '';
    setFormData(prev => ({
      ...prev,
      latitude: val.latitude ?? prev.latitude,
      longitude: val.longitude ?? prev.longitude,
      location_address: val.address || prev.location_address,
      location_source: val.source,
      state: val.state || prev.state || 'Tamil Nadu',
      district: val.district || prev.district || 'Coimbatore',
      city: val.city || prev.city || 'Annur',
      pin: val.pin || prev.pin || '641653',
      address: streetAddr || prev.address
    }));
  };

  // Real-time AI Classification & Duplicate Check
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!formData.subject.trim() && !formData.description.trim()) {
      setAiPrediction(null);
      setDuplicateCheck(null);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setAnalyzingAi(true);
      try {
        const aiRes = await fetch('/api/ai/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: formData.subject,
            description: formData.description,
            emergencyFlag: formData.emergencyFlag
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiPrediction(aiData);
          if (aiData.category) {
            setFormData(prev => ({ ...prev, category: aiData.category }));
          }
        }

        const dupRes = await fetch('/api/complaints/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: formData.subject,
            description: formData.description,
            category: formData.category,
            latitude: formData.latitude,
            longitude: formData.longitude
          })
        });

        if (dupRes.ok) {
          const dupData = await dupRes.json();
          setDuplicateCheck(dupData);
        }
      } catch (err) {
        console.warn('AI analysis skipped:', err);
      } finally {
        setAnalyzingAi(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [formData.subject, formData.description, formData.emergencyFlag, formData.category, formData.latitude, formData.longitude]);

  // Step Validation
  const validateStep = (step: number) => {
    setFormError('');
    if (step === 1) {
      if (!formData.subject.trim()) {
        setFormError('Please enter a clear subject title for the complaint.');
        return false;
      }
      if (!formData.description.trim()) {
        setFormError('Please provide a detailed description of the issue.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!formData.district.trim() || !formData.city.trim()) {
        setFormError('Please enter District and City.');
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setFormError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setFormError('');
    const finalLat = (formData.latitude !== null && !isNaN(formData.latitude)) ? formData.latitude : 11.2342;
    const finalLng = (formData.longitude !== null && !isNaN(formData.longitude)) ? formData.longitude : 77.1350;

    setSubmitting(true);
    try {
      const fullLocation = [
        formData.address.trim(),
        formData.landmark.trim() ? `Near ${formData.landmark.trim()}` : '',
        formData.city.trim(),
        formData.district.trim(),
        formData.state.trim(),
        formData.pin.trim() ? `PIN: ${formData.pin.trim()}` : ''
      ].filter(Boolean).join(', ') || formData.location_address;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject: formData.subject,
          description: formData.description,
          citizenName: user?.name,
          citizenContact: user?.email,
          phone: formData.phone,
          citizenPhone: formData.phone,
          additionalPhone: formData.additionalPhone,
          sendSms: formData.sendSms,
          state: formData.state,
          district: formData.district,
          city: formData.city,
          pin_code: formData.pin,
          street_address: formData.address,
          location: fullLocation,
          category: formData.category,
          emergencyFlag: formData.emergencyFlag,
          isAnonymous: formData.isAnonymous,
          latitude: finalLat,
          longitude: finalLng,
          location_address: formData.location_address || fullLocation,
          location_source: formData.location_source,
          attachments: formData.attachments
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit complaint');
      }

      const data = await res.json();
      setSubmittedData(data);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION
  if (submittedData) {
    const compNum = submittedData.complaintNumber || 'CR-NEW';
    const isDup = Boolean(submittedData.duplicateDetected || submittedData.isDuplicate);
    const smsList = submittedData.smsHistory || (submittedData.smsRecord ? [submittedData.smsRecord] : []);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-8 sm:p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-[#3A7D44] rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Grievance Registered Successfully
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-2 mb-1">
            Grievance Formally Assigned to Department
          </h2>

          <p className="text-sm text-gray-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Your issue has been recorded with geocoded coordinates, classified by AI, and locked into the municipal SLA tracking registry.
          </p>

          <div className="bg-[#F7F3EA] border border-[#E5E0D5] rounded-xl p-5 inline-block mb-8 min-w-[280px]">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Tracking ID Number</p>
            <p className="text-3xl font-mono font-extrabold text-[#172033] tracking-wider">{compNum}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <StatusBadge status={submittedData.status} size="sm" />
              <PriorityBadge priority={submittedData.finalPriority} size="sm" />
            </div>
          </div>

          {/* Clean Citizen SMS Confirmation */}
          {submittedData.phone && (
            <div className="text-left mb-8 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 shadow-2xs flex items-center justify-between text-xs text-emerald-950">
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Confirmation SMS with your tracking link has been sent to <strong>{submittedData.phone}</strong>.</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                SMS Sent
              </span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Return to Citizen Dashboard
            </button>
            <button 
              type="button"
              onClick={() => navigate(`/track?id=${encodeURIComponent(compNum)}`)}
              className="px-5 py-2.5 bg-[#008C95] hover:bg-[#006D75] rounded-lg text-xs font-bold text-white shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>Track Live on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const STEPS = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Evidence' },
    { num: 4, label: 'Safety & Privacy' },
    { num: 5, label: 'Review' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Editorial Header */}
      <div className="border-b border-[#E5E0D5] pb-5">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C95]">
          Government Public Service Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight mt-0.5">
          Lodge a Civic Complaint
        </h1>
        <p className="text-xs text-gray-600 mt-1 max-w-2xl">
          Report municipal defects with GPS geocoding, automated AI department routing, and citizen resolution approval.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl border border-[#E5E0D5] p-3 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                  else if (validateStep(currentStep)) setCurrentStep(s.num);
                }}
                className={`
                  py-2 px-1 rounded-lg border text-center transition-all cursor-pointer font-mono
                  ${isCurrent 
                    ? 'bg-[#172033] text-white border-[#172033] shadow-xs font-bold' 
                    : isCompleted 
                    ? 'bg-emerald-50 text-[#3A7D44] border-emerald-200' 
                    : 'bg-gray-50 text-gray-400 border-gray-200'}
                `}
              >
                <span className="text-[10px] block opacity-75">{isCompleted ? '✓' : `0${s.num}`}</span>
                <span className="truncate block font-sans text-[11px] sm:text-xs">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* MULTI-STEP FORM BODY */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-xs overflow-hidden">
        
        {/* ================================================== */}
        {/* STEP 1: COMPLAINT DETAILS                          */}
        {/* ================================================== */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono text-[#008C95] font-bold uppercase">Step 01 / 05</span>
              <h2 className="text-lg font-bold text-[#172033] mt-0.5">Complaint Specifics</h2>
              <p className="text-xs text-gray-500">Provide an accurate title and detailed narrative of the public defect.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                Complaint Subject Title *
              </label>
              <input
                required
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleSubjectChange}
                placeholder="e.g. Major drinking water main burst flooding street"
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008C95] focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain the condition, how long it has been broken, and any danger or property impact..."
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008C95] focus:bg-white outline-none resize-none leading-relaxed"
              ></textarea>
            </div>

            {/* Auto-selected Category (No manual selection needed) */}
            <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#008C95]" />
                  <span>Category (Auto-Selected from Subject Title)</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  Auto-Classified
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#172033] block">
                    {formData.category || (formData.subject ? 'Classifying...' : 'Type subject above to auto-select')}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Routed to: <strong>{aiPrediction?.departmentName || 'Relevant Municipal Department'}</strong>
                  </span>
                </div>
                {formData.category && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Applied</span>
                  </span>
                )}
              </div>
            </div>

            {/* Live AI Routing Preview */}
            {(aiPrediction || analyzingAi) && (
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-900 flex items-center gap-1.5 font-mono uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#008C95]" />
                    <span>Live AI Department Classifier</span>
                  </span>
                  {analyzingAi && <span className="text-[11px] text-teal-700 animate-pulse">Analyzing text...</span>}
                </div>
                {aiPrediction && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                      <span className="text-gray-500 text-[10px] uppercase font-mono block">Routed Department</span>
                      <span className="font-bold text-[#172033]">{aiPrediction.departmentName || aiPrediction.category}</span>
                      <span className="text-[10px] text-teal-700 block mt-0.5 font-mono">Confidence: {aiPrediction.confidence}%</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                      <span className="text-gray-500 text-[10px] uppercase font-mono block">Predicted Urgency &amp; SLA</span>
                      <span className="font-bold text-amber-900">{aiPrediction.recommendedPriority} Priority</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5 font-mono">{aiPrediction.slaHours} Hours Target</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 2: LOCATION & INTERACTIVE OPENSTREETMAP       */}
        {/* ================================================== */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono text-[#008C95] font-bold uppercase">Step 02 / 05</span>
              <h2 className="text-lg font-bold text-[#172033] mt-0.5">Geographic Location</h2>
              <p className="text-xs text-gray-500">Pinpoint the exact location on the interactive map for dispatch teams.</p>
            </div>

            {/* Map Frame */}
            <div className="border border-[#E5E0D5] rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50 border-b border-[#E5E0D5] flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold text-[#172033] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#008C95]" />
                  <span>Pin the Issue (Click map, drag marker, or search area)</span>
                </span>
                <span className="font-mono text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </span>
              </div>

              <LocationPickerMap
                value={{
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                  address: formData.location_address,
                  source: formData.location_source
                }}
                onChange={handleLocationChange}
                initialState={formData.state}
                initialDistrict={formData.district}
                initialCity={formData.city}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District *</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City / Town *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">PIN Code *</label>
                <input type="text" name="pin" value={formData.pin} onChange={handleChange} className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. 14 North Market Street" className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Landmark</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Opposite State Bank ATM" className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 3: EVIDENCE UPLOAD                            */}
        {/* ================================================== */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono text-[#008C95] font-bold uppercase">Step 03 / 05</span>
              <h2 className="text-lg font-bold text-[#172033] mt-0.5">Supporting Evidence</h2>
              <p className="text-xs text-gray-500">Upload photos or documents of the infrastructure failure from your laptop to assist field inspection.</p>
            </div>

            <label className="block border-2 border-dashed border-[#008C95]/40 hover:border-[#008C95] rounded-2xl p-8 text-center bg-[#F7F3EA]/30 hover:bg-[#F7F3EA]/70 transition-all cursor-pointer space-y-3 group">
              <input 
                type="file" 
                multiple 
                accept="image/*,application/pdf"
                className="hidden" 
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  
                  const newAtts: any[] = [];
                  for (let i = 0; i < files.length; i++) {
                    const f = files[i];
                    if (f.size > 15 * 1024 * 1024) {
                      alert(`File "${f.name}" exceeds the 15MB size limit.`);
                      continue;
                    }
                    try {
                      const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(f);
                      });
                      if (dataUrl) {
                        newAtts.push({
                          id: `att-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
                          name: f.name,
                          size: f.size,
                          type: f.type || 'image/jpeg',
                          url: dataUrl
                        });
                      }
                    } catch (readErr) {
                      console.error('Error reading file:', readErr);
                    }
                  }

                  if (newAtts.length > 0) {
                    setFormData(prev => ({
                      ...prev,
                      attachments: [...(prev.attachments || []), ...newAtts]
                    }));
                  }
                }}
              />
              <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-gray-200 flex items-center justify-center mx-auto text-[#008C95] group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#172033]">Click to choose file or browse from laptop</p>
                <p className="text-xs text-gray-500 mt-0.5">JPEG, PNG, WebP, or PDF &bull; Up to 15MB per file</p>
              </div>
              <span className="inline-block px-3 py-1 bg-white text-[#008C95] border border-[#008C95]/30 rounded-lg text-xs font-semibold shadow-2xs">
                Browse Files
              </span>
              <p className="text-[11px] text-gray-400 font-mono">Real camera captures &amp; site evidence embedded directly into grievance record.</p>
            </label>

            {/* Uploaded Evidence Previews */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Uploaded Evidence Files ({formData.attachments.length})</span>
                  <span className="text-emerald-700 font-mono">Ready to submit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.attachments.map((att: any, idx: number) => (
                    <div key={att.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {att.type && att.type.startsWith('image/') ? (
                          <img 
                            src={att.url} 
                            alt={att.name} 
                            className="w-10 h-10 rounded object-cover border border-gray-300 shrink-0"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-teal-50 text-[#008C95] border border-teal-200 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#172033] truncate">{att.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{(att.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            try {
                              const link = document.createElement('a');
                              link.href = att.url;
                              link.download = att.name || 'evidence.jpg';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (err) {
                              window.open(att.url, '_blank');
                            }
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-[#008C95] hover:bg-teal-50 rounded cursor-pointer"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 rounded cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#008C95] shrink-0 mt-0.5" />
              <span>Evidence helps the municipal department immediately assign the correct equipment (e.g. suction vehicle, high-voltage hoist, asphalt tamper).</span>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 4: SAFETY & PRIVACY & SMS                     */}
        {/* ================================================== */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono text-[#008C95] font-bold uppercase">Step 04 / 05</span>
              <h2 className="text-lg font-bold text-[#172033] mt-0.5">Safety &amp; Notification Settings</h2>
              <p className="text-xs text-gray-500">Configure emergency hazard designation, anonymity, and SMS dispatch recipients.</p>
            </div>

            {/* Emergency Hazard Box */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50/60 cursor-pointer">
              <input
                type="checkbox"
                name="emergencyFlag"
                checked={formData.emergencyFlag}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold text-red-950 block">Immediate Public Safety Hazard</span>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                  Check this only if the situation creates an immediate physical hazard (e.g. exposed live cables, deep open manhole, gas smell, bridge collapse). Triggers automated emergency SLA timers.
                </p>
              </div>
            </label>

            {/* Anonymous Submission Box */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50/70 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-[#008C95] rounded border-gray-300 focus:ring-[#008C95]"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Submit Complaint Anonymously</span>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Your identity will not be visible to field resolving officers. You can still track progress using the complaint tracking ID.
                </p>
              </div>
            </label>

            {/* Direct SMS Settings */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 font-mono uppercase">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Real-Time SMS Alerts via Govt Gateway</span>
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded font-mono">
                  LIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Primary Citizen Mobile Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Secondary / Family Mobile (Optional)</label>
                  <input
                    type="tel"
                    name="additionalPhone"
                    value={formData.additionalPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono"
                    placeholder="e.g. 9123456789"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* STEP 5: REVIEW & SUBMIT                            */}
        {/* ================================================== */}
        {currentStep === 5 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono text-[#008C95] font-bold uppercase">Step 05 / 05</span>
              <h2 className="text-lg font-bold text-[#172033] mt-0.5">Review Grievance Dossier</h2>
              <p className="text-xs text-gray-500">Confirm all details before transmitting to municipal dispatch.</p>
            </div>

            <div className="bg-[#F7F3EA]/70 rounded-xl p-5 border border-[#E5E0D5] space-y-4 text-xs">
              <div className="border-b border-gray-200 pb-3">
                <span className="text-gray-500 uppercase font-mono text-[10px]">Subject</span>
                <h3 className="text-base font-bold text-[#172033] mt-0.5">{formData.subject}</h3>
                <p className="text-gray-600 mt-1 leading-relaxed">{formData.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 uppercase font-mono text-[10px]">Location Pin</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{formData.location_address}</p>
                  <p className="font-mono text-[11px] text-gray-500 mt-0.5">{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
                </div>

                <div>
                  <span className="text-gray-500 uppercase font-mono text-[10px]">AI Predicted Routing</span>
                  <p className="font-bold text-[#008C95] mt-0.5">{aiPrediction?.departmentName || 'Municipal Operations'}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">Priority: <strong>{aiPrediction?.recommendedPriority || 'High'}</strong> &bull; Target SLA: {aiPrediction?.slaHours || 72}h</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Citizen Mobile: <strong className="text-gray-800">{formData.phone || 'None (No SMS alert)'}</strong></span>
                <span>Safety Hazard: <strong className={formData.emergencyFlag ? 'text-red-700' : 'text-gray-700'}>{formData.emergencyFlag ? 'YES' : 'NO'}</strong></span>
              </div>
            </div>

            {duplicateCheck?.isDuplicate && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                <Layers className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>
                  Notice: Related complaint <strong>#{duplicateCheck.primaryMatch?.complaintNumber}</strong> active in 1.5km radius. Your issue will be linked so both receive expedited joint resolution.
                </span>
              </div>
            )}
          </div>
        )}

        {/* FORM NAVIGATION BAR */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-[#E5E0D5] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div></div>}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#008C95] hover:bg-[#006D75] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#008C95] hover:bg-[#006D75] rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting to Municipal Registry...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Transmit Grievance Dossier</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
