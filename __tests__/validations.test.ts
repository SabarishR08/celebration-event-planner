import {
  registerSchema,
  loginSchema,
  createEventSchema,
  createVendorSchema,
  createTaskSchema,
  createBudgetItemSchema,
  createGuestSchema,
  chatMessageSchema,
  createTimelineItemSchema,
  sanitizeInput,
} from '../src/lib/validations';

describe('Validation Schemas & Security Sanitization', () => {
  describe('Authentication Validations', () => {
    test('registerSchema rejects passwords with insufficient complexity', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password', // Missing uppercase and number
      };
      const res = registerSchema.safeParse(invalidData);
      expect(res.success).toBe(false);
    });

    test('registerSchema validates correct user signups', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPassword123!',
      };
      const res = registerSchema.safeParse(validData);
      expect(res.success).toBe(true);
    });

    test('loginSchema validates credentials with proper email structure', () => {
      expect(loginSchema.safeParse({ email: 'invalid-email', password: 'secret' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'user@example.com', password: 'password123' }).success).toBe(true);
    });
  });

  describe('Event & Module Entity Schemas', () => {
    test('createEventSchema validates event types', () => {
      const validEvent = {
        title: 'Grand Gala 2026',
        event_type: 'corporate',
        budget: 10000,
        guest_count: 100,
      };
      expect(createEventSchema.safeParse(validEvent).success).toBe(true);

      const invalidEvent = {
        title: 'Random',
        event_type: 'invalid_category',
      };
      expect(createEventSchema.safeParse(invalidEvent).success).toBe(false);
    });

    test('createVendorSchema validates vendor category and optional email', () => {
      const validVendor = {
        name: 'Artisan Florals',
        category: 'Florist',
        contact_email: 'florals@atelier.com',
        estimated_cost: 2400,
      };
      expect(createVendorSchema.safeParse(validVendor).success).toBe(true);

      const invalidVendor = {
        name: '',
        category: '',
      };
      expect(createVendorSchema.safeParse(invalidVendor).success).toBe(false);
    });

    test('createTaskSchema enforces priority levels and titles', () => {
      const validTask = {
        title: 'Finalize menu tasting',
        priority: 'high',
        due_date: '2026-11-01',
      };
      expect(createTaskSchema.safeParse(validTask).success).toBe(true);

      const invalidTask = {
        title: '',
        priority: 'unknown_priority',
      };
      expect(createTaskSchema.safeParse(invalidTask).success).toBe(false);
    });

    test('createBudgetItemSchema enforces non-negative budget figures', () => {
      const validItem = {
        category: 'Catering',
        estimated_amount: 5000,
        actual_amount: 4800,
      };
      expect(createBudgetItemSchema.safeParse(validItem).success).toBe(true);

      const negativeItem = {
        category: 'Catering',
        estimated_amount: -200,
      };
      expect(createBudgetItemSchema.safeParse(negativeItem).success).toBe(false);
    });

    test('createGuestSchema validates RSVP statuses and emails', () => {
      const validGuest = {
        name: 'Eleanor Vance',
        email: 'eleanor@example.com',
        rsvp_status: 'accepted',
        plus_one: true,
      };
      expect(createGuestSchema.safeParse(validGuest).success).toBe(true);

      const invalidRsvp = {
        name: 'Eleanor Vance',
        rsvp_status: 'not_an_rsvp_status',
      };
      expect(createGuestSchema.safeParse(invalidRsvp).success).toBe(false);
    });

    test('chatMessageSchema caps input message length', () => {
      const validMsg = { message: 'Can you propose a 3-course menu for 40 guests?' };
      expect(chatMessageSchema.safeParse(validMsg).success).toBe(true);

      const emptyMsg = { message: '' };
      expect(chatMessageSchema.safeParse(emptyMsg).success).toBe(false);
    });

    test('createTimelineItemSchema validates title and sort ordering', () => {
      const item = {
        title: 'Opening Toast & Welcome Remarks',
        start_time: '18:00',
        sort_order: 1,
      };
      expect(createTimelineItemSchema.safeParse(item).success).toBe(true);
    });
  });

  describe('Sanitization Primitives', () => {
    test('sanitizeInput strips dangerous XSS scripts', () => {
      const malicious = '<script>alert("hack")</script>Hello World';
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('Hello World');
    });
  });
});
