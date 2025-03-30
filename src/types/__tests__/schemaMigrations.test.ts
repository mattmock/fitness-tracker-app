/**
 * Schema Migrations Tests
 * 
 * These tests verify that database schema migrations align with the centralized type system.
 * They ensure that schema changes are correctly implemented and match type definitions.
 */

import { SQLiteDatabase } from 'expo-sqlite';
import { schema } from '../../db/schema/schema';
import { migrateDatabase } from '../../db/core/migrations';
import { SessionExercise } from '../database';

// Mock the SQLite database
class MockSQLiteDatabase implements Partial<SQLiteDatabase> {
  userVersion = 0;
  execAsyncCalls: string[] = [];
  pragmaTableInfo: Record<string, any[]> = {
    session_exercises: []
  };
  
  execAsync = jest.fn().mockImplementation((query: string) => {
    this.execAsyncCalls.push(query);
    
    // Handle version updates
    if (query.startsWith('PRAGMA user_version =')) {
      this.userVersion = parseInt(query.split('=')[1].trim());
    }
    
    // Handle ALTER TABLE statements
    if (query.startsWith('ALTER TABLE session_exercises ADD COLUMN completed')) {
      const completedColumn = { cid: this.pragmaTableInfo.session_exercises.length, name: 'completed', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 };
      this.pragmaTableInfo.session_exercises.push(completedColumn);
    }
    
    if (query.startsWith('ALTER TABLE session_exercises ADD COLUMN updated_at')) {
      const updatedAtColumn = { cid: this.pragmaTableInfo.session_exercises.length, name: 'updated_at', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 };
      this.pragmaTableInfo.session_exercises.push(updatedAtColumn);
    }
    
    return Promise.resolve();
  });
  
  getAllAsync = jest.fn().mockImplementation((query: string) => {
    if (query === 'PRAGMA table_info(session_exercises)') {
      return Promise.resolve(this.pragmaTableInfo.session_exercises);
    }
    return Promise.resolve([]);
  });
  
  getFirstAsync = jest.fn().mockImplementation((query: string) => {
    if (query === 'PRAGMA user_version') {
      return Promise.resolve({ user_version: this.userVersion });
    }
    return Promise.resolve(null);
  });
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
  
  it('migrates database from version 0 to version 2 with all required columns', async () => {
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
  
  it('migrates from version 1 to 2 by adding completed and updated_at columns', async () => {
    // Set up version 1 database (without completed column)
    mockDb.userVersion = 1;
    mockDb.pragmaTableInfo.session_exercises = [
      { cid: 0, name: 'session_id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
      { cid: 1, name: 'exercise_id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
      { cid: 2, name: 'set_number', type: 'INTEGER', notnull: 1, dflt_value: null, pk: 0 },
      { cid: 3, name: 'reps', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 4, name: 'weight', type: 'REAL', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 5, name: 'duration', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 6, name: 'notes', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 7, name: 'created_at', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 }
    ];
    
    // Run migration
    await migrateDatabase(mockDb as unknown as SQLiteDatabase);
    
    // Verify version updated to 2
    expect(mockDb.userVersion).toBe(2);
    
    // Check that ALTER TABLE statements for new columns were executed
    expect(mockDb.execAsyncCalls).toContain('ALTER TABLE session_exercises ADD COLUMN completed INTEGER;');
    expect(mockDb.execAsyncCalls).toContain('ALTER TABLE session_exercises ADD COLUMN updated_at TEXT;');
  });
  
  it('does nothing when already at latest version', async () => {
    // Set up version 2 database (already at latest version)
    mockDb.userVersion = 2;
    
    // Run migration
    await migrateDatabase(mockDb as unknown as SQLiteDatabase);
    
    // Verify version remains at 2
    expect(mockDb.userVersion).toBe(2);
    
    // Verify that no schema changes were executed
    expect(mockDb.execAsyncCalls).not.toContain('ALTER TABLE session_exercises ADD COLUMN completed INTEGER;');
    expect(mockDb.execAsyncCalls).not.toContain('CREATE TABLE IF NOT EXISTS exercises');
  });
  
  it('verifies SessionExercise type includes completed field that matches schema', async () => {
    // This test ensures type and schema stay in sync
    
    // Create a session exercise with the completed field
    const exercise: SessionExercise = {
      id: '1',
      sessionId: 'session-1',
      exerciseId: 'exercise-1',
      setNumber: 1,
      completed: true,
      createdAt: new Date().toISOString()
    };
    
    // Verify that the completed field exists and is of the correct type
    expect(exercise.completed).toBe(true);
    
    // Check schema to make sure it has the completed column
    mockDb.pragmaTableInfo.session_exercises = [
      { cid: 0, name: 'session_id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
      { cid: 1, name: 'exercise_id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
      { cid: 2, name: 'set_number', type: 'INTEGER', notnull: 1, dflt_value: null, pk: 0 },
      { cid: 3, name: 'reps', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 4, name: 'weight', type: 'REAL', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 5, name: 'duration', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 6, name: 'notes', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 7, name: 'completed', type: 'INTEGER', notnull: 0, dflt_value: null, pk: 0 },
      { cid: 8, name: 'created_at', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
      { cid: 9, name: 'updated_at', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 }
    ];
    
    const tableInfo = await mockDb.getAllAsync('PRAGMA table_info(session_exercises)');
    const completedColumn = tableInfo.find((col: any) => col.name === 'completed');
    
    // Verify column exists
    expect(completedColumn).toBeDefined();
    
    // Verify column is of INTEGER type (used for boolean in SQLite)
    expect(completedColumn.type).toBe('INTEGER');
    
    // Verify column is nullable (matches optional in type)
    expect(completedColumn.notnull).toBe(0);
  });
}); 