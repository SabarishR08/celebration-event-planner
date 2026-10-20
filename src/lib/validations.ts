import { z } from 'zod';

/**
 * Validation schemas for all API endpoints.
 * Uses Zod for runtime type validation and security.
 */

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255).trim(),
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  event_type: z.enum(['wedding', 'birthday', 'community', 'corporate', 'anniversary', 'other']),
  description: z.string().max(5000).optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  location: z.string().max(500).optional(),
  guest_count: z.number().int().min(0).max(100000).optional(),
  budget: z.number().min(0).max(999999999).optional(),
  theme: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['planning', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
});

// Vendor schemas
export const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).trim(),
  category: z.string().min(1, 'Category is required').max(100).trim(),
  contact_email: z.string().email().max(255).optional().or(z.literal('')),
  contact_phone: z.string().max(50).optional(),
  estimated_cost: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateVendorSchema = createVendorSchema.partial().extend({
  status: z.enum(['pending', 'contacted', 'booked', 'confirmed', 'cancelled']).optional(),
  actual_cost: z.number().min(0).optional(),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  description: z.string().max(2000).optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().max(255).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
});

// Budget item schemas
export const createBudgetItemSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100).trim(),
  description: z.string().max(255).optional(),
  estimated_amount: z.number().min(0).optional(),
  actual_amount: z.number().min(0).optional(),
  is_paid: z.boolean().optional(),
});

// Guest schemas
export const createGuestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).trim(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  rsvp_status: z.enum(['pending', 'accepted', 'declined', 'maybe']).optional(),
  dietary_restrictions: z.string().max(500).optional(),
  plus_one: z.boolean().optional(),
  table_number: z.number().int().min(0).optional(),
});

// Chat schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000).trim(),
  eventId: z.number().int().positive().optional(),
});

// Timeline schemas
export const createTimelineItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  description: z.string().max(2000).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  category: z.string().max(100).optional(),
  sort_order: z.number().int().min(0).optional(),
});

/**
 * Sanitizes user input by removing potentially dangerous content.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}
