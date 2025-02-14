import { type SQLiteDatabase } from 'expo-sqlite';
import { RoutineService } from '../routineService';

// Mock SQLiteDatabase
class MockSQLiteDatabase implements Partial<SQLiteDatabase> {
  execAsync = jest.fn();
  getAllAsync = jest.fn();
}

describe('RoutineService', () => {
  let mockDb: MockSQLiteDatabase;
  let service: RoutineService;
  const mockDate = '2024-02-13T00:00:00.000Z';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() for consistent timestamps
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
    mockDb = new MockSQLiteDatabase();
    service = new RoutineService(mockDb as unknown as SQLiteDatabase);
  });

  describe('create', () => {
    const mockRoutine = {
      id: 'routine-1',
      name: 'Push Day',
      description: 'Upper body push workout',
      exerciseIds: ['exercise-1', 'exercise-2']
    };

    it('creates a routine with all fields and exercises', async () => {
      await service.create(mockRoutine);

      // Verify transaction sequence
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      
      // Check routine creation
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(2,
        `INSERT INTO routines (id, name, description, created_at) 
         VALUES ('routine-1', 'Push Day', 
                 'Upper body push workout', 
                 '${mockDate}')`
      );

      // Check exercise associations
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3,
        `INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
           VALUES ('routine-1', 'exercise-1', 3, 10, 0, '${mockDate}')`
      );
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(4,
        `INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
           VALUES ('routine-1', 'exercise-2', 3, 10, 1, '${mockDate}')`
      );

      // Check transaction commit
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(5, 'COMMIT');
    });

    it('creates a routine with only required fields', async () => {
      const minimalRoutine = {
        id: 'routine-1',
        name: 'Push Day',
        exerciseIds: []
      };

      await service.create(minimalRoutine);

      // Verify transaction sequence
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      
      // Check routine creation
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(2,
        `INSERT INTO routines (id, name, description, created_at) 
         VALUES ('routine-1', 'Push Day', 
                 NULL, 
                 '${mockDate}')`
      );

      // Check transaction commit
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'COMMIT');
    });

    it('rolls back transaction on error', async () => {
      // Mock the first non-transaction operation to fail
      mockDb.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
        .mockRejectedValueOnce(new Error('Database error')) // INSERT INTO routines
        .mockResolvedValueOnce(undefined); // ROLLBACK

      await expect(service.create(mockRoutine)).rejects.toThrow('Database error');
      
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    });
  });

  describe('getById', () => {
    it('returns null when routine not found', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE r.id = 'non-existent'")
      );
    });

    it('returns routine with exercises when found', async () => {
      const mockRow = {
        id: 'routine-1',
        name: 'Push Day',
        description: 'Upper body push workout',
        exercise_ids: 'exercise-1,exercise-2',
        created_at: mockDate
      };
      mockDb.getAllAsync.mockResolvedValue([mockRow]);

      const result = await service.getById('routine-1');

      expect(result).toEqual({
        id: 'routine-1',
        name: 'Push Day',
        description: 'Upper body push workout',
        exerciseIds: ['exercise-1', 'exercise-2'],
        createdAt: mockDate
      });
    });

    it('handles routine without exercises', async () => {
      const mockRow = {
        id: 'routine-1',
        name: 'Push Day',
        description: null,
        exercise_ids: null,
        created_at: mockDate
      };
      mockDb.getAllAsync.mockResolvedValue([mockRow]);

      const result = await service.getById('routine-1');

      expect(result).toEqual({
        id: 'routine-1',
        name: 'Push Day',
        exerciseIds: [],
        createdAt: mockDate
      });
    });
  });

  describe('getAll', () => {
    it('returns empty array when no routines exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('returns all routines with their exercises', async () => {
      const mockRows = [
        {
          id: 'routine-1',
          name: 'Push Day',
          description: 'Upper body push workout',
          exercise_ids: 'exercise-1,exercise-2',
          created_at: mockDate
        },
        {
          id: 'routine-2',
          name: 'Pull Day',
          description: null,
          exercise_ids: 'exercise-3',
          created_at: mockDate
        }
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getAll();

      expect(result).toEqual([
        {
          id: 'routine-1',
          name: 'Push Day',
          description: 'Upper body push workout',
          exerciseIds: ['exercise-1', 'exercise-2'],
          createdAt: mockDate
        },
        {
          id: 'routine-2',
          name: 'Pull Day',
          exerciseIds: ['exercise-3'],
          createdAt: mockDate
        }
      ]);
    });
  });

  describe('update', () => {
    it('updates all provided fields', async () => {
      const updates = {
        name: 'Updated Push Day',
        description: 'Updated description'
      };

      await service.update('routine-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE routines SET name = 'Updated Push Day', description = 'Updated description' WHERE id = 'routine-1'"
      );
    });

    it('handles partial updates', async () => {
      const updates = {
        name: 'Updated Push Day'
      };

      await service.update('routine-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE routines SET name = 'Updated Push Day' WHERE id = 'routine-1'"
      );
    });

    it('does nothing when no updates provided', async () => {
      await service.update('routine-1', {});

      expect(mockDb.execAsync).not.toHaveBeenCalled();
    });
  });

  describe('updateExercises', () => {
    const exerciseIds = ['exercise-1', 'exercise-2'];

    it('updates routine exercises with correct order', async () => {
      await service.updateExercises('routine-1', exerciseIds);

      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(2,
        "DELETE FROM routine_exercises WHERE routine_id = 'routine-1'"
      );
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3,
        `INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
           VALUES ('routine-1', 'exercise-1', 3, 10, 0, '${mockDate}')`
      );
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(4,
        `INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
           VALUES ('routine-1', 'exercise-2', 3, 10, 1, '${mockDate}')`
      );
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(5, 'COMMIT');
    });

    it('rolls back transaction on error', async () => {
      // Mock the first non-transaction operation to fail
      mockDb.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
        .mockRejectedValueOnce(new Error('Database error')) // DELETE FROM routine_exercises
        .mockResolvedValueOnce(undefined); // ROLLBACK

      await expect(service.updateExercises('routine-1', exerciseIds)).rejects.toThrow('Database error');
      
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    });
  });

  describe('delete', () => {
    it('deletes routine and its exercises in correct order', async () => {
      await service.delete('routine-1');

      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(2,
        "DELETE FROM routine_exercises WHERE routine_id = 'routine-1'"
      );
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3,
        "DELETE FROM routines WHERE id = 'routine-1'"
      );
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(4, 'COMMIT');
    });

    it('rolls back transaction on error', async () => {
      // Mock the first non-transaction operation to fail
      mockDb.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
        .mockRejectedValueOnce(new Error('Database error')) // DELETE FROM routine_exercises
        .mockResolvedValueOnce(undefined); // ROLLBACK

      await expect(service.delete('routine-1')).rejects.toThrow('Database error');
      
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    });
  });

  describe('searchByName', () => {
    it('returns empty array when no matches found', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.searchByName('nonexistent');

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE r.name LIKE '%nonexistent%'")
      );
    });

    it('returns matching routines with their exercises', async () => {
      const mockRows = [{
        id: 'routine-1',
        name: 'Push Day',
        description: 'Upper body push workout',
        exercise_ids: 'exercise-1,exercise-2',
        created_at: mockDate
      }];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.searchByName('push');

      expect(result).toEqual([{
        id: 'routine-1',
        name: 'Push Day',
        description: 'Upper body push workout',
        exerciseIds: ['exercise-1', 'exercise-2'],
        createdAt: mockDate
      }]);
    });
  });
}); 