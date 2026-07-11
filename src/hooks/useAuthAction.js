import { useState } from 'react';

/**
 * useAuthAction — gates actions behind authentication.
 *
 * Usage:
 *   const { requireAuth, loginPromptProps } = useAuthAction(currentUser);
 *
 *   // In JSX:
 *   <button onClick={() => requireAuth(() => window.open(url), 'Login to view GitHub')}>
 *     CODE
 *   </button>
 *   <LoginPromptModal {...loginPromptProps} />
 */
export default function useAuthAction(currentUser) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptTitle, setPromptTitle] = useState('// ACCESS_DENIED');
  const [promptMessage, setPromptMessage] = useState('This action requires authentication.');

  /**
   * requireAuth — runs callback if authenticated, otherwise shows the login modal.
   * @param {Function} callback  The action to perform when authenticated.
   * @param {string}   message   Optional custom message for the modal body.
   * @param {string}   title     Optional custom title for the modal heading.
   */
  const requireAuth = (callback, message, title) => {
    if (!currentUser) {
      if (title) setPromptTitle(title);
      if (message) setPromptMessage(message);
      setShowLoginPrompt(true);
      return;
    }
    callback();
  };

  const closePrompt = () => setShowLoginPrompt(false);

  // Spread these directly onto <LoginPromptModal>
  const loginPromptProps = {
    isOpen: showLoginPrompt,
    onClose: closePrompt,
    title: promptTitle,
    message: promptMessage,
  };

  return { requireAuth, loginPromptProps };
}
