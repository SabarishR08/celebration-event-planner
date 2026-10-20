import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS merge for conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (USD).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date string to a human-readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Calculates the percentage of budget used.
 */
export function calculateBudgetPercentage(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((spent / total) * 100), 100);
}

/**
 * Returns a tone class set for a status badge.
 * Tones are drawn from the CelebPlan palette (ink, gold, sage, wine) rather
 * than default tailwind rainbows, so badges read as engraved stationery.
 */
export function getStatusColor(status: string): string {
  const tones: Record<string, string> = {
    // Event lifecycle
    planning: 'bg-surface-2 text-muted border-border-strong',
    confirmed: 'bg-success/10 text-success border-success/40',
    in_progress: 'bg-accent/10 text-accent border-accent/40',
    completed: 'bg-success/10 text-success border-success/40',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/40',
    // Vendors
    pending: 'bg-surface-2 text-muted border-border-strong',
    contacted: 'bg-surface-2 text-muted border-border-strong',
    booked: 'bg-accent/10 text-accent border-accent/40',
    // RSVP
    accepted: 'bg-success/10 text-success border-success/40',
    declined: 'bg-destructive/10 text-destructive border-destructive/40',
    maybe: 'bg-accent/10 text-accent border-accent/40',
    // Priorities
    low: 'bg-surface-2 text-muted border-border-strong',
    medium: 'bg-accent/10 text-accent border-accent/40',
    high: 'bg-primary/10 text-primary border-primary/40',
    urgent: 'bg-destructive/10 text-destructive border-destructive/40',
  };
  return tones[status] || 'bg-surface-2 text-muted border-border-strong';
}

/**
 * Human-readable labels for event types.
 */
export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    wedding: 'Wedding',
    birthday: 'Birthday',
    community: 'Community Gathering',
    corporate: 'Corporate Event',
    anniversary: 'Anniversary',
    other: 'Celebration',
  };
  return labels[type] || 'Celebration';
}

/**
 * Generates days until event.
 */
export function daysUntilEvent(eventDate: string): number {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Rate limiter using in-memory store (suitable for serverless with reasonable limits).
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
