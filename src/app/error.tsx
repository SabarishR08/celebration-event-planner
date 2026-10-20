'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Fleuron } from '@/components/layout/Brand';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime errors to telemetry or console in dev
    console.error('Application error boundary captured:', error);
  }, [error]);

  return (
    <div
      className="min-h-[75vh] flex items-center justify-center px-4 py-16"
      role="alert"
      aria-live="assertive"
    >
      <div className="paper frame-ornate max-w-lg w-full p-8 sm:p-10 text-center rounded-xl animate-rise shadow-lg">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-700 mx-auto flex items-center justify-center mb-5 ring-8 ring-rose-50/50">
          <AlertCircle className="w-7 h-7" aria-hidden="true" />
        </div>

        <p className="eyebrow text-rose-800 mb-2">Notice of Disturbance</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-3">
          Something interrupted the ceremony
        </h1>

        <p className="text-muted text-sm leading-relaxed mb-6">
          {error?.message ||
            'An unexpected error occurred while preparing this view. Your saved events and ledger remain safe.'}
        </p>

        {error?.digest && (
          <p className="text-[0.75rem] font-mono text-muted/70 bg-black/[0.03] px-3 py-1.5 rounded mb-6 inline-block">
            Digest: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Try again
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Return to dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-center text-muted">
          <Fleuron />
        </div>
      </div>
    </div>
  );
}
