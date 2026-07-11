import React from 'react';
import ErrorPage from '../components/ErrorPage';

export const metadata = {
  title: 'Node Not Found // MAX-OS',
  description: 'The requested sector in the neural mainframe could not be established.'
};

export default function NotFound() {
  return <ErrorPage code={404} />;
}
