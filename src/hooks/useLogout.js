"use client";

import { useState } from 'react';
import { playClick, playLogout, speakTermination, startLoopingSFX, stopLoopingSFX } from '@/utils/audio';

/**
 * useLogout — Shared hook for managing the 5-step dynamic logout flow.
 */
export default function useLogout(router) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('// INITIATING_LOGOUT...');

  const initiateLogout = () => {
    playClick();
    setShowConfirm(true);
  };

  const confirmLogout = async (onClearState) => {
    speakTermination();
    startLoopingSFX('loading');
    playLogout();
    setShowConfirm(false);
    setIsLoggingOut(true);
    setProgress(0);
    setStatusText('// INITIATING_LOGOUT...');
    
    // Step 1: Initiating (0% -> 20%)
    await new Promise(r => setTimeout(r, 200));
    setProgress(20);
    setStatusText('// CLEARING_CREDENTIALS...');

    // Step 2: Call backend API (20% -> 45%)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('[Logout Hook] API error:', err);
    }
    
    setProgress(45);
    setStatusText('// WIPING_SESSION_DATA...');

    // Step 3: Wiping local state (45% -> 70%)
    await new Promise(r => setTimeout(r, 300));
    setProgress(70);
    setStatusText('// SECURING_NEURAL_LINK...');
    
    if (onClearState) {
      onClearState();
    }

    // Block back button navigation to auth pages
    window.history.pushState(null, '', '/login');
    const blockBack = () => {
      window.history.pushState(null, '', '/login');
    };
    window.addEventListener('popstate', blockBack);

    // Step 4: Securing neural link (70% -> 90%)
    await new Promise(r => setTimeout(r, 200));
    setProgress(90);

    // Step 5: Completed (90% -> 100%)
    await new Promise(r => setTimeout(r, 300));
    setProgress(100);
    setStatusText('// LOGOUT_COMPLETE ✓');

    // Wait and redirect to login
    await new Promise(r => setTimeout(r, 400));
    router.replace('/login');
  };

  const cancelLogout = () => {
    playClick();
    setShowConfirm(false);
  };

  return {
    initiateLogout,
    confirmLogout,
    cancelLogout,
    showConfirm,
    isLoggingOut,
    progress,
    statusText
  };
}
