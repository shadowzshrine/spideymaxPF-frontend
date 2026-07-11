"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoginTransition } from './LoginTransition.jsx';
import { 
  X, Minus, ChevronUp, ChevronDown
} from 'lucide-react';
import { playPopupOpen, playPopupClose, speakChatOpen, speakChatClose } from '@/utils/audio';

// Spider SVG Icon for AI FAB Button
const SpiderIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C11.45 2 11 2.45 11 3v2.06c-1.37.16-2.58.74-3.5 1.57L5.83 5.06a1 1 0 0 0-1.41 1.41l1.7 1.7C5.45 9.24 5 10.57 5 12c0 1.25.32 2.42.88 3.44l-2.09 2.09a1 1 0 0 0 1.41 1.41l2.09-2.09c.96.88 2.21 1.45 3.61 1.58V21c0 .55.45 1 1 1s1-.45 1-1v-2.57c1.4-.13 2.65-.7 3.61-1.58l2.09 2.09a1 1 0 0 0 1.41-1.41l-2.09-2.09c.56-1.02.88-2.19.88-3.44 0-1.43-.45-2.76-1.12-3.83l1.7-1.7a1 1 0 0 0-1.41-1.41l-1.67 1.57c-.92-.83-2.13-1.41-3.5-1.57V3c0-.55-.45-1-1-1zm0 6c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const { navigateToLogin } = useLoginTransition();
  const [isGuest, setIsGuest] = useState(true);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    playPopupOpen();
    speakChatOpen();
  };

  const handleClose = () => {
    setIsOpen(false);
    playPopupClose();
    speakChatClose();
  };
  const [messages, setMessages] = useState([
    {
      sender: 'system',
      text: 'SYSTEM BOOT // MAX_OS_AI: ONLINE. Connection established. Ask me anything about Mageshwaran S\'s projects, timeline, or skill arsenal!'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGuestAuthPrompt, setShowGuestAuthPrompt] = useState(false);
  
  const historyEndRef = useRef(null);

  // Fetch current session details on mount
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/auth/me`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsGuest(data.isGuest || false);
        }
      })
      .catch((err) => console.warn('[AI Assistant] Session fetch failed:', err.message || err));
  }, []);

  // Auto-scroll to latest messages
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const submitMessageText = async (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setIsTyping(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        credentials: 'include'
      });

      const json = await response.json();
      setIsTyping(false);

      if (response.ok && json.success) {
        setMessages((prev) => [...prev, { sender: 'ai', text: json.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'system', text: `ERROR: ${json.message || 'Failed to decrypt AI stream.'}` }
        ]);

        // If the user gets banned, force-reload/redirect to login
        if (response.status === 403) {
          setTimeout(() => {
            window.location.href = '/login?error=policy_violation';
          }, 3000);
        }
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'system', text: 'CONNECTION_LOSS: Direct data link timed out. Confirm backend server is online.' }
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = inputVal;
    setInputVal('');
    submitMessageText(val);
  };

  const handleQuickCommand = (text) => {
    submitMessageText(text);
  };

  const handleAuthRedirect = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Clear user state and redirect instantly
    setCurrentUser(null);
    setIsGuest(true);
    router.replace('/login');

    // Call backend logout API in background (fire and forget)
    fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(err => console.error('[AI Assistant] Logout error:', err));
  };

  // Minimized rendering style matching Spidey theme
  if (isOpen && isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 sm:right-12 z-[9999] pointer-events-auto w-[300px] bg-[#0a0a0f] border border-zinc-850 rounded-t-lg shadow-[0_-5px_20px_rgba(229,9,20,0.15)] flex items-center justify-between px-4 py-2.5 font-mono text-xs select-none">
        <span className="text-zinc-400 font-bold truncate">// MAX_OS : AI_CHAT</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(false)}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            title="Expand"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-spidey-red transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* 1. Chat Terminal Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay for focus alignment */}
            <div className="fixed inset-0 z-[9998] bg-black/70 pointer-events-auto" onClick={() => setIsOpen(false)} />

            {/* Split panel modal container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20, y: 50 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateX: -10, y: 30 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 1200 }}
              className="fixed inset-0 m-auto z-[9999] pointer-events-auto w-[75vw] max-w-[1000px] h-[75vh] max-h-[700px] bg-[#0a0a0f] border border-zinc-850 shadow-[0_0_50px_rgba(229,9,20,0.15)] flex flex-col md:flex-row rounded-3xl overflow-hidden"
            >
              
              {/* LEFT SIDE: Neural Link details (Width: 35%) */}
              <div className="w-full md:w-[35%] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900 bg-[#08080c]/90 z-10 min-w-0">
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[9px] text-spidey-red bg-spidey-red/10 border border-spidey-red/20 px-2 py-0.5 rounded uppercase tracking-wider select-none">
                      // MAX_OS : CHAT_CORE
                    </span>
                    <h3 className="font-mono text-zinc-500 text-[10px] mt-2.5 uppercase tracking-widest select-none">
                      CLASS: AI_NEURAL_LINK
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Connection Status */}
                    <div>
                      <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-1.5 select-none">// CONNECTION_STATUS</span>
                      <div className="space-y-2 select-text font-mono text-[10px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900/60">
                        <div>
                          <span className="text-zinc-650 mr-1.5 font-bold">USER:</span>
                          {isGuest ? 'GUEST // ANONYMOUS' : `${currentUser?.name || 'USER'} // ADMIN`}
                        </div>
                        <div>
                          <span className="text-zinc-650 mr-1.5 font-bold">MODEL:</span>
                          GEMINI-2.0-FLASH
                        </div>
                        <div>
                          <span className="text-zinc-650 mr-1.5 font-bold">STATUS:</span>
                          <span className="text-emerald-400 font-bold">ONLINE ✓</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Command Suggestions */}
                    <div>
                      <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-2 select-none">// QUICK_COMMANDS</span>
                      <div className="space-y-2 select-none">
                        <button 
                          onClick={() => handleQuickCommand("What are his skills?")}
                          className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-[9px] text-zinc-400 hover:text-white transition-all cursor-pointer pointer-events-auto block"
                        >
                          &gt; What are his skills?
                        </button>
                        <button 
                          onClick={() => handleQuickCommand("Show me his projects")}
                          className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-[9px] text-zinc-400 hover:text-white transition-all cursor-pointer pointer-events-auto block"
                        >
                          &gt; Show me his projects
                        </button>
                        <button 
                          onClick={() => handleQuickCommand("Is he available for hire?")}
                          className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-[9px] text-zinc-400 hover:text-white transition-all cursor-pointer pointer-events-auto block"
                        >
                          &gt; Is he available for hire?
                        </button>
                        <button 
                          onClick={() => handleQuickCommand("Download his CV")}
                          className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-[9px] text-zinc-400 hover:text-white transition-all cursor-pointer pointer-events-auto block"
                        >
                          &gt; Download his CV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dismiss CTA */}
                <div className="mt-8 pt-4 border-t border-zinc-950 select-none">
                  <button 
                    onClick={handleClose}
                    className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer text-zinc-500 hover:text-white pointer-events-auto"
                  >
                    DISCARD INTERFACE
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: Chat Area / Iframe preview (Width: 65%) */}
              <div className="flex flex-col flex-1 relative bg-[#07070a] h-full min-w-0 border-t md:border-t-0 md:border-l border-zinc-900/60 bg-[#07070a]/95">
                {/* Topbar Utility Controls */}
                <div className="absolute top-4 right-4 flex gap-2 z-20 select-none">
                  <button 
                    onClick={() => setIsMinimized(true)}
                    className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer backdrop-blur-md pointer-events-auto"
                    title="Minimize"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleClose}
                    className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-spidey-red transition-all cursor-pointer backdrop-blur-md pointer-events-auto"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Locked Panel for Guests */}
                {(isGuest || !currentUser) ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 relative">
                    {/* Access Locked Padlock Icon */}
                    <div className="w-14 h-14 rounded-full bg-spidey-red/10 border border-spidey-red/35 flex items-center justify-center text-spidey-red animate-pulse shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    
                    <div>
                      <h3 className="font-heading text-sm text-white tracking-wider spidey-heading uppercase">// ACCESS_LOCKED</h3>
                      <p className="text-zinc-500 text-[10px] leading-relaxed max-w-[240px] mx-auto mt-2">
                        Live interactive AI chat is restricted to authenticated users. Log in for full access — it's completely free!
                      </p>
                    </div>

                    <button
                      onClick={handleAuthRedirect}
                      className="px-6 py-2.5 bg-spidey-red hover:bg-spidey-red-glow text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded-lg border border-red-500/30 transition-all shadow-[0_0_10px_rgba(229,9,20,0.25)] cursor-pointer hover:scale-105 active:scale-95"
                    >
                      AUTHENTICATE
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Scrollable Message Feed */}
                    <div className="flex-1 overflow-y-auto pt-16 px-6 pb-6 space-y-4 scrollbar-thin text-xs font-mono text-zinc-300">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl p-3 border ${
                              msg.sender === 'user'
                                ? 'bg-spidey-red/10 border-spidey-red/40 text-white shadow-[0_0_10px_rgba(229,9,20,0.1)]'
                                : msg.sender === 'system'
                                ? 'bg-zinc-950/80 border-zinc-900 text-zinc-500 text-[10px]'
                                : 'bg-[#0f0f15]/80 border-zinc-800 text-spidey-blue-glow shadow-[0_0_10px_rgba(0,168,255,0.08)]'
                            }`}
                          >
                            <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5 select-none font-bold">
                              {msg.sender === 'user' ? 'USER' : msg.sender === 'system' ? 'OS_SYSTEM' : 'NEURAL_LINK_AI'}
                            </span>
                            <p className="leading-relaxed whitespace-pre-line select-text">{msg.text}</p>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-[#0f0f15]/80 border border-zinc-850 rounded-xl p-3 text-spidey-blue-glow shadow-[0_0_10px_rgba(0,168,255,0.08)]">
                            <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5 select-none font-bold">NEURAL_LINK_AI</span>
                            <div className="flex space-x-1.5 items-center pt-1 px-1">
                              <div className="w-1.5 h-1.5 bg-spidey-blue-glow rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-spidey-blue-glow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-spidey-blue-glow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={historyEndRef} />
                    </div>

                    {/* Chat Input form area */}
                    <form onSubmit={handleSubmit} className="border-t border-zinc-900 bg-[#0a0a0f] p-4 flex gap-3 select-none">
                      <input
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder="Ask MAX-OS..."
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-spidey-red/50 focus:shadow-[0_0_10px_rgba(229,9,20,0.1)] transition-all placeholder:text-zinc-650 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-bold text-xs uppercase rounded-lg border border-red-500/20 shadow-[0_0_10px_rgba(229,9,20,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                      >
                        Send
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Floating Action Button (FAB) */}
      <button
        onClick={() => {
          if (isGuest || !currentUser) {
            setShowGuestAuthPrompt((prev) => !prev);
          } else {
            if (isOpen) {
              handleClose();
            } else {
              handleOpen();
            }
          }
        }}
        className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.55)] border border-red-500/35 hover:scale-110 active:scale-95 hover:shadow-[0_0_22px_rgba(229,9,20,0.7)] transition-all cursor-pointer"
        title="Access MAX-OS AI Assistant"
      >
        <SpiderIcon />
      </button>

      {/* Guest Login Tooltip Prompt */}
      {showGuestAuthPrompt && (
        <div className="fixed bottom-20 right-4 sm:right-12 z-[9999] w-72 p-5 bg-[#0a0a0f] border border-zinc-800 rounded-xl shadow-[0_0_20px_rgba(229,9,20,0.25)] font-mono text-xs text-center pointer-events-auto">
          <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-3 bg-zinc-950">
            <span className="text-spidey-red text-sm">🕷️</span>
          </div>
          <h3 className="text-white font-bold tracking-wider mb-2">// LOGIN_REQUIRED</h3>
          <p className="text-zinc-400 mb-4 text-[10px] uppercase leading-relaxed">
            Login to access MAX-OS AI
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowGuestAuthPrompt(false);
                navigateToLogin();
              }}
              className="flex-grow py-2 bg-spidey-red hover:bg-[#b91c1c] text-white font-bold uppercase rounded-lg hover:scale-105 transition-transform cursor-pointer"
            >
              LOGIN
            </button>
            <button
              onClick={() => setShowGuestAuthPrompt(false)}
              className="flex-grow py-2 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white uppercase rounded-lg hover:scale-105 transition-transform cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
