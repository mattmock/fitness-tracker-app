import { type SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase } from './migrations';

/**
 * Initializes or migrates the database schema.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  console.log('[Provider] Starting database initialization...');
  
  // Set up database configuration
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Normal schema migration
  await migrateDatabase(db);

  console.log('[Provider] Database initialization complete');
} 