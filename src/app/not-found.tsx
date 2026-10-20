import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Fleuron, Monogram } from '@/components/layout/Brand';

export default function NotFound() {
  return (
    <div
      className="min-h-[75vh] flex items-center justify-center px-4 py-16"
      role="main"
      aria-labelledby="not-found-title"
    >
      <div className="paper frame-ornate max-w-lg w-full p-8 sm:p-10 text-center rounded-xl animate-rise shadow-lg">
        <div className="mb-4 flex justify-center opacity-85">
          <Monogram size={48} />
        </div>

        <p className="eyebrow text-accent mb-2">Error 404 · Folio Not Located</p>
        <h1
          id="not-found-title"
          className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-3"
        >
          This celebration has not yet been inked
        </h1>

        <p className="text-muted text-sm leading-relaxed mb-8">
          The page or invitation suite you requested cannot be found in the current ledger. It may have moved or been archived.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Return to dashboard
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Atelier Home
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
