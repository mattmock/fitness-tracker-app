import { type SQLiteDatabase } from 'expo-sqlite';
import { schema } from '../schema/schema';

/**
 * Migrates the database to the latest version.
 */
export async function migrateDatabase(db: SQLiteDatabase) {
  // Get current database version
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;
  
  console.log(`[Migration] Starting migration from version ${currentVersion} to ${schema.version}`);

  // If database is already at latest version, skip migration
  if (currentVersion >= schema.version) {
    console.log(`[Migration] Database already at version ${currentVersion}, skipping migration`);
    return;
  }

  // Begin transaction for migrations
  console.log(`[Migration] Beginning transaction for migration`);
  await db.execAsync('BEGIN TRANSACTION');

  try {
    // Apply specific migrations based on current version
    if (currentVersion < 1) {
      console.log(`[Migration] Applying initial schema creation (version 1)`);
      // Initial schema creation
      for (const statement of schema.statements) {
        await db.execAsync(statement);
      }
    } else if (currentVersion === 1) {
      console.log(`[Migration] Applying migration from version 1 to 2: Adding completed and updated_at columns`);
      // Migration from version 1 to 2: Add completed and updated_at columns
      // SQLite requires separate ALTER TABLE statements
      try {
        console.log(`[Migration] Adding completed column to session_exercises`);
        await db.execAsync('ALTER TABLE session_exercises ADD COLUMN completed INTEGER;');
        console.log(`[Migration] Successfully added completed column`);
      } catch (error) {
        console.error(`[Migration] Error adding completed column:`, error);
        throw error;
      }
      
      try {
        console.log(`[Migration] Adding updated_at column to session_exercises`);
        await db.execAsync('ALTER TABLE session_exercises ADD COLUMN updated_at TEXT;');
        console.log(`[Migration] Successfully added updated_at column`);
      } catch (error) {
        console.error(`[Migration] Error adding updated_at column:`, error);
        throw error;
      }
      
      // Verify the columns were added
      try {
        console.log(`[Migration] Verifying columns were added`);
        const tableInfo = await db.getAllAsync('PRAGMA table_info(session_exercises)');
        const columns = tableInfo.map((col: any) => col.name);
        console.log(`[Migration] session_exercises columns after migration:`, columns);
        
        const hasCompletedColumn = columns.includes('completed');
        const hasUpdatedAtColumn = columns.includes('updated_at');
        
        console.log(`[Migration] Has completed column: ${hasCompletedColumn}`);
        console.log(`[Migration] Has updated_at column: ${hasUpdatedAtColumn}`);
        
        if (!hasCompletedColumn || !hasUpdatedAtColumn) {
          throw new Error(`Migration failed: Missing columns after migration`);
        }
      } catch (error) {
        console.error(`[Migration] Error verifying columns:`, error);
        throw error;
      }
    }

    // Update database version
    console.log(`[Migration] Updating database version to ${schema.version}`);
    await db.execAsync(`PRAGMA user_version = ${schema.version}`);
    
    // Commit transaction
    console.log(`[Migration] Committing transaction`);
    await db.execAsync('COMMIT');
    console.log(`[Migration] Migration completed successfully`);
  } catch (error) {
    // Rollback on error
    console.error(`[Migration] Error during migration, rolling back:`, error);
    await db.execAsync('ROLLBACK');
    throw error;
  }
} 