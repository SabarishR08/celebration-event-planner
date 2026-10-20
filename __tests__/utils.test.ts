import {
  formatCurrency,
  formatDate,
  calculateBudgetPercentage,
  getStatusColor,
  getEventTypeLabel,
  daysUntilEvent,
} from '../src/lib/utils';

describe('Utility Functions Test Suite', () => {
  test('formatCurrency formats numbers into USD currency string', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('calculateBudgetPercentage accurately determines percentage cap', () => {
    expect(calculateBudgetPercentage(50, 100)).toBe(50);
    expect(calculateBudgetPercentage(150, 100)).toBe(100);
    expect(calculateBudgetPercentage(0, 0)).toBe(0);
  });

  test('getEventTypeLabel returns readable celebration labels', () => {
    expect(getEventTypeLabel('wedding')).toBe('Wedding');
    expect(getEventTypeLabel('birthday')).toBe('Birthday');
    expect(getEventTypeLabel('community')).toBe('Community Gathering');
    expect(getEventTypeLabel('unknown')).toBe('Celebration');
  });

  test('getStatusColor returns palette tone classes for badges', () => {
    // Success-toned statuses share the sage treatment
    expect(getStatusColor('confirmed')).toContain('text-success');
    expect(getStatusColor('completed')).toContain('text-success');
    // Negative statuses share the wine treatment
    expect(getStatusColor('cancelled')).toContain('text-destructive');
    expect(getStatusColor('declined')).toContain('text-destructive');
    // Unknown statuses fall back to a neutral tone
    expect(getStatusColor('planning')).toContain('text-muted');
    expect(getStatusColor('something-unknown')).toContain('text-muted');
  });
});
