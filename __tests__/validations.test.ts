import { registerSchema, loginSchema, createEventSchema, createVendorSchema, sanitizeInput } from '../src/lib/validations';

describe('Validation Schemas & Security Sanitization', () => {
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

  test('sanitizeInput strips dangerous XSS scripts', () => {
    const malicious = '<script>alert("hack")</script>Hello World';
    const clean = sanitizeInput(malicious);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello World');
  });
});
