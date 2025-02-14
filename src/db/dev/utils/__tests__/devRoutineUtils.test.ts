import { faker } from '@faker-js/faker';
import { generateId } from '../devCommonUtils';
import {
  generateRoutineExercises,
  insertRoutine,
  insertRoutineExercise,
  addRoutines,
  addRoutineExercises,
  DEV_ROUTINES,
  ROUTINE_TEMPLATES,
  type Routine,
  type RoutineExercise,
  type RoutineTemplate
} from '../devRoutineUtils';
import type { Exercise } from '../devExerciseUtils';

// Mock the database
const mockDb = {
  runAsync: jest.fn(),
  execAsync: jest.fn()
};

// Mock generateId
let mockIdCounter = 0;
jest.mock('../devCommonUtils', () => ({
  generateId: jest.fn(() => `mock-id-${mockIdCounter++}`)
}));

// Sample data for testing
const sampleExercises: Exercise[] = [
  { id: 'ex1', name: 'Push-ups', category: 'Upper Body', description: 'Basic push-up' },
  { id: 'ex2', name: 'Squats', category: 'Lower Body', description: 'Basic squat' },
  { id: 'ex3', name: 'Running', category: 'Cardio', description: 'Treadmill running' }
];

describe('devRoutineUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset faker seed and ID counter for consistent tests
    faker.seed(123);
    mockIdCounter = 0;
  });

  describe('constants', () => {
    it('has valid routine templates', () => {
      expect(ROUTINE_TEMPLATES.length).toBeGreaterThan(0);
      ROUTINE_TEMPLATES.forEach((template: RoutineTemplate) => {
        expect(template).toEqual(expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          categories: expect.any(Array)
        }));
      });
    });

    it('has the correct number of DEV_ROUTINES', () => {
      expect(DEV_ROUTINES).toHaveLength(ROUTINE_TEMPLATES.length);
      DEV_ROUTINES.forEach(routine => {
        expect(routine).toEqual(expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String)
        }));
      });
    });
  });

  describe('generateRoutineExercises', () => {
    it('generates appropriate exercise relationships', () => {
      const routines = DEV_ROUTINES.slice(0, 2);
      const relationships = generateRoutineExercises(routines, sampleExercises);

      expect(relationships.length).toBeGreaterThan(0);
      relationships.forEach(rel => {
        expect(rel).toEqual(expect.objectContaining({
          routineId: expect.any(String),
          exerciseId: expect.any(String)
        }));
        // Verify IDs match our sample data
        expect(routines.map(r => r.id)).toContain(rel.routineId);
        expect(sampleExercises.map(e => e.id)).toContain(rel.exerciseId);
      });
    });
  });

  describe('database operations', () => {
    describe('insertRoutine', () => {
      it('inserts a single routine correctly', async () => {
        const routine: Routine = {
          id: 'test-id',
          name: 'Test Routine',
          description: 'Test description'
        };

        await insertRoutine(mockDb as any, routine);

        expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO routines'),
          expect.arrayContaining([
            routine.id,
            routine.name,
            routine.description
          ])
        );
      });
    });

    describe('insertRoutineExercise', () => {
      it('inserts a routine-exercise relationship correctly', async () => {
        const relationship: RoutineExercise = {
          routineId: 'routine-1',
          exerciseId: 'exercise-1'
        };

        await insertRoutineExercise(mockDb as any, relationship);

        expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
        expect(mockDb.runAsync).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO routine_exercises'),
          expect.arrayContaining([
            relationship.routineId,
            relationship.exerciseId
          ])
        );
      });
    });

    describe('addRoutines', () => {
      it('bulk inserts the specified number of routines', async () => {
        const count = 3;
        await addRoutines(mockDb as any, count);

        expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
        const sql = mockDb.execAsync.mock.calls[0][0];
        const valueMatches = sql.match(/VALUES/g);
        expect(valueMatches).toHaveLength(1);

        // Count the number of value groups
        const valueGroups = sql.split('VALUES')[1].trim().split('),');
        expect(valueGroups).toHaveLength(count);
      });

      it('rejects negative routine count', async () => {
        await expect(addRoutines(mockDb as any, -1))
          .rejects.toThrow('Routine count cannot be negative');
      });

      it('uses provided routines when available', async () => {
        const routines: Routine[] = [
          { id: 'r1', name: 'Routine 1', description: 'Test 1' },
          { id: 'r2', name: 'Routine 2', description: 'Test 2' }
        ];

        await addRoutines(mockDb as any, 2, routines);

        expect(mockDb.execAsync).toHaveBeenCalledWith(
          expect.stringContaining('r1') && expect.stringContaining('r2')
        );
      });
    });

    describe('addRoutineExercises', () => {
      it('bulk inserts multiple relationships', async () => {
        const relationships: RoutineExercise[] = [
          { routineId: 'r1', exerciseId: 'e1' },
          { routineId: 'r1', exerciseId: 'e2' },
          { routineId: 'r2', exerciseId: 'e1' }
        ];

        await addRoutineExercises(mockDb as any, relationships);

        expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
        const sql = mockDb.execAsync.mock.calls[0][0];
        
        // Verify all relationships are included
        relationships.forEach(rel => {
          expect(sql).toContain(rel.routineId);
          expect(sql).toContain(rel.exerciseId);
        });
      });

      it('does nothing with empty relationships array', async () => {
        await addRoutineExercises(mockDb as any, []);
        expect(mockDb.execAsync).not.toHaveBeenCalled();
      });
    });
  });
}); 