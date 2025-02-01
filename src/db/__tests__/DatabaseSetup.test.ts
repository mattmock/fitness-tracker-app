import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { initializeDatabase, getSchemaVersion } from '../DatabaseSetup';

jest.mock('expo-sqlite');

const mockExecAsync = jest.fn();
const mockGetFirstAsync = jest.fn();

// Enhanced mock implementation
(openDatabaseAsync as jest.Mock).mockImplementation(() => ({
  execAsync: mockExecAsync,
  closeAsync: jest.fn(),
  getFirstAsync: mockGetFirstAsync,
}));

describe('Database Setup', () => {
  beforeEach(() => {
    // Reset mocks between tests
    mockExecAsync.mockReset();
    mockGetFirstAsync.mockReset();
  });

  it('should initialize fresh database', async () => {
    // Simulate fresh install (version 0)
    mockGetFirstAsync.mockResolvedValueOnce({ user_version: 0 });
    
    const db = await openDatabaseAsync(':memory:');
    await initializeDatabase(db);

    // Verify table creation
    expect(mockExecAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS Exercise')
    );
    
    // Verify version update
    expect(mockExecAsync).toHaveBeenCalledWith(
      'PRAGMA user_version = 1'
    );
  });

  it('should not recreate tables on existing database', async () => {
    // Simulate existing database (version 1)
    mockGetFirstAsync.mockResolvedValueOnce({ user_version: 1 });
    
    const db = await openDatabaseAsync(':memory:');
    await initializeDatabase(db);

    // Verify no table creation attempts
    expect(mockExecAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE')
    );
  });
}); 