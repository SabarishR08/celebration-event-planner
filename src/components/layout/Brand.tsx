import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Wax-seal style monogram used as the CelebPlan brand mark.
 */
export function Monogram({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <circle cx="24" cy="24" r="19.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path
        d="M29.8 17.6c-1.2-1.9-3.3-3-5.7-3-4.5 0-7.6 3.5-7.6 8.4 0 4.9 3.1 8.4 7.6 8.4 2.4 0 4.5-1.1 5.7-3"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="1.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Brand lockup: monogram + serif wordmark with the gold "AI" superscript.
 */
export function Wordmark({
  className,
  href = '/',
  onClick,
  markSize = 34,
}: {
  className?: string;
  href?: string | null;
  onClick?: () => void;
  markSize?: number;
}) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5 text-primary', className)}>
      <Monogram size={markSize} />
      <span className="font-display text-[1.3rem] leading-none font-semibold tracking-tight text-foreground">
        CelebPlan
        <sup className="ml-1 align-super text-[0.55em] font-semibold tracking-[0.18em] text-accent">
          AI
        </sup>
      </span>
    </span>
  );

  if (!href) {
    return (
      <button type="button" onClick={onClick} aria-label="CelebPlan home" className="text-left">
        {content}
      </button>
    );
  }

  return (
    <Link href={href} aria-label="CelebPlan home">
      {content}
    </Link>
  );
}

/**
 * Small typographic ornament used as a section divider — like a printer's fleuron.
 */
export function Fleuron({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex items-center gap-3 text-accent', className)}
    >
      <span className="h-px w-10 bg-current opacity-40" />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" />
      </svg>
      <span className="h-px w-10 bg-current opacity-40" />
    </span>
  );
}
