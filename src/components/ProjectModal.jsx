"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Maximize2, Loader } from 'lucide-react';
import SpiderWebLoader from './SpiderWebLoader.jsx';
import LoginPromptModal from './LoginPromptModal.jsx';
import { playPopupClose, playSuccess } from '@/utils/audio';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProjectModal({ project, isGuest, onAuthenticate, onClose }) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showRepoPrompt, setShowRepoPrompt] = useState(false);

  if (!project) return null;

  const liveUrl = project.liveUrl || project.liveLink;
  const githubUrl = project.githubLink || project.githubUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm pointer-events-auto">
      {/* Click outside to close overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => { playPopupClose(); onClose(); }} />

      {/* Modal Container with 3D Flip entrance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 20, y: 50 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, rotateX: -10, y: 30 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1200 }}
        className="relative w-full max-w-5xl h-[85vh] bg-[#0a0a0f] border border-zinc-850 rounded-3xl overflow-hidden card-grid flex flex-col md:flex-row shadow-[0_0_50px_rgba(229,9,20,0.15)] z-10"
      >
        
        {/* LEFT SIDE: Project details (Width: 35%) */}
        <div className={`w-full md:w-[35%] p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900 bg-[#08080c]/90 z-10 ${!liveUrl ? 'md:w-full max-w-2xl mx-auto' : ''}`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[9px] text-spidey-red bg-spidey-red/10 border border-spidey-red/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {project.mission || 'ACTIVE'}
                </span>
                <h2 className="text-xl md:text-2xl font-heading text-white spidey-heading uppercase tracking-tight mt-3">
                  {project.title}
                </h2>
                <h3 className="font-mono text-zinc-500 text-[10px] mt-1 uppercase tracking-widest">
                  CLASS: {project.class || 'CORE_APP'}
                </h3>
              </div>
              <button 
                onClick={() => { playPopupClose(); onClose(); }}
                className="p-1.5 rounded-lg bg-zinc-950 hover:bg-spidey-red/10 border border-zinc-900 hover:border-spidey-red/30 text-zinc-500 hover:text-spidey-red cursor-pointer transition-all md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-1.5">// MISSION_DESCRIPTION</span>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed max-h-[25vh] overflow-y-auto pr-2 scrollbar-thin">
                  {project.description}
                </p>
              </div>

              <div>
                <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-2">// TECH_STACK</span>
                <div className="flex flex-wrap gap-1.5">
                  {(project.techStack || project.skills || []).map((tag, tIdx) => (
                    <span key={`${tag}-${tIdx}`} className="font-mono text-[9px] bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-900">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-950 flex flex-col gap-2.5">
            {githubUrl && (
              isGuest ? (
                <button
                  onClick={() => setShowRepoPrompt(true)}
                  title="Login required"
                  className="w-full flex items-center justify-center space-x-2 bg-zinc-950 border border-zinc-850 py-3 rounded-xl font-mono text-xs text-zinc-600 opacity-70 cursor-default gap-1"
                >
                  <span className="text-[10px]">🔒</span>
                  <GithubIcon />
                  <span>INSPECT REPOSITORY</span>
                </button>
              ) : (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 py-3 rounded-xl font-mono text-xs transition-all cursor-pointer text-zinc-300 hover:text-white"
                >
                  <GithubIcon />
                  <span>INSPECT REPOSITORY</span>
                </a>
              )
            )}
            
            {liveUrl && (
              isGuest ? (
                <button 
                  onClick={onAuthenticate}
                  className="w-full flex items-center justify-center space-x-2 bg-[#050508]/85 border border-zinc-800 hover:border-spidey-red text-zinc-400 hover:text-white py-3 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(229,9,20,0.1)] md:hidden"
                >
                  <span>AUTHENTICATE TO PREVIEW</span>
                </button>
              ) : (
                <a 
                  href={liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-spidey-red hover:bg-spidey-red-glow text-white py-3 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(229,9,20,0.25)] md:hidden"
                >
                  <span>LAUNCH PREVIEW</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )
            )}

            <button 
              onClick={() => { playPopupClose(); onClose(); }}
              className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer text-zinc-500 hover:text-white hidden md:block"
            >
              DISMISS INTERFACE
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Iframe preview (Width: 65%) or Lock Screen for Guests */}
        {isGuest ? (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-[#07070a]/95 border-l border-zinc-900/60 font-mono space-y-5 relative">
            {/* Topbar close button overlay */}
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => { playPopupClose(); onClose(); }}
                className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-spidey-red transition-all cursor-pointer backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-14 h-14 rounded-full bg-spidey-red/10 border border-spidey-red/35 flex items-center justify-center text-spidey-red animate-pulse shadow-[0_0_15px_rgba(229,9,20,0.2)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            
            <div>
              <h3 className="font-heading text-sm text-white tracking-wider spidey-heading uppercase">// ACCESS_LOCKED</h3>
              <p className="text-zinc-500 text-[10px] leading-relaxed max-w-[240px] mx-auto mt-2">
                Live interactive project preview is restricted to authenticated users. Log in for full access — it's completely free!
              </p>
            </div>

            <button
              onClick={onAuthenticate}
              className="px-6 py-2.5 bg-spidey-red hover:bg-spidey-red-glow text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded-lg border border-red-500/30 transition-all shadow-[0_0_10px_rgba(229,9,20,0.25)] cursor-pointer hover:scale-105 active:scale-95"
            >
              AUTHENTICATE
            </button>
          </div>
        ) : liveUrl ? (
          <div className="hidden md:flex flex-1 relative bg-black h-full overflow-hidden">
            {/* Loading state indicator */}
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
                <SpiderWebLoader 
                  size="sm"
                  text="ESTABLISHING TARGET LINK PREVIEW..."
                  showProgress={false}
                />
              </div>
            )}

            {/* Embedded project iframe */}
            <iframe
              src={liveUrl}
              onLoad={() => {
                setIframeLoading(false);
                playSuccess();
              }}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />

            {/* Topbar utility icons overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <a 
                href={liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open Live Preview in new tab"
                className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              >
                <Maximize2 className="w-4 h-4" />
              </a>
              <button 
                onClick={() => { playPopupClose(); onClose(); }}
                className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-spidey-red transition-all cursor-pointer backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty preview state placeholder if no liveUrl exists */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-[#07070a]/90 font-mono text-xs text-zinc-600">
            <span>// PREVIEW_LINK_OFFLINE</span>
            <span className="text-[10px] mt-1 text-zinc-700">No live deployment url set for this operation.</span>
          </div>
        )}

      </motion.div>

      {/* Repo access gate for guests */}
      <LoginPromptModal
        isOpen={showRepoPrompt}
        onClose={() => setShowRepoPrompt(false)}
        title="// ACCESS_DENIED"
        message="Login to inspect the repository"
      />
    </div>
  );
}
