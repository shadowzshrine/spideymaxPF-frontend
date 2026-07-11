"use client";

import React from 'react';
import SpiderWebLoader from './SpiderWebLoader.jsx';

/**
 * LogoutOverlay — Shared UI overlay component rendering both the
 * confirmation dialog and the 5-step dynamic progress bar.
 */
export default function LogoutOverlay({
  showConfirm,
  isLoggingOut,
  progress,
  statusText,
  onConfirm,
  onCancel
}) {
  return (
    <>
      {/* Logout Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 w-full h-full z-[20000] bg-black/90 backdrop-blur-md flex items-center justify-center pointer-events-auto">
          <div className="w-full max-w-sm p-6 bg-[#0a0a0f] border border-zinc-800 rounded-xl text-center shadow-[0_0_25px_rgba(229,9,20,0.2)]">
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-4 bg-zinc-950 shadow-[0_0_12px_rgba(229,9,20,0.15)]">
              <span className="text-spidey-red text-lg select-none">🕷️</span>
            </div>
            <h2 className="text-sm font-mono text-white tracking-[0.2em] mb-6 uppercase font-bold">
              // TERMINATE SESSION?
            </h2>
            <div className="flex gap-4">
              <button
                onClick={onConfirm}
                className="flex-grow px-4 py-2.5 bg-spidey-red hover:bg-[#b91c1c] text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg shadow-[0_0_12px_rgba(229,9,20,0.3)] hover:scale-[1.02] transition-transform cursor-pointer"
              >
                CONFIRM
              </button>
              <button
                onClick={onCancel}
                className="flex-grow px-4 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg hover:scale-[1.02] transition-transform cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 w-full h-full z-[25000] bg-[#0a0a0f] flex flex-col items-center justify-center pointer-events-auto select-none">
          {/* Subtle Halftone Overlay */}
          <div className="absolute inset-0 comic-grid opacity-[0.06] pointer-events-none" />

          <div className="z-10">
            <SpiderWebLoader 
              size="md"
              text="// TERMINATING_SESSION..."
              showProgress={true}
              progress={progress}
              statusText={statusText}
            />
          </div>
        </div>
      )}
    </>
  );
}
