import { SQLiteDatabase } from 'expo-sqlite';

// Current schema version
const SCHEMA_VERSION = 1;

// Initialize database schema
export async function initializeSchema(db: SQLiteDatabase): Promise<void> {
  try {
    // Create Exercise table
    await createExerciseTable(db);
    
    // Update schema version (correct PRAGMA syntax)
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Schema initialization failed:', error);
    throw error;
  }
}

// Create Exercise table (simplified)
async function createExerciseTable(db: SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Exercise (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        tags TEXT,
        variations TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      );
    `);
    console.log('Exercise table created/verified');
  } catch (error) {
    console.error('Failed to create Exercise table:', error);
    throw error;
  }
}

// Export getSchemaVersion
export async function getSchemaVersion(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  return result?.user_version || 0;
}

// Set schema version (correct method)
async function setSchemaVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

// Main initialization function
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  try {
    console.log('Starting database initialization...');
    const currentVersion = await getSchemaVersion(db);
    
    if (currentVersion === 0) {
      console.log('Fresh install detected, initializing schema...');
      await initializeSchema(db);
    } else if (currentVersion < SCHEMA_VERSION) {
      console.warn(`Migration required from version ${currentVersion} to ${SCHEMA_VERSION}`);
      throw new Error('Migrations not yet implemented');
    } else {
      console.log('Database already at current version');
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
