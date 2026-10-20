import { formatCurrency, formatDate, calculateBudgetPercentage, getStatusColor, getEventTypeEmoji, daysUntilEvent } from '../src/lib/utils';

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

  test('getEventTypeEmoji returns correct celebration emojis', () => {
    expect(getEventTypeEmoji('wedding')).toBe('💒');
    expect(getEventTypeEmoji('birthday')).toBe('🎂');
    expect(getEventTypeEmoji('community')).toBe('🏘️');
    expect(getEventTypeEmoji('unknown')).toBe('🎉');
  });

  test('getStatusColor returns appropriate styling badges', () => {
    expect(getStatusColor('planning')).toContain('bg-blue-100');
    expect(getStatusColor('confirmed')).toContain('bg-green-100');
    expect(getStatusColor('cancelled')).toContain('bg-red-100');
  });
});
