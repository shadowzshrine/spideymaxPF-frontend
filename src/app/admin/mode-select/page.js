"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Settings, ShieldAlert, LogOut } from 'lucide-react';
import SpiderWebLoader from '@/components/SpiderWebLoader.jsx';
import { startLoopingSFX, stopLoopingSFX, initAudio, playHover, playClick } from '@/utils/audio';
import useLogout from '@/hooks/useLogout';
import LogoutOverlay from '@/components/LogoutOverlay.jsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SpiderIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-spidey-red drop-shadow-[0_0_8px_var(--color-spidey-red-glow)] mb-4 animate-pulse" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C11.45 2 11 2.45 11 3v2.06c-1.37.16-2.58.74-3.5 1.57L5.83 5.06a1 1 0 0 0-1.41 1.41l1.7 1.7C5.45 9.24 5 10.57 5 12c0 1.25.32 2.42.88 3.44l-2.09 2.09a1 1 0 0 0 1.41 1.41l2.09-2.09c.96.88 2.21 1.45 3.61 1.58V21c0 .55.45 1 1 1s1-.45 1-1v-2.57c1.4-.13 2.65-.7 3.61-1.58l2.09 2.09a1 1 0 0 0 1.41-1.41l-2.09-2.09c.56-1.02.88-2.19.88-3.44 0-1.43-.45-2.76-1.12-3.83l1.7-1.7a1 1 0 0 0-1.41-1.41l-1.67 1.57c-.92-.83-2.13-1.41-3.5-1.57V3c0-.55-.45-1-1-1zm0 6c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export default function AdminModeSelect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [selecting, setSelecting] = useState(false);

  // Shared logout flow
  const {
    initiateLogout,
    confirmLogout,
    cancelLogout,
    showConfirm: isLogoutConfirmOpen,
    isLoggingOut,
    progress,
    statusText
  } = useLogout(router);

  // Authenticate Admin Session on Mount
  useEffect(() => {
    initAudio();
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user && data.user.role === 'admin') {
          setAdminUser(data.user);
          setLoading(false);
        } else {
          setTimeout(() => router.replace('/'), 0);
        }
      })
      .catch((err) => {
        console.error('[AdminModeSelect] Auth check failed:', err);
        setTimeout(() => router.replace('/'), 0);
      });
  }, [router]);

  // Handle start/stop looping SFX for admin mode select
  useEffect(() => {
    if (loading || selecting) {
      console.log('[SFX Debug] mode-select loading pulse triggered');
      startLoopingSFX('loading');
    } else {
      stopLoopingSFX();
    }
    return () => stopLoopingSFX();
  }, [loading, selecting]);

  const handleSelectMode = async (mode) => {
    if (selecting) return;
    setSelecting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/select-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Record admin mode timestamp in background (fire and forget)
        fetch(`${API_URL}/api/admin/record-mode`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode }),
          credentials: 'include'
        }).catch(() => {});

        if (mode === 'viewer') {
          router.replace('/');
        } else {
          router.replace('/admin');
        }
      } else {
        alert(data.message || 'Authorization mode switch failed.');
        setSelecting(false);
      }
    } catch (err) {
      console.error('[AdminModeSelect] Mode selection failed:', err);
      alert('Network failure occurred during authorization mode update.');
      setSelecting(false);
    }
  };

  if (loading || selecting) {
    return (
      <div className="relative min-h-screen w-screen flex items-center justify-center bg-[#050505] text-white font-mono overflow-hidden">
        <div className="fixed inset-0 comic-grid opacity-[0.08] pointer-events-none" />
        <div className="text-center z-10">
          <SpiderWebLoader 
            size="sm"
            text={selecting ? '// SYNCHRONIZING_SESSION_CREDENTIALS...' : '// ESTABLISHING_SECURE_LINK...'}
            showProgress={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-[#050505] text-white font-mono overflow-hidden">
      {/* Halftone mesh grid overlay */}
      <div className="fixed inset-0 comic-grid opacity-[0.08] pointer-events-none z-1" />
      
      {/* HUD scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-20 opacity-[0.03] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_20px] animate-scanline" />

      {/* Cyberpunk HUD border frame */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 border-[8px] border-zinc-950" />

      {/* Center Auth Mode Select card */}
      <div className="relative z-10 w-full max-w-2xl p-8 bg-[#0a0a0f]/80 border border-zinc-850 rounded-2xl shadow-[0_0_35px_rgba(229,9,20,0.12)] text-center card-grid backdrop-blur-md">
        
        {/* Header telemetry */}
        <div className="flex flex-col items-center">
          <SpiderIcon />
          <h1 className="text-lg font-heading text-white spidey-heading uppercase tracking-widest mb-1 select-none">
            MAX_OS // AUTHORIZATION_PORT
          </h1>
          <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-8 select-none">
            // Welcome back, {adminUser?.name || 'Admin'}
          </span>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          
          {/* Card 1: Viewer Mode */}
          <button
            onClick={() => { playClick(); handleSelectMode('viewer'); }}
            onMouseEnter={() => playHover()}
            className="group flex flex-col items-center justify-between p-6 bg-zinc-950/60 hover:bg-spidey-blue/5 border border-zinc-900 hover:border-spidey-blue-glow/40 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.98] text-center space-y-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-spidey-blue/10 border border-spidey-blue-glow/20 flex items-center justify-center text-spidey-blue-glow group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-xs font-bold text-white group-hover:text-spidey-blue-glow transition-colors tracking-widest uppercase">
                // VIEWER_MODE
              </h3>
              <p className="text-[10px] text-zinc-500 mt-2 font-mono leading-relaxed">
                Experience the portfolio exactly as a standard client/visitor.
              </p>
            </div>
          </button>

          {/* Card 2: Editor Mode */}
          <button
            onClick={() => { playClick(); handleSelectMode('editor'); }}
            onMouseEnter={() => playHover()}
            className="group flex flex-col items-center justify-between p-6 bg-zinc-950/60 hover:bg-spidey-red/5 border border-zinc-900 hover:border-spidey-red/40 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.98] text-center space-y-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-spidey-red/10 border border-spidey-red/30 flex items-center justify-center text-spidey-red group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(229,9,20,0.15)]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-xs font-bold text-white group-hover:text-spidey-red-glow transition-colors tracking-widest uppercase">
                // EDITOR_MODE
              </h3>
              <p className="text-[10px] text-zinc-500 mt-2 font-mono leading-relaxed">
                Access full administrative control panel features and settings.
              </p>
            </div>
          </button>

        </div>

        {/* Abort footer */}
        <div className="border-t border-zinc-900 pt-6 flex justify-between items-center text-[9px] text-zinc-600 font-mono select-none">
          <span>// IP_VERIFIED // SESSION: VALID</span>
          <button
            onClick={initiateLogout}
            className="flex items-center space-x-1.5 hover:text-spidey-red transition-colors font-bold cursor-pointer uppercase"
          >
            <LogOut className="w-3 h-3" />
            <span>Terminate Link</span>
          </button>
        </div>

      </div>

      <LogoutOverlay
        showConfirm={isLogoutConfirmOpen}
        isLoggingOut={isLoggingOut}
        progress={progress}
        statusText={statusText}
        onConfirm={() => confirmLogout(() => setAdminUser(null))}
        onCancel={cancelLogout}
      />
    </div>
  );
}
