import { type SQLiteDatabase } from 'expo-sqlite';
import { ExerciseService } from '../exerciseService';

// Mock SQLiteDatabase
class MockSQLiteDatabase implements Partial<SQLiteDatabase> {
  execAsync = jest.fn();
  getAllAsync = jest.fn();
}

describe('ExerciseService', () => {
  let mockDb: MockSQLiteDatabase;
  let service: ExerciseService;
  const mockDate = '2024-02-13T00:00:00.000Z';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() for consistent timestamps
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
    mockDb = new MockSQLiteDatabase();
    service = new ExerciseService(mockDb as unknown as SQLiteDatabase);
  });

  describe('create', () => {
    const mockExercise = {
      id: 'exercise-1',
      name: 'Bench Press',
      category: 'Chest',
      description: 'Barbell bench press'
    };

    it('creates an exercise with all fields', async () => {
      await service.create(mockExercise);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO exercises (id, name, category, description, created_at) 
       VALUES ('exercise-1', 'Bench Press', 
               'Chest', 
               'Barbell bench press', 
               '${mockDate}')`
      );
    });

    it('creates an exercise with only required fields', async () => {
      const minimalExercise = {
        id: 'exercise-1',
        name: 'Bench Press'
      };

      await service.create(minimalExercise);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO exercises (id, name, category, description, created_at) 
       VALUES ('exercise-1', 'Bench Press', 
               NULL, 
               NULL, 
               '${mockDate}')`
      );
    });

    it('returns the created exercise with createdAt', async () => {
      const result = await service.create(mockExercise);

      expect(result).toEqual({
        ...mockExercise,
        createdAt: mockDate
      });
    });

    it('handles special characters in input safely', async () => {
      const exerciseWithSpecialChars = {
        id: 'exercise-1',
        name: "O'Connor's Workout",
        category: 'Arms & Shoulders',
        description: 'Special workout with "quotes" and \'apostrophes\''
      };

      await service.create(exerciseWithSpecialChars);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO exercises (id, name, category, description, created_at) 
       VALUES ('exercise-1', 'O''Connor''s Workout', 
               'Arms & Shoulders', 
               'Special workout with "quotes" and ''apostrophes''', 
               '${mockDate}')`
      );
    });

    it('throws error when required fields are missing', async () => {
      const invalidExercise = {
        id: 'exercise-1'
      } as any;

      await expect(service.create(invalidExercise)).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('returns null when exercise not found', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE id = 'non-existent'"
      );
    });

    it('returns exercise when found', async () => {
      const mockRow = {
        id: 'exercise-1',
        name: 'Bench Press',
        category: 'Chest',
        description: 'Barbell bench press',
        created_at: mockDate
      };
      mockDb.getAllAsync.mockResolvedValue([mockRow]);

      const result = await service.getById('exercise-1');

      expect(result).toEqual({
        id: 'exercise-1',
        name: 'Bench Press',
        category: 'Chest',
        description: 'Barbell bench press',
        createdAt: mockDate
      });
    });
  });

  describe('getAll', () => {
    it('returns empty array when no exercises exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM exercises ORDER BY created_at DESC'
      );
    });

    it('returns all exercises', async () => {
      const mockRows = [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          category: 'Chest',
          description: 'Barbell bench press',
          created_at: mockDate
        },
        {
          id: 'exercise-2',
          name: 'Squat',
          category: 'Legs',
          description: null,
          created_at: mockDate
        }
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getAll();

      expect(result).toEqual([
        {
          id: 'exercise-1',
          name: 'Bench Press',
          category: 'Chest',
          description: 'Barbell bench press',
          createdAt: mockDate
        },
        {
          id: 'exercise-2',
          name: 'Squat',
          category: 'Legs',
          createdAt: mockDate
        }
      ]);
    });
  });

  describe('update', () => {
    it('updates all provided fields', async () => {
      const updates = {
        name: 'Updated Press',
        category: 'Updated Category',
        description: 'Updated description'
      };

      await service.update('exercise-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE exercises SET name = 'Updated Press', category = 'Updated Category', description = 'Updated description' WHERE id = 'exercise-1'"
      );
    });

    it('handles partial updates', async () => {
      const updates = {
        name: 'Updated Press'
      };

      await service.update('exercise-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE exercises SET name = 'Updated Press' WHERE id = 'exercise-1'"
      );
    });

    it('does nothing when no updates provided', async () => {
      await service.update('exercise-1', {});

      expect(mockDb.execAsync).not.toHaveBeenCalled();
    });

    it('properly escapes special characters in updates', async () => {
      const updates = {
        name: "O'Connor's Exercise",
        description: 'Contains "quotes"'
      };

      await service.update('exercise-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE exercises SET name = 'O''Connor''s Exercise', description = 'Contains \"quotes\"' WHERE id = 'exercise-1'"
      );
    });

    it('handles empty string values', async () => {
      const updates = {
        description: ''
      };

      await service.update('exercise-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE exercises SET description = '' WHERE id = 'exercise-1'"
      );
    });

    it('ignores undefined values in updates', async () => {
      const updates = {
        name: 'New Name',
        description: undefined,
        category: 'New Category'
      };

      await service.update('exercise-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE exercises SET name = 'New Name', category = 'New Category' WHERE id = 'exercise-1'"
      );
    });
  });

  describe('delete', () => {
    it('deletes the exercise', async () => {
      await service.delete('exercise-1');

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "DELETE FROM exercises WHERE id = 'exercise-1'"
      );
    });
  });

  describe('searchByName', () => {
    it('returns empty array when no matches found', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.searchByName('nonexistent');

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE name LIKE '%nonexistent%' ORDER BY created_at DESC"
      );
    });

    it('returns matching exercises', async () => {
      const mockRows = [{
        id: 'exercise-1',
        name: 'Bench Press',
        category: 'Chest',
        description: 'Barbell bench press',
        created_at: mockDate
      }];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.searchByName('bench');

      expect(result).toEqual([{
        id: 'exercise-1',
        name: 'Bench Press',
        category: 'Chest',
        description: 'Barbell bench press',
        createdAt: mockDate
      }]);
    });

    it('escapes special characters in search query', async () => {
      await service.searchByName("O'Connor");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE name LIKE '%O''Connor%' ORDER BY created_at DESC"
      );
    });

    it('handles empty search query', async () => {
      await service.searchByName('');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE name LIKE '%%' ORDER BY created_at DESC"
      );
    });
  });

  describe('getByCategory', () => {
    it('returns empty array when no exercises in category', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getByCategory('nonexistent');

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE category = 'nonexistent' ORDER BY created_at DESC"
      );
    });

    it('returns exercises in category', async () => {
      const mockRows = [{
        id: 'exercise-1',
        name: 'Bench Press',
        category: 'Chest',
        description: 'Barbell bench press',
        created_at: mockDate
      }];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getByCategory('Chest');

      expect(result).toEqual([{
        id: 'exercise-1',
        name: 'Bench Press',
        category: 'Chest',
        description: 'Barbell bench press',
        createdAt: mockDate
      }]);
    });

    it('escapes special characters in category name', async () => {
      await service.getByCategory("Arms & Shoulders");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE category = 'Arms & Shoulders' ORDER BY created_at DESC"
      );
    });

    it('handles case sensitivity in category search', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);
      const result = await service.getByCategory('CHEST');
      
      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE category = 'CHEST' ORDER BY created_at DESC"
      );
    });
  });

  describe('error handling', () => {
    it('handles database errors in getAll', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Database error'));

      await expect(service.getAll()).rejects.toThrow('Database error');
    });

    it('handles database errors in getById', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Database error'));

      await expect(service.getById('exercise-1')).rejects.toThrow('Database error');
    });

    it('handles database errors in update', async () => {
      mockDb.execAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        service.update('exercise-1', { name: 'New Name' })
      ).rejects.toThrow('Database error');
    });
  });
}); 