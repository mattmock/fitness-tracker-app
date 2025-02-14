import { faker } from '@faker-js/faker';
import { generateId } from '../devCommonUtils';
import {
  generateExercise,
  insertExercise,
  addExercises,
  ensureMinimumExercises,
  DEV_EXERCISES,
  BASE_EXERCISES,
  EXERCISE_CATEGORIES,
  EXERCISES_BY_CATEGORY,
  type Exercise,
  type ExerciseCategory
} from '../devExerciseUtils';

// Mock the database
const mockDb = {
  runAsync: jest.fn(),
  execAsync: jest.fn(),
  getAllAsync: jest.fn()
};

// Mock generateId
let mockIdCounter = 0;
jest.mock('../devCommonUtils', () => ({
  generateId: jest.fn(() => `mock-id-${mockIdCounter++}`)
}));

describe('devExerciseUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset faker seed and ID counter for consistent tests
    faker.seed(123);
    mockIdCounter = 0;
  });

  describe('constants', () => {
    it('has the correct number of exercise categories', () => {
      expect(EXERCISE_CATEGORIES).toHaveLength(7); // Upper Body, Lower Body, Core, Cardio, Full Body, Olympic Lifts, Mobility
      expect(EXERCISE_CATEGORIES).toContain('Upper Body');
      expect(EXERCISE_CATEGORIES).toContain('Cardio');
      expect(EXERCISE_CATEGORIES).toContain('Mobility');
    });

    it('has exercises defined for each category', () => {
      EXERCISE_CATEGORIES.forEach(category => {
        expect(Object.keys(EXERCISES_BY_CATEGORY)).toContain(category);
        expect(EXERCISES_BY_CATEGORY[category].length).toBeGreaterThan(0);
      });
    });

    it('has the correct number of DEV_EXERCISES', () => {
      expect(DEV_EXERCISES).toHaveLength(EXERCISE_CATEGORIES.length);
      // Each exercise should be from a different category
      const categories = new Set(DEV_EXERCISES.map(ex => ex.category));
      expect(categories.size).toBe(EXERCISE_CATEGORIES.length);
    });

    it('has the correct BASE_EXERCISES', () => {
      expect(BASE_EXERCISES).toHaveLength(2);
      expect(BASE_EXERCISES[0].category).toBe('Upper Body');
      expect(BASE_EXERCISES[1].category).toBe('Lower Body');
    });
  });

  describe('generateExercise', () => {
    it('generates a valid exercise with all required fields', () => {
      const exercise = generateExercise();
      
      expect(exercise).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        category: expect.any(String),
        description: expect.any(String)
      }));

      // Verify category is valid
      expect(EXERCISE_CATEGORIES).toContain(exercise.category);
    });

    it('respects provided category parameter', () => {
      const category: ExerciseCategory = 'Cardio';
      const exercise = generateExercise(category);
      
      expect(exercise.category).toBe(category);
      expect(EXERCISES_BY_CATEGORY[category]).toContain(exercise.name);
    });

    it('generates different exercises on subsequent calls', () => {
      const exercise1 = generateExercise();
      const exercise2 = generateExercise();
      
      expect(exercise1.id).not.toBe(exercise2.id);
      // Note: There's a small chance the other fields could be the same due to random generation
    });
  });

  describe('database operations', () => {
    describe('insertExercise', () => {
      it('inserts a single exercise correctly', async () => {
        const exercise: Exercise = {
          id: 'test-id',
          name: 'Test Exercise',
          category: 'Upper Body',
          description: 'Test description'
        };

        await insertExercise(mockDb as any, exercise);

        expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO exercises'),
          expect.arrayContaining([
            exercise.id,
            exercise.name,
            exercise.category,
            exercise.description
          ])
        );
      });
    });

    describe('addExercises', () => {
      it('bulk inserts the specified number of exercises', async () => {
        const count = 3;
        await addExercises(mockDb as any, count);

        expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
        const sql = mockDb.execAsync.mock.calls[0][0];
        const valueMatches = sql.match(/VALUES/g);
        expect(valueMatches).toHaveLength(1);

        // Count the number of value groups
        const valueGroups = sql.split('VALUES')[1].trim().split('),');
        expect(valueGroups).toHaveLength(count);
      });

      it('rejects negative exercise count', async () => {
        await expect(addExercises(mockDb as any, -1))
          .rejects.toThrow('Exercise count cannot be negative');
      });

      it('uses provided exercises when available', async () => {
        const exercises: Exercise[] = [
          { id: 'ex1', name: 'Exercise 1', category: 'Upper Body', description: 'Test 1' },
          { id: 'ex2', name: 'Exercise 2', category: 'Lower Body', description: 'Test 2' }
        ];

        await addExercises(mockDb as any, 2, exercises);

        expect(mockDb.execAsync).toHaveBeenCalledWith(
          expect.stringContaining('ex1') && expect.stringContaining('ex2')
        );
      });
    });

    describe('ensureMinimumExercises', () => {
      it('adds exercises when below minimum count', async () => {
        mockDb.getAllAsync.mockResolvedValueOnce([]);  // No existing exercises
        await ensureMinimumExercises(mockDb as any);

        expect(mockDb.execAsync).toHaveBeenCalled();
        expect(mockDb.getAllAsync).toHaveBeenCalledTimes(2);  // Initial check and final fetch
      });

      it('does nothing when above minimum count', async () => {
        mockDb.getAllAsync.mockResolvedValueOnce([
          { id: 'ex1', name: 'Exercise 1', category: 'Upper Body' },
          { id: 'ex2', name: 'Exercise 2', category: 'Lower Body' },
          { id: 'ex3', name: 'Exercise 3', category: 'Core' }
        ]);

        await ensureMinimumExercises(mockDb as any, 2);

        expect(mockDb.execAsync).not.toHaveBeenCalled();
        expect(mockDb.getAllAsync).toHaveBeenCalledTimes(1);  // Only initial check
      });
    });
  });
}); 