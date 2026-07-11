"use client";

import { useEffect, useRef, useState } from 'react';

/**
 * useSessionTracker - Custom hook to track active time, visibility changes, section times,
 * heartbeats, and manage the 5-minute inactivity auto-logout sequence.
 * 
 * @param {Function} onAutoLogout - Callback to execute when the user is logged out due to inactivity timeout.
 */
export default function useSessionTracker(onAutoLogout) {
  const sessionStartRef = useRef(Date.now());
  const activeTimeRef = useRef(0);
  const lastActivePeriodStartRef = useRef(Date.now());
  const isTabActiveRef = useRef(true);

  const currentSectionRef = useRef('hero');
  const sectionEnterTimeRef = useRef(Date.now());

  // Dictionary of section time tracking
  const sectionTracker = useRef({
    hero: { viewed: true, timeSpentSeconds: 0, enteredAt: new Date() },
    about: { viewed: false, timeSpentSeconds: 0, enteredAt: null },
    skills: { viewed: false, timeSpentSeconds: 0, enteredAt: null },
    projects: { viewed: false, timeSpentSeconds: 0, enteredAt: null },
    contact: { viewed: false, timeSpentSeconds: 0, enteredAt: null }
  });

  // State for Inactivity Warning Modal
  const [isIdleModalOpen, setIsIdleModalOpen] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(60);

  const idleTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Helper: Detect browser and operating system
  const getDeviceInfo = () => {
    if (typeof window === 'undefined') return { browser: 'Unknown', os: 'Unknown', userAgent: '' };
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { browser, os, userAgent: ua };
  };

  // Helper: Formulates the payload for the final session endpoint
  const getFinalSessionPayload = (endReason = 'tab_close') => {
    const now = Date.now();

    // 1. Calculate active time
    let finalActiveTime = activeTimeRef.current;
    if (isTabActiveRef.current) {
      finalActiveTime += (now - lastActivePeriodStartRef.current);
    }

    // 2. Calculate total session time
    const finalTotalTime = now - sessionStartRef.current;

    // 3. Update current section time spent
    if (isTabActiveRef.current) {
      const elapsed = (now - sectionEnterTimeRef.current) / 1000;
      sectionTracker.current[currentSectionRef.current].timeSpentSeconds += elapsed;
    }

    // 4. Map sections viewed array
    const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
    const sectionsViewed = sections.map(s => ({
      section: s,
      timeSpentSeconds: Math.round(sectionTracker.current[s].timeSpentSeconds),
      enteredAt: sectionTracker.current[s].enteredAt || now
    })).filter(s => sectionTracker.current[s.section].viewed);

    return {
      sessionStart: sessionStartRef.current,
      sessionEnd: now,
      activeTime: finalActiveTime,
      totalTime: finalTotalTime,
      sectionsViewed,
      device: getDeviceInfo(),
      endReason
    };
  };

  // Helper: Sends final session log (synchronously via sendBeacon on tab close, fetch otherwise)
  const saveSession = (endReason = 'tab_close') => {
    const payload = getFinalSessionPayload(endReason);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${apiUrl}/api/users/session-end`;

    if (endReason === 'tab_close') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      }).catch(err => console.warn('[SessionEnd Tracker] Fetch failed:', err.message || err));
    }
  };

  // Section Observer hook callback
  const onSectionEnter = (sectionId) => {
    const now = Date.now();
    const prevSection = currentSectionRef.current;

    if (prevSection === sectionId) return;

    // Update time spent in previous section if tab is active
    if (isTabActiveRef.current) {
      const elapsed = (now - sectionEnterTimeRef.current) / 1000;
      sectionTracker.current[prevSection].timeSpentSeconds += elapsed;
    }

    // Transition to the new section
    currentSectionRef.current = sectionId;
    sectionEnterTimeRef.current = now;

    // Mark as viewed
    if (sectionTracker.current[sectionId]) {
      sectionTracker.current[sectionId].viewed = true;
      if (!sectionTracker.current[sectionId].enteredAt) {
        sectionTracker.current[sectionId].enteredAt = new Date();
      }
    }
  };

  // 1. Tracking Page Visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Tab hidden -> pause timer
        const elapsed = (now - sectionEnterTimeRef.current) / 1000;
        sectionTracker.current[currentSectionRef.current].timeSpentSeconds += elapsed;

        activeTimeRef.current += (now - lastActivePeriodStartRef.current);
        isTabActiveRef.current = false;
      } else {
        // Tab visible -> resume timer
        lastActivePeriodStartRef.current = now;
        sectionEnterTimeRef.current = now;
        isTabActiveRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 2. Tracking Page Unload (Close tab/Navigate away)
  useEffect(() => {
    const handleUnload = () => {
      saveSession('tab_close');
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // 3. Telemetry Heartbeat
  useEffect(() => {
    const sendHeartbeat = () => {
      // Only heartbeat when page is active
      if (!isTabActiveRef.current) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${apiUrl}/api/users/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSection: currentSectionRef.current,
          sessionStart: sessionStartRef.current
        }),
        credentials: 'include'
      }).catch(err => console.warn('[Heartbeat] Connection failed:', err.message || err));
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, []);

  // 4. Inactivity & Timeout Management
  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (isIdleModalOpen) {
      setIsIdleModalOpen(false);
    }
    setIdleCountdown(60);

    // Set 5-minute inactivity trigger (300,000 ms)
    idleTimeoutRef.current = setTimeout(() => {
      triggerIdleState();
    }, 300000);
  };

  const triggerIdleState = () => {
    setIsIdleModalOpen(true);
    setIdleCountdown(60);

    let count = 60;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      setIdleCountdown(count);
      if (count <= 0) {
        clearInterval(countdownIntervalRef.current);
        handleAutoLogout();
      }
    }, 1000);
  };

  const handleAutoLogout = () => {
    // 1. Save session with timeout reason
    saveSession('timeout');

    // 2. Clear local timers
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // 3. Trigger auto-logout callback
    if (onAutoLogout) {
      onAutoLogout();
    }
  };

  const keepActive = () => {
    resetIdleTimer();
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click'];
    
    const handleUserActivity = () => {
      // If modal is open, we enforce an explicit click on the "KEEP_ACTIVE" button
      if (!isIdleModalOpen) {
        resetIdleTimer();
      }
    };

    resetIdleTimer();
    events.forEach(evt => window.addEventListener(evt, handleUserActivity));

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, [isIdleModalOpen]);

  return {
    isIdleModalOpen,
    idleCountdown,
    keepActive,
    onSectionEnter,
    saveSession
  };
}
