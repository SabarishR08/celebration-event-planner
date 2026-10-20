import React from 'react';
import { Fleuron } from '@/components/layout/Brand';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center" role="status">
      <div className="text-accent mb-4">{icon}</div>
      <Fleuron className="mb-4 opacity-70" />
      <h3 className="font-display text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-muted text-sm mb-6 max-w-sm leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
