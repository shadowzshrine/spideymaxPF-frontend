"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const errorConfigs = {
  400: {
    title: '// CORRUPTED_REQUEST',
    name: 'BAD_REQUEST',
    description: 'The request payload contains malformed or unreadable data packets. Neural synap-link aborted.',
    webVariant: 'dissolve'
  },
  401: {
    title: '// AUTHENTICATION_REQUIRED',
    name: 'UNAUTHORIZED',
    description: 'Secure handshake failed. Identity signature required to access this sub-sector.',
    webVariant: 'key'
  },
  403: {
    title: '// ACCESS_DENIED',
    name: 'FORBIDDEN',
    description: 'Clearance level insufficient. Access to this mainframe node is strictly restricted.',
    webVariant: 'shield'
  },
  404: {
    title: '// NODE_NOT_FOUND',
    name: 'PAGE_NOT_FOUND',
    description: 'The requested resource does not exist in this sector of the network. The web has grown cold here.',
    webVariant: 'broken'
  },
  500: {
    title: '// SYSTEM_FAILURE',
    name: 'INTERNAL_SERVER_ERROR',
    description: 'An internal fault occurred in the neural core. Critical system modules are restarting.',
    webVariant: 'glitch'
  },
  502: {
    title: '// GATEWAY_MALFUNCTION',
    name: 'BAD_GATEWAY',
    description: 'Upstream gateway returned an invalid sequence. Mainframe comm-link unstable.',
    webVariant: 'slow-fade'
  },
  503: {
    title: '// SERVICE_OFFLINE',
    name: 'SERVICE_UNAVAILABLE',
    description: 'The target system is currently offline or undergoing defensive maintenance. Try linking later.',
    webVariant: 'slow-fade'
  }
};

export default function ErrorPage({ code = 404, onReset }) {
  const router = useRouter();
  const config = errorConfigs[code] || errorConfigs[404];

  // Helper to render the specific spider web SVG based on the animation variant
  const renderSpiderWeb = () => {
    const variant = config.webVariant;

    // CSS Keyframes embedded inside the SVG to make it self-contained
    return (
      <svg 
        viewBox="0 0 200 200" 
        className="w-64 h-64 md:w-80 md:h-80 select-none drop-shadow-[0_0_15px_rgba(229,9,20,0.15)]"
      >
        <defs>
          <style>{`
            .web-line {
              stroke: #27272a;
              stroke-width: 0.8;
            }
            .web-accent {
              stroke: #dc2626;
              stroke-width: 1.2;
              filter: drop-shadow(0 0 4px #dc2626);
            }
            
            /* Dissolve Animation (400) */
            @keyframes web-dissolve {
              0%, 100% { opacity: 0.9; }
              50% { opacity: 0.15; filter: blur(1px); }
            }
            .dissolve-animate {
              animation: web-dissolve 3s infinite ease-in-out;
            }

            /* Key Rotation (401) */
            @keyframes key-float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-4px) rotate(10deg); }
            }
            .key-animate {
              transform-origin: center;
              animation: key-float 4s infinite ease-in-out;
            }

            /* Shield Pulse (403) */
            @keyframes shield-pulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 8px #dc2626); }
            }
            .shield-animate {
              transform-origin: 100px 100px;
              animation: shield-pulse 2s infinite ease-in-out;
            }

            /* Broken Strand (404) */
            @keyframes broken-dangle {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(15deg); }
            }
            .broken-strand {
              transform-origin: 65px 65px;
              animation: broken-dangle 4s infinite ease-in-out;
              stroke: #ef4444;
              stroke-width: 1.2;
            }

            /* Glitch Animation (500) */
            @keyframes glitch-jitter {
              0% { transform: translate(0, 0) skew(0deg); }
              10% { transform: translate(-2px, 1px) skew(-5deg); }
              20% { transform: translate(2px, -1px) skew(5deg); }
              30% { transform: translate(0, 0) skew(0deg); }
              100% { transform: translate(0, 0) skew(0deg); }
            }
            .glitch-animate {
              animation: glitch-jitter 1.2s infinite steps(2);
            }

            /* Slow Spin (502/503) */
            @keyframes slow-spin {
              0% { transform: rotate(0deg) scale(1); opacity: 0.8; }
              50% { transform: rotate(180deg) scale(0.95); opacity: 0.4; }
              100% { transform: rotate(360deg) scale(1); opacity: 0.8; }
            }
            .slow-spin-animate {
              transform-origin: 100px 100px;
              animation: slow-spin 16s infinite linear;
            }
          `}</style>
        </defs>

        <g className={
          variant === 'dissolve' ? 'dissolve-animate' :
          variant === 'glitch' ? 'glitch-animate' :
          variant === 'slow-fade' ? 'slow-spin-animate' : ''
        }>
          {/* Radial strands */}
          <line x1="100" y1="100" x2="100" y2="10" className="web-line" />
          <line x1="100" y1="100" x2="190" y2="100" className="web-line" />
          <line x1="100" y1="100" x2="100" y2="190" className="web-line" />
          <line x1="100" y1="100" x2="10" y2="100" className="web-line" />
          
          <line x1="100" y1="100" x2="164" y2="36" className="web-line" />
          <line x1="100" y1="100" x2="164" y2="164" className="web-line" />
          <line x1="100" y1="100" x2="36" y2="164" className="web-line" />
          <line x1="100" y1="100" x2="36" y2="36" className="web-line" />

          {/* Outer Web Rings */}
          <path d="M 100,30 Q 149,49 170,100 Q 149,151 100,170 Q 51,151 30,100 Q 51,49 100,30 Z" fill="none" className="web-line" />
          <path d="M 100,50 Q 135,65 150,100 Q 135,135 100,150 Q 65,135 50,100 Q 65,65 100,50 Z" fill="none" className="web-line" />
          <path d="M 100,70 Q 121,80 130,100 Q 121,120 100,130 Q 79,120 70,100 Q 79,80 100,70 Z" fill="none" className="web-line" />

          {/* Broken Strand Animation (404 Specific) */}
          {variant === 'broken' ? (
            <>
              {/* Inner ring fragment */}
              <path d="M 100,85 Q 110,90 115,100" fill="none" className="web-line" />
              <path d="M 100,85 Q 90,90 85,100" fill="none" className="web-line" />
              {/* Dangling strand */}
              <g className="broken-strand">
                <line x1="85" y1="100" x2="65" y2="125" />
                <circle cx="65" cy="125" r="1.5" fill="#ef4444" />
              </g>
            </>
          ) : (
            <path d="M 100,85 Q 110,90 115,100 Q 110,110 100,115 Q 90,110 85,100 Q 90,90 100,85 Z" fill="none" className="web-line" />
          )}
        </g>

        {/* Central Variant Icon Elements */}
        {variant === 'shield' && (
          <g className="shield-animate" fill="none" stroke="#dc2626" strokeWidth="1.5">
            {/* Lock Shield */}
            <rect x="90" y="93" width="20" height="15" rx="2" fill="#dc2626" fillOpacity="0.2" className="web-accent" />
            <path d="M 94,93 V 87 A 6,6 0 0 1 106,87 V 93" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {variant === 'key' && (
          <g className="key-animate" fill="none" stroke="#dc2626" strokeWidth="1.5">
            {/* Key icon */}
            <circle cx="100" cy="90" r="8" className="web-accent" />
            <line x1="100" y1="98" x2="100" y2="118" strokeWidth="2" strokeLinecap="round" className="web-accent" />
            <line x1="100" y1="108" x2="108" y2="108" strokeWidth="2" strokeLinecap="round" className="web-accent" />
            <line x1="100" y1="114" x2="106" y2="114" strokeWidth="2" strokeLinecap="round" className="web-accent" />
          </g>
        )}

        {/* Central core node */}
        {variant !== 'shield' && variant !== 'key' && (
          <circle cx="100" cy="100" r="3" fill="#dc2626" className="drop-shadow-[0_0_6px_#dc2626]" />
        )}
      </svg>
    );
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#050505] text-white font-mono flex items-center justify-center p-6 select-none overflow-hidden">
      {/* Halftone grid background */}
      <div className="absolute inset-0 comic-grid opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_20px] animate-scanline" />

      {/* Outer framing */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[8px] border-zinc-950 z-40" />

      {/* Main split layout container */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center bg-[#0a0a0f]/80 border border-zinc-850 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(229,9,20,0.12)]">
        
        {/* LEFT PANEL: Animated Spider Web with Big Error Code */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            {renderSpiderWeb()}
            
            {/* Big Code Text overlay */}
            <span className="absolute text-5xl font-black font-heading tracking-tighter text-white select-none drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
              {code}
            </span>
          </div>
          <span className="text-[10px] text-zinc-550 tracking-widest uppercase">
            // MAINMAIN_LINK_FAILED
          </span>
        </div>

        {/* RIGHT PANEL: Info and Actions */}
        <div className="flex flex-col space-y-6 text-left select-text">
          <div className="space-y-2">
            <span className="text-xs text-spidey-red font-bold tracking-widest block uppercase">
              {config.title}
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight font-heading leading-tight">
              ERROR_{code} // {config.name}
            </h1>
            <div className="h-px bg-zinc-900 w-full my-3" />
            <p className="text-zinc-400 text-xs leading-relaxed font-mono">
              {config.description}
            </p>
          </div>

          <div className="bg-[#050508] border border-zinc-900 rounded-xl p-4 space-y-2 font-mono text-[10px] text-zinc-550 uppercase">
            <div>&gt; HOST_STATUS: ONLINE</div>
            <div>&gt; PORTAL_LINK: INTERRUPTED</div>
            <div>&gt; ACTION: RE-ROUTE SECURE CHANNEL</div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 select-none">
            {onReset ? (
              <button
                onClick={onReset}
                className="px-5 py-2.5 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg border border-red-500/30 neon-border-red hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                RE-ESTABLISH LINK (RETRY)
              </button>
            ) : (
              <Link
                href="/"
                className="px-5 py-2.5 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg border border-red-500/30 neon-border-red hover:scale-105 active:scale-95 transition-transform cursor-pointer text-center"
              >
                RETURN HOME
              </Link>
            )}
            
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
            >
              PREVIOUS NODE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
