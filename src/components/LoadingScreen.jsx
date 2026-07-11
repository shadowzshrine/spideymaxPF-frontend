"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpiderWebLoader from './SpiderWebLoader.jsx';
import { startLoopingSFX, stopLoopingSFX, initAudio, playClick, getAudioContext } from '@/utils/audio';

export default function LoadingScreen({ onLoaded, isDataLoaded }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  // Check if AudioContext is already unlocked on mount (bypass button if so)
  useEffect(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'running') {
      setIsStarted(true);
    }
  }, []);

  // Handle start/stop looping SFX based on isStarted
  useEffect(() => {
    if (isStarted) {
      startLoopingSFX('loading');
    }
    return () => {
      stopLoopingSFX();
    };
  }, [isStarted]);

  // Loading progress bar interval (only runs if isStarted is true)
  useEffect(() => {
    if (!isStarted) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Increment progress randomly
        const next = prev + Math.floor(Math.random() * 8) + 4;
        
        // If we reach 95%+, hold until the backend API data is loaded
        if (next >= 99) {
          if (isDataLoaded) {
            clearInterval(interval);
            setTimeout(() => {
              setIsVisible(false);
              if (onLoaded) onLoaded();
            }, 500);
            return 100;
          }
          return 99; // Hold at 99% waiting for data fetch
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isStarted, onLoaded, isDataLoaded]);

  const handleLaunch = () => {
    initAudio();
    playClick();
    setIsStarted(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 w-full h-full z-50 bg-[#050505] flex flex-col items-center justify-center pointer-events-auto"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Subtle Halftone Overlay */}
          <div className="absolute inset-0 comic-grid opacity-30 pointer-events-none" />

          <SpiderWebLoader 
            size="lg"
            text={isStarted ? "INITIALIZING MAX-OS" : "SECURE CONNECTION PENDING"}
            showProgress={isStarted}
            progress={progress}
            statusText={!isStarted ? "" : (!isDataLoaded ? "CONNECTING TO DATA NODE..." : "WEAVING DIGITAL WEB MESH...")}
          />

          {!isStarted && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onClick={handleLaunch}
              className="absolute bottom-24 px-8 py-3 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg border border-red-500/30 neon-border-red hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto shadow-[0_0_15px_rgba(220,38,38,0.25)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] z-50"
            >
              ESTABLISH SECURE LINK
            </motion.button>
          )}

          {/* Bottom HUD elements */}
          <div className="absolute bottom-6 left-6 font-mono text-[9px] text-zinc-600 tracking-wider">
            VERSION 4.2.0 // DEPLOYMENT: ACTIVE
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[9px] text-zinc-600 tracking-wider">
            DATABASE STATUS: {isDataLoaded ? "SYNCED (100%)" : "SEARCHING..."}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
