import { type SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase } from './migrations';

// Define a type for the table info result
interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

/**
 * Initializes or migrates the database schema.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  console.log('[Provider] ==========================================');
  console.log('[Provider] Starting database initialization...');
  
  // Set up database configuration
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Check current database version
  const versionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionResult?.user_version ?? 0;
  console.log('[Provider] Current database version:', currentVersion);
  
  // Check if session_exercises table exists
  try {
    const tableExists = await db.getFirstAsync<{ count: number }>(
      "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='session_exercises'"
    );
    console.log('[Provider] session_exercises table exists:', tableExists?.count > 0);
    
    if (tableExists?.count === 0) {
      console.log('[Provider] session_exercises table does not exist, will be created during migration');
    }
  } catch (error) {
    console.error('[Provider] Error checking if table exists:', error);
  }
  
  // Check session_exercises table schema if it exists
  let hasCompletedColumn = false;
  try {
    const tableInfo = await db.getAllAsync<TableColumn>('PRAGMA table_info(session_exercises)');
    if (tableInfo.length > 0) {
      console.log('[Provider] session_exercises columns:', tableInfo.map(col => `${col.name} (${col.type})`).join(', '));
      
      // Check specifically for completed column
      hasCompletedColumn = tableInfo.some(col => col.name === 'completed');
      console.log('[Provider] Has completed column:', hasCompletedColumn);
    } else {
      console.log('[Provider] No columns found in session_exercises table');
    }
  } catch (error) {
    console.log('[Provider] Error checking table schema (table might not exist yet):', error);
  }

  // If the completed column is missing but the version is already 2 or higher,
  // force a downgrade to version 1 to trigger the migration
  if (!hasCompletedColumn && currentVersion >= 2) {
    console.log('[Provider] WARNING: Completed column missing but version is', currentVersion);
    console.log('[Provider] Forcing downgrade to version 1 to trigger migration');
    await db.execAsync('PRAGMA user_version = 1');
  }

  // Normal schema migration
  try {
    console.log('[Provider] Starting database migration...');
    await migrateDatabase(db);
    console.log('[Provider] Database migration completed successfully');
  } catch (error) {
    console.error('[Provider] Error during database migration:', error);
  }

  // Verify migration was successful
  try {
    const postMigrationVersion = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    console.log('[Provider] Post-migration database version:', postMigrationVersion?.user_version ?? 0);
    
    const postMigrationTableInfo = await db.getAllAsync<TableColumn>('PRAGMA table_info(session_exercises)');
    if (postMigrationTableInfo.length > 0) {
      console.log('[Provider] Post-migration session_exercises columns:', 
        postMigrationTableInfo.map(col => `${col.name} (${col.type})`).join(', '));
      
      const nowHasCompletedColumn = postMigrationTableInfo.some(col => col.name === 'completed');
      console.log('[Provider] Post-migration has completed column:', nowHasCompletedColumn);
      
      if (!nowHasCompletedColumn) {
        console.error('[Provider] CRITICAL ERROR: Migration did not add the completed column!');
      }
    } else {
      console.error('[Provider] CRITICAL ERROR: session_exercises table not found after migration!');
    }
  } catch (error) {
    console.error('[Provider] Error verifying migration:', error);
  }

  console.log('[Provider] Database initialization complete');
  console.log('[Provider] ==========================================');
} 