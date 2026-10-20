import {
  calculateBudgetPercentage,
  formatCurrency,
  daysUntilEvent,
} from '../src/lib/utils';

describe('Efficiency & Performance Algorithms Test Suite', () => {
  describe('Budget Calculations & Edge Case Efficiency', () => {
    test('handles zero denominator without NaN or division by zero', () => {
      const percentage = calculateBudgetPercentage(100, 0);
      expect(percentage).toBe(0);
      expect(Number.isFinite(percentage)).toBe(true);
    });

    test('caps percentage at 100 to prevent layout blowouts on overbudget', () => {
      const percentage = calculateBudgetPercentage(7500, 5000);
      expect(percentage).toBe(100);
    });

    test('rounds correctly on fractional budgets', () => {
      const percentage = calculateBudgetPercentage(33.33, 100);
      expect(percentage).toBe(33);
    });
  });

  describe('Formatting Performance & Number Handling', () => {
    test('formats large currency figures cleanly and performantly', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        formatCurrency(125000.5);
      }
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Sub-100ms for 1000 iterations
      expect(formatCurrency(125000.5)).toBe('$125,000.50');
    });

    test('handles negative amounts safely without throwing', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });
  });

  describe('Date Difference Calculations', () => {
    test('accurately calculates future countdown days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const days = daysUntilEvent(future.toISOString());
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(11);
    });

    test('returns non-crashing negative integer for past events', () => {
      const past = new Date('2020-01-01');
      const days = daysUntilEvent(past.toISOString());
      expect(days).toBeLessThan(0);
    });
  });
});
