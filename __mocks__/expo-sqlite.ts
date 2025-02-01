export const openDatabaseAsync = jest.fn(() => ({
  execAsync: jest.fn(),
  closeAsync: jest.fn(),
  getFirstAsync: jest.fn(),
}));

export const SQLiteDatabase = {
  prototype: {},
}; 