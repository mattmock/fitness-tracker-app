import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

interface QueryParams {
  [key: string]: string | number | boolean | null;
}

interface DatabaseConnection {
  db: SQLiteDatabase | null;
  init: () => Promise<void>;
  close: () => Promise<void>;
  executeTransaction: (query: string, params?: QueryParams) => Promise<void>;
}

// Initialize database connection
const database: DatabaseConnection = {
  db: null,

  async init() {
    try {
      this.db = await openDatabaseAsync('fitness-tracker.db');
      console.log('Database initialized');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  },

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  },

  async executeTransaction(query: string, params: QueryParams = {}) {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(query, params);
  }
};

export default database;