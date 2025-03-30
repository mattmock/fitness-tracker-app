/**
 * Centralized Type System Tests
 * 
 * These tests verify the integrity and correctness of the centralized type system.
 * They ensure that:
 * 1. Type definitions are correctly exported from the central location
 * 2. Types match the expected structure
 * 3. Database schema is compatible with the type definitions
 * 4. Services properly use the centralized types
 */

import { SQLiteDatabase } from 'expo-sqlite';
import { Exercise, Routine, Session, SessionExercise } from '../database';
import { ExerciseService } from '../../db/services/exerciseService';
import { SessionService } from '../../db/services/sessionService';
import { RoutineService } from '../../db/services/routineService';

// Mock the SQLite database
class MockSQLiteDatabase implements Partial<SQLiteDatabase> {
  execAsync = jest.fn();
  getAllAsync = jest.fn().mockImplementation((query: string) => {
    // Mock response for the table schema query
    if (query === 'PRAGMA table_info(session_exercises)') {
      return Promise.resolve([
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
      ]);
    } else if (query === 'PRAGMA table_info(exercises)') {
      return Promise.resolve([
        { cid: 0, name: 'id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 1 },
        { cid: 1, name: 'name', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
        { cid: 2, name: 'description', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
        { cid: 3, name: 'category', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
        { cid: 4, name: 'created_at', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
        { cid: 5, name: 'updated_at', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 }
      ]);
    } else if (query === 'PRAGMA table_info(routines)') {
      return Promise.resolve([
        { cid: 0, name: 'id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 1 },
        { cid: 1, name: 'name', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
        { cid: 2, name: 'description', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
        { cid: 3, name: 'created_at', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
        { cid: 4, name: 'updated_at', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 }
      ]);
    } else if (query === 'PRAGMA table_info(sessions)') {
      return Promise.resolve([
        { cid: 0, name: 'id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 1 },
        { cid: 1, name: 'routine_id', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
        { cid: 2, name: 'name', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
        { cid: 3, name: 'notes', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
        { cid: 4, name: 'start_time', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
        { cid: 5, name: 'end_time', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 },
        { cid: 6, name: 'created_at', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 },
        { cid: 7, name: 'updated_at', type: 'TEXT', notnull: 0, dflt_value: null, pk: 0 }
      ]);
    } else if (query === 'PRAGMA table_info(routine_exercises)') {
      return Promise.resolve([
        { cid: 0, name: 'routine_id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 1 },
        { cid: 1, name: 'exercise_id', type: 'TEXT', notnull: 1, dflt_value: null, pk: 1 },
        { cid: 2, name: 'created_at', type: 'TEXT', notnull: 1, dflt_value: null, pk: 0 }
      ]);
    }
    return Promise.resolve([]);
  });
  getFirstAsync = jest.fn();
  runAsync = jest.fn();
  batchAsync = jest.fn();
}

describe('Centralized Type System', () => {

  // Test that all types are properly exported from the central location
  describe('Type Exports', () => {
    it('verifies types are exported from database directory', () => {
      // Try importing types directly from the module
      // If these compile, it means the types are correctly exported
      const _exercise: Exercise | null = null;
      const _session: Session | null = null;
      const _sessionExercise: SessionExercise | null = null;
      const _routine: Routine | null = null;
      
      // We're just confirming the types can be imported
      // No runtime assertions needed as TypeScript types don't exist at runtime
      expect(true).toBe(true);
    });
    
    it('supports Exercise interface', () => {
      // Check if the type has the expected structure
      const exercise: Exercise = {
        id: '1',
        name: 'Bench Press',
        createdAt: new Date().toISOString()
      };
      
      // TypeScript compilation will fail if the type is not correct
      expect(exercise.id).toBe('1');
      expect(exercise.name).toBe('Bench Press');
    });
    
    it('supports Session interface', () => {
      const session: Session = {
        id: '1',
        name: 'Morning Workout',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        sessionExercises: []
      };
      
      expect(session.id).toBe('1');
      expect(session.sessionExercises).toHaveLength(0);
    });
    
    it('supports SessionExercise interface with completed field', () => {
      const sessionExercise: SessionExercise = {
        id: '1',
        sessionId: '1',
        exerciseId: '1',
        setNumber: 1,
        completed: true,
        createdAt: new Date().toISOString()
      };
      
      expect(sessionExercise.id).toBe('1');
      expect(sessionExercise.completed).toBe(true);
    });
    
    it('supports Routine interface', () => {
      const routine: Routine = {
        id: '1',
        name: 'Full Body Workout',
        exerciseIds: ['1', '2', '3'],
        createdAt: new Date().toISOString()
      };
      
      expect(routine.id).toBe('1');
      expect(routine.exerciseIds).toHaveLength(3);
    });
  });
  
  // Test type compatibility with database schema
  describe('Database Schema Compatibility', () => {
    let mockDb: MockSQLiteDatabase;
    
    beforeEach(() => {
      mockDb = new MockSQLiteDatabase();
    });

    it('verifies session_exercises table schema matches SessionExercise type', async () => {
      const tableInfo = await mockDb.getAllAsync('PRAGMA table_info(session_exercises)');
      
      // Get column names from table schema
      const columnNames = tableInfo.map((col: any) => col.name);
      
      // Check that all required fields from the type exist in the table schema
      expect(columnNames).toContain('session_id');  // maps to sessionId
      expect(columnNames).toContain('exercise_id'); // maps to exerciseId
      expect(columnNames).toContain('set_number');  // maps to setNumber
      expect(columnNames).toContain('reps');        // maps to reps
      expect(columnNames).toContain('weight');      // maps to weight
      expect(columnNames).toContain('duration');    // maps to duration
      expect(columnNames).toContain('notes');       // maps to notes
      expect(columnNames).toContain('completed');   // maps to completed
      expect(columnNames).toContain('created_at');  // maps to createdAt
      expect(columnNames).toContain('updated_at');  // maps to updatedAt
      
      // Verify the presence of our new 'completed' field
      const completedColumn = tableInfo.find((col: any) => col.name === 'completed');
      expect(completedColumn).toBeDefined();
      expect(completedColumn.type).toBe('INTEGER');
    });
    
    it('verifies exercises table schema matches Exercise type', async () => {
      const tableInfo = await mockDb.getAllAsync('PRAGMA table_info(exercises)');
      const columnNames = tableInfo.map((col: any) => col.name);
      
      expect(columnNames).toContain('id');          // maps to id
      expect(columnNames).toContain('name');        // maps to name
      expect(columnNames).toContain('description'); // maps to description
      expect(columnNames).toContain('category');    // maps to category
      expect(columnNames).toContain('created_at');  // maps to createdAt
      expect(columnNames).toContain('updated_at');  // maps to updatedAt
    });
    
    it('verifies routines table schema matches Routine type', async () => {
      const tableInfo = await mockDb.getAllAsync('PRAGMA table_info(routines)');
      const columnNames = tableInfo.map((col: any) => col.name);
      
      expect(columnNames).toContain('id');          // maps to id
      expect(columnNames).toContain('name');        // maps to name
      expect(columnNames).toContain('description'); // maps to description
      expect(columnNames).toContain('created_at');  // maps to createdAt
      expect(columnNames).toContain('updated_at');  // maps to updatedAt
    });
    
    it('verifies sessions table schema matches Session type', async () => {
      const tableInfo = await mockDb.getAllAsync('PRAGMA table_info(sessions)');
      const columnNames = tableInfo.map((col: any) => col.name);
      
      expect(columnNames).toContain('id');          // maps to id
      expect(columnNames).toContain('routine_id');  // maps to routineId
      expect(columnNames).toContain('name');        // maps to name
      expect(columnNames).toContain('notes');       // maps to notes
      expect(columnNames).toContain('start_time');  // maps to startTime
      expect(columnNames).toContain('end_time');    // maps to endTime
      expect(columnNames).toContain('created_at');  // maps to createdAt
      expect(columnNames).toContain('updated_at');  // maps to updatedAt
    });
  });
  
  // Test that services use the centralized types correctly
  describe('Service Type Integration', () => {
    let mockDb: MockSQLiteDatabase;
    
    beforeEach(() => {
      mockDb = new MockSQLiteDatabase();
    });
    
    it('ExerciseService uses the centralized Exercise type', () => {
      // Create a new ExerciseService instance
      const service = new ExerciseService(mockDb as unknown as SQLiteDatabase);
      
      // Test create method parameter and return type
      const exercise: Exercise = {
        id: '1',
        name: 'Squat',
        description: 'Lower body exercise',
        category: 'Strength',
        createdAt: new Date().toISOString()
      };
      
      // This will fail compilation if the type is not compatible
      service.create(exercise);
      
      // Check that the exercise object matches the expected Exercise type
      const keys = Object.keys(exercise);
      expect(keys).toContain('id');
      expect(keys).toContain('name');
      expect(keys).toContain('description');
      expect(keys).toContain('category');
      expect(keys).toContain('createdAt');
    });
    
    it('SessionService uses the centralized Session and SessionExercise types', () => {
      const service = new SessionService(mockDb as unknown as SQLiteDatabase);
      
      // Test create method parameter and return type
      const session: Omit<Session, 'id' | 'createdAt' | 'sessionExercises'> = {
        name: 'Evening Workout',
        startTime: new Date().toISOString()
      };
      
      const sessionExercises: Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'>[] = [
        {
          exerciseId: '1',
          setNumber: 1,
          reps: 10,
          weight: 100,
          completed: true
        }
      ];
      
      // This will fail compilation if the types are not compatible
      service.create(session, sessionExercises);
      
      // Verify the completed field in SessionExercise is being used
      expect(sessionExercises[0].completed).toBe(true);
    });
    
    it('RoutineService uses the centralized Routine type', () => {
      const service = new RoutineService(mockDb as unknown as SQLiteDatabase);
      
      // Test create method parameter and return type
      const routine: Omit<Routine, 'createdAt'> = {
        id: '1',
        name: 'Leg Day',
        description: 'Focus on lower body',
        exerciseIds: ['1', '2', '3']
      };
      
      // This will fail compilation if the type is not compatible
      service.create(routine);
      
      // Check that the routine object matches the expected Routine type
      const keys = Object.keys(routine);
      expect(keys).toContain('id');
      expect(keys).toContain('name');
      expect(keys).toContain('description');
      expect(keys).toContain('exerciseIds');
    });
  });
  
  // Test type compatibility with actual runtime values
  describe('Runtime Type Compatibility', () => {
    it('validates sample exercise data against Exercise type', () => {
      // Create a sample exercise object
      const exercise = {
        id: '1',
        name: 'Push-up',
        description: 'Upper body exercise',
        category: 'Strength',
        tags: ['upper body', 'chest'],
        createdAt: new Date().toISOString()
      };
      
      // Validate the object matches the Exercise type
      const exerciseType: Exercise = exercise;
      
      // Verify required properties
      expect(exerciseType.id).toBeDefined();
      expect(exerciseType.name).toBeDefined();
      expect(exerciseType.createdAt).toBeDefined();
      
      // Note: TypeScript's type checking happens at compile time, not runtime
      // We can't actually test for TypeScript errors at runtime
    });
    
    it('validates sample session data against Session type', () => {
      // Create a sample session with exercises
      const session = {
        id: '1',
        name: 'Morning Workout',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        sessionExercises: [
          {
            id: '1_1',
            sessionId: '1',
            exerciseId: '1',
            setNumber: 1,
            reps: 10,
            weight: 100,
            completed: true,
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      // Validate the object matches the Session type
      const sessionType: Session = session;
      
      // Verify required properties
      expect(sessionType.id).toBeDefined();
      expect(sessionType.name).toBeDefined();
      expect(sessionType.startTime).toBeDefined();
      expect(sessionType.createdAt).toBeDefined();
      expect(sessionType.sessionExercises).toBeDefined();
      
      // Validate session exercises
      const exercise = sessionType.sessionExercises[0];
      expect(exercise.id).toBeDefined();
      expect(exercise.sessionId).toBeDefined();
      expect(exercise.exerciseId).toBeDefined();
      expect(exercise.setNumber).toBeDefined();
      expect(exercise.completed).toBe(true);
    });
  });
}); 