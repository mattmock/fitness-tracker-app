import React, { useMemo, useEffect } from 'react';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { DATABASE_NAME } from '../schema/schema';
import { migrateDbIfNeeded } from './databaseSetup';
import { DatabaseContext } from './hooks';
import type { DatabaseProviderProps } from './types';
import type { SQLiteDatabase } from './sqlite';
import { castToSQLiteDatabase } from './sqlite';
import { ExerciseService, RoutineService, SessionService } from '../services';

/**
 * Internal provider component that provides database context
 */
export function DatabaseContextProvider({ children }: DatabaseProviderProps) {
  console.log('[DatabaseContextProvider] Initializing...');
  const expoDb = useSQLiteContext();
  const db = castToSQLiteDatabase(expoDb);
  console.log('[DatabaseContextProvider] SQLite context obtained:', db ? 'yes' : 'no');

  useEffect(() => {
    // Only run on mount
    migrateDbIfNeeded(db).catch((err) => {
      console.error('[DatabaseContextProvider] Migration failed:', err);
    });
  }, [db]);

  const services = useMemo(() => {
    console.log('[DatabaseContextProvider] Creating services...');
    return {
      exerciseService: new ExerciseService(db),
      routineService: new RoutineService(db),
      sessionService: new SessionService(db)
    };
  }, [db]);

  const forceReset = async () => {
    try {
      console.log('[Provider] Force resetting database...');
      await db.execAsync('PRAGMA user_version = 0');
      await migrateDbIfNeeded(db);
      console.log('[Provider] Force reset complete');
    } catch (error) {
      console.error('[Provider] Force reset failed:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    forceReset,
    ...services
  }), [services]);

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Main database provider that sets up SQLite and provides database context
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  console.log('[DatabaseProvider] Initializing...');
  return (
    <SQLiteProvider 
      databaseName={DATABASE_NAME}
      useSuspense
    >
      <DatabaseContextProvider>
        {children}
      </DatabaseContextProvider>
    </SQLiteProvider>
  );
}

export { useDatabaseContext } from './hooks';
