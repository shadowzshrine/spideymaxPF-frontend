"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { playClick, playLogin, startLoopingSFX, stopLoopingSFX, initAudio } from '@/utils/audio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SpiderWebSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] text-[#dc2626]/25 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] select-none pointer-events-none">
    {/* Radial web strands */}
    <line x1="50" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.2" />
    <line x1="50" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="0.2" />
    <line x1="50" y1="50" x2="0" y2="50" stroke="currentColor" strokeWidth="0.2" />
    <line x1="50" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" />
    <line x1="50" y1="50" x2="15" y2="15" stroke="currentColor" strokeWidth="0.2" />
    <line x1="50" y1="50" x2="85" y2="85" stroke="currentColor" strokeWidth="0.2" />
    <line x1="50" y1="50" x2="85" y2="15" stroke="currentColor" strokeWidth="0.2" />
    <line x1="50" y1="50" x2="15" y2="85" stroke="currentColor" strokeWidth="0.2" />

    {/* Concentric octagons (rings) */}
    {[8, 16, 24, 32, 40, 48].map((r, i) => {
      const cos45 = 0.7071;
      const points = [
        `50,${50 - r}`,
        `${50 + r * cos45},${50 - r * cos45}`,
        `${50 + r},50`,
        `${50 + r * cos45},${50 + r * cos45}`,
        `50,${50 + r}`,
        `${50 - r * cos45},${50 + r * cos45}`,
        `${50 - r},50`,
        `${50 - r * cos45},${50 - r * cos45}`
      ].join(' ');

      return (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.2"
          className="animate-pulse"
          style={{
            animationDelay: `${i * 0.4}s`,
            animationDuration: '3s',
            stroke: i % 2 === 0 ? '#dc2626' : '#00ffff',
            opacity: i % 2 === 0 ? 0.3 : 0.2
          }}
        />
      );
    })}

    {/* Additional subtle diagonal connector paths */}
    <circle cx="50" cy="50" r="2" fill="#dc2626" className="animate-ping" style={{ animationDuration: '2s' }} />
    <circle cx="50" cy="50" r="1.5" fill="#00ffff" />
  </svg>
);

const SpiderIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#dc2626] drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C11.45 2 11 2.45 11 3v2.06c-1.37.16-2.58.74-3.5 1.57L5.83 5.06a1 1 0 0 0-1.41 1.41l1.7 1.7C5.45 9.24 5 10.57 5 12c0 1.25.32 2.42.88 3.44l-2.09 2.09a1 1 0 0 0 1.41 1.41l2.09-2.09c.96.88 2.21 1.45 3.61 1.58V21c0 .55.45 1 1 1s1-.45 1-1v-2.57c1.4-.13 2.65-.7 3.61-1.58l2.09 2.09a1 1 0 0 0 1.41-1.41l-2.09-2.09c.56-1.02.88-2.19.88-3.44 0-1.43-.45-2.76-1.12-3.83l1.7-1.7a1 1 0 0 0-1.41-1.41l-1.67 1.57c-.92-.83-2.13-1.41-3.5-1.57V3c0-.55-.45-1-1-1zm0 6c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-3 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.235 15.422 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.743-.08-1.3-.176-1.859H12.24z"/>
  </svg>
);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Prevent back navigation from login page
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', '/login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch session status on mount, ignoring guest session
  useEffect(() => {
    stopLoopingSFX();
    initAudio();
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (!data.isGuest) {
            setCurrentUser(data.user);
          }
        }
      })
      .catch((err) => console.warn('[Login] Check user failed:', err.message || err));
  }, []);

  // If already logged in, replace history so back doesn't return here
  useEffect(() => {
    if (currentUser) {
      router.replace('/');
    }
  }, [currentUser, router]);

  // Handle looping sound during authentication loading state
  useEffect(() => {
    if (loading) {
      startLoopingSFX('logging-in');
    } else {
      stopLoopingSFX();
    }
    return () => stopLoopingSFX();
  }, [loading]);

  const handleGoogleLogin = () => {
    playClick();
    setLoading(true);
    setTimeout(() => {
      window.location.href = `${API_URL}/api/auth/google`;
    }, 50);
  };

  const handleGuestLogin = async () => {
    playClick();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        playLogin();
        // Clear history stack completely
        window.history.replaceState(null, '', '/');
        // Prevent any back navigation
        window.addEventListener('popstate', () => {
          window.history.pushState(null, '', window.location.href);
        });
        router.replace('/');
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('[Login] Guest login failed:', err);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col md:flex-row bg-[#0a0a0a] text-white overflow-hidden font-sans select-none">
      {/* Pre-fetch home page so it loads instantly after authentication */}
      <Link href="/" prefetch={true} className="hidden" aria-hidden="true" />
      
      {/* LEFT SIDE PANEL (visual brand side, hidden on mobile) */}
      <div className="hidden md:flex md:w-[50%] lg:w-[55%] relative flex-col justify-between p-12 bg-[#050505] border-r border-zinc-900 overflow-hidden">
        {/* Comic grid overlay */}
        <div className="absolute inset-0 comic-grid opacity-[0.06] pointer-events-none" />
        
        {/* Animated matrix scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_18px] animate-scanline" />
        
        {/* Custom glowing Spiderman web SVG container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] flex items-center justify-center">
            <SpiderWebSVG />
          </div>
        </div>

        {/* Top section (over web animation) */}
        <div className="z-10 font-mono">
          <div className="text-[9px] text-[#00ffff] tracking-[0.25em] uppercase opacity-80 mb-1">
            // PORTFOLIO_SECURE_AUTH_OS
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white mt-2">// MX PORTFOLIO</h1>
          <p className="text-[10px] text-spidey-red tracking-wider font-semibold uppercase mt-0.5">FULL STACK DEVELOPER</p>
        </div>

        {/* Middle section — // LOGIN_BENEFITS */}
        <div className="z-10 my-auto font-mono max-w-sm mt-8 mb-8">
          <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-4">// LOGIN_BENEFITS</span>
          <div className="space-y-3">
            {[
              "Access AI-powered portfolio assistant",
              "Send direct transmissions (messages)",
              "Download resume & project files",
              "View live project previews",
              "Personalized experience"
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * idx }}
                className="flex items-center text-xs text-zinc-300 gap-2.5 select-none"
              >
                <span className="text-spidey-red">✦</span>
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom section — // CREATIVE_STACK */}
        <div className="z-10 font-mono mt-auto pt-6 border-t border-zinc-900/60">
          <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-3.5">// CREATIVE_STACK</span>
          <div className="flex flex-wrap gap-2 max-w-md select-none">
            {[
              "React", "Next.js", "Node.js", "MongoDB", "Three.js", "Gemini AI",
              "GSAP", "Tailwind", "Express", "JWT Auth", "Google OAuth"
            ].map((skill, idx) => (
              <span
                key={idx}
                className="text-[9px] font-semibold text-zinc-300 bg-zinc-950 border border-zinc-850 hover:border-spidey-red px-2.5 py-1 rounded transition-colors duration-250 hover:shadow-[0_0_8px_rgba(229,9,20,0.15)] cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL (login form container) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a] relative">
        {/* Mobile background web indicator */}
        <div className="absolute inset-0 md:hidden flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-[300px] h-[300px]">
            <SpiderWebSVG />
          </div>
        </div>
        
        {/* Scanline overlay for CRT display aesthetic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_20px] animate-scanline" />

        {/* Main interactive terminal card */}
        <div className="w-full max-w-sm flex flex-col items-center text-center z-10">
          {/* Top spider icon */}
          <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-[#070707] border border-zinc-900 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-shadow duration-300">
            <SpiderIcon />
          </div>

          <h1 className="text-lg font-mono text-white tracking-[0.2em] uppercase font-bold mb-2">
            // AUTHENTICATE_USER
          </h1>
          
          <span className="text-xs text-zinc-400 font-sans tracking-wide block mb-8 px-4 leading-relaxed">
            Access granted to verified entities only.
          </span>

          {/* Action buttons list */}
          <div className="w-full space-y-4 pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center bg-[#dc2626] hover:bg-[#b91c1c] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-red-500/20 disabled:opacity-50"
            >
              <GoogleIcon />
              {loading ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full flex items-center justify-center bg-zinc-950 hover:bg-[#111111] border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-[0.2em] py-3.5 px-4 rounded-xl cursor-pointer shadow-md hover:shadow-[0_0_12px_rgba(0,255,255,0.1)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span className="mr-2.5">🕷️</span>
              ENTER AS GUEST
            </button>
          </div>

          {/* Footer connection details */}
          <div className="mt-16 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em] font-semibold">
            // SECURE_CONNECTION_ESTABLISHED ✓
          </div>
        </div>
      </div>
    </div>
  );
}
