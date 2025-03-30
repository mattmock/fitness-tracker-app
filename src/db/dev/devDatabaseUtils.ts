/**
 * Development Database Utilities
 * These utilities are for development and testing purposes only.
 * They should not be included in production builds.
 */

import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { schema } from '../schema/schema';
import { 
  TableName, 
  DatabaseCounts,
  formatDateForSQLite 
} from './utils/devCommonUtils';
import {
  DEV_EXERCISES,
  Exercise,
  addExercises,
  ensureMinimumExercises
} from './utils/devExerciseUtils';
import {
  DEV_ROUTINES,
  DEV_ROUTINE_EXERCISES,
  Routine,
  RoutineExercise,
  addRoutines,
  addRoutineExercises
} from './utils/devRoutineUtils';
import {
  DevSession as Session,
  DevSessionExercise as SessionExercise,
  addSessions
} from './utils/devSessionUtils';

/**
 * Hook that provides development database operations
 */
export function useDevDatabase() {
  const db = useSQLiteContext();

  return {
    getDatabaseCounts: () => getDatabaseCounts(db),
    clearDatabase: () => clearDatabase(db),
    clearTable: (table: TableName) => clearTable(db, table),
    updateRowCount: (table: TableName, count: number) => updateRowCount(db, table, count),
    resetDatabaseToDefault: () => resetDatabaseToDefault(db),
    forceResetSchema: () => forceResetSchema(db),
    checkTableSchema: (tableName: string) => checkTableSchema(db, tableName)
  };
}

/**
 * Gets the current count of rows in each table
 */
async function getDatabaseCounts(db: SQLiteDatabase): Promise<DatabaseCounts> {
  console.log('[Dev] Fetching database counts...');
  
  const [sessions, exercises, routines] = await Promise.all([
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM sessions'),
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM exercises'),
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM routines')
  ]);

  const counts = {
    sessions: sessions?.count ?? 0,
    exercises: exercises?.count ?? 0,
    routines: routines?.count ?? 0
  };

  console.log('[Dev] Current database counts:', counts);
  return counts;
}

/**
 * Clears all data from all tables
 */
async function clearDatabase(db: SQLiteDatabase): Promise<void> {
  console.log('[Dev] Clearing all database tables...');
  
  // Order matters due to foreign key constraints
  const tables: TableName[] = [
    'session_exercises',
    'routine_exercises',
    'sessions',
    'routines',
    'exercises'
  ];
  
  for (const table of tables) {
    await clearTable(db, table);
  }
  
  console.log('[Dev] Database cleared successfully');
}

/**
 * Clears all data from a specific table
 */
async function clearTable(db: SQLiteDatabase, table: TableName): Promise<void> {
  console.log(`[Dev] Clearing table: ${table}`);
  await db.execAsync(`DELETE FROM ${table}`);
  console.log(`[Dev] Table ${table} cleared successfully`);
}

/**
 * Updates the number of rows in a table to match the specified count
 */
async function updateRowCount(db: SQLiteDatabase, table: TableName, targetCount: number): Promise<void> {
  if (targetCount < 0) {
    throw new Error(`Count cannot be negative for table: ${table}`);
  }

  console.log(`[Dev] Updating ${table} count to ${targetCount}...`);
  
  // Get current count
  const result = await db.getFirstAsync<{count: number}>(`SELECT COUNT(*) as count FROM ${table}`);
  const currentCount = result?.count ?? 0;
  
  if (currentCount === targetCount) {
    console.log(`[Dev] ${table} already has ${targetCount} rows`);
    return;
  }
  
  if (currentCount < targetCount) {
    await addRows(db, table, targetCount - currentCount);
  } else {
    await subtractRows(db, table, currentCount - targetCount);
  }
  
  console.log(`[Dev] ${table} count updated successfully`);
}

/**
 * Adds the specified number of rows to a table
 */
async function addRows(db: SQLiteDatabase, table: TableName, count: number): Promise<void> {
  console.log(`[Dev] Adding ${count} rows to ${table}...`);
  
  switch (table) {
    case 'exercises':
      await addExercises(db, count);
      break;
      
    case 'routines':
      await addRoutines(db, count);
      break;
      
    case 'sessions': {
      const exercises = await ensureMinimumExercises(db);
      await addSessions(db, count, exercises);
      break;
    }
      
    default:
      throw new Error(`Adding rows not supported for table: ${table}`);
  }
  
  console.log(`[Dev] Added ${count} rows to ${table}`);
}

/**
 * Removes the specified number of rows from a table
 */
async function subtractRows(db: SQLiteDatabase, table: TableName, count: number): Promise<void> {
  console.log(`[Dev] Removing ${count} rows from ${table}...`);
  
  await db.execAsync(`
    DELETE FROM ${table} 
    WHERE rowid IN (
      SELECT rowid FROM ${table} 
      ORDER BY rowid DESC 
      LIMIT ${count}
    )
  `);
  
  console.log(`[Dev] Removed ${count} rows from ${table}`);
}

/**
 * Resets the database to its default state
 */
async function resetDatabaseToDefault(db: SQLiteDatabase): Promise<void> {
  console.log('[Dev] Resetting database to default state...');
  
  // Clear all data
  await clearDatabase(db);
  
  // Recreate schema if needed
  for (const statement of schema.statements) {
    await db.execAsync(statement);
  }
  
  // Add default data in bulk
  await Promise.all([
    addExercises(db, DEV_EXERCISES.length, DEV_EXERCISES),
    addRoutines(db, DEV_ROUTINES.length, DEV_ROUTINES),
    addRoutineExercises(db, DEV_ROUTINE_EXERCISES)
  ]);
  
  console.log('[Dev] Database reset complete');
}

/**
 * Force resets the database schema by setting the user_version to 0
 * and triggering a full schema recreation on next app start.
 */
async function forceResetSchema(db: SQLiteDatabase): Promise<void> {
  try {
    console.log('[Dev] Force resetting database schema...');
    await db.execAsync('PRAGMA user_version = 0');
    console.log('[Dev] Database schema reset. Restart the app to apply changes.');
  } catch (error) {
    console.error('[Dev] Failed to reset database schema:', error);
    throw error;
  }
}

/**
 * Checks the schema of a specific table
 */
async function checkTableSchema(db: SQLiteDatabase, tableName: string): Promise<any[]> {
  try {
    console.log(`[Dev] Checking schema for table: ${tableName}`);
    const result = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
    console.log(`[Dev] Table schema for ${tableName}:`, result);
    return result;
  } catch (error) {
    console.error(`[Dev] Failed to check schema for table ${tableName}:`, error);
    throw error;
  }
}

// Export resetDatabaseToDefault for use in provider
export { resetDatabaseToDefault as resetDevDatabase }; 