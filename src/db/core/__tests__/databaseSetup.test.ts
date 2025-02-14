import { type SQLiteDatabase } from 'expo-sqlite';
import { migrateDbIfNeeded } from '../databaseSetup';
import { migrateDatabase } from '../migrations';

// Mock the migrations module
jest.mock('../migrations', () => ({
  migrateDatabase: jest.fn(),
}));

// Use the mock database class from jest.setup.js
class MockSQLiteDatabase {
  execAsync = jest.fn().mockResolvedValue(undefined);
  getFirstAsync = jest.fn().mockResolvedValue(undefined);
  isInTransactionAsync = jest.fn().mockResolvedValue(false);
  closeAsync = jest.fn().mockResolvedValue(undefined);
  deleteAsync = jest.fn().mockResolvedValue(undefined);
  getAllAsync = jest.fn().mockResolvedValue([]);
  runAsync = jest.fn().mockResolvedValue(undefined);
}

describe('Database Setup', () => {
  let mockDb: MockSQLiteDatabase;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new mock database instance
    mockDb = new MockSQLiteDatabase();
  });

  describe('migrateDbIfNeeded', () => {
    it('configures database with correct PRAGMA settings', async () => {
      await migrateDbIfNeeded(mockDb as unknown as SQLiteDatabase);

      // Verify PRAGMA settings
      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA journal_mode = WAL;');
      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
    });

    it('calls migrateDatabase with the database instance', async () => {
      await migrateDbIfNeeded(mockDb as unknown as SQLiteDatabase);

      expect(migrateDatabase).toHaveBeenCalledWith(mockDb);
      expect(migrateDatabase).toHaveBeenCalledTimes(1);
    });

    it('handles database configuration errors', async () => {
      const error = new Error('PRAGMA configuration failed');
      mockDb.execAsync.mockRejectedValueOnce(error);

      await expect(migrateDbIfNeeded(mockDb as unknown as SQLiteDatabase))
        .rejects.toThrow('PRAGMA configuration failed');
    });

    it('handles migration errors', async () => {
      const error = new Error('Migration failed');
      (migrateDatabase as jest.Mock).mockRejectedValueOnce(error);

      await expect(migrateDbIfNeeded(mockDb as unknown as SQLiteDatabase))
        .rejects.toThrow('Migration failed');
    });

    it('executes database operations in correct order', async () => {
      await migrateDbIfNeeded(mockDb as unknown as SQLiteDatabase);

      // Check the order of operations using mock.calls
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'PRAGMA journal_mode = WAL;');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(2, 'PRAGMA foreign_keys = ON;');
      
      // Verify migrateDatabase was called after PRAGMA settings
      const execCalls = mockDb.execAsync.mock.calls.length;
      const migrateCalls = (migrateDatabase as jest.Mock).mock.invocationCallOrder[0];
      const lastExecCall = mockDb.execAsync.mock.invocationCallOrder[execCalls - 1];
      expect(migrateCalls).toBeGreaterThan(lastExecCall);
    });
  });
}); 