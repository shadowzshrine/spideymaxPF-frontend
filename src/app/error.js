"use client";

import React, { useEffect } from 'react';
import ErrorPage from '../components/ErrorPage';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error details to administrative logs
    console.error('[MAX-OS SYSTEM FAILURE ALERT]:', error);
  }, [error]);

  return <ErrorPage code={500} onReset={reset} />;
}
