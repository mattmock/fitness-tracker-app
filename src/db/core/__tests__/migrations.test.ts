import { type SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase } from '../migrations';
import { schema } from '../../schema/schema';

describe('migrateDatabase', () => {
  let mockDb: jest.Mocked<SQLiteDatabase>;

  beforeEach(() => {
    mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 0 }),
      execAsync: jest.fn().mockResolvedValue(undefined),
      isInTransactionAsync: jest.fn(),
      closeAsync: jest.fn(),
      deleteAsync: jest.fn(),
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
    } as unknown as jest.Mocked<SQLiteDatabase>;

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should migrate when version is outdated', async () => {
    // Setup: database at version 0
    mockDb.getFirstAsync.mockResolvedValueOnce({ user_version: 0 });

    // Execute migration
    await migrateDatabase(mockDb);

    // Verify all schema statements were executed
    for (const statement of schema.statements) {
      expect(mockDb.execAsync).toHaveBeenCalledWith(statement);
    }

    // Verify version was updated
    expect(mockDb.execAsync).toHaveBeenCalledWith(`PRAGMA user_version = ${schema.version}`);
  });

  it('should not migrate database when version is up-to-date', async () => {
    // Setup: database at current version
    mockDb.getFirstAsync.mockResolvedValueOnce({ user_version: schema.version });

    // Execute migration
    await migrateDatabase(mockDb);

    // Verify no schema statements were executed
    for (const statement of schema.statements) {
      expect(mockDb.execAsync).not.toHaveBeenCalledWith(statement);
    }

    // Verify version was not updated
    expect(mockDb.execAsync).not.toHaveBeenCalledWith(`PRAGMA user_version = ${schema.version}`);
  });

  it('should propagate errors during migration', async () => {
    // Setup: mock an error during execution
    const error = new Error('Database error');
    mockDb.execAsync.mockRejectedValueOnce(error);

    // Verify error is propagated
    await expect(migrateDatabase(mockDb)).rejects.toThrow('Database error');
  });

  it('should handle null user_version result', async () => {
    // Setup: database returns null for user_version
    mockDb.getFirstAsync.mockResolvedValueOnce(null);

    // Execute migration
    await migrateDatabase(mockDb);

    // Verify all schema statements were executed (treats null as version 0)
    for (const statement of schema.statements) {
      expect(mockDb.execAsync).toHaveBeenCalledWith(statement);
    }

    // Verify version was updated
    expect(mockDb.execAsync).toHaveBeenCalledWith(`PRAGMA user_version = ${schema.version}`);
  });
}); 