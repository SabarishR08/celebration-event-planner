import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  status?: string;
  className?: string;
}

export default function Badge({ children, status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-[3px] text-[0.65rem] font-semibold uppercase tracking-[0.14em]',
        status ? getStatusColor(status) : 'bg-surface-2 text-muted border-border-strong',
        className
      )}
    >
      {children}
    </span>
  );
}
