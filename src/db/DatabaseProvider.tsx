import React, { useEffect, useState } from 'react';
import { initializeSchema } from './DatabaseSetup';
import { openDatabaseAsync } from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { View, Text, StyleSheet } from 'react-native';

interface DatabaseContextType {
  db: SQLiteDatabase | null;
}

const DatabaseContext = React.createContext<DatabaseContextType>({ db: null });

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDatabaseAsync('fitness-tracker.db');
        await initializeSchema(database);
        setDb(database);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initDB();

    return () => {
      if (db) {
        db.closeAsync().catch(console.error);
      } else {
        console.warn('Database connection not established during cleanup');
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          <Text style={styles.errorText}>Database initialization failed</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DatabaseContext.Provider value={{ db }}>
        {children}
      </DatabaseContext.Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export const useDatabase = () => {
  const context = React.useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
