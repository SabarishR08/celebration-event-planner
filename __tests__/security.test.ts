import { sanitizeInput, registerSchema, loginSchema, createEventSchema } from '../src/lib/validations';
import { checkRateLimit } from '../src/lib/utils';

describe('Security & Vulnerability Protection Test Suite', () => {
  describe('XSS & Payload Neutralization', () => {
    test('neutralizes nested script injection tags', () => {
      const malicious = '<script><script>alert("xss")</script></script>Celebration Title';
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('Celebration Title');
    });

    test('strips inline event handler attributes like onerror and onload', () => {
      const payload = '<img src="x" onerror="stealCookies()" />Grand Banquet';
      const clean = sanitizeInput(payload);
      expect(clean).not.toContain('onerror="stealCookies()"');
    });

    test('strips inline onclick and onmouseover handlers', () => {
      const payload = '<a href="#" onclick="malicious()" onmouseover="evil()">Link</a>';
      const clean = sanitizeInput(payload);
      expect(clean).not.toContain('onclick=');
      expect(clean).not.toContain('onmouseover=');
    });

    test('strips javascript: pseudoprotocol links', () => {
      const payload = 'javascript:alert(document.cookie)';
      const clean = sanitizeInput(payload);
      expect(clean).not.toContain('javascript:');
    });
  });

  describe('Rate Limiting & Abuse Prevention', () => {
    test('permits requests within quota and throttles excess requests', () => {
      const testKey = `test-ip-${Date.now()}`;
      const limit = 5;

      for (let i = 0; i < limit; i++) {
        expect(checkRateLimit(testKey, limit, 10000)).toBe(true);
      }
      // Exceed limit
      expect(checkRateLimit(testKey, limit, 10000)).toBe(false);
    });

    test('isolates rate limits between separate identifiers', () => {
      const idA = `user-a-${Date.now()}`;
      const idB = `user-b-${Date.now()}`;

      for (let i = 0; i < 3; i++) {
        checkRateLimit(idA, 3, 10000);
      }
      expect(checkRateLimit(idA, 3, 10000)).toBe(false);
      // idB should still be allowed
      expect(checkRateLimit(idB, 3, 10000)).toBe(true);
    });
  });

  describe('Authentication Boundary Security', () => {
    test('enforces password minimum length of 8 characters', () => {
      const res = registerSchema.safeParse({
        name: 'Sabarish R',
        email: 'test@example.com',
        password: 'Aa1!',
      });
      expect(res.success).toBe(false);
    });

    test('enforces uppercase requirement in password policy', () => {
      const res = registerSchema.safeParse({
        name: 'Sabarish R',
        email: 'test@example.com',
        password: 'lowercase123!',
      });
      expect(res.success).toBe(false);
    });

    test('enforces numeric digit requirement in password policy', () => {
      const res = registerSchema.safeParse({
        name: 'Sabarish R',
        email: 'test@example.com',
        password: 'NoNumbersAllowed!',
      });
      expect(res.success).toBe(false);
    });

    test('normalizes email casing to prevent duplicate bypass accounts', () => {
      const res = loginSchema.safeParse({
        email: 'USER@DOMAIN.COM ',
        password: 'SecretPassword123',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.email).toBe('user@domain.com');
      }
    });

    test('caps maximum boundary values against integer overflow attacks', () => {
      const overflowEvent = {
        title: 'Huge Festival',
        event_type: 'corporate',
        budget: 9999999999999, // Exceeds schema limit
        guest_count: 500000,   // Exceeds 100k guest limit
      };
      const res = createEventSchema.safeParse(overflowEvent);
      expect(res.success).toBe(false);
    });
  });
});
