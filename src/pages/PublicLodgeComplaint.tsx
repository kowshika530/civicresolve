import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LocationPickerMap, LocationPickerValue } from '../components/map/LocationPickerMap';
import { nlpClassifier } from '../services/nlpClassifier';
import { 
  AlertCircle, CheckCircle2, ArrowLeft, ShieldAlert, Upload, 
  MapPin, Sparkles, User, Mail, Phone, FileText, Check, AlertTriangle,
  Smartphone, Send, MessageSquare, Tag, Layers
} from 'lucide-react';

export function PublicLodgeComplaint() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locationSuccessBadge, setLocationSuccessBadge] = useState('');
  const [successComplaint, setSuccessComplaint] = useState<any | null>(null);

  // Live Duplicate Check State
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
  const debounceTimerRef = useRef<any>(null);

  // Auto-Category State from Subject Title
  const [autoCategoryInfo, setAutoCategoryInfo] = useState<{
    category: string;
    departmentName: string;
    confidence: number;
  } | null>(null);

  const [formData, setFormData] = useState<{
    citizenName: string;
    citizenContact: string;
    phone: string;
    subject: string;
    description: string;
    state: string;
    district: string;
    city: string;
    pin: string;
    address: string;
    category: string;
    emergencyFlag: boolean;
    isAnonymous: boolean;
    latitude: number | null;
    longitude: number | null;
    location_address: string;
    location_source: 'MAP_SELECTION' | 'CURRENT_LOCATION' | 'SEARCH' | 'MANUAL';
  }>({
    citizenName: user?.name || '',
    citizenContact: user?.email || '',
    phone: user?.phone || '',
    sendSms: true,
    subject: '',
    description: '',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Annur',
    pin: '641653',
    address: '',
    category: 'Roads & Infrastructure',
    emergencyFlag: false,
    isAnonymous: false,
    latitude: 11.2342,
    longitude: 77.1350,
    location_address: 'Annur, Coimbatore, Tamil Nadu - 641653',
    location_source: 'MAP_SELECTION'
  });

  // Automatically categorize complaint when subject title is entered
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const classified = nlpClassifier.classify(val, formData.description || '', formData.emergencyFlag);
    setAutoCategoryInfo({
      category: classified.category,
      departmentName: classified.departmentName,
      confidence: classified.confidence
    });
    setFormData(prev => ({
      ...prev,
      subject: val,
      category: classified.category
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const classified = nlpClassifier.classify(formData.subject || '', val, formData.emergencyFlag);
    setAutoCategoryInfo({
      category: classified.category,
      departmentName: classified.departmentName,
      confidence: classified.confidence
    });
    setFormData(prev => ({
      ...prev,
      description: val,
      category: classified.category
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  // Live duplicate detection on subject/description/location changes
  useEffect(() => {
    if (!formData.subject.trim()) {
      setDuplicateCheck(null);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/complaints/check-duplicate', {
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
        if (res.ok) {
          const dupData = await res.json();
          setDuplicateCheck(dupData);
        }
      } catch (err) {
        console.warn('Duplicate check skipped:', err);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [formData.subject, formData.description, formData.category, formData.latitude, formData.longitude]);

  const handleLocationChange = (val: LocationPickerValue) => {
    setLocationError('');
    const detectedCity = val.city || formData.city || 'Annur';
    const detectedDistrict = val.district || formData.district || 'Coimbatore';
    const detectedState = val.state || formData.state || 'Tamil Nadu';
    const detectedPin = val.pin || formData.pin || '641653';
    const streetAddr = val.address ? val.address.split(',')[0].trim() : formData.address;

    setFormData(prev => ({
      ...prev,
      latitude: val.latitude,
      longitude: val.longitude,
      location_address: val.address || prev.location_address,
      location_source: val.source,
      state: detectedState,
      district: detectedDistrict,
      city: detectedCity,
      pin: detectedPin,
      address: streetAddr || prev.address
    }));

    if (val.address) {
      setLocationSuccessBadge(`✓ Applied: ${val.address}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocationError('');

    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Please provide both subject and description of your complaint.');
      return;
    }

    const finalLat = (formData.latitude !== null && !isNaN(formData.latitude)) ? formData.latitude : 11.2342;
    const finalLng = (formData.longitude !== null && !isNaN(formData.longitude)) ? formData.longitude : 77.1350;

    setSubmitting(true);

    try {
      const fullLocation = [
        formData.address.trim(),
        formData.city.trim(),
        formData.district.trim(),
        formData.state.trim(),
        formData.pin.trim() ? `PIN: ${formData.pin.trim()}` : ''
      ].filter(Boolean).join(', ') || formData.location_address;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject: formData.subject,
          description: formData.description,
          location: fullLocation || 'Address not specified',
          emergencyFlag: formData.emergencyFlag,
          isAnonymous: formData.isAnonymous,
          citizenName: formData.citizenName,
          citizenContact: formData.citizenContact,
          phone: formData.phone,
          citizenPhone: formData.phone,
          sendSms: formData.sendSms,
          category: formData.category,
          state: formData.state,
          district: formData.district,
          city: formData.city,
          pin_code: formData.pin,
          street_address: formData.address,
          latitude: finalLat,
          longitude: finalLng,
          location_address: formData.location_address || fullLocation,
          location_source: formData.location_source
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit complaint');
      }

      const data = await res.json();
      setSuccessComplaint(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while registering the complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successComplaint) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 text-[#3A7D44] rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#172033] mb-2">Complaint Registered Successfully!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your grievance has been received and routed into our automated SLA tracking system.
          </p>

          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-5 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Tracking Number</span>
              <span className="text-xs px-2 py-0.5 bg-[#008C95] text-white rounded font-medium">Active</span>
            </div>
            <p className="text-2xl font-mono font-extrabold text-[#172033] tracking-wide mb-3">
              {successComplaint.complaintNumber}
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong className="text-gray-700">Department:</strong> {successComplaint.departmentName || 'Assigned automatically'}</p>
              <p><strong className="text-gray-700">Initial Priority:</strong> {successComplaint.finalPriority || 'Medium'}</p>
              {successComplaint.aiReasoning && (
                <p className="text-teal-700 mt-2 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span>AI Classification: {successComplaint.aiCategory} ({successComplaint.aiConfidence}% confidence)</span>
                </p>
              )}
            </div>
          </div>

          {/* Direct Senior Officer Escalation Notice if Multi-Citizen Duplicate Surge */}
          {(successComplaint.isEscalated || successComplaint.duplicateDetected) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Direct Senior Officer Auto-Escalation Active</span>
                </span>
                <span className="text-[10px] font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded uppercase">
                  Critical Priority
                </span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                {successComplaint.escalationReason || 'Multi-Citizen Community Surge: Multiple residents have reported this grievance in your immediate vicinity. The system has automatically escalated this case directly to the Senior Officer / Department Director for expedited resolution.'}
              </p>
            </div>
          )}

          {/* Clean Citizen SMS Confirmation Alert */}
          {(successComplaint.smsSent || successComplaint.citizenPhone) && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 mb-6 text-left shadow-2xs flex items-center justify-between text-xs text-emerald-950">
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>SMS updates with live tracking link dispatched to <strong>{successComplaint.citizenPhone || formData.phone}</strong>.</span>
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold shrink-0">
                SMS Active
              </span>
            </div>
          )}

          <div className="space-y-3">
            <Link 
              to={`/track?id=${encodeURIComponent(successComplaint.complaintNumber)}`}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#008C95] hover:bg-teal-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              Track Complaint Status Now
            </Link>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                type="button"
                onClick={() => {
                  setSuccessComplaint(null);
                  setFormData({
                    citizenName: user?.name || '',
                    citizenContact: user?.email || '',
                    phone: '',
                    subject: '',
                    description: '',
                    state: 'Karnataka',
                    district: 'Bengaluru Urban',
                    city: 'Bengaluru',
                    pin: '560038',
                    address: '',
                    category: '',
                    emergencyFlag: false,
                    isAnonymous: false,
                  });
                }}
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg transition-colors"
              >
                Lodge Another Complaint
              </button>

              <Link 
                to="/login"
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/login" 
            className="text-[#008C95] hover:underline flex items-center font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login
          </Link>
          <Link 
            to="/track" 
            className="text-xs font-semibold text-gray-600 hover:text-[#008C95] bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Already have a tracking ID?
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-[#008C95] font-semibold text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            <span>CivicResolve Public Grievance Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-[#172033]">Register a Complaint</h1>
          <p className="text-gray-600 text-sm mt-1">
            Submit your civic grievance for prompt inspection, automated department routing, and SLA tracking.
          </p>
        </div>

        {/* Emergency Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start space-x-3 text-sm text-amber-900">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-700" />
          <p className="text-xs leading-relaxed">
            <strong>Emergency Notice:</strong> For immediate, life-threatening hazards (active gas leaks, sparking high-voltage wires, or severe structural collapse), please notify emergency services directly.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          
          {/* Citizen Contact info */}
          <div className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-base font-bold text-[#172033] mb-1 flex items-center">
              <User className="w-4 h-4 mr-2 text-[#008C95]" /> Complainant Details
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {formData.isAnonymous ? 'You are submitting anonymously. Contact info will be discarded.' : 'Provide your details to receive resolution updates.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name {!formData.isAnonymous && '*'}</label>
                <input 
                  type="text" 
                  name="citizenName" 
                  disabled={formData.isAnonymous}
                  value={formData.citizenName} 
                  onChange={handleChange} 
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email / Phone Contact {!formData.isAnonymous && '*'}</label>
                <input 
                  type="text" 
                  name="citizenContact" 
                  disabled={formData.isAnonymous}
                  value={formData.citizenContact} 
                  onChange={handleChange} 
                  placeholder="e.g. name@example.com or 9876543210"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors" 
                />
              </div>
            </div>

            {/* Direct SMS Notification Option */}
            <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Citizen Mobile Number for Direct SMS Updates</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300">
                  Govt SMS Gateway Active
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Enter your mobile number to receive direct SMS updates containing your tracking ID, officer assignment, and resolution verification links.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="tel"
                    name="phone"
                    disabled={formData.isAnonymous}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none disabled:bg-gray-100"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded-lg border border-emerald-200 w-full hover:bg-emerald-50/50 transition-colors">
                    <input
                      type="checkbox"
                      name="sendSms"
                      checked={formData.sendSms}
                      onChange={handleChange}
                      disabled={formData.isAnonymous}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-emerald-900 select-none">Enable Direct SMS</span>
                  </label>
                </div>
              </div>

              {formData.sendSms && formData.phone && !formData.isAnonymous && (
                <div className="bg-white border border-emerald-200 rounded-lg p-2.5 text-xs text-gray-700 font-mono text-[11px]">
                  <span className="text-emerald-800 font-sans font-bold block text-[10px] uppercase">Direct SMS Preview &bull; {formData.phone}</span>
                  &quot;Govt of Tamil Nadu / CivicResolve: Complaint CR-2026-XXXX registered successfully. Auto-assigned to department. Track: http://localhost:3000/track?id=CR-2026-XXXX&quot;
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isAnonymous" 
                  checked={formData.isAnonymous} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-[#008C95] rounded border-gray-300 focus:ring-[#008C95]" 
                />
                <span className="text-xs font-medium text-gray-700">Submit complaint anonymously (identity hidden from officers)</span>
              </label>
            </div>
          </div>

          {/* Issue Details */}
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-[#172033] flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#008C95]" /> Issue Specifics
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Complaint Subject (Title) *
              </label>
              <input 
                required 
                type="text" 
                name="subject" 
                value={formData.subject} 
                onChange={handleSubjectChange} 
                placeholder="e.g. Major water pipeline leakage flooding road"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] outline-none transition-colors" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea 
                required 
                rows={4} 
                name="description" 
                value={formData.description} 
                onChange={handleDescriptionChange} 
                placeholder="Describe the issue in detail, how long it has persisted, and any impact on pedestrians or traffic..."
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] outline-none transition-colors resize-none" 
              />
            </div>

            {/* Auto Category Selection from Subject Title */}
            <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-[#008C95]" />
                  <span>Category (Auto-Selected from Subject Title)</span>
                </span>
                {autoCategoryInfo && (
                  <span className="text-[10px] bg-teal-200/90 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                    {autoCategoryInfo.confidence}% Confidence
                  </span>
                )}
              </div>

              {formData.subject.trim() ? (
                <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-teal-300 shadow-2xs">
                  <div>
                    <span className="text-sm font-bold text-[#132238] block flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#008C95]" />
                      <span>{formData.category || 'Roads & Infrastructure'}</span>
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Assigned Department: <strong>{autoCategoryInfo?.departmentName || 'Roads & Infrastructure'}</strong>
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Selected</span>
                  </span>
                </div>
              ) : (
                <p className="text-xs text-teal-800 bg-white/70 p-2.5 rounded-lg border border-dashed border-teal-300">
                  ⚡ Type your complaint subject above — the category will be automatically detected and selected for you!
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Category is automatically determined by AI NLP matching from your subject title.</span>
              </div>
            </div>

            {/* Live Duplicate Grievance Detection Alert on Public Form */}
            {duplicateCheck?.isDuplicate && (
              <div className="p-4 bg-purple-50/90 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide font-mono text-[11px] text-purple-950">
                    <Layers className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Nearby Duplicate Grievance Detected</span>
                  </span>
                  <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                    Auto-Cluster Active
                  </span>
                </div>
                <p className="leading-relaxed">
                  Notice: Related complaint <strong>#{duplicateCheck.primaryMatch?.complaintNumber}</strong> is already active within 1.5km. Submitting this grievance will automatically trigger a <strong>Multi-Citizen Surge direct escalation to Senior Officer / Department Director</strong> with Critical Priority!
                </p>
              </div>
            )}

            {/* Location */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-[#008C95]" /> Location Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">District / City</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Street Address / Landmark *</label>
                <input 
                  required
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="e.g. 5th Cross Road, opposite Post Office, Indiranagar"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] outline-none" 
                />
              </div>

              {/* 📍 COMPLAINT LOCATION INTERACTIVE MAP */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-[#008C95]" />
                      <span>📍 Complaint Location *</span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium">Select Complaint Location on Map</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click anywhere on the interactive map below or use your device location to pin the exact complaint coordinates.
                  </p>
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

                {locationSuccessBadge && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{locationSuccessBadge}</span>
                  </div>
                )}

                {locationError && (
                  <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Danger / Emergency Flag */}
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="emergencyFlag" 
                  checked={formData.emergencyFlag} 
                  onChange={handleChange} 
                  className="mt-0.5 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500" 
                />
                <div>
                  <span className="block text-sm font-bold text-red-900">Mark as Critical / Emergency Hazard</span>
                  <span className="block text-xs text-red-700 mt-0.5">
                    Flag this issue for immediate supervisor oversight and rapid field dispatch.
                  </span>
                </div>
              </label>
            </div>

          </div>

          {/* Action buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-neutral-200 flex items-center justify-between">
            <Link 
              to="/login" 
              className="text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>

            <button 
              type="submit" 
              disabled={submitting}
              className="px-6 py-2.5 bg-[#008C95] hover:bg-teal-700 text-white font-medium text-sm rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Classifying with AI & Submitting...
                </>
              ) : (
                'Register Complaint'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
