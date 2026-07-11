"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoginTransition } from './LoginTransition.jsx';

export default function LoginPromptModal({
  isOpen,
  onClose,
  title = '// ACCESS_DENIED',
  message = 'This action requires authentication.',
}) {
  const router = useRouter();
  const { navigateToLogin } = useLoginTransition();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="login-prompt-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 w-full h-full z-[15000] bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm mx-4 p-6 bg-[#0a0a0f] border border-zinc-800 rounded-xl text-center shadow-[0_0_30px_rgba(229,9,20,0.2)] font-mono text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Spider icon */}
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-4 bg-zinc-950 shadow-[0_0_12px_rgba(229,9,20,0.15)]">
              <span className="text-spidey-red text-lg select-none">🕷️</span>
            </div>

            {/* Title */}
            <h2 className="text-sm font-mono text-white tracking-[0.2em] mb-2 uppercase font-bold">
              {title}
            </h2>

            {/* Message */}
            <p className="text-zinc-400 mb-6 text-[10px] uppercase leading-relaxed tracking-wider">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClose(); // close modal first
                  navigateToLogin(); // then redirect with transition
                }}
                className="flex-grow px-4 py-2.5 bg-spidey-red hover:bg-[#b91c1c] text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg shadow-[0_0_12px_rgba(229,9,20,0.3)] hover:scale-[1.02] transition-transform cursor-pointer"
              >
                LOGIN
              </button>
              <button
                onClick={onClose}
                className="flex-grow px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs font-bold tracking-widest uppercase rounded-lg hover:scale-[1.02] transition-transform cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
