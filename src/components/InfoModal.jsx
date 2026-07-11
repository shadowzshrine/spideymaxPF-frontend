"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const SpiderWebSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[120%] h-[120%] text-[#dc2626]/20 drop-shadow-[0_0_15px_rgba(220,38,38,0.25)] select-none pointer-events-none absolute">
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
            opacity: i % 2 === 0 ? 0.25 : 0.15
          }}
        />
      );
    })}
    <circle cx="50" cy="50" r="1.5" fill="#dc2626" />
  </svg>
);

export default function InfoModal({ isOpen, isGuest, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm pointer-events-auto">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 15, y: 30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, rotateX: -10, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1200 }}
        className="relative w-full max-w-4xl h-[78vh] bg-[#0a0a0f] border border-zinc-850 rounded-3xl overflow-hidden card-grid flex flex-col md:flex-row shadow-[0_0_50px_rgba(229,9,20,0.18)] z-10 font-mono text-xs"
      >
        {/* LEFT PANEL: Spiderman Web background (35% Width) */}
        <div className="w-full md:w-[38%] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900 bg-[#050508] relative overflow-hidden select-none">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45">
            <SpiderWebSVG />
          </div>
          <div className="absolute inset-0 comic-grid opacity-[0.05] pointer-events-none" />
          
          <div className="z-10 text-[9px] text-[#00ffff] tracking-widest uppercase">
            // MAIN_TELEMETRY_SYSTEM
          </div>

          <div className="z-10 mt-auto">
            <span className="font-mono text-[9px] text-spidey-red bg-spidey-red/10 border border-spidey-red/20 px-2 py-0.5 rounded uppercase tracking-wider">
              BUILD_INFOS
            </span>
            <h2 className="text-xl font-heading text-white spidey-heading uppercase tracking-wider mt-4 leading-tight">
              // ABOUT_THIS_BUILD
            </h2>
            <p className="text-[10px] text-zinc-550 uppercase tracking-widest mt-2">
              Creative Engineering Showcase
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Build Information (65% Width) */}
        <div className="flex-1 p-6 md:p-8 bg-[#0a0a0f] overflow-y-auto scrollbar-thin flex flex-col justify-between relative">
          
          {/* Close button at top right */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg bg-zinc-950 hover:bg-spidey-red/10 border border-zinc-900 hover:border-spidey-red/30 text-zinc-500 hover:text-spidey-red cursor-pointer transition-all z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-6">
            {/* Section 1: What You Can Do */}
            <div>
              <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-3">// WHAT_YOU_CAN_DO</span>
              <div className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 space-y-2.5">
                {isGuest ? (
                  <>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <span className="text-emerald-400">👁️</span>
                      <span>Browse portfolio (limited view)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-550">
                      <span>🔒</span>
                      <span>Login to unlock full access</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-550">
                      <span>🔒</span>
                      <span>AI Assistant (login required)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-550">
                      <span>🔒</span>
                      <span>Send message (login required)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-550">
                      <span>🔒</span>
                      <span>Download CV (login required)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <span className="text-emerald-400">✅</span>
                      <span>Full portfolio access unlocked</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <span className="text-emerald-400">✅</span>
                      <span>AI Assistant active & ready</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <span className="text-emerald-400">✅</span>
                      <span>Send direct message enabled</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <span className="text-emerald-400">✅</span>
                      <span>Download CV & Resume available</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <span className="text-emerald-400">✅</span>
                      <span>View live project previews activated</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section 2: How It Was Built */}
            <div>
              <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-3">// HOW_IT_WAS_BUILT</span>
              <div className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-450">
                <div className="flex items-center gap-2.5">
                  <span>🕸️</span>
                  <span>Three.js + R3F (3D animations)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>⚡</span>
                  <span>Next.js 16 + Turbopack</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>🤖</span>
                  <span>Gemini AI + Groq (Dual fallback)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>🎨</span>
                  <span>GSAP + Framer Motion (scroll physics)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>🔐</span>
                  <span>Google OAuth + JWT secure auth</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>📊</span>
                  <span>MongoDB Atlas cloud database</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>🚀</span>
                  <span>Vercel + Railway cloud hosting</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>📧</span>
                  <span>Nodemailer automated email system</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>☁️</span>
                  <span>Google Drive API resume sync</span>
                </div>
              </div>
            </div>

            {/* Section 3: Unique Features */}
            <div>
              <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-3">// UNIQUE_FEATURES</span>
              <div className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-zinc-450">
                <div className="flex items-start gap-2.5">
                  <span className="text-spidey-red mt-0.5">▪</span>
                  <span>Auto-syncs resume from Google Drive</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-spidey-red mt-0.5">▪</span>
                  <span>AI detects code abuse attempts</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-spidey-red mt-0.5">▪</span>
                  <span>Real-time visitor session tracking</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-spidey-red mt-0.5">▪</span>
                  <span>Dual AI API fallback (highly redundant)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-spidey-red mt-0.5">▪</span>
                  <span>Smart GitHub project sync with AI descriptions</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-spidey-red mt-0.5">▪</span>
                  <span>Role-based access (Guest/User/Admin)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-950">
            <button 
              onClick={onClose}
              className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer text-zinc-500 hover:text-white"
            >
              DISMISS INTERFACE
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
