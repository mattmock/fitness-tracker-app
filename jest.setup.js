// Mock expo-sqlite
jest.mock('expo-sqlite', () => {
  class MockSQLiteDatabase {
    getFirstAsync = jest.fn();
    execAsync = jest.fn();
    isInTransactionAsync = jest.fn();
    closeAsync = jest.fn();
    deleteAsync = jest.fn();
    getAllAsync = jest.fn();
    runAsync = jest.fn();
  }

  return {
    SQLiteProvider: ({ children }) => children,
    useSQLiteContext: () => new MockSQLiteDatabase(),
  };
}); 