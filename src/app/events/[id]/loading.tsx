import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EventDetailLoading() {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse"
      role="status"
      aria-label="Loading celebration details"
    >
      <div className="h-4 w-32 bg-stone-200/70 dark:bg-stone-800 rounded"></div>

      {/* Header skeleton */}
      <div className="paper rounded-lg p-8 sm:p-10 border border-stone-200/60 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-4 max-w-xl flex-1">
          <div className="h-4 w-40 bg-stone-200/80 rounded"></div>
          <div className="h-10 w-3/4 bg-stone-300/60 rounded"></div>
          <div className="h-4 w-full bg-stone-200/50 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-stone-200/70 rounded"></div>
          <div className="h-10 w-36 bg-amber-200/50 rounded"></div>
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="paper p-5 rounded-xl border border-stone-200/60 space-y-3">
            <div className="h-3 w-20 bg-stone-200/70 rounded"></div>
            <div className="h-7 w-24 bg-stone-300/60 rounded"></div>
            <div className="h-2 w-full bg-stone-200/40 rounded"></div>
          </div>
        ))}
      </div>

      {/* Centered spinner indicator */}
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <LoadingSpinner size="md" />
        <p className="text-xs font-serif italic text-muted mt-3">
          Opening celebration folio...
        </p>
      </div>
    </div>
  );
}
