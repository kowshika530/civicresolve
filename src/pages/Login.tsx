import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Building2, Shield, User, Lock, Mail, Phone, Eye, EyeOff, 
  Search, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, 
  Globe, Accessibility, ChevronDown, Check, Sparkles, KeyRound, 
  FileText, ExternalLink, Code, Compass, PhoneCall, Layers, ShieldCheck,
  Smartphone, Clock, Briefcase, CheckCheck
} from 'lucide-react';
import municipalPhoto from '../assets/images/municipal_secretariat_1790843798124.jpg';

interface LoginProps {
  defaultTab?: 'citizen' | 'official' | 'register' | 'officer_register' | 'track';
}

const DEFAULT_MUNICIPAL_DEPTS = [
  { id: 'd2', name: 'Water Supply', code: 'WS', icon: '💧', status: 'Active', desc: 'Drinking water pipelines, leakage redressal, quality testing, tankers' },
  { id: 'd1', name: 'Roads & Highways', code: 'RH', icon: '🛣️', status: 'Active', desc: 'Road surfaces, potholes, highway repairs, street paving, bridges' },
  { id: 'd3', name: 'Sanitation & Waste', code: 'SAN', icon: '🧹', status: 'Active', desc: 'Solid waste management, garbage clearance, open drain desilting' },
  { id: 'dept-elec', name: 'Electricity & Lighting', code: 'ELEC', icon: '⚡', status: 'Active', desc: 'Street lighting, streetlight poles, wiring, transformers' },
  { id: 'dept-animal', name: 'Animal Husbandry & Stray Control', code: 'AH', icon: '🐕', status: 'Active', desc: 'Stray dog control, anti-rabies, stray cattle management' },
  { id: 'dept-health', name: 'Public Health & Disease Control', code: 'PH', status: 'Active', desc: 'Vector control, mosquito & dengue breeding, sanitation inspections' },
  { id: 'dept-edu', name: 'Education & School Infrastructure', code: 'EDU', icon: '🏫', status: 'Active', desc: 'Government schools, classroom repairs, student amenities' },
  { id: 'dept-trans', name: 'Public Transport', code: 'TRANS', icon: '🚌', status: 'Active', desc: 'City bus services, bus stops, commuter frequency' },
  { id: 'dept-rev', name: 'Revenue & Property Tax', code: 'REV', icon: '📋', status: 'Active', desc: 'Property tax assessments, municipal tax demands, licensing' },
  { id: 'dept-admin', name: 'Municipal Administration', code: 'MA', icon: '🏛️', status: 'Active', desc: 'Overall municipal administration & general civic issues' },
];

export function Login({ defaultTab = 'citizen' }: LoginProps) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'citizen' | 'official' | 'register' | 'officer_register'>(
    (searchParams.get('tab') === 'official' || searchParams.get('tab') === 'officer') ? 'official' : 
    searchParams.get('tab') === 'officer_register' ? 'officer_register' :
    searchParams.get('tab') === 'register' ? 'register' : 'citizen'
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'official' || tab === 'officer') {
      setActiveTab('official');
    } else if (tab === 'officer_register') {
      setActiveTab('officer_register');
    } else if (tab === 'register') {
      setActiveTab('register');
    } else if (tab === 'citizen') {
      setActiveTab('citizen');
    }
  }, [searchParams]);

  // Form states
  const [identifier, setIdentifier] = useState(''); // email or mobile number
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration states (Direct registration, NO OTP!)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Officer Registration states
  const [availableDepts, setAvailableDepts] = useState<any[]>(DEFAULT_MUNICIPAL_DEPTS);
  const [offName, setOffName] = useState('');
  const [offEmail, setOffEmail] = useState('');
  const [offPhone, setOffPhone] = useState('+91 ');
  const [offPassword, setOffPassword] = useState('');
  const [offDepartmentId, setOffDepartmentId] = useState('d2');
  const [offZone, setOffZone] = useState('Zone 1');
  const [offCity, setOffCity] = useState('Annur');
  const [offDistrict, setOffDistrict] = useState('Coimbatore');
  const [offDesignation, setOffDesignation] = useState('Field Officer');
  const [offError, setOffError] = useState('');
  const [offLoading, setOffLoading] = useState(false);
  const [offSuccess, setOffSuccess] = useState('');

  // Quick Track without login
  const [trackRefNo, setTrackRefNo] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);

  // Accessibility Controls
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Discreet Developer / Demo Profiles Drawer
  const [showDevDrawer, setShowDevDrawer] = useState(false);

  // Forgot password & Email Dispatch states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotResponse, setForgotResponse] = useState<any>(null);

  // Password Reset states (supports URL ?resetToken=... or in-modal token entry)
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email Gateway Configuration Drawer
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailConfigInput, setEmailConfigInput] = useState({
    user: '',
    pass: ''
  });
  const [savingEmailConfig, setSavingEmailConfig] = useState(false);
  const [emailConfigMsg, setEmailConfigMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Check URL parameters for direct reset token link
  useEffect(() => {
    const rToken = searchParams.get('resetToken');
    const rEmail = searchParams.get('email');
    if (rToken) {
      setResetTokenInput(rToken);
      if (rEmail) setResetEmailInput(rEmail);
      setShowResetForm(true);
      setShowForgotModal(true);
    }
  }, [searchParams]);

  // Load municipal departments for dynamic officer registration
  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setAvailableDepts(d);
          if (!offDepartmentId) {
            setOffDepartmentId(d[0].id);
          }
        }
      })
      .catch(() => {
        fetch('/api/admin/departments')
          .then(r => r.json())
          .then(d => {
            if (Array.isArray(d) && d.length > 0) {
              setAvailableDepts(d);
            }
          })
          .catch(() => {});
      });
  }, []);

  // Handle Official Officer Registration
  const handleRegisterOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOffError('');
    setOffSuccess('');
    setOffLoading(true);

    try {
      if (!offName.trim()) throw new Error('Full name is required.');
      if (!offEmail.trim()) throw new Error('Official email address is required.');
      if (!offPassword.trim()) throw new Error('Password is required.');
      if (!offDepartmentId) throw new Error('Please select your municipal department.');

      const selectedDept = availableDepts.find(d => d.id === offDepartmentId);

      const res = await fetch('/api/auth/register-officer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: offName.trim(),
          email: offEmail.trim().toLowerCase(),
          phone: offPhone.trim(),
          password: offPassword,
          departmentId: offDepartmentId,
          departmentName: selectedDept ? selectedDept.name : 'Municipal Department',
          state: 'Tamil Nadu',
          district: offDistrict || 'Coimbatore',
          city: offCity || 'Annur',
          zone: offZone || 'Zone 1',
          designation: offDesignation || 'Field Inspector',
          maxWorkload: 15
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete officer registration.');

      setLoginSuccessMsg(data.message || 'Officer registration complete! Your official account has been created. Please sign in below to enter the Operations Center.');
      setIdentifier(offEmail.trim().toLowerCase());
      setPassword(offPassword);
      setOffSuccess('');
      setActiveTab('official');
    } catch (err: any) {
      setOffError(err.message || 'Error completing officer registration.');
    } finally {
      setOffLoading(false);
    }
  };

  // Quick 1-Click login for instant demo verification
  const handleQuickLogin = async (emailVal: string, passVal: string = 'password', targetRole: 'CITIZEN' | 'OFFICER' = 'CITIZEN') => {
    setLoginError('');
    setLoginLoading(true);
    setIdentifier(emailVal);
    setPassword(passVal);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailVal.trim(), 
          password: passVal,
          targetRole 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed. Please verify credentials.');

      login(data.token, data.user);

      switch (data.user.role) {
        case 'CITIZEN': navigate('/citizen'); break;
        case 'OFFICER': navigate('/officer'); break;
        case 'SENIOR_OFFICER': navigate('/senior'); break;
        case 'ADMIN': navigate('/admin'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Sign In (Citizen or Official) - Direct login without OTP
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const cleanInput = identifier.trim();
      const targetRole = activeTab === 'official' ? 'OFFICER' : 'CITIZEN';

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanInput, 
          password: password || 'password',
          targetRole
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed. Please verify your credentials.');

      login(data.token, data.user);

      switch (data.user.role) {
        case 'CITIZEN': navigate('/citizen'); break;
        case 'OFFICER': navigate('/officer'); break;
        case 'SENIOR_OFFICER': navigate('/senior'); break;
        case 'ADMIN': navigate('/admin'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Please re-check and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Citizen Self-Registration directly (NO OTP REQUIRED, keeps mobile number)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      if (!regName.trim()) throw new Error('Full name is required.');
      if (!regEmail.trim()) throw new Error('Email address is required.');
      if (!regPhone.trim()) throw new Error('10-digit mobile number is required.');

      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          phone: regPhone.trim(),
          password: regPassword || 'password'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      setLoginSuccessMsg(data.message || 'Citizen account registered successfully! Please sign in below with your password to continue.');
      setIdentifier(regEmail.trim().toLowerCase());
      setPassword(regPassword || 'password');
      setRegError('');
      setActiveTab('citizen');
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setRegLoading(false);
    }
  };

  // Handle Forgot Password - Dispatches real email via /api/auth/forgot-password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address or mobile number.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotResponse(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch password recovery email.');

      setForgotResponse(data);
      setResetEmailInput(data.email);
      setResetTokenInput(data.token);
    } catch (err: any) {
      setForgotError(err.message || 'Error requesting password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Reset Password Submit (using token from email)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      setResetMsg({ type: 'error', text: 'Please enter your new password.' });
      return;
    }
    setResetLoading(true);
    setResetMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmailInput.trim(),
          token: resetTokenInput.trim(),
          newPassword: newPasswordInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');

      setResetMsg({ type: 'success', text: 'Password reset successful! Logging you in...' });
      if (data.token && data.user) {
        login(data.token, data.user);
        setTimeout(() => {
          setShowForgotModal(false);
          switch (data.user.role) {
            case 'CITIZEN': navigate('/citizen'); break;
            case 'OFFICER': navigate('/officer'); break;
            case 'SENIOR_OFFICER': navigate('/senior'); break;
            case 'ADMIN': navigate('/admin'); break;
            default: navigate('/');
          }
        }, 1000);
      }
    } catch (err: any) {
      setResetMsg({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setResetLoading(false);
    }
  };

  // Configure Gmail / SMTP Gateway for Real Inbox Delivery
  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailConfigInput.user.trim() || !emailConfigInput.pass.trim()) {
      setEmailConfigMsg({ type: 'error', text: 'Both Gmail address and 16-character App Password are required.' });
      return;
    }
    setSavingEmailConfig(true);
    setEmailConfigMsg(null);
    try {
      const res = await fetch('/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gmail',
          user: emailConfigInput.user.trim(),
          pass: emailConfigInput.pass.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate Gmail SMTP.');

      setEmailConfigMsg({ type: 'success', text: 'Gmail SMTP credentials saved & verified! Password reset emails will now deliver directly to real Gmail inboxes.' });
    } catch (err: any) {
      setEmailConfigMsg({ type: 'error', text: err.message || 'Failed to connect to SMTP server.' });
    } finally {
      setSavingEmailConfig(false);
    }
  };

  // Quick Track without login handler
  const handleQuickTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRefNo.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const cleanId = trackRefNo.trim();
      const res = await fetch(`/api/complaints/${cleanId}`);
      if (!res.ok) throw new Error(`Complaint reference "${cleanId}" not found in state municipal registry.`);
      const comp = await res.json();
      setTrackResult(comp);
    } catch (err: any) {
      setTrackError(err.message);
    } finally {
      setTrackLoading(false);
    }
  };

  // Quick preset loader for developer evaluation
  const loadDemoUser = (emailVal: string, passVal: string = 'password', tab: 'citizen' | 'official' = 'citizen') => {
    setActiveTab(tab);
    setIdentifier(emailVal);
    setPassword(passVal);
    setShowDevDrawer(false);
  };

  // Bilingual UI dictionary
  const t = {
    en: {
      govt: "Government of Tamil Nadu",
      dept: "Municipal Administration & Urban Development Department",
      helpline: "Toll-Free Helpline: 1913",
      navHome: "Home",
      navAbout: "About Us",
      navServices: "Citizen Services",
      navTrack: "Track Grievance",
      navContact: "Help & Contact",
      brandTitle: "CivicResolve",
      brandSub: "Municipal Grievance System",
      heroTitle: "Your Voice Matters",
      heroDesc: "Register your grievance, track the status and help us build a cleaner, safer and better city for a brighter tomorrow.",
      item1Title: "Register a Grievance",
      item1Desc: "Raise your civic concern in just a few steps.",
      item2Title: "Track Status",
      item2Desc: "Stay informed about your complaint in real time.",
      item3Title: "Transparent Process",
      item3Desc: "Accountable and people-centric governance.",
      motto: "Clean City • Healthy Citizens • Progressive Tamil Nadu",
      citizenTab: "Citizen Login",
      officialTab: "Official Login",
      registerTab: "Citizen Registration",
      signIn: "Sign In",
      citizenSub: "Access your account to register a complaint, track status and manage your grievances.",
      officialSub: "Authorized portal for municipal officers, field inspectors and department heads.",
      emailOrPhoneLabel: "Email Address / Mobile Number *",
      emailOrPhonePlaceholder: "Enter your email or mobile number",
      officialLabel: "Official ID / Gov Email *",
      officialPlaceholder: "Enter your official municipal email",
      passLabel: "Password *",
      passPlaceholder: "Enter your password",
      forgotPass: "Forgot Password?",
      signInBtn: "Sign In",
      noAccount: "Don't have an account?",
      noAccountSub: "Register now as a citizen to raise and track your grievances instantly.",
      registerBtn: "Register as Citizen",
      alreadyAccount: "Already registered?",
      trackWithoutLogin: "Track Complaint Without Login",
      trackSub: "Check status directly using your complaint reference number.",
      trackPlaceholder: "e.g. CR-2026-1001",
      trackBtn: "Track",
      officialBadge: "Authorized Personnel Only",
      officialNotice: "This portal is monitored. Unauthorized access attempts are subject to legal penalties under IT Act 2000.",
    },
    ta: {
      govt: "தமிழ்நாடு அரசு",
      dept: "நகராட்சி நிர்வாகம் மற்றும் குடிநீர் வழங்கல் துறை",
      helpline: "கட்டணமில்லா உதவி எண்: 1913",
      navHome: "முகப்பு",
      navAbout: "எங்களைப் பற்றி",
      navServices: "பொதுமக்கள் சேவைகள்",
      navTrack: "புகாரைக் கண்காணிக்க",
      navContact: "உதவி & தொடர்பு",
      brandTitle: "சிவிக்ரிசால்வ்",
      brandSub: "நகராட்சி குறைதீர்ப்பு அமைப்பு",
      heroTitle: "உங்கள் குரல் முக்கியமானது",
      heroDesc: "உங்கள் குறைகளைப் பதிவு செய்து, அவற்றின் நிலையைக் கண்காணித்து, தூய்மையான மற்றும் பாதுகாப்பான நகரத்தை உருவாக்க உதவுங்கள்.",
      item1Title: "புகாரைப் பதிவு செய்யவும்",
      item1Desc: "சில எளிய படிகளில் உங்கள் பொதுக் குறையைத் தெரிவிக்கவும்.",
      item2Title: "நிலையைக் கண்காணிக்கவும்",
      item2Desc: "உங்கள் புகாரின் நிலையை உடனுக்குடன் அறியவும்.",
      item3Title: "வெளிப்படையான நிர்வாகம்",
      item3Desc: "பொறுப்புணர்வு மற்றும் மக்கள் மைய ஆட்சி முறை.",
      motto: "தூய்மையான நகரம் • நலமான குடிமக்கள் • முன்னேறும் தமிழ்நாடு",
      citizenTab: "பொதுமக்கள் உள்நுழைவு",
      officialTab: "அலுவலர் உள்நுழைவு",
      registerTab: "குடிமக்கள் பதிவு",
      signIn: "உள்நுழையவும்",
      citizenSub: "புகாரைப் பதிவு செய்யவும், நிலையைக் கண்காணிக்கவும் உங்கள் கணக்கில் உள்நுழையவும்.",
      officialSub: "நகராட்சி அலுவலர்கள் மற்றும் துறைத் தலைவர்களுக்கான அங்கீகரிக்கப்பட்ட தளம்.",
      emailOrPhoneLabel: "மின்னஞ்சல் முகவரி / கைபேசி எண் *",
      emailOrPhonePlaceholder: "மின்னஞ்சல் அல்லது கைபேசி எண்ணை உள்ளிடவும்",
      officialLabel: "அலுவல் ஐடி / அரசு மின்னஞ்சல் *",
      officialPlaceholder: "அரசு மின்னஞ்சல் முகவரியை உள்ளிடவும்",
      passLabel: "கடவுச்சொல் *",
      passPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
      forgotPass: "கடவுச்சொல் மறந்துவிட்டதா?",
      signInBtn: "உள்நுழைக",
      noAccount: "கணக்கு இல்லையா?",
      noAccountSub: "குறைகளைப் பதிவு செய்ய உடனே குடிமகனாகப் பதிவு செய்யவும்.",
      registerBtn: "குடிமகனாகப் பதிவு செய்க",
      alreadyAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
      trackWithoutLogin: "உள்நுழையாமல் புகாரைக் கண்காணிக்க",
      trackSub: "உங்கள் புகார் எண்ணை உள்ளிட்டு நிலையை அறியலாம்.",
      trackPlaceholder: "எ.கா. CR-2026-1001",
      trackBtn: "கண்காணி",
      officialBadge: "அங்கீகரிக்கப்பட்ட அலுவலர்கள் மட்டும்",
      officialNotice: "இத்தளம் கண்காணிக்கப்படுகிறது. அனுமதியற்ற உள்நுழைவு தகவல் தொழில்நுட்பச் சட்டப்படி தண்டனைக்குரியது.",
    }
  }[language];

  // Font size scale class
  const fontScaleClass = 
    fontSize === 'large' ? 'text-[17px]' :
    fontSize === 'xlarge' ? 'text-[19px]' : 'text-sm';

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8FAFC] text-[#252A34] ${fontScaleClass} selection:bg-[#008C95]/20`}>
      
      {/* ==================================================
          1. OFFICIAL GOVERNMENT PRIMARY TOP BAR
      ================================================== */}
      <header className="bg-[#132238] text-white border-b border-[#1f3454] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Emblem & Official State Branding */}
          <div className="flex items-center gap-3">
            {/* National Emblem SVG */}
            <div className="w-10 h-11 bg-white/10 rounded-sm p-1 flex items-center justify-center shrink-0 border border-white/20">
              <svg viewBox="0 0 100 115" className="w-full h-full fill-white" aria-label="Government Emblem">
                {/* Simplified Indian Lion Capital Emblem Silhouette */}
                <path d="M50 5 C43 5 37 11 37 18 C37 21 38 24 40 26 C36 29 33 34 33 40 C33 46 37 51 42 53 C38 56 35 60 35 66 C35 72 40 78 47 79 L47 85 L25 85 C23 85 21 87 21 89 C21 91 23 93 25 93 L47 93 L47 97 L20 97 C18 97 16 99 16 101 C16 103 18 105 20 105 L80 105 C82 105 84 103 84 101 C84 99 82 97 80 97 L53 97 L53 93 L75 93 C77 93 79 91 79 89 C79 87 77 85 75 85 L53 85 L53 79 C60 78 65 72 65 66 C65 60 62 56 58 53 C63 51 67 46 67 40 C67 34 64 29 60 26 C62 24 63 21 63 18 C63 11 57 5 50 5 Z M50 11 C54 11 57 14 57 18 C57 22 54 25 50 25 C46 25 43 22 43 18 C43 14 46 11 50 11 Z M50 31 C55 31 59 35 59 40 C59 45 55 49 50 49 C45 49 41 45 41 40 C41 35 45 31 50 31 Z M50 55 C56 55 60 60 60 66 C60 72 56 76 50 76 C44 76 40 72 40 66 C40 60 44 55 50 55 Z" />
              </svg>
            </div>

            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide text-white">
                {t.govt}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 font-normal leading-tight">
                {t.dept}
              </p>
            </div>
          </div>

          {/* Right: Accessibility, Font Size & Language Controls */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
            
            {/* Accessibility User Icon */}
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors" title="Accessibility Standards (WCAG 2.1 AA)">
              <Accessibility className="w-4 h-4 text-teal-400" />
              <span className="hidden md:inline text-[11px] text-slate-300">Accessibility</span>
            </div>

            {/* Font Size Adjusters */}
            <div className="flex items-center bg-white/10 rounded-md p-0.5 border border-white/15" role="group" aria-label="Font Size Controls">
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  fontSize === 'large' ? 'bg-[#008C95] text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Increase Font Size (A+)"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  fontSize === 'normal' ? 'bg-[#008C95] text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Normal Font Size (A)"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  fontSize === 'xlarge' ? 'bg-[#008C95] text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Extra Large Font Size (A-)"
              >
                A-
              </button>
            </div>

            <div className="h-4 w-px bg-white/20 hidden sm:block"></div>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-md border border-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
                aria-expanded={showLangMenu}
              >
                <Globe className="w-3.5 h-3.5 text-teal-300" />
                <span>{language === 'en' ? 'English' : 'தமிழ்'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white text-[#172033] rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-teal-50 flex items-center justify-between font-medium cursor-pointer ${language === 'en' ? 'text-[#008C95] font-bold' : ''}`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLanguage('ta'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-teal-50 flex items-center justify-between font-medium cursor-pointer ${language === 'ta' ? 'text-[#008C95] font-bold' : ''}`}
                  >
                    <span>தமிழ் (Tamil)</span>
                    {language === 'ta' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Toll Free Helpline Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-amber-300 font-bold text-xs bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/30">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>1913</span>
            </div>
          </div>
        </div>

        {/* Secondary Clean Navigation Bar */}
        <nav className="bg-[#1a2c47] border-t border-white/10 text-xs text-slate-200" aria-label="Portal Navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-1.5">
            <div className="flex items-center space-x-6 shrink-0">
              <Link to="/" className="text-white hover:text-teal-300 font-semibold transition-colors">
                {t.navHome}
              </Link>
              <Link to="/about" className="hover:text-teal-300 transition-colors font-medium">
                {t.navAbout}
              </Link>
              <Link to="/services" className="hover:text-teal-300 transition-colors font-medium">
                {t.navServices}
              </Link>
              <Link to="/track" className="hover:text-teal-300 transition-colors font-medium">
                {t.navTrack}
              </Link>
              <Link to="/contact" className="hover:text-teal-300 transition-colors font-medium">
                {t.navContact}
              </Link>
            </div>

            <div className="text-[11px] text-slate-400 hidden md:block">
              {t.helpline} • 24x7 Citizen Helpline
            </div>
          </div>
        </nav>
      </header>

      {/* ==================================================
          2. MAIN LOGIN WORKSPACE (BALANCED TWO-COLUMN LAYOUT)
      ================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT SIDE: CIVIC BRANDING & HERITAGE VISUAL (CARD 1) */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col justify-between h-full min-h-[620px]">
            
            {/* Background Municipal Architecture Photo with Soft Blue-Navy Overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src={municipalPhoto} 
                alt="Government Municipal Secretariat Building" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#132238]/95 via-[#132238]/85 to-[#132238]/70 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-[#008C95]/10"></div>
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 p-6 sm:p-8 space-y-6 text-white">
              
              {/* CivicResolve Brand Identity */}
              <div className="flex items-center gap-3.5">
                {/* Tamil Nadu Gopuram Temple Emblem Graphic */}
                <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-teal-200">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Gopuram Motif */}
                    <polygon points="50,10 40,25 60,25" fill="#D9A441" />
                    <polygon points="50,22 35,42 65,42" fill="#008C95" />
                    <polygon points="50,38 30,62 70,62" fill="#172033" />
                    <polygon points="50,58 22,88 78,88" fill="#D9A441" />
                    <rect x="42" y="80" width="16" height="15" fill="#C0392B" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#008C95" strokeWidth="4" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold tracking-tight text-white">{t.brandTitle}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#008C95] text-white">Gov Portal</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium tracking-wide">{t.brandSub}</p>
                </div>
              </div>

              {/* Headline & Mission */}
              <div className="space-y-2 pt-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {t.heroTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg font-normal">
                  {t.heroDesc}
                </p>
              </div>

              {/* Three Civic Service Pillars */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{t.item1Title}</h3>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">{t.item1Desc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{t.item2Title}</h3>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">{t.item2Desc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{t.item3Title}</h3>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">{t.item3Desc}</p>
                  </div>
                </div>
              </div>

              {/* Official 24x7 Government Helplines & Direct Citizen Assistance Box */}
              <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                    <span>24x7 Citizen Assistance &amp; Helplines</span>
                  </span>
                  <span className="text-[10px] text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30 font-semibold font-mono">
                    Toll-Free
                  </span>
                </div>

                {/* 4 Quick Helpline Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a 
                    href="tel:1100" 
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-center transition-all group block shadow-2xs"
                    title="Chief Minister Special Helpline (1100)"
                  >
                    <span className="block text-sm font-black text-amber-300 font-mono group-hover:scale-105 transition-transform">1100</span>
                    <span className="block text-[10px] text-slate-200 font-medium leading-tight mt-0.5">CM Helpline</span>
                  </a>

                  <a 
                    href="tel:1913" 
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-center transition-all group block shadow-2xs"
                    title="Municipal Civic Grievances (1913)"
                  >
                    <span className="block text-sm font-black text-teal-300 font-mono group-hover:scale-105 transition-transform">1913</span>
                    <span className="block text-[10px] text-slate-200 font-medium leading-tight mt-0.5">Municipal Civic</span>
                  </a>

                  <a 
                    href="tel:112" 
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-center transition-all group block shadow-2xs"
                    title="Unified Police / Fire Emergency (112)"
                  >
                    <span className="block text-sm font-black text-rose-300 font-mono group-hover:scale-105 transition-transform">112</span>
                    <span className="block text-[10px] text-slate-200 font-medium leading-tight mt-0.5">Emergency</span>
                  </a>

                  <a 
                    href="tel:1916" 
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-center transition-all group block shadow-2xs"
                    title="Water Supply & Sewage Redressal (1916)"
                  >
                    <span className="block text-sm font-black text-sky-300 font-mono group-hover:scale-105 transition-transform">1916</span>
                    <span className="block text-[10px] text-slate-200 font-medium leading-tight mt-0.5">Water/Drainage</span>
                  </a>
                </div>

                {/* Statewide Service Guarantees */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-teal-300 font-extrabold block">38 Districts</span>
                    <span className="text-slate-300 text-[9px] block">Statewide Coverage</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-amber-300 font-extrabold block">24h–72h SLA</span>
                    <span className="text-slate-300 text-[9px] block">Auto Escalation</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-teal-300 font-extrabold block">100% Geotagged</span>
                    <span className="text-slate-300 text-[9px] block">Photo Proof Audit</span>
                  </div>
                </div>

                {/* Direct Action Link to Lodge Public Grievance Without Sign-In */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <Link
                    to="/public/lodge"
                    className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-[#008C95] hover:bg-teal-600 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>File Grievance Without Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/track"
                    className="w-full sm:w-auto py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Track an existing complaint status"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-300" />
                    <span>Track Status</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Slogan Strip */}
            <div className="relative z-10 px-6 sm:px-8 py-3.5 bg-black/40 border-t border-white/10 text-white flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-teal-200 italic">
                {t.motto}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">TN-CIVIC-v4</span>
            </div>
          </div>

          {/* RIGHT SIDE: CLEAN GOVERNMENT WHITE LOGIN CARD (CARD 2 - IDENTICAL MATCHING SIZE) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full min-h-[620px]">
            
            {/* Active User Session Banner (if already logged in) */}
            {user && (
              <div className="p-3.5 bg-gradient-to-r from-teal-50 to-slate-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#132238] text-teal-300 border border-teal-400/30 flex items-center justify-center font-bold text-sm shrink-0">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#132238] truncate">
                      Signed In: <span className="text-[#008C95]">{user.name}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono truncate">
                      {user.role === 'OFFICER' ? '👮 Official Field Officer' : user.role === 'CITIZEN' ? '👤 Verified Citizen' : user.role}
                      {user.department ? ` • ${user.department}` : ''}
                      {user.city ? ` • ${user.city}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      switch (user.role) {
                        case 'CITIZEN': navigate('/citizen'); break;
                        case 'OFFICER': navigate('/officer'); break;
                        case 'SENIOR_OFFICER': navigate('/senior'); break;
                        case 'ADMIN': navigate('/admin'); break;
                        default: navigate('/');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>Go to {user.role === 'OFFICER' ? 'Officer Portal' : user.role === 'CITIZEN' ? 'Citizen Portal' : 'Portal'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIdentifier('');
                      setPassword('');
                    }}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 rounded-lg font-medium text-xs cursor-pointer transition-colors"
                  >
                    Switch
                  </button>
                </div>
              </div>
            )}

            {/* Top Navigation Tabs: Citizen Sign In | Officer Sign In | Citizen Register | Officer Register */}
            <div className="border-b border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1" role="tablist">
                
                {/* 1. Citizen Sign In Tab */}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'citizen'}
                  onClick={() => { 
                    setActiveTab('citizen'); 
                    setLoginError(''); 
                    setRegError(''); 
                    setOffError(''); 
                    if (identifier === 'rajesh.water@civic.gov' || identifier === 'officer@example.com') {
                      setIdentifier('');
                    }
                  }}
                  className={`py-2.5 px-1.5 sm:px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'citizen'
                      ? 'border-[#008C95] text-[#008C95] bg-teal-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <User className="w-4 h-4 text-[#008C95]" />
                  <span>Citizen Login</span>
                </button>

                {/* 2. Officer Sign In Tab */}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'official'}
                  onClick={() => { 
                    setActiveTab('official'); 
                    setLoginError(''); 
                    setRegError(''); 
                    setOffError(''); 
                    if (identifier === 'citizen@example.com' || identifier === 'kowshishree637@gmail.com') {
                      setIdentifier('');
                    }
                  }}
                  className={`py-2.5 px-1.5 sm:px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'official'
                      ? 'border-[#132238] text-[#132238] bg-slate-100 font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Officer Login</span>
                </button>

                {/* 3. Citizen Registration Tab */}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'register'}
                  onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); setOffError(''); }}
                  className={`py-2.5 px-1.5 sm:px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'border-[#008C95] text-[#008C95] bg-teal-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                  <span>Register Citizen</span>
                </button>

                {/* 4. Field Officer Registration Tab */}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'officer_register'}
                  onClick={() => { setActiveTab('officer_register'); setLoginError(''); setRegError(''); setOffError(''); }}
                  className={`py-2.5 px-1.5 sm:px-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'officer_register'
                      ? 'border-[#008C95] text-[#008C95] bg-teal-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#008C95]" />
                  <span>Register Officer</span>
                </button>
              </div>
            </div>

            {/* Registration Success Message */}
            {loginSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-emerald-950">Registration Completed Successfully!</span>
                  <span className="mt-0.5 block text-emerald-800">{loginSuccessMsg}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {loginError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-medium">{loginError}</span>
                </div>
                {loginError.includes('register first') && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'official') {
                          setActiveTab('officer_register');
                          setOffEmail(identifier);
                        } else {
                          setActiveTab('register');
                          if (identifier.includes('@')) {
                            setRegEmail(identifier);
                          } else {
                            setRegPhone(identifier);
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <span>Create Account &bull; Register as {activeTab === 'official' ? 'Officer' : 'Citizen'} First</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab Form Views */}
            {activeTab === 'officer_register' ? (
              /* FIELD OFFICER OFFICIAL REGISTRATION FORM */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[#008C95] font-bold text-[11px] uppercase tracking-wider mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Official Staff Registration</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#132238]">Field Officer Registration</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Register with your assigned municipal department (Water, Roads, Sanitation, etc.) to receive citizen queries in your area directly.
                  </p>
                </div>

                {offSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{offSuccess}</span>
                  </div>
                )}

                {offError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span className="font-medium">{offError}</span>
                    </div>
                    {offError.toLowerCase().includes('already registered') && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier(offEmail);
                            setActiveTab('official');
                            setOffError('');
                            setLoginError('');
                          }}
                          className="px-3 py-1.5 bg-[#008C95] hover:bg-teal-700 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Sign In as Officer with this Email &rarr;</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleRegisterOfficer} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Officer Full Name *</label>
                      <input
                        required
                        type="text"
                        value={offName}
                        onChange={e => setOffName(e.target.value)}
                        placeholder="e.g. Officer Raman"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Official Email *</label>
                      <input
                        required
                        type="email"
                        value={offEmail}
                        onChange={e => setOffEmail(e.target.value)}
                        placeholder="raman.water@civic.gov"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95] focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Department Selection */}
                  <div className="space-y-2.5 p-3.5 bg-teal-50/40 rounded-xl border border-teal-200">
                    <div className="flex items-center justify-between">
                      <label htmlFor="choose-department-select" className="block text-xs font-bold text-gray-800">
                        Assigned Municipal Department *
                      </label>
                      {offDepartmentId ? (
                        <span className="text-[11px] font-bold text-[#008C95] bg-white px-2.5 py-0.5 rounded-full border border-teal-300 shadow-2xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{availableDepts.find(d => d.id === offDepartmentId)?.name || 'Department Selected'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Please choose department
                        </span>
                      )}
                    </div>

                    {/* Department Quick Select Grid (All Municipal Departments) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                      {availableDepts.map(d => {
                        const isSelected = offDepartmentId === d.id;
                        const icon = d.icon || (
                          d.name.includes('Water') ? '💧' :
                          d.name.includes('Road') ? '🛣️' :
                          d.name.includes('Sanitation') ? '🧹' :
                          d.name.includes('Animal') ? '🐕' :
                          d.name.includes('Electricity') ? '⚡' :
                          d.name.includes('Health') ? '🏥' :
                          d.name.includes('Education') ? '🏫' :
                          d.name.includes('Transport') ? '🚌' :
                          d.name.includes('Revenue') ? '📋' : '🏛️'
                        );
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setOffDepartmentId(d.id)}
                            className={`p-2 rounded-lg text-left transition-all cursor-pointer border flex items-center gap-2 ${
                              isSelected
                                ? 'bg-[#008C95] text-white border-[#008C95] shadow-xs ring-2 ring-teal-200 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                            }`}
                          >
                            <span className="text-sm shrink-0">{icon}</span>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[11px] leading-tight truncate">
                                {d.name}
                              </span>
                              <span className={`block text-[9px] truncate ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                                {d.code || 'Municipal'}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Form Select Dropdown */}
                    <div className="pt-1">
                      <select
                        id="choose-department-select"
                        name="departmentId"
                        required
                        value={offDepartmentId}
                        onChange={e => setOffDepartmentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-lg text-xs font-bold text-[#132238] outline-none focus:ring-2 focus:ring-[#008C95] shadow-2xs"
                      >
                        <option value="">-- Choose Municipal Department --</option>
                        {availableDepts.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} {d.code ? `(${d.code})` : ''} {d.id === 'd2' ? '💧 [Water Operations]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department Routing Policy Guarantee */}
                    {offDepartmentId === 'd2' || offDepartmentId === 'dept-water' ? (
                      <div className="p-2.5 bg-teal-100/60 border border-teal-300 rounded-lg text-teal-950 text-[11px] space-y-0.5">
                        <strong className="flex items-center gap-1 text-[#006D75]">
                          <span>💧 Exclusive Water Redressal Assignment:</span>
                        </strong>
                        <p className="text-[10px] text-teal-900 leading-relaxed">
                          As Water Department staff, you will receive <strong>ONLY water-related queries and grievances</strong> (drinking water leaks, burst pipes, contamination, tanker requests). Queries will route strictly to this department.
                        </p>
                      </div>
                    ) : offDepartmentId ? (
                      <div className="p-2 bg-white/80 border border-teal-200 rounded-lg text-[10px] text-gray-600">
                        ✓ <strong>Strict Department Scope:</strong> Staff receives only queries assigned to{' '}
                        <strong className="text-[#008C95]">
                          {availableDepts.find(d => d.id === offDepartmentId)?.name || 'this department'}
                        </strong>. Complaints from other municipal departments will not leak into your queue.
                      </div>
                    ) : null}
                  </div>

                  {/* Jurisdiction Zone & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Zone *</label>
                      <select
                        value={offZone}
                        onChange={e => setOffZone(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                      >
                        <option value="Zone 1">Zone 1 (Central / Bazaar)</option>
                        <option value="Zone 2">Zone 2 (North / Highway)</option>
                        <option value="Zone 3">Zone 3 (East / Kariampalayam)</option>
                        <option value="Zone 4">Zone 4 (South / PHC)</option>
                        <option value="All Zones">All Zones (Municipality-Wide)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">City / Municipality *</label>
                      <select
                        value={['Annur', 'Coimbatore', 'Mettupalayam', 'Pollachi', 'Sulur', 'Tiruppur', 'Erode', 'Chennai', 'Madurai', 'Salem', 'Trichy'].includes(offCity) ? offCity : 'OTHER'}
                        onChange={e => {
                          if (e.target.value === 'OTHER') {
                            setOffCity('');
                          } else {
                            setOffCity(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                      >
                        <option value="Annur">Annur Town Panchayat</option>
                        <option value="Coimbatore">Coimbatore Corporation</option>
                        <option value="Mettupalayam">Mettupalayam Municipality</option>
                        <option value="Pollachi">Pollachi Municipality</option>
                        <option value="Sulur">Sulur Town Panchayat</option>
                        <option value="Tiruppur">Tiruppur Corporation</option>
                        <option value="Erode">Erode Corporation</option>
                        <option value="Chennai">Greater Chennai Corporation</option>
                        <option value="Madurai">Madurai Corporation</option>
                        <option value="Salem">Salem Corporation</option>
                        <option value="Trichy">Tiruchirappalli Corporation</option>
                        <option value="OTHER">Other City / Taluk...</option>
                      </select>
                      {!['Annur', 'Coimbatore', 'Mettupalayam', 'Pollachi', 'Sulur', 'Tiruppur', 'Erode', 'Chennai', 'Madurai', 'Salem', 'Trichy'].includes(offCity) && (
                        <input
                          type="text"
                          required
                          value={offCity}
                          onChange={e => setOffCity(e.target.value)}
                          placeholder="Enter your City / Taluk name"
                          className="mt-1.5 w-full px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={offDesignation}
                        onChange={e => setOffDesignation(e.target.value)}
                        placeholder="Junior Engineer"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Mobile (SMS Dispatch Alerts) *</label>
                      <input
                        required
                        type="tel"
                        value={offPhone}
                        onChange={e => setOffPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Account Password *</label>
                      <input
                        required
                        type="password"
                        value={offPassword}
                        onChange={e => setOffPassword(e.target.value)}
                        placeholder="Set account password"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#008C95]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={offLoading}
                    className="w-full py-3 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Briefcase className="w-4 h-4 text-teal-200" />
                    <span>{offLoading ? 'Registering Officer & Activating Routing...' : 'Complete Officer Registration & Direct Routing'}</span>
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('official')}
                    className="text-xs text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
                  >
                    Already registered as an officer? <strong className="text-[#008C95]">Sign In as Officer &rarr;</strong>
                  </button>
                </div>
              </div>
            ) : activeTab === 'register' ? (
              /* CITIZEN REGISTRATION FORM (DIRECT REGISTRATION - NO OTP!) */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-teal-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                    <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                    <span>Public Registration</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#132238]">Citizen Registration</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Create your citizen account using your 10-digit mobile number to lodge complaints and track resolutions directly.
                  </p>
                </div>

                {regError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span className="font-medium">{regError}</span>
                    </div>
                    {regError.toLowerCase().includes('already registered') && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier(regEmail || regPhone);
                            setPassword(regPassword);
                            setActiveTab('citizen');
                            setRegError('');
                            setLoginError('');
                          }}
                          className="px-3 py-1.5 bg-[#132238] hover:bg-black text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Sign In as Citizen with this Account &rarr;</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="e.g. Kowshishree"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#132238] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="kowshishree637@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#132238] focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (10 Digits) *</label>
                    <input
                      required
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#132238] focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                    <input
                      required
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Create account password"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#132238] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 bg-[#132238] hover:bg-[#1f3454] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{regLoading ? 'Registering Citizen Account...' : 'Complete Registration & Sign In'}</span>
                    <ArrowRight className="w-4 h-4 text-teal-400" />
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('citizen')}
                    className="text-xs text-[#008C95] hover:underline font-bold cursor-pointer"
                  >
                    Already have an account? Sign In as Citizen &rarr;
                  </button>
                </div>
              </div>
            ) : activeTab === 'official' ? (
              /* DEDICATED OFFICER & MUNICIPAL STAFF LOGIN FORM */
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] tracking-wider uppercase font-mono flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-700" />
                      OFFICIAL OPERATIONS CONSOLE
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#132238] tracking-tight mt-1">
                    Officer &amp; Staff Login
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed font-medium">
                    Tamil Nadu Municipal Administration • Field Officers, Department Directors &amp; Administrators.
                  </p>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs flex items-center justify-between text-teal-950">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-[#008C95] shrink-0" />
                    <span className="truncate">New Field Officer? Register department station first.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('officer_register'); setLoginError(''); }}
                    className="font-bold text-[#008C95] hover:underline cursor-pointer shrink-0 ml-2"
                  >
                    Register Officer &rarr;
                  </button>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Field 1: Official Email / Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Official Email / Officer ID / Mobile *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Shield className="w-4 h-4 text-[#008C95]" />
                      </div>
                      <input
                        required
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="e.g. officer@example.com or rajesh.water@civic.gov"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-[#132238] outline-none focus:ring-2 focus:ring-[#132238] font-medium"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Account Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-[#008C95] hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your officer password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-[#132238] outline-none focus:ring-2 focus:ring-[#132238] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Officer Sign In Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-[#132238] hover:bg-[#1f3454] text-white rounded-lg text-xs sm:text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{loginLoading ? 'Authenticating Officer Credentials...' : 'SIGN IN TO OPERATIONS CENTER'}</span>
                  </button>
                </form>



                <div className="text-center pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('officer_register')}
                    className="text-xs text-[#008C95] hover:underline font-bold cursor-pointer"
                  >
                    New Field Officer? Register Department Jurisdiction &rarr;
                  </button>
                </div>
              </div>
            ) : (
              /* DEDICATED CITIZEN LOGIN FORM */
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-[#008C95] font-bold text-[10px] tracking-wider uppercase font-mono">
                      CITIZEN GRIEVANCE PORTAL
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#132238] tracking-tight mt-1">
                    Citizen Sign In
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed font-medium">
                    Sign in with your registered Email or 10-digit Mobile Number to view, lodge, and track grievances.
                  </p>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs flex items-center justify-between text-teal-950">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-[#008C95] shrink-0" />
                    <span className="truncate">First time user? Please register your citizen account first.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setLoginError(''); }}
                    className="font-bold text-[#008C95] hover:underline cursor-pointer shrink-0 ml-2"
                  >
                    Register Citizen &rarr;
                  </button>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Field 1: Identifier (Email / Mobile) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email Address / 10-Digit Mobile Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        required
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="e.g. kowshishree637@gmail.com, citizen@example.com, or mobile"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-[#132238] outline-none focus:ring-2 focus:ring-[#132238] font-medium"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-[#008C95] hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-[#132238] outline-none focus:ring-2 focus:ring-[#132238] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Sign In Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loginLoading ? 'Authenticating...' : 'SIGN IN AS CITIZEN'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>



                {/* Don't have an account? */}
                <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#132238]">New to CivicResolve?</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Register with your mobile number to lodge complaints.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="px-3 py-1.5 bg-white border border-[#132238] text-[#132238] hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    Register Citizen &rarr;
                  </button>
                </div>

                {/* Track Complaint Without Login */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#132238]">
                      <Search className="w-3.5 h-3.5 text-[#008C95]" />
                      <span>{t.trackWithoutLogin}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {t.trackSub}
                    </p>

                    <form onSubmit={handleQuickTrack} className="flex gap-2">
                      <input
                        type="text"
                        value={trackRefNo}
                        onChange={e => setTrackRefNo(e.target.value)}
                        placeholder={t.trackPlaceholder}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-[#132238] outline-none focus:ring-2 focus:ring-[#008C95] font-mono uppercase"
                      />
                      <button
                        type="submit"
                        disabled={trackLoading}
                        className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {trackLoading ? 'Searching...' : t.trackBtn}
                      </button>
                    </form>

                    {trackError && (
                      <p className="text-[11px] text-red-600 font-medium">{trackError}</p>
                    )}

                    {trackResult && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950">{trackResult.complaintNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                            {trackResult.status}
                          </span>
                        </div>
                        <p className="text-gray-700 text-[11px] truncate">{trackResult.subject}</p>
                        <p className="text-gray-500 text-[10px]">Assigned to: {trackResult.departmentName}</p>
                        <Link 
                          to={`/track?id=${trackResult.complaintNumber}`}
                          className="text-[11px] text-[#008C95] font-bold inline-flex items-center gap-1 hover:underline pt-1"
                        >
                          View Full Official Timeline &amp; Resolution →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>



      {/* ==================================================
          4. OFFICIAL GOVERNMENT FOOTER
      ================================================== */}
      <footer className="bg-[#132238] text-slate-300 border-t border-[#1f3454] mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-white/10">
            {/* Col 1: Government Authority */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{t.govt}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Municipal Administration &amp; Urban Development Department. CivicResolve is an integrated public grievance redressal portal empowering citizens with transparent, SLA-monitored civic resolution.
              </p>
              <p className="text-[11px] text-slate-400">
                Official State Civic Escalation Gateway • Real-time SMS Updates
              </p>
            </div>

            {/* Col 2: Legal & Policy Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Policies &amp; Access</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); alert("CivicResolve Public Grievance Charter v2.4."); }} className="hover:text-white transition-colors">About CivicResolve</a></li>
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Citizen Data Protection Policy: All complainant details and mobile numbers are stored in encrypted municipal databases."); }} className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service: Governed by the Tamil Nadu District Municipalities Act."); }} className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#accessibility" onClick={(e) => { e.preventDefault(); alert("Accessibility: Formatted per Guidelines for Indian Government Websites (GIGW) and WCAG 2.1 AA standards."); }} className="hover:text-white transition-colors">Accessibility Statement</a></li>
              </ul>
            </div>

            {/* Col 3: Helpline & Contact */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Helpline &amp; Support</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-white font-bold">1913</span>
                  <span className="text-[10px] text-slate-400">(Toll-Free, 24x7)</span>
                </li>
                <li>Emergency Disaster Line: <span className="text-white font-semibold">112 / 1077</span></li>
                <li>State Grievance Email: <span className="text-white font-mono text-[11px]">grievance.cma@tn.gov.in</span></li>
                <li>Chief Minister's Cell: <span className="text-white font-semibold">1100</span></li>
              </ul>
            </div>
          </div>

          {/* Copyright & Hosting Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 Government of Tamil Nadu. Portal designed, developed and hosted by Municipal Administration &amp; Urban Development Department.
            </div>
            <div className="shrink-0 text-slate-400">
              Last Updated: 01 Oct 2026 | Best viewed in all modern browsers.
            </div>
          </div>
        </div>
      </footer>

      {/* Forgot Password & Password Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#008C95]" />
                <h3 className="font-bold text-[#132238] text-sm">
                  {showResetForm ? 'Set New Account Password' : 'Password Recovery & Email Dispatch'}
                </h3>
              </div>
              <button 
                onClick={() => { 
                  setShowForgotModal(false); 
                  setForgotResponse(null);
                  setForgotError('');
                  setShowResetForm(false);
                  setResetMsg(null);
                }} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* View A: In-Modal Password Reset Form (when token is available) */}
            {showResetForm ? (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-950">
                  <span className="font-bold text-[11px] block">Verified Reset Security Token</span>
                  <div className="font-mono text-xs mt-1 text-teal-800 flex items-center justify-between">
                    <span>Account: <strong>{resetEmailInput}</strong></span>
                    <span className="bg-white px-2 py-0.5 rounded border border-teal-300 font-bold">{resetTokenInput}</span>
                  </div>
                </div>

                {resetMsg && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${resetMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {resetMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    <span>{resetMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Enter New Password *</label>
                  <input
                    required
                    type="password"
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="Enter your new secure password"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008C95] focus:bg-white text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                  </button>
                </div>
              </form>
            ) : forgotResponse ? (
              /* View B: Email Dispatched Success Screen */
              <div className="space-y-4 py-1 text-left text-xs">
                {forgotResponse.isEthereal ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Password Recovery Generated (Sandbox Mode)</span>
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      Recovery credentials for <strong className="font-mono bg-white px-1 py-0.5 rounded border border-amber-300">{forgotResponse.email}</strong> have been generated! In test mode, you can view the sent email in the web inbox preview, or log in immediately using the instant credentials below.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Password Reset Dispatched to Real Email</span>
                    </div>
                    <p className="text-emerald-900 text-[11px] leading-relaxed">
                      A password recovery email has been sent to <strong className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">{forgotResponse.email}</strong>. Please check your inbox and spam folder.
                    </p>
                  </div>
                )}

                {/* Instant 1-Click Access Button if user record available */}
                {forgotResponse.user && (
                  <button
                    type="button"
                    onClick={() => {
                      login(forgotResponse.token || forgotResponse.email, forgotResponse.user);
                      setShowForgotModal(false);
                      switch (forgotResponse.user.role) {
                        case 'CITIZEN': navigate('/citizen'); break;
                        case 'OFFICER': navigate('/officer'); break;
                        case 'SENIOR_OFFICER': navigate('/senior'); break;
                        case 'ADMIN': navigate('/admin'); break;
                        default: navigate('/');
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>⚡ One-Click Sign In Now as {forgotResponse.name || 'User'} &rarr;</span>
                  </button>
                )}

                {/* Instant Recovery Credentials Box */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#132238] block text-xs">
                      Immediate Access Credentials:
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Token: {forgotResponse.token}</span>
                  </div>
                  
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-1.5">
                    <div className="text-[11px] text-gray-500">Temporary Login Password:</div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#008C95] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {forgotResponse.tempPassword}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIdentifier(forgotResponse.email);
                          setPassword(forgotResponse.tempPassword);
                          setShowForgotModal(false);
                        }}
                        className="text-[11px] font-bold text-[#008C95] hover:underline cursor-pointer"
                      >
                        Auto-Fill into Sign In &rarr;
                      </button>
                    </div>
                  </div>

                  {forgotResponse.previewUrl && (
                    <div className="pt-1">
                      <a
                        href={forgotResponse.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Dispatched Email Preview (Ethereal Web Inbox)</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="flex-1 py-2.5 px-3 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold text-center cursor-pointer transition-colors"
                  >
                    Set New Password With Token &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(false); setForgotResponse(null); }}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* View C: Initial Request Form */
              <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
                <p className="text-gray-600 leading-relaxed">
                  Enter your registered Citizen or Officer email address (or 10-digit mobile number) to receive an official password reset link.
                </p>

                {forgotError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Registered Email / Mobile Number *</label>
                  <input
                    required
                    type="text"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. kowshishree637@gmail.com, officer@example.com, or mobile"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008C95] focus:bg-white text-xs font-medium"
                  />
                </div>

                <div className="pt-1 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-[#008C95] hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Recovery Email</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Optional Expandable: Configure Real Gmail SMTP for direct inbox delivery */}
                <div className="pt-3 border-t border-gray-200/80">
                  <button
                    type="button"
                    onClick={() => setShowEmailConfig(!showEmailConfig)}
                    className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>⚙️ Optional: Configure Real Gmail / SMTP Server</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEmailConfig ? 'rotate-180' : ''}`} />
                  </button>

                  {showEmailConfig && (
                    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        To receive password reset emails directly in your personal Gmail inbox, enter your Gmail address and 16-character Google App Password (from myaccount.google.com/apppasswords):
                      </p>
                      <div className="space-y-1.5">
                        <input
                          type="email"
                          placeholder="your.email@gmail.com"
                          value={emailConfigInput.user}
                          onChange={e => setEmailConfigInput(prev => ({ ...prev, user: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none font-mono"
                        />
                        <input
                          type="password"
                          placeholder="16-character Google App Password"
                          value={emailConfigInput.pass}
                          onChange={e => setEmailConfigInput(prev => ({ ...prev, pass: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleSaveEmailConfig}
                          disabled={savingEmailConfig || !emailConfigInput.user || !emailConfigInput.pass}
                          className="w-full py-1.5 bg-[#132238] hover:bg-[#1f3454] text-white rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50"
                        >
                          {savingEmailConfig ? 'Testing SMTP Connection...' : 'Save & Verify Gmail SMTP'}
                        </button>
                      </div>

                      {emailConfigMsg && (
                        <div className={`p-2 rounded text-[10px] ${emailConfigMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'}`}>
                          {emailConfigMsg.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
