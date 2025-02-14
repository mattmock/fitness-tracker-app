/**
 * Common Development Utilities
 * Shared utilities for development and testing purposes.
 */

import { faker } from '@faker-js/faker';

/**
 * Common types used across development utilities
 */
export type TableName = 'sessions' | 'exercises' | 'routines' | 'session_exercises' | 'routine_exercises';

export interface DatabaseCounts {
  sessions: number;
  exercises: number;
  routines: number;
}

/**
 * Generates a UUID for development purposes
 */
export function generateId(): string {
  return faker.string.uuid();
}

/**
 * Formats a date for SQLite (YYYY-MM-DD HH:MM:SS)
 */
export function formatDateForSQLite(date: Date): string {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Safely escapes a value for SQL insertion
 */
export function sqlEscape(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  return value.toString();
} 