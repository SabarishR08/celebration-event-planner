import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Monogram } from '@/components/layout/Brand';

export default function RootLoading() {
  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="mb-6 opacity-90 transition-transform duration-300 hover:scale-105">
        <Monogram size={56} />
      </div>
      <LoadingSpinner size="lg" />
      <p className="font-serif italic text-muted mt-6 text-sm tracking-wide">
        Preparing your celebration ledger...
      </p>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
