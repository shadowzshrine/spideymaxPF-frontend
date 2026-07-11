"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LogIn, Info } from 'lucide-react';
import InfoModal from './InfoModal.jsx';
import { LoginTransitionProvider, useLoginTransition } from './LoginTransition.jsx';
import ProjectModal from './ProjectModal';
import ResumeModal from './ResumeModal';
import ComposeModal from './ComposeModal.jsx';
import AIAssistant from './AIAssistant.jsx';
import LoginPromptModal from './LoginPromptModal.jsx';
import useAuthAction from '../hooks/useAuthAction.js';
import LogoutOverlay from './LogoutOverlay.jsx';
import useLogout from '../hooks/useLogout.js';
import useSessionTracker from '../hooks/useSessionTracker.js';
import { playClick, playHover, playWebSling, playPopupOpen, playScrollTick, startLoopingSFX, stopLoopingSFX, speakWelcome, speakGuestExit, initAudio } from '@/utils/audio';

// Custom SVG Icons to avoid package export issues
const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Typewriter Component for Hero Section
function Typewriter({ words }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  useEffect(() => {
    if (!words || words.length === 0) return;
    if (index >= words.length) return;

    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    if (!isDeleting && subIndex === words[index].length + 1) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, index, words]);

  if (!words || words.length === 0) return null;

  return (
    <span className="font-mono text-spidey-blue-glow font-bold tracking-widest text-lg md:text-2xl neon-text-blue uppercase">
      {words[index].substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity text-white`}>|</span>
    </span>
  );
}

function AppOverlayContent({ portfolioData }) {
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const { navigateToLogin } = useLoginTransition();
  const [isGuest, setIsGuest] = useState(true);
  const isEditorRef = useRef(false);

  const handleGuestLoginRedirect = () => {
    startLoopingSFX('loading');
    speakGuestExit();
    navigateToLogin();
  };
  const { requireAuth, loginPromptProps } = useAuthAction(currentUser);
  const [selectedProject, setSelectedProject] = useState(null);
  const [guestTooltipId, setGuestTooltipId] = useState(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sendingState, setSendingState] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  // Modals state
  const {
    initiateLogout,
    confirmLogout,
    cancelLogout,
    showConfirm: isLogoutConfirmOpen,
    isLoggingOut,
    progress,
    statusText
  } = useLogout(router);

  // Initialize session tracker hook
  const {
    isIdleModalOpen,
    idleCountdown,
    keepActive,
    onSectionEnter,
    saveSession
  } = useSessionTracker(() => {
    // Auto-logout callback
    confirmLogout(() => {
      setCurrentUser(null);
      setIsGuest(true);
    });
  });

  // Intercept manual logout to save session logs
  const handleManualLogout = () => {
    saveSession('logout');
    confirmLogout(() => {
      setCurrentUser(null);
      setIsGuest(true);
    });
  };

  // Setup Intersection Observer for portfolio sections view durations
  useEffect(() => {
    const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.35
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onSectionEnter(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [onSectionEnter]);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileMobileNumber, setProfileMobileNumber] = useState('');
  const [profileError, setProfileError] = useState(null);

  // Pre-warm the audio context and handle browser autoplay unlock on mount
  useEffect(() => {
    initAudio(); // Attempt immediately on mount

    const unlockOnFirstInteraction = () => {
      initAudio();
      if (typeof window !== 'undefined' && !window.welcomeSpoken) {
        speakWelcome(isEditorRef.current);
      }
    };

    window.addEventListener('pointerdown', unlockOnFirstInteraction, { once: true });
    window.addEventListener('keydown', unlockOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockOnFirstInteraction);
      window.removeEventListener('keydown', unlockOnFirstInteraction);
    };
  }, []);

  // Fetch session status on mount
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const userObj = data.success && data.user ? data.user : null;
        const isGuestUser = data.success ? (data.isGuest || false) : true;

        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsGuest(isGuestUser);
        }
        
        // Stop pulse loading sound immediately
        stopLoopingSFX();

        // Play Welcome Speech (dynamically welcomes Admin Editor vs standard users)
        const isEditor = userObj && userObj.role === 'admin' && userObj.adminMode === 'editor';
        isEditorRef.current = isEditor;
        speakWelcome(isEditor);
      })
      .catch(err => {
        console.warn('[Overlay] Auth check failed:', err.message || err);
        stopLoopingSFX();
        speakWelcome(false);
      });
  }, []);

  // Prevent back navigation to login page when authenticated
  useEffect(() => {
    if (currentUser && !isGuest) {
      window.history.replaceState(null, '', '/');
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [currentUser, isGuest]);
  const handleLogout = () => {
    router.push('/login');
  };
  const [lastDraft, setLastDraft] = useState({ subject: '', htmlBody: '', files: [] });

  const handleSendMessage = async (subject, htmlBody, files) => {
    setLastDraft({ subject, htmlBody, files });
    setSendingState('sending');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', htmlBody);
      formData.append('senderEmail', currentUser?.email || 'guest@maxpf.local');
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch(`${apiUrl}/api/contact/send`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendingState('sent');
        setIsComposeOpen(false);
        setTimeout(() => {
          setSendingState(null);
        }, 2000);
      } else {
        alert(data.message || 'Transmitter encountered an error.');
        setSendingState('failed');
      }
    } catch (err) {
      console.warn('[Contact] Error sending message:', err.message || err);
      alert('Transmission failed. Server is currently unreachable.');
      setSendingState('failed');
    }
  };

  // Scroll tick audio effect
  useEffect(() => {
    const handleScroll = () => {
      playScrollTick();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCardClick = (proj, idx) => {
    playWebSling();
    playPopupOpen();
    setSelectedProject(proj);
  };

  // Destructure data with fallbacks
  const profile = portfolioData?.profile || { name: 'MAGESHWARAN S', roles: [], bio: '' };
  const experiences = portfolioData?.experiences || [];
  const skills = portfolioData?.skills || [];
  const projects = portfolioData?.projects || [];
  const contact = portfolioData?.contact || { phone: '', location: '', email: '', github: '', linkedin: '' };

  const defaultRoles = ["Fresher", "Aspiring Developer", "Multimedia Designer", "FullStack Developer", "AI Agent Trainer"];
  const roles = profile.roles && profile.roles.length > 0 ? profile.roles : defaultRoles;

  // Process stats to inject calculated AGE dynamically if D.O.B is present
  const statsToRender = React.useMemo(() => {
    if (!profile.stats) return [];
    const dobStat = profile.stats.find(s => s.label === 'D.O.B' || s.label === 'DOB');
    const hasAge = profile.stats.some(s => s.label === 'AGE');
    
    if (dobStat && !hasAge) {
      const birthDate = new Date(dobStat.value);
      let calculatedAge = 21; // Default fallback
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
      }
      
      const index = profile.stats.indexOf(dobStat);
      const newStats = [...profile.stats];
      newStats.splice(index + 1, 0, { label: 'AGE', value: String(calculatedAge) });
      return newStats;
    }
    
    return profile.stats;
  }, [profile.stats]);

  // Filter skills by category
  const frontendSkills = skills.filter(s => s.category === 'FRONTEND_SYSTEMS');
  const backendSkills = skills.filter(s => s.category === 'BACKEND_INTEGRATIONS');
  const mobileSkills = skills.filter(s => s.category === 'MOBILE_ARCHITECTURES');
  const workflowSkills = skills.filter(s => s.category === 'WORKFLOW_AND_DESIGN');

  const showInfoButton = !(currentUser && currentUser.role === 'admin' && currentUser.adminMode === 'editor');

  return (
    <div id="scroll-container" className="relative w-full h-[500vh] z-10 pointer-events-none">
      
      {/* Floating HUD Info Button */}
      {showInfoButton && (
        <button
          onClick={() => {
            playClick();
            playPopupOpen();
            setIsInfoModalOpen(true);
          }}
          className="fixed top-6 left-6 z-50 pointer-events-auto p-2 bg-[#0a0a0f]/90 backdrop-blur-md border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-spidey-red hover:shadow-[0_0_15px_rgba(229,9,20,0.25)] transition-all cursor-pointer flex items-center justify-center w-9 h-9 shadow-lg"
          title="System Information"
        >
          <Info className="w-4 h-4" />
        </button>
      )}
      


      {/* Floating HUD User Profile & Logout */}
      {currentUser && !isGuest && (
        <div className="fixed top-6 right-6 z-50 pointer-events-auto flex items-center gap-3 bg-[#0a0a0f]/90 backdrop-blur-md border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono select-none shadow-[0_0_15px_rgba(229,9,20,0.12)] animate-fade-in">
          <div 
            className="flex flex-col items-end text-right cursor-pointer group"
            onClick={() => {
              playClick();
              setProfileDisplayName(currentUser.name || '');
              setProfileMobileNumber(currentUser.mobileNumber || '');
              setIsProfileEditOpen(true);
            }}
          >
            <span className="text-white font-bold max-w-[120px] truncate leading-tight group-hover:text-spidey-red transition-colors">{currentUser.name}</span>
            <span className={`text-[8px] uppercase tracking-wider leading-none mt-0.5 ${currentUser.role === 'admin' ? 'text-spidey-red font-bold animate-pulse' : 'text-zinc-500'}`}>
              // {currentUser.role}
            </span>
          </div>
          <div
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              playClick();
              setProfileDisplayName(currentUser.name || '');
              setProfileMobileNumber(currentUser.mobileNumber || '');
              setIsProfileEditOpen(true);
            }}
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-800 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 font-bold uppercase">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
            )}
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-1" />
          <button
            onClick={initiateLogout}
            className="p-1.5 rounded-lg border border-zinc-800 hover:border-spidey-red text-zinc-400 hover:text-white bg-[#050508]/85 hover:shadow-[0_0_10px_rgba(229,9,20,0.25)] transition-all cursor-pointer flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating HUD Login for Guests / Unauthenticated Users */}
      {(!currentUser || isGuest) && (
        <div className="fixed top-6 right-6 z-50 pointer-events-auto flex items-center gap-3 bg-[#0a0a0f]/90 backdrop-blur-md border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono select-none shadow-[0_0_15px_rgba(0,168,255,0.08)] animate-fade-in">
          <div className="flex flex-col items-end text-right">
            <span className="text-zinc-400 font-bold leading-tight">Guest Profile</span>
            <span className="text-[8px] text-zinc-500 uppercase tracking-wider leading-none mt-0.5">// read-only</span>
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-1" />
          <button
            onClick={handleGuestLoginRedirect}
            className="p-1.5 rounded-lg border border-zinc-800 hover:border-spidey-blue-glow text-zinc-400 hover:text-white bg-[#050508]/85 hover:shadow-[0_0_10px_rgba(0,168,255,0.25)] transition-all cursor-pointer flex items-center justify-center"
            title="Log In"
          >
            <LogIn className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SECTION 1: HERO */}
      <section id="hero" className="h-screen w-full flex flex-col justify-center items-center relative px-6 md:px-12 select-none text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pointer-events-auto bg-[#050505]/40 backdrop-blur-[2px] p-8 rounded-2xl border border-zinc-900/60 max-w-2xl"
        >
          <span className="text-zinc-500 font-mono tracking-widest text-[10px] md:text-xs block mb-3 uppercase">
            // COMPILING PROFILE_DATA
          </span>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-heading text-white tracking-tighter spidey-heading leading-none mb-4">
            {profile.name}
          </h1>

          <div className="h-8 md:h-12 flex items-center justify-center mb-4">
            <Typewriter words={roles} />
          </div>

          <p className="font-mono text-zinc-400 text-xs md:text-sm max-w-md mx-auto mb-6 leading-relaxed">
            "{profile.subtitle}"
          </p>

          <div className="flex gap-4 justify-center">
            <a
              href="#scroll-to-about"
              onClick={(e) => {
                playWebSling();
                playPopupOpen();
                e.preventDefault();
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: 'smooth'
                });
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg border border-red-500/30 neon-border-red hover:scale-105 active:scale-95 transition-transform"
            >
              INITIATE SEQUENCE
            </a>
          </div>
        </motion.div>

        {/* Scroll Cue */}
        <div className="absolute bottom-10 flex flex-col items-center">
          <span className="font-mono text-[9px] text-zinc-600 tracking-widest mb-2 uppercase">
            SCROLL DOWN // PULL WEB
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-zinc-800 flex justify-center pt-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-spidey-red-glow" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: ABOUT ME */}
      <section id="about" className="h-screen w-full flex items-center justify-center py-20 px-6 md:px-12 select-text relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-auto w-full max-w-5xl max-h-[85vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 md:p-8 neon-border-red-subtle card-grid scrollbar-thin"
        >
          {/* Column 1: Terminal Console & Stats */}
          <div className="flex flex-col space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-spidey-red neon-border-red" />
                <span className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest">// DECODE: SYSTEM_PROFILE</span>
              </div>
              <h2 className="text-3xl font-heading text-white spidey-heading text-spidey-red neon-text-red">
                02 // ABOUT ME
              </h2>
            </div>

            {/* Profile Bio */}
            <div className="bg-[#050505]/90 border border-zinc-800 rounded-lg p-5 font-mono text-xs text-zinc-300 leading-relaxed relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
              <p className="mb-4">
                <span className="text-spidey-red">&gt; NAME:</span> {profile.name}<br />
                <span className="text-spidey-red">&gt; SUBJECT:</span> {profile.roles ? profile.roles[3] || 'FullStack Developer' : 'FullStack Developer'}
              </p>
              <p className="text-zinc-400">
                {profile.bio}
              </p>
            </div>

            {/* Core Stats */}
            <div className="bg-[#050505]/60 border border-zinc-900 rounded-lg p-5">
              <h3 className="font-mono text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                CORE_ATTRIBUTES
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-mono text-xs">
                {statsToRender && statsToRender.map((stat, idx) => (
                  <div key={idx}>
                    <span className="text-zinc-500 block">{stat.label}:</span>
                    {stat.label === 'GITHUB' ? (
                      <button
                        onClick={() => requireAuth(
                          () => window.open(`https://github.com/${stat.value}`, '_blank'),
                          'Login to visit GitHub profile'
                        )}
                        title={isGuest ? 'Login required' : 'View GitHub profile'}
                        className={`font-semibold transition-colors flex items-center gap-1 ${
                          isGuest
                            ? 'text-zinc-500 opacity-70 cursor-default'
                            : 'text-zinc-200 hover:text-spidey-red underline cursor-pointer'
                        }`}
                      >
                        {isGuest && <span className="text-[9px]">🔒</span>}
                        {stat.value}
                      </button>
                    ) : (
                      <span className={stat.value === 'AVAILABLE' ? 'text-spidey-blue-glow neon-text-blue font-bold' : 'text-zinc-200'}>
                        {stat.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Chronological Missions Log */}
          <div className="flex flex-col space-y-4 max-h-[60vh] md:max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin">
            <h3 className="font-mono text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 border-b border-zinc-800 pb-2 flex justify-between items-center">
              <span>MISSIONS_LOG (TIMELINE)</span>
              <span className="text-[9px] text-zinc-600">// CHRONOLOGICAL</span>
            </h3>

            <div className="relative border-l border-zinc-800 pl-4 ml-2 space-y-6">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${exp.type === 'INTERNSHIP' ? 'bg-spidey-red neon-border-red' : 'bg-spidey-blue-glow neon-border-blue'}`} />
                  
                  <span className="font-mono text-[9px] text-zinc-500 block uppercase">
                    {exp.dateRange} // {exp.type}
                  </span>
                  <h4 className="font-heading text-sm text-white uppercase font-bold tracking-tight">
                    {exp.title}
                  </h4>
                  <span className="font-mono text-[10px] text-spidey-blue-glow block mb-1">
                    {exp.company}
                  </span>
                  <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: SKILLS & ARSENAL */}
      <section id="skills" className="h-screen w-full flex items-center justify-center py-20 px-6 md:px-12 select-text relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-auto w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 md:p-8 neon-border-blue card-grid scrollbar-thin"
        >
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-spidey-blue-glow neon-border-blue" />
              <span className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest">// ARSENAL_DECRYPT: SKILLS_DATABASE</span>
            </div>
            <h2 className="text-3xl font-heading text-white spidey-heading text-spidey-blue-glow neon-text-blue">
              03 // CORE SKILLS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category 1: Frontend */}
            <div className="bg-[#050505]/80 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
              <h3 className="font-mono text-spidey-blue-glow font-bold text-xs uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                FRONTEND_SYSTEMS
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {frontendSkills.map((skill, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>{skill.name}</span>
                      <span className="text-spidey-blue-glow">{skill.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-spidey-blue-glow to-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2: Backend */}
            <div className="bg-[#050505]/80 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
              <h3 className="font-mono text-spidey-red font-bold text-xs uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                BACKEND_INTEGRATIONS
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {backendSkills.map((skill, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>{skill.name}</span>
                      <span className="text-spidey-red">{skill.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-spidey-red to-spidey-red-glow"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 3: Mobile Development */}
            <div className="bg-[#050505]/80 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
              <h3 className="font-mono text-spidey-red font-bold text-xs uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                MOBILE_ARCHITECTURES
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {mobileSkills.map((skill, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>{skill.name}</span>
                      <span className="text-spidey-red">{skill.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-spidey-red to-spidey-red-glow"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 4: Tools & Design */}
            <div className="bg-[#050505]/80 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
              <h3 className="font-mono text-spidey-blue-glow font-bold text-xs uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                WORKFLOW_AND_DESIGN
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {workflowSkills.map((skill, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>{skill.name}</span>
                      <span className="text-spidey-blue-glow">{skill.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-spidey-blue-glow to-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* SECTION 4: PROJECTS & MISSIONS */}
      <section id="projects" className="h-screen w-full flex items-center justify-center py-20 px-6 md:px-12 select-text relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-auto w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 md:p-8 neon-border-red card-grid scrollbar-thin"
        >
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-spidey-red neon-border-red" />
              <span className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest">// MISSIONS: COMPLETED_OPERATIONS</span>
            </div>
            <h2 className="text-3xl font-heading text-white spidey-heading text-spidey-red neon-text-red">
              04 // PROJECTS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj, idx) => (
              <div 
                key={idx} 
                onMouseEnter={playHover}
                onClick={() => handleCardClick(proj, idx)}
                className={`bg-[#050505]/80 border border-zinc-900 rounded-xl p-5 hover:border-${idx % 2 === 0 ? 'spidey-red' : 'spidey-blue-glow'}/50 hover:shadow-[0_0_15px_rgba(${idx % 2 === 0 ? '229,9,20' : '0,168,255'},0.15)] transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden pointer-events-auto`}
              >
                {guestTooltipId === idx && (
                  <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-spidey-red text-spidey-red font-mono text-xs z-20 animate-fade-in pointer-events-none">
                    <span>Login to view live preview — it's free!</span>
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`font-mono text-[9px] ${idx % 2 === 0 ? 'text-spidey-red bg-spidey-red/10' : 'text-spidey-blue-glow bg-spidey-blue/30'} px-2 py-0.5 rounded uppercase tracking-wider`}>
                      {proj.mission} // ACTIVE
                    </span>
                    <span className="font-mono text-[9px] text-zinc-600">CLASS: {proj.class}</span>
                  </div>
                  <h3 className="font-heading text-lg text-white font-bold tracking-tight uppercase mb-1">
                    {proj.title}
                  </h3>
                  <h4 className="font-mono text-zinc-400 text-xs mb-3 font-semibold">
                    {proj.subtitle}
                  </h4>
                  <p className="font-mono text-[11px] text-zinc-400 leading-relaxed mb-4">
                    {proj.description}
                  </p>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(proj.techStack || proj.skills || []).map((tag, tIdx) => (
                      <span key={`${tag}-${tIdx}`} className="font-mono text-[9px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-end font-mono text-xs border-t border-zinc-900 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requireAuth(
                          () => window.open(proj.githubLink || proj.githubUrl, '_blank'),
                          'Login to inspect the repository'
                        );
                      }}
                      title={isGuest ? 'Login required' : 'View repository'}
                      className={`flex items-center gap-1.5 transition-colors ${
                        isGuest
                          ? 'text-zinc-600 opacity-70 cursor-default'
                          : 'text-zinc-500 hover:text-white cursor-pointer'
                      }`}
                    >
                      {isGuest && <span className="text-[9px]">🔒</span>}
                      <Github className="w-3.5 h-3.5" /> CODE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 5: CONTACT HUB */}
      <section id="contact" className="h-screen w-full flex items-center justify-center py-20 px-6 select-text relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-auto w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 md:p-8 neon-border-red card-grid text-center scrollbar-thin"
        >
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest">// CONNECT: CORE_LINK_ESTABLISHED</span>
            </div>
            <h2 className="text-3xl font-heading text-white spidey-heading uppercase">
              05 // CONTACT HUB
            </h2>
            <p className="font-mono text-zinc-400 text-xs mt-2">
              "{contact.subtitle}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-mono text-xs text-left">
            
            <div className="bg-[#050505]/75 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-zinc-600 block mb-1 uppercase tracking-wider">// COMMS</span>
                <span className="text-white font-bold block mb-2">Call Direct</span>
              </div>
              <button
                onClick={() => requireAuth(
                  () => window.open(`tel:${contact.phone}`),
                  'Login to view contact number'
                )}
                title={isGuest ? 'Login required' : 'Call direct'}
                className={`font-semibold transition-colors ${
                  isGuest
                    ? 'text-zinc-500 opacity-70 cursor-default flex items-center gap-1'
                    : 'text-spidey-red hover:text-spidey-red-glow cursor-pointer'
                }`}
              >
                {isGuest && <span className="text-[9px]">🔒</span>}
                {contact.phone}
              </button>
            </div>

            <div className="bg-[#050505]/75 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-zinc-600 block mb-1 uppercase tracking-wider">// BASE_LOC</span>
                <span className="text-white font-bold block mb-2">Location</span>
              </div>
              <span className="text-zinc-400">
                {contact.location}
              </span>
            </div>

            <div className="bg-[#050505]/75 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-zinc-600 block mb-1 uppercase tracking-wider">// SECURE_MAIL</span>
                <span className="text-white font-bold block mb-2">Email Address</span>
              </div>
              <button
                onClick={() => requireAuth(
                  () => window.open(`mailto:${contact.email}`),
                  'Login to view email address'
                )}
                title={isGuest ? 'Login required' : 'Send email'}
                className={`font-semibold transition-colors truncate block ${
                  isGuest
                    ? 'text-zinc-500 opacity-70 cursor-default flex items-center gap-1'
                    : 'text-spidey-blue-glow hover:underline cursor-pointer'
                }`}
              >
                {isGuest && <span className="text-[9px]">🔒</span>}
                {contact.email}
              </button>
            </div>

          </div>

          <div className="flex justify-center gap-6 mb-8">
            <button
              onClick={() => {
                playClick();
                requireAuth(
                  () => window.open(`https://github.com/${contact.github}`, '_blank'),
                  'Login to visit GitHub profile'
                );
              }}
              title={isGuest ? 'Login required' : 'GitHub Profile'}
              className={`w-10 h-10 rounded-full border border-zinc-800 bg-[#050505] flex items-center justify-center transition-all relative ${
                isGuest
                  ? 'text-zinc-600 opacity-60 cursor-default'
                  : 'text-zinc-400 hover:text-white hover:border-spidey-red hover:shadow-[0_0_10px_rgba(229,9,20,0.4)] cursor-pointer'
              }`}
            >
              {isGuest && <span className="absolute -top-1 -right-1 text-[8px]">🔒</span>}
              <Github className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                playClick();
                requireAuth(
                  () => window.open(`https://linkedin.com/in/${contact.linkedin}`, '_blank'),
                  'Login to visit LinkedIn profile'
                );
              }}
              title={isGuest ? 'Login required' : 'LinkedIn Profile'}
              className={`w-10 h-10 rounded-full border border-zinc-800 bg-[#050505] flex items-center justify-center transition-all relative ${
                isGuest
                  ? 'text-zinc-600 opacity-60 cursor-default'
                  : 'text-zinc-400 hover:text-white hover:border-spidey-blue-glow hover:shadow-[0_0_10px_rgba(0,168,255,0.4)] cursor-pointer'
              }`}
            >
              {isGuest && <span className="absolute -top-1 -right-1 text-[8px]">🔒</span>}
              <Linkedin className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 border-t border-zinc-900">
            <button
              onClick={() => {
                playClick();
                requireAuth(
                  () => {
                    playWebSling();
                    playPopupOpen();
                    setIsComposeOpen(true);
                  },
                  'Login to send a direct transmission'
                );
              }}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg border border-red-500/30 neon-border-red hover:scale-105 active:scale-95 transition-transform cursor-pointer pointer-events-auto"
            >
              Send Message
            </button>
            <button
              onClick={() => {
                playClick();
                requireAuth(
                  () => {
                    playWebSling();
                    playPopupOpen();
                    setIsResumeOpen(true);
                  },
                  'Login to download resume',
                  '// ACCESS_DENIED'
                );
              }}
              title={isGuest ? 'Login required' : 'Download CV'}
              className={`w-full sm:w-auto px-8 py-3 font-mono text-xs font-bold tracking-widest uppercase rounded-lg border transition-all text-center pointer-events-auto flex items-center justify-center gap-2 ${
                isGuest
                  ? 'bg-zinc-950 text-zinc-600 border-zinc-900 opacity-70 cursor-default'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-600 hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              {isGuest && <span className="text-xs">🔒</span>}
              Download CV
            </button>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            isGuest={isGuest}
            onAuthenticate={navigateToLogin}
            onClose={() => setSelectedProject(null)}
          />
        )}
        {isResumeOpen && (
          <ResumeModal 
            key="resume-modal"
            contact={contact}
            onClose={() => setIsResumeOpen(false)}
          />
        )}
        {isComposeOpen && (
          <ComposeModal 
            key="compose-modal"
            currentUser={currentUser}
            onClose={() => setIsComposeOpen(false)}
            onSend={handleSendMessage}
          />
        )}
        {sendingState && (
          <motion.div
            key="sending-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-full h-full z-[100] bg-[#050505]/95 flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="absolute inset-0 comic-grid opacity-30 pointer-events-none" />

            <div className="text-center z-10 select-none">
              {sendingState === 'sending' && (
                <>
                  <div className="relative mb-8 w-24 h-24 flex items-center justify-center mx-auto">
                    <motion.div
                      className="absolute w-20 h-20 rounded-full border-2 border-dashed border-spidey-red"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute w-14 h-14 rounded-full border border-dotted border-spidey-blue-glow"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
                    />
                    <div className="w-6 h-6 rounded-full bg-spidey-red neon-border-red animate-pulse" />
                  </div>
                  <span className="text-zinc-500 font-mono tracking-widest text-xs md:text-sm block uppercase animate-pulse">
                    // TRANSMITTING DATA...
                  </span>
                </>
              )}
              {sendingState === 'sent' && (
                <>
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-6 text-green-500 text-2xl font-bold"
                  >
                    ✓
                  </motion.div>
                  <span className="text-green-500 font-mono tracking-widest text-xs md:text-sm block uppercase font-bold">
                    // MESSAGE DELIVERED
                  </span>
                </>
              )}
              {sendingState === 'failed' && (
                <>
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full border-2 border-spidey-red flex items-center justify-center mx-auto mb-6 text-spidey-red font-bold text-2xl"
                  >
                    ✕
                  </motion.div>
                  <span className="text-spidey-red font-mono tracking-widest text-xs md:text-sm block uppercase font-bold mb-6 animate-pulse">
                    // TRANSMISSION FAILED — RETRY?
                  </span>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleSendMessage(lastDraft.subject, lastDraft.htmlBody, lastDraft.files)}
                      className="px-6 py-2 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-bold rounded font-mono text-xs transition-colors cursor-pointer pointer-events-auto shadow-[0_0_10px_rgba(229,9,20,0.3)] hover:scale-105"
                    >
                      RETRY TRANSMISSION
                    </button>
                    <button
                      onClick={() => setSendingState(null)}
                      className="px-6 py-2 bg-zinc-900 border border-zinc-700 hover:border-spidey-red text-zinc-300 hover:text-white rounded font-mono text-xs transition-colors cursor-pointer pointer-events-auto"
                    >
                      CANCEL
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* FIX 5: User Profile Edit modal */}
        {isProfileEditOpen && (
          <div className="fixed inset-0 w-full h-full z-[11000] bg-black/85 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <div className="w-full max-w-sm p-6 bg-[#0a0a0f] border border-zinc-800 rounded-xl shadow-[0_0_25px_rgba(229,9,20,0.15)] font-mono text-xs">
              <h2 className="text-sm font-bold text-white tracking-[0.2em] mb-6 uppercase font-bold text-center border-b border-zinc-900 pb-3">
                // EDIT PROFILE
              </h2>
              
              {profileError && (
                <div className="mb-4 text-[#dc2626] uppercase tracking-wider text-[10px] text-center">
                  ✕ {profileError}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-zinc-500 uppercase tracking-wider mb-2">// DISPLAY_NAME</label>
                  <input
                    type="text"
                    value={profileDisplayName}
                    onChange={(e) => setProfileDisplayName(e.target.value)}
                    placeholder="ENTER DISPLAY NAME"
                    className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-spidey-red/50 transition-colors uppercase placeholder-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase tracking-wider mb-2">// MOBILE_NUMBER</label>
                  <input
                    type="text"
                    value={profileMobileNumber}
                    onChange={(e) => setProfileMobileNumber(e.target.value)}
                    placeholder="ENTER CONTACT NUMBER"
                    className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-spidey-red/50 transition-colors placeholder-zinc-800"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    playClick();
                    if (!profileDisplayName.trim() || !profileMobileNumber.trim()) {
                      setProfileError('All fields are required');
                      return;
                    }
                    setProfileError(null);
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                      const res = await fetch(`${apiUrl}/api/users/profile`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          displayName: profileDisplayName,
                          mobileNumber: profileMobileNumber
                        }),
                        credentials: 'include'
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setCurrentUser(prev => ({
                          ...prev,
                          name: data.user.name,
                          mobileNumber: data.user.mobileNumber
                        }));
                        setIsProfileEditOpen(false);
                      } else {
                        setProfileError(data.message || 'Update failed');
                      }
                    } catch (err) {
                      console.warn('[Profile Update] Error:', err.message || err);
                      setProfileError('Server is currently unreachable');
                    }
                  }}
                  className="flex-grow px-4 py-2.5 bg-spidey-red hover:bg-[#b91c1c] text-white font-bold tracking-wider uppercase rounded-lg shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  SAVE
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setIsProfileEditOpen(false);
                    setProfileError(null);
                  }}
                  className="flex-grow px-4 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white tracking-wider uppercase rounded-lg hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Telemetry and System Info Modal */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <InfoModal
            isOpen={isInfoModalOpen}
            isGuest={isGuest}
            onClose={() => setIsInfoModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Global guest auth prompt modal (all restricted actions) */}
      <LoginPromptModal {...loginPromptProps} />

      {!isLogoutConfirmOpen && (
        <AIAssistant />
      )}

      <LogoutOverlay
        showConfirm={isLogoutConfirmOpen}
        isLoggingOut={isLoggingOut}
        progress={progress}
        statusText={statusText}
        onConfirm={handleManualLogout}
        onCancel={cancelLogout}
      />

      {/* Inactivity Warning HUD Alert */}
      {isIdleModalOpen && (
        <div className="fixed bottom-6 left-6 z-50 pointer-events-auto bg-[#0a0a0f]/95 backdrop-blur-md border border-spidey-red rounded-xl p-5 shadow-[0_0_20px_rgba(229,9,20,0.2)] font-mono text-xs max-w-sm select-none animate-fade-in">
          <div className="flex items-center space-x-3 mb-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spidey-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-spidey-red"></span>
            </span>
            <span className="text-spidey-red font-bold uppercase tracking-wider">// IDLE_DETECTED</span>
          </div>
          <p className="text-zinc-300 mb-4 leading-relaxed">
            System has detected inactivity for 5 minutes. Autologout sequence initiating in <span className="text-white font-bold">{idleCountdown}s</span>.
          </p>
          <button
            onClick={keepActive}
            className="w-full py-2 bg-spidey-red/15 border border-spidey-red text-white hover:bg-spidey-red/25 transition-all font-bold tracking-wider rounded-lg cursor-pointer text-center pointer-events-auto"
          >
            // KEEP_SESSION_ACTIVE
          </button>
        </div>
      )}

    </div>
  );
}

export default function AppOverlay({ portfolioData }) {
  return (
    <LoginTransitionProvider>
      <AppOverlayContent portfolioData={portfolioData} />
    </LoginTransitionProvider>
  );
}
