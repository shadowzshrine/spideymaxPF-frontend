"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import SpiderWebLoader from '@/components/SpiderWebLoader.jsx';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick, playSuccess, playWebSling, playWarning, speakThankYou } from '@/utils/audio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const visitReasons = [
  "Looking to hire",
  "Checking out my work",
  "Just curious",
  "Referred by someone",
  "Found on social media"
];

const findSources = [
  { id: 'LinkedIn', label: 'LinkedIn' },
  { id: 'GitHub', label: 'GitHub' },
  { id: 'Instagram', label: 'Instagram' },
  { id: 'Naukri', label: 'Naukri' },
  { id: 'Indeed', label: 'Indeed' },
  { id: 'Google Search', label: 'Google Search' },
  { id: 'Other', label: 'Other' }
];

const countryCodes = [
  { code: '+91', name: 'IN' },
  { code: '+1', name: 'US/CA' },
  { code: '+44', name: 'UK' },
  { code: '+61', name: 'AU' },
  { code: '+971', name: 'AE' },
  { code: '+65', name: 'SG' },
  { code: '+49', name: 'DE' },
  { code: '+33', name: 'FR' }
];

const SwingIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#dc2626] select-none pointer-events-none drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">
    {/* Sky stars */}
    <circle cx="15" cy="20" r="0.5" fill="#ffffff" opacity="0.3" />
    <circle cx="80" cy="15" r="0.4" fill="#ffffff" opacity="0.5" />
    <circle cx="45" cy="35" r="0.6" fill="#00ffff" opacity="0.4" className="animate-pulse" />
    
    {/* City Skyline silhouettes */}
    <rect x="5" y="65" width="12" height="35" fill="#111111" stroke="#1f2937" strokeWidth="0.2" />
    <rect x="22" y="50" width="16" height="50" fill="#0a0a0a" stroke="#1f2937" strokeWidth="0.2" />
    <rect x="42" y="60" width="20" height="40" fill="#111111" stroke="#1f2937" strokeWidth="0.2" />
    <rect x="68" y="45" width="14" height="55" fill="#0a0a0a" stroke="#1f2937" strokeWidth="0.2" />
    <rect x="86" y="70" width="10" height="30" fill="#111111" stroke="#1f2937" strokeWidth="0.2" />
    
    {/* Skyline Windows */}
    <rect x="26" y="55" width="2" height="3" fill="#00ffff" opacity="0.4" />
    <rect x="32" y="65" width="2" height="3" fill="#dc2626" opacity="0.3" />
    <rect x="72" y="50" width="2" height="3" fill="#00ffff" opacity="0.5" />
    <rect x="76" y="60" width="2" height="3" fill="#ffffff" opacity="0.2" />

    {/* Swinging web strand */}
    <path d="M10,-10 Q32,32 52,56" fill="none" stroke="#00ffff" strokeWidth="0.3" opacity="0.8" />
    {/* Spiderman swinging silhouette */}
    <g transform="translate(50, 55) scale(0.8)">
      <path d="M0,0 C2,-3 4,-5 6,-4 C8,-3 7,2 5,4 C3,6 -2,8 -4,6 C-6,4 -4,2 0,0 Z" fill="#dc2626" className="animate-bounce" style={{ animationDuration: '2s' }} />
      <circle cx="2" cy="-6" r="3" fill="#dc2626" />
      <path d="M-2,-5 L-4,-8 M5,-5 L8,-7" stroke="#ffffff" strokeWidth="0.5" />
    </g>
  </svg>
);

const RippleIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#dc2626] select-none pointer-events-none">
    {/* Concentric pulsing circles for Spidersense */}
    {[16, 26, 36, 46].map((r, i) => (
      <circle
        key={i}
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={i % 2 === 0 ? '#00ffff' : '#dc2626'}
        strokeWidth="0.35"
        style={{
          transformOrigin: '50px 50px',
          animation: 'ripple 3.5s ease-out infinite',
          animationDelay: `${i * 0.75}s`
        }}
      />
    ))}
    
    {/* Center Spider mask silhouette */}
    <g transform="translate(50, 50) scale(0.6)">
      <path d="M-15,-20 C-15,-20 -5,-32 0,-32 C5,-32 15,-20 15,-20 C18,-5 12,20 0,30 C-12,20 -18,-5 -15,-20 Z" fill="#0c0c0e" stroke="#dc2626" strokeWidth="1.2" />
      {/* Eyes */}
      <path d="M-10,-8 C-7,-12 -3,-10 -2,-8 C-4,-4 -7,-1 -10,-8 Z" fill="#ffffff" stroke="#dc2626" strokeWidth="0.6" />
      <path d="M10,-8 C7,-12 2,-10 1,-8 C3,-4 7,-1 10,-8 Z" fill="#ffffff" stroke="#dc2626" strokeWidth="0.6" />
    </g>

    <style>{`
      @keyframes ripple {
        0% { transform: scale(0.65); opacity: 0; }
        50% { opacity: 0.85; }
        100% { transform: scale(1.15); opacity: 0; }
      }
    `}</style>
  </svg>
);

const MapIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#dc2626] select-none pointer-events-none">
    {/* Map Grid */}
    <line x1="10" y1="0" x2="10" y2="100" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="30" y1="0" x2="30" y2="100" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="70" y1="0" x2="70" y2="100" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="90" y1="0" x2="90" y2="100" stroke="#1f2937" strokeWidth="0.1" />
    
    <line x1="0" y1="10" x2="100" y2="10" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="0" y1="30" x2="100" y2="30" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="0" y1="50" x2="100" y2="50" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="0" y1="70" x2="100" y2="70" stroke="#1f2937" strokeWidth="0.1" />
    <line x1="0" y1="90" x2="100" y2="90" stroke="#1f2937" strokeWidth="0.1" />

    {/* Connected Web Strands */}
    <line x1="20" y1="20" x2="50" y2="50" stroke="#dc2626" strokeWidth="0.3" strokeDasharray="1,1" />
    <line x1="80" y1="30" x2="50" y2="50" stroke="#00ffff" strokeWidth="0.3" />
    <line x1="30" y1="80" x2="50" y2="50" stroke="#dc2626" strokeWidth="0.3" />
    <line x1="20" y1="20" x2="30" y2="80" stroke="#00ffff" strokeWidth="0.15" strokeDasharray="2,1" />
    <line x1="80" y1="30" x2="75" y2="75" stroke="#dc2626" strokeWidth="0.15" />
    <line x1="75" y1="75" x2="30" y2="80" stroke="#00ffff" strokeWidth="0.3" />

    {/* Map Points */}
    <circle cx="50" cy="50" r="2.5" fill="#dc2626" className="animate-pulse" />
    <circle cx="20" cy="20" r="1.2" fill="#00ffff" />
    <circle cx="80" cy="30" r="1.2" fill="#dc2626" />
    <circle cx="30" cy="80" r="1.2" fill="#00ffff" />
    <circle cx="75" cy="75" r="1.2" fill="#dc2626" />
  </svg>
);

export default function Onboarding() {
  const router = useRouter();

  // Onboarding phase states
  const [step, setStep] = useState(0); // 0 = Intro, 1 = Step 1, 2 = Step 2, 3 = Step 3
  const [loading, setLoading] = useState(true);

  // Form Fields state
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNo, setPhoneNo] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch logged in user to prefill name
  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user) {
          // If already onboarded, redirect straight to portfolio
          if (data.user.onboarded) {
            setTimeout(() => router.push('/'), 0);
          } else {
            setFullName(data.user.name || '');
            setLoading(false);
          }
        } else {
          setTimeout(() => router.push('/login'), 0);
        }
      })
      .catch((err) => {
        console.warn('[Onboarding Auth Check Error]:', err.message || err);
        setTimeout(() => router.push('/login'), 0);
      });
  }, [router]);

  // Step 0: Auto-advance to step 1 after 2.5s
  useEffect(() => {
    if (step === 0 && !loading) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, loading]);

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!fullName || !fullName.trim()) {
        newErrors.fullName = 'Full Name is required';
      }
      if (!phoneNo || !phoneNo.trim()) {
        newErrors.phoneNo = 'Mobile number is required';
      } else if (!/^\d{7,15}$/.test(phoneNo.trim().replace(/[-\s]/g, ''))) {
        newErrors.phoneNo = 'Please enter a valid mobile number (7-15 digits)';
      }
    }

    if (currentStep === 2) {
      if (!visitReason) {
        newErrors.visitReason = 'Please select a reason';
      }
      if (visitReason === 'Referred by someone' && (!referrerName || !referrerName.trim())) {
        newErrors.referrerName = "Friend's name is required";
      }
    }

    if (currentStep === 3) {
      if (selectedSources.length === 0) {
        newErrors.findSource = 'Please select at least one source';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      playWarning();
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      playClick();
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playClick();
    setErrors({});
    setStep((prev) => prev - 1);
  };

  const handleSourceSelect = (sourceId) => {
    playClick();
    setErrors({});
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter((id) => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    const combinedMobileNumber = `${countryCode} ${phoneNo.trim()}`;

    try {
      const res = await fetch(`${API_URL}/api/users/onboarding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          mobileNumber: combinedMobileNumber,
          visitReason,
          referrerName: visitReason === 'Referred by someone' ? referrerName : undefined,
          findSource: selectedSources
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSuccess();
        playWebSling();
        speakThankYou();
        router.push('/');
      } else {
        playWarning();
        setErrors({ submit: data.message || 'Failed to complete onboarding.' });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('[Onboarding Submit Error]:', err);
      playWarning();
      setErrors({ submit: 'Network error. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return fullName.trim().length > 0 && phoneNo.trim().length > 0;
    }
    if (step === 2) {
      if (!visitReason) return false;
      if (visitReason === 'Referred by someone') return referrerName.trim().length > 0;
      return true;
    }
    if (step === 3) {
      return selectedSources.length > 0;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] text-white font-mono text-xs">
        <div className="text-center">
          <SpiderWebLoader 
            size="sm"
            text="// SECURING PROTOCOLS..."
            showProgress={false}
          />
        </div>
      </div>
    );
  }

  // STEP 0: Auto-advancing Intro message Redesign
  if (step === 0) {
    return (
      <div className="relative min-h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white font-mono overflow-hidden select-none">
        {/* Comic grid overlay */}
        <div className="absolute inset-0 comic-grid opacity-[0.06] pointer-events-none" />
        
        {/* CRT Scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_20px] animate-scanline" />

        <div className="z-10 w-full max-w-md p-8 bg-[#050505] border border-zinc-900 rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.15)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#dc2626] animate-[pulse_1.5s_infinite]" />
          
          {/* Logo */}
          <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-6 bg-zinc-950 animate-pulse">
            <span className="text-[#00ffff] text-lg">🕷️</span>
          </div>

          <h2 className="text-sm font-bold text-white tracking-[0.2em] mb-4 uppercase animate-pulse">
            // INITIALIZING_PROFILE_SCAN...
          </h2>
          
          <div className="space-y-2 text-xs text-zinc-400 font-sans tracking-wide">
            <p className="font-mono text-zinc-500 text-[10px] tracking-wider">// SYSTEM_OS READY</p>
            <p className="mt-4">Don't worry — I'm just getting to know you.</p>
            <p>This won't take long. 😊</p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="w-24 bg-zinc-950 h-1 rounded-full overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full bg-[#00ffff] animate-[scan_2.5s_linear_infinite]" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes scan {
            0% { left: -40%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-screen bg-[#0a0a0a] text-white overflow-hidden flex items-center justify-center font-mono selection:bg-[#dc2626] selection:text-white select-none">
      {/* Background elements */}
      <div className="fixed inset-0 comic-grid opacity-[0.06] pointer-events-none z-1" />
      <div className="fixed inset-0 pointer-events-none z-20 opacity-[0.02] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_20px] animate-scanline" />

      <AnimatePresence mode="wait">
        {step > 0 && (
          <motion.div
            key="onboarding-split"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col md:flex-row w-full max-w-5xl bg-[#050505] border border-zinc-900 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.15)] min-h-[580px] z-10 m-4 relative"
          >
            {/* LEFT PANEL: visual brand side (hidden on mobile) */}
            <div className="hidden md:flex md:w-[45%] lg:w-[48%] bg-[#080808] border-r border-zinc-900 p-10 flex-col justify-between relative overflow-hidden select-none">
              {/* Subtle pattern background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              
              {/* Step indicator */}
              <div className="z-10 font-mono text-[9px] text-[#00ffff] tracking-[0.35em] uppercase opacity-80">
                // STEP_0{step} OF 03
              </div>

              {/* Dynamic SVG Illustration per step */}
              <div className="z-10 flex-1 flex items-center justify-center my-6">
                <div className="w-[220px] h-[220px] lg:w-[260px] lg:h-[260px] flex items-center justify-center">
                  {step === 1 && <SwingIllustration />}
                  {step === 2 && <RippleIllustration />}
                  {step === 3 && <MapIllustration />}
                </div>
              </div>

              {/* Motivational themed bottom labels */}
              <div className="z-10 font-sans text-xs text-zinc-500 leading-relaxed px-2">
                {step === 1 && "We need to register your entity inside the system database to allocate resource credentials."}
                {step === 2 && "Categorizing your clearance level helps tailor the interface modules to your specific requirements."}
                {step === 3 && "Tracing the transmission origin logs spatial telemetry points to enhance network routing."}
              </div>
            </div>

            {/* RIGHT PANEL: form action side */}
            <div className="flex-1 p-8 md:p-12 bg-[#050505] flex flex-col justify-between">
              
              <div>
                {/* Red Glowing Progress Bar */}
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mb-8">
                  <div 
                    className="bg-[#dc2626] h-full shadow-[0_0_10px_#dc2626] transition-all duration-500 ease-out" 
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>

                {/* Form Heading in code style */}
                <div className="mb-8">
                  <span className="font-mono text-[9px] text-[#00ffff] tracking-[0.25em] block mb-1 uppercase">// ONBOARDING_SEQUENCE</span>
                  <h2 className="text-lg font-mono text-white tracking-[0.15em] uppercase font-bold">
                    {step === 1 && "// IDENTIFY_YOURSELF"}
                    {step === 2 && "// STATE_PURPOSE"}
                    {step === 3 && "// TRACE_ORIGIN"}
                  </h2>
                </div>

                {/* Errors display */}
                {errors.submit && (
                  <div className="mb-6 bg-red-950/20 border border-[#dc2626]/30 rounded-xl p-3 text-xs text-[#dc2626] font-mono text-center">
                    {errors.submit}
                  </div>
                )}

                {/* Fields Forms Container */}
                <div className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">// FULL_NAME</label>
                        <input
                          type="text"
                          value={fullName}
                          onClick={playClick}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            setErrors({ ...errors, fullName: null });
                          }}
                          placeholder="ENTER FULL NAME"
                          className="w-full bg-[#0a0a0a] border border-zinc-850 text-white font-mono text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#dc2626]/40 focus:shadow-[0_0_12px_rgba(220,38,38,0.15)] transition-all uppercase placeholder-zinc-700"
                        />
                        {errors.fullName && <p className="text-[10px] text-[#dc2626] font-mono mt-1.5">✕ {errors.fullName}</p>}
                      </div>
                      
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">// CONTACT_NUMBER</label>
                        <div className="flex gap-2.5">
                          <select
                            value={countryCode}
                            onClick={playClick}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-[#0a0a0a] border border-zinc-850 text-white font-mono text-xs rounded-xl px-3 py-3.5 focus:outline-none focus:border-[#dc2626]/40 cursor-pointer"
                          >
                            {countryCodes.map((item) => (
                              <option key={item.code} value={item.code} className="bg-[#0a0a0a] text-white">
                                {item.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={phoneNo}
                            onClick={playClick}
                            onChange={(e) => {
                              setPhoneNo(e.target.value);
                              setErrors({ ...errors, phoneNo: null });
                            }}
                            placeholder="MOBILE TELEPHONY"
                            className="flex-1 bg-[#0a0a0a] border border-zinc-850 text-white font-mono text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#dc2626]/40 focus:shadow-[0_0_12px_rgba(220,38,38,0.15)] transition-all placeholder-zinc-700"
                          />
                        </div>
                        {errors.phoneNo && <p className="text-[10px] text-[#dc2626] font-mono mt-1.5">✕ {errors.phoneNo}</p>}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">// SPECIFY_OBJECTIVE</label>
                        <select
                          value={visitReason}
                          onClick={playClick}
                          onChange={(e) => {
                            setVisitReason(e.target.value);
                            setReferrerName('');
                            setErrors({ ...errors, visitReason: null });
                          }}
                          className="w-full bg-[#0a0a0a] border border-zinc-850 text-white font-mono text-xs rounded-xl p-3.5 focus:outline-none focus:border-[#dc2626]/40 cursor-pointer"
                        >
                          <option value="" disabled className="text-zinc-600">CHOOSE OBJECTIVE</option>
                          {visitReasons.map((reason) => (
                            <option key={reason} value={reason} className="bg-[#0a0a0a] text-white uppercase">{reason}</option>
                          ))}
                        </select>
                        {errors.visitReason && <p className="text-[10px] text-[#dc2626] font-mono mt-1.5">✕ {errors.visitReason}</p>}
                      </div>

                      {visitReason === 'Referred by someone' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                          <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">// REFERRER_IDENTITY</label>
                          <input
                            type="text"
                            value={referrerName}
                            onClick={playClick}
                            onChange={(e) => {
                              setReferrerName(e.target.value);
                              setErrors({ ...errors, referrerName: null });
                            }}
                            placeholder="NAME OF FRIEND"
                            className="w-full bg-[#0a0a0a] border border-zinc-850 text-white font-mono text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#dc2626]/40 focus:shadow-[0_0_12px_rgba(220,38,38,0.15)] transition-all uppercase placeholder-zinc-700"
                          />
                          {errors.referrerName && <p className="text-[10px] text-[#dc2626] font-mono mt-1.5">✕ {errors.referrerName}</p>}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-3">// REFERENCE_CHANNELS</label>
                        <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                          {findSources.map((source) => {
                            const isSelected = selectedSources.includes(source.id);
                            return (
                              <button
                                key={source.id}
                                type="button"
                                onClick={() => handleSourceSelect(source.id)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-[11px] text-left transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'border-[#dc2626] bg-[#dc2626]/10 text-white font-bold shadow-[0_0_12px_rgba(220,38,38,0.15)]'
                                    : 'border-zinc-900 bg-[#0a0a0a] hover:border-zinc-850 text-zinc-500 hover:text-white'
                                }`}
                              >
                                <span>{source.label.toUpperCase()}</span>
                                {isSelected && <span className="text-[#dc2626]">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                        {errors.findSource && <p className="text-[10px] text-[#dc2626] font-mono mt-2">✕ {errors.findSource}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center gap-4 mt-8 border-t border-zinc-900 pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="bg-[#0a0a0a] border border-zinc-900 text-zinc-500 hover:text-white px-6 py-3.5 rounded-xl hover:border-zinc-800 transition-all font-mono text-xs cursor-pointer tracking-wider"
                  >
                    ← BACK
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className={`flex-grow font-mono text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-900 cursor-pointer ${
                      isStepValid()
                        ? 'bg-[#dc2626] text-white hover:bg-[#b91c1c] border-[#dc2626] hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:scale-[1.01]'
                        : 'bg-zinc-950 text-zinc-600 cursor-not-allowed border-zinc-900'
                    }`}
                  >
                    PROCEED →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isStepValid()}
                    className={`flex-grow font-mono text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-900 cursor-pointer ${
                      !isSubmitting && isStepValid()
                        ? 'bg-[#dc2626] text-white hover:bg-[#b91c1c] border-[#dc2626] hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:scale-[1.01]'
                        : 'bg-zinc-950 text-zinc-600 cursor-not-allowed border-zinc-900'
                    }`}
                  >
                    {isSubmitting ? "COMPLETING SEQUENCE..." : "PROCEED →"}
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
