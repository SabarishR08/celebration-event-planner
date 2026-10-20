import React from 'react';
import {
  Heart,
  CakeSlice,
  Trees,
  BriefcaseBusiness,
  Gem,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Maps event types to elegant line icons (replaces the old emoji treatment).
 */
export const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
  wedding: Heart,
  birthday: CakeSlice,
  community: Trees,
  corporate: BriefcaseBusiness,
  anniversary: Gem,
  other: Sparkles,
};

interface EventTypeIconProps {
  type: string;
  className?: string;
  size?: number;
}

/**
 * Renders the icon for an event type inside a small engraved medallion.
 */
export default function EventTypeIcon({ type, className, size = 20 }: EventTypeIconProps) {
  const Icon = EVENT_TYPE_ICONS[type] || Sparkles;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent',
        className
      )}
      aria-hidden="true"
    >
      <Icon size={size} strokeWidth={1.75} />
    </span>
  );
}
