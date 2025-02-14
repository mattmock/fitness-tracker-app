import { faker } from '@faker-js/faker';
import {
  generateId,
  formatDateForSQLite,
  sqlEscape,
  type TableName,
  type DatabaseCounts
} from '../devCommonUtils';

describe('devCommonUtils', () => {
  beforeEach(() => {
    // Reset faker seed for consistent tests
    faker.seed(123);
  });

  describe('generateId', () => {
    it('generates valid UUIDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('generates unique IDs on subsequent calls', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id3).not.toBe(id1);
    });
  });

  describe('formatDateForSQLite', () => {
    it('formats dates in SQLite format', () => {
      const date = new Date('2024-02-15T14:30:45.123Z');
      const formatted = formatDateForSQLite(date);
      
      expect(formatted).toBe('2024-02-15 14:30:45');
    });

    it('handles different timezones consistently', () => {
      const dates = [
        new Date('2024-02-15T00:00:00Z'),
        new Date('2024-02-15T12:00:00Z'),
        new Date('2024-02-15T23:59:59Z')
      ];

      dates.forEach(date => {
        const formatted = formatDateForSQLite(date);
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      });
    });
  });

  describe('sqlEscape', () => {
    it('handles null and undefined', () => {
      expect(sqlEscape(null)).toBe('NULL');
      expect(sqlEscape(undefined)).toBe('NULL');
    });

    it('escapes string values', () => {
      expect(sqlEscape('simple text')).toBe("'simple text'");
      expect(sqlEscape("text with 'quotes'")).toBe("'text with ''quotes'''");
    });

    it('converts numbers to strings', () => {
      expect(sqlEscape(42)).toBe('42');
      expect(sqlEscape(3.14)).toBe('3.14');
    });

    it('handles boolean values', () => {
      expect(sqlEscape(true)).toBe('true');
      expect(sqlEscape(false)).toBe('false');
    });

    it('escapes special characters in strings', () => {
      const specialChars = "text with 'quotes' and \n newlines";
      const escaped = sqlEscape(specialChars);
      expect(escaped).toBe("'text with ''quotes'' and \n newlines'");
    });
  });

  describe('types', () => {
    it('validates TableName type with literal values', () => {
      const validTables: TableName[] = [
        'sessions',
        'exercises',
        'routines',
        'session_exercises',
        'routine_exercises'
      ];

      // TypeScript will catch if we try to assign invalid values
      validTables.forEach(table => {
        expect(typeof table).toBe('string');
      });
    });

    it('validates DatabaseCounts type structure', () => {
      const counts: DatabaseCounts = {
        sessions: 5,
        exercises: 10,
        routines: 3
      };

      expect(counts).toEqual(expect.objectContaining({
        sessions: expect.any(Number),
        exercises: expect.any(Number),
        routines: expect.any(Number)
      }));
    });
  });
}); 