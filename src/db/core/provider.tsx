import React, { useMemo } from 'react';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { DATABASE_NAME } from '../schema/schema';
import { migrateDbIfNeeded } from './databaseSetup';
import { DatabaseContext } from './hooks';
import type { DatabaseProviderProps } from './types';
import { ExerciseService, RoutineService, SessionService } from '../services';

/**
 * Internal provider component that provides database context
 */
export function DatabaseContextProvider({ children }: DatabaseProviderProps) {
  const db = useSQLiteContext();

  const services = useMemo(() => ({
    exerciseService: new ExerciseService(db),
    routineService: new RoutineService(db),
    sessionService: new SessionService(db)
  }), [db]);

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
  return (
    <SQLiteProvider 
      databaseName={DATABASE_NAME}
      onInit={migrateDbIfNeeded}
      useSuspense
      children={<DatabaseContextProvider children={children} />}
    />
  );
}

export { useDatabaseContext } from './hooks';
