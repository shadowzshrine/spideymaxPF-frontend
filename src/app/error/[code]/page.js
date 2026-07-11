"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ErrorPage from '../../../components/ErrorPage';

export default function CustomErrorRoute() {
  const params = useParams();
  
  // Parse code from path parameter, defaulting to 404 if invalid
  const errorCodeStr = params?.code || '404';
  const errorCode = parseInt(errorCodeStr, 10);
  
  const validCodes = [400, 401, 403, 404, 500, 502, 503];
  const activeCode = validCodes.includes(errorCode) ? errorCode : 404;

  return <ErrorPage code={activeCode} />;
}
