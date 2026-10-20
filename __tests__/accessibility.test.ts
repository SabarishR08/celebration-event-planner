import { getStatusColor, getEventTypeLabel } from '../src/lib/utils';

describe('Accessibility (a11y) & Semantic Contracts Test Suite', () => {
  describe('Color Contrast & Semantic State Classification', () => {
    test('confirmed and completed events map to accessible success tokens', () => {
      const confirmedTone = getStatusColor('confirmed');
      const completedTone = getStatusColor('completed');
      expect(confirmedTone).toContain('text-success');
      expect(completedTone).toContain('text-success');
    });

    test('cancellations and declines map to destructive semantic tokens', () => {
      const cancelledTone = getStatusColor('cancelled');
      const declinedTone = getStatusColor('declined');
      expect(cancelledTone).toContain('text-destructive');
      expect(declinedTone).toContain('text-destructive');
    });

    test('in_progress and booked map to gold accent tokens', () => {
      const inProgressTone = getStatusColor('in_progress');
      const bookedTone = getStatusColor('booked');
      expect(inProgressTone).toContain('text-accent');
      expect(bookedTone).toContain('text-accent');
    });

    test('unrecognized or pending statuses provide neutral accessible fallback', () => {
      const fallback = getStatusColor('unrecognized_status');
      expect(fallback).toContain('text-muted');
      expect(fallback).toContain('border-border-strong');
    });
  });

  describe('Screen Reader & Taxonomy Readability', () => {
    test('provides human-readable title-cased labels for all event keys', () => {
      expect(getEventTypeLabel('wedding')).toBe('Wedding');
      expect(getEventTypeLabel('birthday')).toBe('Birthday');
      expect(getEventTypeLabel('community')).toBe('Community Gathering');
      expect(getEventTypeLabel('corporate')).toBe('Corporate Event');
      expect(getEventTypeLabel('anniversary')).toBe('Anniversary');
      expect(getEventTypeLabel('other')).toBe('Celebration');
    });

    test('falls back gracefully to Celebration for missing or malformed types', () => {
      expect(getEventTypeLabel('')).toBe('Celebration');
      expect(getEventTypeLabel('surprise_party')).toBe('Celebration');
    });
  });
});
