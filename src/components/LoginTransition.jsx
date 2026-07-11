"use client";

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SpiderWebLoader from './SpiderWebLoader.jsx';
import { startLoopingSFX } from '@/utils/audio';

const LoginTransitionContext = createContext(null);



export function LoginTransitionProvider({ children }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const router = useRouter();

  const navigateToLogin = () => {
    setShowOverlay(true);
    startLoopingSFX('loading');
    // Push the navigation to /login. Since the overlay is shown immediately,
    // it will stay active until Next.js loads the new page, which replaces the layout/DOM.
    router.push('/login');
  };

  return (
    <LoginTransitionContext.Provider value={{ navigateToLogin }}>
      {children}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[20000] bg-black/95 flex flex-col items-center justify-center pointer-events-auto select-none"
          >
            <SpiderWebLoader 
              size="lg"
              text="// AUTHENTICATING..."
              showProgress={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LoginTransitionContext.Provider>
  );
}

export function useLoginTransition() {
  const context = useContext(LoginTransitionContext);
  if (!context) {
    throw new Error('useLoginTransition must be used within a LoginTransitionProvider');
  }
  return context;
}
