import { type SQLiteDatabase } from 'expo-sqlite';
import { schema } from '../schema/schema';

/**
 * Migrates the database to the latest version.
 */
export async function migrateDatabase(db: SQLiteDatabase) {
  // Get current database version
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  // If database is already at latest version, skip migration
  if (currentVersion >= schema.version) {
    return;
  }

  // Execute schema creation statements
  for (const statement of schema.statements) {
    await db.execAsync(statement);
  }

  // Update database version
  await db.execAsync(`PRAGMA user_version = ${schema.version}`);
} 