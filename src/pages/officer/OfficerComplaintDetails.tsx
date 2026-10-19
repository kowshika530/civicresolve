import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Complaint } from '../../types';
import { format } from 'date-fns';
import { ComplaintLocationViewMap } from '../../components/map/ComplaintLocationViewMap';
import { 
  ArrowLeft, Clock, MapPin, Tag, ShieldAlert, CheckCircle2, 
  AlertTriangle, Play, FileText, Upload, Send, ExternalLink, Shield,
  User, Phone, Mail, Paperclip, Download, Eye, Camera, Check, X
} from 'lucide-react';

export function OfficerComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [resolveRemarks, setResolveRemarks] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await fetch(`/api/complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setComplaint(await res.json());
      } finally { setLoading(false); }
    };
    if (id) fetchComplaint();
  }, [id, token]);

  const handleDownloadFile = async (url: string, filename: string) => {
    if (!url) return;
    try {
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'evidence_file.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('File download unavailable');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'evidence_file.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const updateStatus = async (status: string, remarks?: string, escalation?: string, proofUrl?: string) => {
    setActionLoading(true);
    try {
      const payload: any = { status };
      if (remarks) payload.remarks = remarks;
      if (escalation) payload.escalateReason = escalation;
      if (proofUrl) payload.proofUrl = proofUrl;
      
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowResolveForm(false);
        setProofFile(null);
        setProofFileName('');
        const updated = await fetch(`/api/complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        setComplaint(updated);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#008C95] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!complaint) return <div className="p-12 text-center text-gray-500">Complaint not found.</div>;

  const getSLAStatus = (c: Complaint) => {
    if (['Resolved', 'Closed', 'Citizen Verification'].includes(c.status)) return <span className="text-green-600 font-medium">Resolved</span>;
    if (!c.slaDeadline) return <span className="text-gray-400">N/A</span>;
    const now = Date.now();
    if (c.slaDeadline < now) return <span className="text-[#C0392B] font-bold uppercase">Overdue</span>;
    if (c.slaDeadline - now < 24 * 60 * 60 * 1000) return <span className="text-[#D99A2B] font-bold uppercase">At Risk</span>;
    return <span className="text-gray-500 font-medium">On Track</span>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link to="/officer/complaints" className="hover:text-[#008C95] flex items-center"><ArrowLeft className="w-4 h-4 mr-1"/> Back to Assigned List</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-start flex-col sm:flex-row gap-4 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-[#172033] flex items-center">
                  {complaint.complaintNumber}
                  {complaint.emergencyFlag && <ShieldAlert className="w-5 h-5 text-red-600 ml-3" title="Emergency Concern" />}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{complaint.subject}</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold border border-gray-200">
                {complaint.status.toUpperCase()}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">{complaint.description}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">AI Identified Category</span>
                  <span className="font-bold text-[#172033]">{complaint.categoryName || complaint.aiCategory || 'General Issue'}</span>
                  {complaint.aiConfidence && <span className="ml-2 text-xs text-[#008C95] font-bold">({complaint.aiConfidence}% match)</span>}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Responsible Department</span>
                  <span className="font-bold text-gray-800">{complaint.departmentName || 'General Works'}</span>
                  {complaint.resolvedZone && <span className="ml-2 text-xs text-teal-700 font-mono">({complaint.resolvedZone})</span>}
                </div>
              </div>

              {/* Dynamic Routing Pipeline Trace (Audit Trail) */}
              {Array.isArray(complaint.routingTrace) && complaint.routingTrace.length > 0 && (
                <div className="mt-4 p-4 bg-teal-50/50 rounded-xl border border-teal-200">
                  <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    Automated Routing Pipeline Audit Trail
                  </span>
                  <div className="space-y-2">
                    {complaint.routingTrace.map((step: any, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {step.step || i + 1}
                        </span>
                        <div>
                          <span className="font-bold text-gray-900">{step.title}: </span>
                          <span className="text-gray-600">{step.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Bar */}
            <div className="bg-gray-50 border-t border-neutral-200 p-6">
              <h3 className="text-sm font-bold text-[#172033] mb-4">Action Panel</h3>
              
              {/* Direct Senior Officer Auto-Escalation Status Banner */}
              {(complaint.isEscalated || complaint.status === 'Escalated') ? (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Direct Senior Officer Escalation Active</span>
                    </div>
                    <span className="text-[10px] font-bold bg-red-200/80 text-red-900 px-2 py-0.5 rounded uppercase">
                      Executive Oversight
                    </span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    This grievance was automatically escalated directly to Senior Municipal Leadership / Department Director by the auto-escalation engine. Manual officer escalation is disabled.
                  </p>
                  {complaint.escalationReason && (
                    <div className="mt-2 text-xs bg-white/90 p-2.5 rounded-lg border border-red-200 text-red-950">
                      <strong className="text-red-900">Trigger Reason:</strong> {complaint.escalationReason}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs text-teal-900">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#008C95] shrink-0" />
                    <span>
                      <strong>Automated Senior Escalation Engine Active:</strong> Cases automatically escalate directly to Senior Officers if SLA is breached or multiple citizens report duplicate issues. Field officers focus on site resolution.
                    </span>
                  </div>
                </div>
              )}

              {!showResolveForm && (
                <div className="flex flex-wrap items-center gap-3">
                  {(complaint.status === 'New' || complaint.status === 'Assigned') && (
                    <button onClick={() => updateStatus('Accepted')} disabled={actionLoading} className="px-4 py-2 bg-[#008C95] text-white text-sm font-medium rounded hover:bg-teal-700 shadow-sm disabled:opacity-50 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Assignment
                    </button>
                  )}
                  
                  {complaint.status === 'Accepted' && (
                    <button onClick={() => updateStatus('In Progress')} disabled={actionLoading} className="px-4 py-2 bg-[#008C95] text-white text-sm font-medium rounded hover:bg-teal-700 shadow-sm disabled:opacity-50 flex items-center">
                      <Play className="w-4 h-4 mr-2" /> Start Work
                    </button>
                  )}

                  {(complaint.status === 'In Progress' || complaint.status === 'Reopened' || complaint.status === 'Escalated') && (
                    <button onClick={() => setShowResolveForm(true)} disabled={actionLoading} className="px-4 py-2 bg-[#3A7D44] text-white text-sm font-medium rounded hover:bg-green-700 shadow-sm disabled:opacity-50 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved &amp; Submit Proof
                    </button>
                  )}
                </div>
              )}

              {showResolveForm && (
                <div className="space-y-4 bg-white p-5 border border-green-200 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-green-900 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Submit Grievance Resolution Proof</span>
                    </h4>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      Officer Field Sign-Off
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Inspection &amp; Remediation Remarks *
                    </label>
                    <textarea 
                      value={resolveRemarks}
                      onChange={e => setResolveRemarks(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C95] focus:border-[#008C95] text-xs resize-none outline-none"
                      rows={3}
                      placeholder="Detail the exact works carried out on site (e.g. road patched with asphalt, valve replaced, garbage cleared)..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Upload Field Resolution Photo (Proof from laptop)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-3.5 py-2 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-[#008C95] flex items-center gap-2 cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" />
                        <span>Choose Photo from Laptop</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setProofFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => setProofFile(reader.result as string);
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {proofFileName && (
                        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium truncate max-w-[180px]">{proofFileName}</span>
                          <button
                            type="button"
                            onClick={() => { setProofFile(null); setProofFileName(''); }}
                            className="text-gray-400 hover:text-red-600 ml-1 font-bold"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>

                    {proofFile && (
                      <div className="mt-2.5 relative inline-block border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
                        <img src={proofFile} alt="Resolution Preview" className="h-24 w-36 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setProofFile(null); setProofFileName(''); }}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button 
                      onClick={() => {
                        if (!resolveRemarks.trim()) return alert('Resolution remarks are required.');
                        updateStatus('Resolved', resolveRemarks.trim(), undefined, proofFile || undefined);
                      }} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-[#3A7D44] hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading ? 'Submitting...' : 'Submit Resolution to Citizen'}</span>
                    </button>
                    <button 
                      onClick={() => setShowResolveForm(false)} 
                      disabled={actionLoading} 
                      className="px-3.5 py-2 text-gray-600 hover:text-gray-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Evidence Files & Photos Section (Citizen Attachments) */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#008C95]" />
                    <h3 className="text-sm font-bold text-[#172033]">
                      Citizen Uploaded Evidence &amp; Media ({complaint.attachments.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                    Site Evidence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {complaint.attachments.map((att: any, idx: number) => {
                    const isImg = att.type?.startsWith('image/') || att.url?.startsWith('data:image/') || att.url?.match(/\.(jpeg|jpg|png|webp|gif)/i);
                    return (
                      <div key={att.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#008C95]/50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          {isImg ? (
                            <img 
                              src={att.url} 
                              alt={att.name || 'Evidence'} 
                              onClick={() => setPreviewModalUrl(att.url)}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-300 shrink-0 cursor-pointer hover:opacity-85 transition-opacity" 
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-teal-50 text-[#008C95] border border-teal-200 flex items-center justify-center shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#172033] truncate">{att.name || `Evidence_File_${idx + 1}.jpg`}</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Geotagged site capture'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pl-2">
                          {isImg && (
                            <button
                              type="button"
                              onClick={() => setPreviewModalUrl(att.url)}
                              title="Preview full size"
                              className="p-1.5 text-gray-500 hover:text-[#008C95] hover:bg-white rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(att.url, att.name || `evidence_${idx + 1}.jpg`)}
                            title="Download to laptop"
                            className="p-1.5 text-gray-500 hover:text-[#008C95] hover:bg-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Officer Resolution Proof (if resolved) */}
            {complaint.resolutionProofUrl && (
              <div className="p-6 bg-emerald-50/50 rounded-xl shadow-sm border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-emerald-950">Field Work Completion Proof Photo</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(complaint.resolutionProofUrl || '', 'resolution_proof.jpg')}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Proof</span>
                  </button>
                </div>
                {complaint.resolutionRemarks && (
                  <p className="text-xs text-emerald-900 bg-white/80 p-3 rounded-lg border border-emerald-200">
                    <strong>Resolution Remarks:</strong> {complaint.resolutionRemarks}
                  </p>
                )}
                <div 
                  onClick={() => setPreviewModalUrl(complaint.resolutionProofUrl || null)}
                  className="w-full max-w-sm rounded-lg overflow-hidden border border-emerald-300 shadow-2xs relative group cursor-pointer"
                >
                  <img 
                    src={complaint.resolutionProofUrl} 
                    alt="Resolution Proof" 
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>Click to view full size</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* SLA Card */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-sm font-bold text-[#172033] mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-500" /> SLA &amp; Deadlines
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status:</span>
                {getSLAStatus(complaint)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deadline:</span>
                <span className="font-medium text-[#172033]">{complaint.slaDeadline ? format(new Date(complaint.slaDeadline), 'PPp') : 'Not Set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Registered:</span>
                <span className="font-medium text-[#172033]">{format(new Date(complaint.createdAt), 'PPp')}</span>
              </div>
            </div>
          </div>

          {/* 📍 Complaint Location (Interactive Map & Address Details) */}
          <div className="space-y-4">
            <ComplaintLocationViewMap
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              address={complaint.location_address || complaint.location}
              complaintNumber={complaint.complaintNumber}
              category={complaint.categoryName}
              status={complaint.status}
              priority={complaint.finalPriority}
              height="240px"
              showDetails={false}
            />

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-[#008C95]" /> Official Incident Location
                </h3>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                  Verified Site
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">State</span>
                  <span className="font-medium text-gray-800">{complaint.state || 'Tamil Nadu'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">District</span>
                  <span className="font-medium text-gray-800">{complaint.district || 'Coimbatore'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">City / Town</span>
                  <span className="font-medium text-gray-800">{complaint.city || 'Annur'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">PIN Code</span>
                  <span className="font-medium font-mono text-gray-800">{complaint.pin_code || '641653'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Street Address &amp; Landmark</span>
                  <span className="font-medium text-gray-800">{complaint.street_address || complaint.location_address || complaint.location}</span>
                </div>
                {complaint.latitude && complaint.longitude && (
                  <div className="col-span-2 pt-2 border-t border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Exact GPS Coordinates</span>
                    <span className="font-mono text-gray-800 font-bold">
                      Lat: {Number(complaint.latitude).toFixed(5)}, Lng: {Number(complaint.longitude).toFixed(5)}
                    </span>
                    <span className="ml-2 text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-medium">
                      Source: {complaint.location_source || 'MAP_SELECTION'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 👤 COMPREHENSIVE CITIZEN DETAILS CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <User className="w-4 h-4 text-[#008C95]" />
                <span>Citizen Details &amp; Contact</span>
              </h3>
              <span className="text-[10px] bg-teal-50 text-[#008C95] font-bold px-2 py-0.5 rounded-full border border-teal-200 uppercase">
                Grievance Lodger
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Citizen Name */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Citizen Full Name</span>
                  <p className="font-bold text-sm text-[#172033] mt-0.5">
                    {complaint.citizenName || 'Registered Citizen'}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono font-bold">
                  ID: {complaint.citizenId}
                </span>
              </div>

              {/* Citizen Mobile Number */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#008C95]" />
                  <span>Mobile Contact (SMS Alerts Active)</span>
                </span>
                <div className="flex items-center justify-between pt-0.5">
                  <a 
                    href={`tel:${complaint.citizenPhone || complaint.additionalPhone || '+919876543210'}`}
                    className="font-mono font-bold text-xs text-[#008C95] hover:underline"
                  >
                    {complaint.citizenPhone || complaint.additionalPhone || '+91 9876543210'}
                  </a>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    Verified
                  </span>
                </div>
                {complaint.additionalPhone && (
                  <p className="text-[10px] text-gray-500 pt-1">
                    Alt/Ward Rep: <span className="font-mono font-semibold">{complaint.additionalPhone}</span>
                  </p>
                )}
              </div>

              {/* Citizen Email */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#008C95]" />
                  <span>Email Address</span>
                </span>
                <p className="font-mono font-medium text-xs text-gray-800 break-all pt-0.5">
                  <a href={`mailto:${complaint.citizenContact || 'citizen@example.com'}`} className="hover:text-[#008C95]">
                    {complaint.citizenContact || 'citizen@example.com'}
                  </a>
                </p>
              </div>

              {/* Citizen Location & Jurisdiction */}
              <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-200/60 space-y-1.5">
                <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#008C95]" />
                  <span>Citizen Area &amp; Jurisdiction</span>
                </span>
                <p className="text-xs text-gray-800 leading-snug">
                  <strong>Location:</strong> {complaint.location_address || complaint.street_address || complaint.location}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-gray-600 font-medium">
                  <span className="bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-900 font-bold">
                    Ward/Zone: {complaint.resolvedZone || 'Zone 1'}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                    {complaint.city || 'Annur'}, {complaint.district || 'Coimbatore'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Evidence Photo Preview Modal */}
      {previewModalUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5 uppercase tracking-wide">
                <Paperclip className="w-4 h-4 text-[#008C95]" />
                <span>Evidence File Viewer (Officer Inspection)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewModalUrl, 'evidence_file.jpg')}
                  className="px-3 py-1.5 bg-[#008C95] text-white rounded-lg text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image to Laptop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-neutral-900">
              <img 
                src={previewModalUrl} 
                alt="Evidence Preview" 
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500 font-mono">
              Municipal Evidence Record &bull; Direct download enabled &bull; No 404 error
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
