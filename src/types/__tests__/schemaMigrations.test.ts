/**
 * Schema Migrations Tests
 * 
 * These tests verify that database schema migrations align with the centralized type system.
 * They ensure that schema changes are correctly implemented and match type definitions.
 */

import { SQLiteDatabase } from '../../db/core/sqlite';
import { schema } from '../../db/schema/schema';
import { migrateDatabase } from '../../db/core/migrations';

// Mock the SQLite database
class MockSQLiteDatabase implements Partial<SQLiteDatabase> {
  userVersion = 0;
  execAsyncCalls: string[] = [];
  
  execAsync = jest.fn().mockImplementation((query: string) => {
    this.execAsyncCalls.push(query);
    
    // Handle version updates
    if (query.startsWith('PRAGMA user_version =')) {
      this.userVersion = parseInt(query.split('=')[1].trim());
    }
    
    return Promise.resolve();
  });
  
  getFirstAsync = jest.fn().mockImplementation((query: string) => {
    if (query === 'PRAGMA user_version') {
      return Promise.resolve({ user_version: this.userVersion });
    }
    return Promise.resolve(null);
  });

  // Add missing required methods
  deleteAsync = jest.fn().mockResolvedValue(undefined);
  transactionAsync = jest.fn().mockResolvedValue(undefined);
  readTransactionAsync = jest.fn().mockResolvedValue(undefined);
}

describe('Schema Migrations', () => {
  let mockDb: MockSQLiteDatabase;
  
  beforeEach(() => {
    mockDb = new MockSQLiteDatabase();
  });
  
  it('verifies schema version matches latest in schema file', () => {
    // This test ensures that when we update types, we also update the schema version
    expect(schema.version).toBe(2);
  });
  
  it('migrates database from version 0 to latest version', async () => {
    // Set up version 0 database (empty)
    mockDb.userVersion = 0;
    
    // Run migration
    await migrateDatabase(mockDb as unknown as SQLiteDatabase);
    
    // Verify correct schema version after migration
    expect(mockDb.userVersion).toBe(2);
    
    // Check that all schema creation statements are executed
    for (const statement of schema.statements) {
      expect(mockDb.execAsyncCalls).toContain(statement);
    }
  });
  
  it('does nothing when already at latest version', async () => {
    // Set up version 2 database (already at latest version)
    mockDb.userVersion = 2;
    
    // Run migration
    await migrateDatabase(mockDb as unknown as SQLiteDatabase);
    
    // Verify version remains at 2
    expect(mockDb.userVersion).toBe(2);
    
    // Verify that no schema changes were executed
    expect(mockDb.execAsyncCalls).not.toContain('CREATE TABLE IF NOT EXISTS exercises');
  });
}); 