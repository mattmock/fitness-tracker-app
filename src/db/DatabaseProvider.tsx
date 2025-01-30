import React, { useEffect, useState } from 'react';
import database from './database';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { View, Text, StyleSheet } from 'react-native';

export default function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await database.init();
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
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
      {children}
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
