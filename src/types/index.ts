/**
 * Type definitions for the Celebration & Event Planner application.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Event {
  id: number;
  user_id: number;
  title: string;
  event_type: EventType;
  description?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  guest_count: number;
  budget: number;
  status: EventStatus;
  theme?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate' | 'anniversary' | 'other';
export type EventStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Vendor {
  id: number;
  event_id: number;
  name: string;
  category: string;
  contact_email?: string;
  contact_phone?: string;
  estimated_cost: number;
  actual_cost?: number;
  status: VendorStatus;
  notes?: string;
  created_at: string;
}

export type VendorStatus = 'pending' | 'contacted' | 'booked' | 'confirmed' | 'cancelled';

export interface Task {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to?: string;
  created_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface BudgetItem {
  id: number;
  event_id: number;
  category: string;
  description?: string;
  estimated_amount: number;
  actual_amount?: number;
  is_paid: boolean;
  created_at: string;
}

export interface Guest {
  id: number;
  event_id: number;
  name: string;
  email?: string;
  phone?: string;
  rsvp_status: RSVPStatus;
  dietary_restrictions?: string;
  plus_one: boolean;
  table_number?: number;
  created_at: string;
}

export type RSVPStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

export interface TimelineItem {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  sort_order: number;
  created_at: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalBudget: number;
  totalSpent: number;
  upcomingEvents: Event[];
  tasksDue: number;
  pendingRSVPs: number;
}
