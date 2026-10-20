import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-3', md: 'p-5', lg: 'p-6' };
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl border border-[var(--border)] shadow-sm',
      paddings[padding],
      hover && 'card-hover cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}
