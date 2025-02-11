import React, { createContext, useContext } from 'react';
import { SQLiteProvider, type SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { DATABASE_NAME, schema } from './database';
import { SEED_DB } from '@env';
import { resetDevDatabase } from './dev/devDatabaseUtils';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

interface DatabaseContextValue {
  forceReset: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}

/**
 * Initializes or migrates the database schema.
 * If SEED_DB is true, it will reset the database with development data.
 */
async function migrateDbIfNeeded(db: SQLiteDatabase) {
  console.log('Starting database initialization...');
  
  // Set up database configuration
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Check current schema version
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;
  console.log('Current database version:', currentVersion);

  // Development mode: reset database with sample data
  if (SEED_DB === 'true') {
    console.log('Development mode: resetting database with sample data...');
    await resetDevDatabase(db);
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log('Development database setup complete');
    return;
  }

  // Production mode: normal schema migration
  if (currentVersion < DATABASE_VERSION) {
    console.log('Migrating database to version', DATABASE_VERSION);
    
    // Create or update schema
    for (const statement of schema) {
      await db.execAsync(statement);
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log('Migration complete');
  }

  console.log('Database initialization complete');
}

/**
 * Internal provider component that provides database context
 */
function DatabaseContextProvider({ children }: DatabaseProviderProps) {
  const db = useSQLiteContext();

  const forceReset = async () => {
    console.log('Force resetting database...');
    await resetDevDatabase(db);
    await db.execAsync('PRAGMA user_version = 1');
    console.log('Force reset complete');
  };

  return (
    <DatabaseContext.Provider value={{ forceReset }}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Main database provider that sets up SQLite and provides database context
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <SQLiteProvider 
      databaseName={DATABASE_NAME}
      onInit={migrateDbIfNeeded}
      useSuspense
      children={<DatabaseContextProvider children={children} />}
    />
  );
}
