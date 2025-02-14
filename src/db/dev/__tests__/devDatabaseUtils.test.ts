/**
 * @jest-environment node
 * @jest
 * 
 * Test suite for devDatabaseUtils
 * Tests the development database utility functions for managing test data
 */

import { SQLiteDatabase } from 'expo-sqlite';
import { faker } from '@faker-js/faker';
import { useDevDatabase } from '../devDatabaseUtils';
import { DEV_EXERCISES, DEV_ROUTINES, DEV_ROUTINE_EXERCISES, DEV_SAMPLE_SESSIONS } from '../devSeedData';
import { schema } from '../../schema/schema';

// Mock utility functions
jest.mock('../utils/devExerciseUtils', () => ({
  ...jest.requireActual('../utils/devExerciseUtils'),
  addExercises: jest.fn(),
  ensureMinimumExercises: jest.fn()
}));

jest.mock('../utils/devRoutineUtils', () => ({
  ...jest.requireActual('../utils/devRoutineUtils'),
  addRoutines: jest.fn(),
  addRoutineExercises: jest.fn()
}));

jest.mock('../utils/devSessionUtils', () => ({
  addSessions: jest.fn()
}));

// Import mocked functions
import { addExercises, ensureMinimumExercises } from '../utils/devExerciseUtils';
import { addRoutines } from '../utils/devRoutineUtils';
import { addSessions } from '../utils/devSessionUtils';

// Mock SQLite database
const mockDb = {
  execAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn()
};

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockDb
}));

describe('devDatabaseUtils', () => {
  let devDb: ReturnType<typeof useDevDatabase>;

  beforeEach(() => {
    jest.clearAllMocks();
    faker.seed(123);
    devDb = useDevDatabase();
  });

  describe('useDevDatabase', () => {
    it('returns database operation functions', () => {
      expect(devDb).toEqual({
        clearDatabase: expect.any(Function),
        clearTable: expect.any(Function),
        updateRowCount: expect.any(Function),
        resetDatabaseToDefault: expect.any(Function),
        getCounts: expect.any(Function)
      });
    });
  });

  describe('getDatabaseCounts', () => {
    it('returns correct counts from database', async () => {
      mockDb.getFirstAsync
        .mockResolvedValueOnce({ count: 5 })  // sessions
        .mockResolvedValueOnce({ count: 10 }) // exercises
        .mockResolvedValueOnce({ count: 3 }); // routines

      const counts = await devDb.getCounts();
      
      expect(counts).toEqual({
        sessions: 5,
        exercises: 10,
        routines: 3
      });
    });

    it('handles null counts gracefully', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const counts = await devDb.getCounts();
      
      expect(counts).toEqual({
        sessions: 0,
        exercises: 0,
        routines: 0
      });
    });
  });

  describe('clearDatabase', () => {
    it('clears all tables in correct order', async () => {
      await devDb.clearDatabase();
      
      expect(mockDb.execAsync).toHaveBeenCalledTimes(5);
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'DELETE FROM session_exercises');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(2, 'DELETE FROM routine_exercises');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'DELETE FROM sessions');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(4, 'DELETE FROM routines');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(5, 'DELETE FROM exercises');
    });
  });

  describe('clearTable', () => {
    it('clears a specific table', async () => {
      await devDb.clearTable('exercises');
      
      expect(mockDb.execAsync).toHaveBeenCalledWith('DELETE FROM exercises');
    });
  });

  describe('updateRowCount', () => {
    it('adds rows when target count is higher', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ count: 2 });
      (addExercises as jest.Mock).mockResolvedValueOnce(undefined);

      await devDb.updateRowCount('exercises', 5);
      
      expect(addExercises).toHaveBeenCalledWith(mockDb, 3);
    });

    it('removes rows when target count is lower', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ count: 5 });

      await devDb.updateRowCount('exercises', 2);
      
      const expectedQuery = `
    DELETE FROM exercises 
    WHERE rowid IN (
      SELECT rowid FROM exercises 
      ORDER BY rowid DESC 
      LIMIT 3
    )
  `;
      
      expect(mockDb.execAsync).toHaveBeenCalledWith(expectedQuery);
    });

    it('throws error for negative target count', async () => {
      await expect(devDb.updateRowCount('exercises', -1))
        .rejects.toThrow('Count cannot be negative');
    });

    it('does nothing when current count equals target count', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ count: 5 });

      await devDb.updateRowCount('exercises', 5);
      
      expect(mockDb.execAsync).not.toHaveBeenCalled();
    });

    describe('addRows', () => {
      it('adds exercise rows correctly', async () => {
        mockDb.getFirstAsync.mockResolvedValueOnce({ count: 2 });
        (addExercises as jest.Mock).mockResolvedValueOnce(undefined);

        await devDb.updateRowCount('exercises', 5);
        
        expect(addExercises).toHaveBeenCalledWith(mockDb, 3);
      });

      it('adds routine rows correctly', async () => {
        mockDb.getFirstAsync.mockResolvedValueOnce({ count: 1 });
        (addRoutines as jest.Mock).mockResolvedValueOnce(undefined);

        await devDb.updateRowCount('routines', 4);
        
        expect(addRoutines).toHaveBeenCalledWith(mockDb, 3);
      });

      it('adds session rows correctly', async () => {
        mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 });
        const mockExercises = [{ id: 1, name: 'Push-up' }];
        (ensureMinimumExercises as jest.Mock).mockResolvedValueOnce(mockExercises);
        (addSessions as jest.Mock).mockResolvedValueOnce(undefined);

        await devDb.updateRowCount('sessions', 3);
        
        expect(ensureMinimumExercises).toHaveBeenCalledWith(mockDb);
        expect(addSessions).toHaveBeenCalledWith(mockDb, 3, mockExercises);
      });

      it('throws error for unsupported table', async () => {
        mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 });
        
        await expect(devDb.updateRowCount('session_exercises' as any, 3))
          .rejects.toThrow('Adding rows not supported for table: session_exercises');
      });
    });
  });

  describe('resetDatabaseToDefault', () => {
    it('performs reset operations in correct order', async () => {
      await devDb.resetDatabaseToDefault();
      
      // Verify database was cleared
      expect(mockDb.execAsync).toHaveBeenCalledWith('DELETE FROM session_exercises');
      
      // Verify schema statements were executed
      schema.statements.forEach(statement => {
        expect(mockDb.execAsync).toHaveBeenCalledWith(statement);
      });
      
      // Verify default data was added
      expect(mockDb.execAsync).toHaveBeenCalled();
    });
  });
}); 