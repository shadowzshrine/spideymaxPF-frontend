"use client";

import React from 'react';

export default function SpiderWebLoader({
  size = 'md',
  text = '',
  showProgress = false,
  progress = 0,
  statusText = ''
}) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64'
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Spider web SVG */}
      <div className={`${sizeClasses[size] || sizeClasses.md} animate-[webPulse_3s_ease-in-out_infinite] animate-[webGlow_3s_infinite]`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* 8 radial lines from center */}
          <line x1="100" y1="100" x2="100" y2="10" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          <line x1="100" y1="100" x2="157" y2="43" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          <line x1="100" y1="100" x2="190" y2="100" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          <line x1="100" y1="100" x2="157" y2="157" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          <line x1="100" y1="100" x2="100" y2="190" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          <line x1="100" y1="100" x2="43" y2="157" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          <line x1="100" y1="100" x2="10" y2="100" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          <line x1="100" y1="100" x2="43" y2="43" stroke="#dc2626" strokeWidth="1" opacity="0.8"/>
          
          {/* 4 concentric web rings (octagonal path connecting radial points) */}
          {/* Ring 1 - innermost */}
          <polygon points="100,75 121,79 129,100 121,121 100,125 79,121 71,100 79,79"
            fill="none" stroke="#dc2626" strokeWidth="0.8" opacity="0.9"/>
          {/* Ring 2 */}
          <polygon points="100,55 135,63 145,100 135,137 100,145 65,137 55,100 65,63"
            fill="none" stroke="#dc2626" strokeWidth="0.7" opacity="0.7"/>
          {/* Ring 3 */}
          <polygon points="100,35 149,47 161,100 149,153 100,165 51,153 39,100 51,47"
            fill="none" stroke="#dc2626" strokeWidth="0.6" opacity="0.5"/>
          {/* Ring 4 - outermost */}
          <polygon points="100,15 163,31 177,100 163,169 100,183 37,169 23,100 37,31"
            fill="none" stroke="#dc2626" strokeWidth="0.5" opacity="0.3"/>
          
          {/* Spider body - small oval in center */}
          <ellipse cx="100" cy="100" rx="6" ry="8" fill="#dc2626"/>
          {/* Spider legs */}
          <line x1="94" y1="97" x2="82" y2="88" stroke="#dc2626" strokeWidth="1.5"/>
          <line x1="94" y1="100" x2="80" y2="100" stroke="#dc2626" strokeWidth="1.5"/>
          <line x1="94" y1="103" x2="82" y2="112" stroke="#dc2626" strokeWidth="1.5"/>
          <line x1="106" y1="97" x2="118" y2="88" stroke="#dc2626" strokeWidth="1.5"/>
          <line x1="106" y1="100" x2="120" y2="100" stroke="#dc2626" strokeWidth="1.5"/>
          <line x1="106" y1="103" x2="118" y2="112" stroke="#dc2626" strokeWidth="1.5"/>
          
          {/* Swinging spider - separate, orbits around web */}
          <g style={{
            animation: 'spiderOrbit 2s linear infinite',
            transformOrigin: '100px 100px'
          }}>
            <ellipse cx="100" cy="30" rx="4" ry="5" fill="#ff0000"/>
            <line x1="97" y1="28" x2="90" y2="22" stroke="#ff0000" strokeWidth="1"/>
            <line x1="97" y1="30" x2="88" y2="30" stroke="#ff0000" strokeWidth="1"/>
            <line x1="103" y1="28" x2="110" y2="22" stroke="#ff0000" strokeWidth="1"/>
            <line x1="103" y1="30" x2="112" y2="30" stroke="#ff0000" strokeWidth="1"/>
            {/* Web strand from swinging spider to web */}
            <line x1="100" y1="35" x2="100" y2="75" stroke="#dc2626" strokeWidth="0.5" opacity="0.6"/>
          </g>
        </svg>
      </div>
      
      {/* Loading text */}
      {text && (
        <p className="text-red-500 font-mono text-sm tracking-widest text-center animate-pulse">
          {text}
        </p>
      )}
      
      {/* Progress bar (optional) */}
      {showProgress && (
        <div className="w-64 z-10 font-mono">
          <div className="w-full bg-zinc-900 border border-zinc-800/40 rounded-full h-1 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-650 to-red-500 h-full rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%`, boxShadow: '0 0 8px #dc2626' }}
            />
          </div>
          {statusText && (
            <p className="text-zinc-500 font-mono text-[9px] mt-2.5 text-center tracking-widest uppercase animate-pulse">
              {statusText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
