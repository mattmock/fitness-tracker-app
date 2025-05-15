import type { 
  SQLiteDatabase as ExpoSQLiteDatabase,
  SQLiteBindParams,
  SQLiteVariadicBindParams,
  SQLiteRunResult
} from 'expo-sqlite';

export interface SQLiteDatabase {
  // Core methods from Expo
  execAsync(source: string): Promise<void>;
  runAsync(
    source: string,
    params: SQLiteBindParams
  ): Promise<SQLiteRunResult>;
  runAsync(
    source: string,
    ...params: SQLiteVariadicBindParams
  ): Promise<SQLiteRunResult>;
  
  // Our custom methods
  getFirstAsync<T = any>(sql: string): Promise<T | null>;
  getAllAsync<T = any>(sql: string): Promise<T[]>;
  isInTransactionAsync(): Promise<boolean>;

  // Additional methods needed by services
  databasePath: string;
  options: { enableMultipleConnections: boolean };
  nativeDatabase: any;
  closeAsync(): Promise<void>;
  deleteAsync(): Promise<void>;
  transactionAsync<T>(callback: (tx: SQLiteDatabase) => Promise<T>): Promise<T>;
  readTransactionAsync<T>(callback: (tx: SQLiteDatabase) => Promise<T>): Promise<T>;
  execAsync(source: string, params?: any[]): Promise<void>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  runAsync(sql: string, params?: any[]): Promise<SQLiteRunResult>;
}

// Helper function to cast Expo's database to our interface
export function castToSQLiteDatabase(db: ExpoSQLiteDatabase): SQLiteDatabase {
  return db as unknown as SQLiteDatabase;
} 