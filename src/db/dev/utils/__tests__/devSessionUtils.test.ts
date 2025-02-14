import { faker } from '@faker-js/faker';
import { generateId } from '../devCommonUtils';
import {
  generatePastDate,
  generateSession,
  generateSampleSessions,
  insertSession,
  addSessions,
  type DevSession,
  type DevSessionExercise
} from '../devSessionUtils';
import type { Exercise } from '../devExerciseUtils';

// Mock the database
const mockDb = {
  runAsync: jest.fn(),
  execAsync: jest.fn()
};

// Mock generateId
jest.mock('../devCommonUtils', () => ({
  generateId: jest.fn(() => 'mock-id')
}));

// Sample exercises for testing
const sampleExercises: Exercise[] = [
  { id: 'ex1', name: 'Push-ups', category: 'Upper Body', description: 'Basic push-up' },
  { id: 'ex2', name: 'Squats', category: 'Lower Body', description: 'Basic squat' },
  { id: 'ex3', name: 'Running', category: 'Cardio', description: 'Treadmill running' },
  { id: 'ex4', name: 'Stretching', category: 'Mobility', description: 'Basic stretches' }
];

describe('devSessionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset faker seed for consistent tests
    faker.seed(123);
  });

  describe('generatePastDate', () => {
    it('generates a date within the specified range', () => {
      const minDays = 1;
      const maxDays = 30;
      const date = generatePastDate(minDays, maxDays);

      // Check if date is within range
      const now = new Date();
      const minDate = new Date(now);
      minDate.setDate(now.getDate() - maxDays);
      const maxDate = new Date(now);
      maxDate.setDate(now.getDate() - minDays);

      expect(date).toBeInstanceOf(Date);
      expect(date >= minDate).toBe(true);
      expect(date <= maxDate).toBe(true);
    });

    it('sets hour between 6 AM and 9 PM', () => {
      const date = generatePastDate();
      const hour = date.getHours();
      expect(hour).toBeGreaterThanOrEqual(6);
      expect(hour).toBeLessThanOrEqual(21);
    });
  });

  describe('generateSession', () => {
    it('generates a valid session with exercises', () => {
      const session = generateSession(sampleExercises);

      expect(session).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.stringContaining('Workout'),
        startTime: expect.any(String),
        endTime: expect.any(String),
        exercises: expect.arrayContaining([
          expect.objectContaining({
            exerciseId: expect.any(String),
            setNumber: expect.any(Number)
          })
        ])
      }));

      // Verify exercise count is within bounds
      expect(session.exercises.length).toBeGreaterThanOrEqual(2);
      expect(session.exercises.length).toBeLessThanOrEqual(6);

      // Verify endTime is after startTime
      expect(new Date(session.endTime) > new Date(session.startTime)).toBe(true);
    });

    it('handles cardio exercises correctly', () => {
      const cardioExercises = [sampleExercises[2]]; // Use the cardio exercise
      const session = generateSession(cardioExercises);
      const exercise = session.exercises[0];

      expect(exercise).toEqual(expect.objectContaining({
        exerciseId: 'ex3',
        reps: expect.any(Number),
        weight: null,
        duration: expect.any(Number)
      }));

      if (exercise.reps) {
        expect(exercise.reps).toBeGreaterThanOrEqual(20);
        expect(exercise.reps).toBeLessThanOrEqual(50);
      }

      if (exercise.duration) {
        expect(exercise.duration).toBeGreaterThanOrEqual(30);
        expect(exercise.duration).toBeLessThanOrEqual(300);
      }
    });

    it('handles mobility exercises correctly', () => {
      const mobilityExercises = [sampleExercises[3]]; // Use the mobility exercise
      const session = generateSession(mobilityExercises);
      const exercise = session.exercises[0];

      expect(exercise).toEqual(expect.objectContaining({
        exerciseId: 'ex4',
        reps: null,
        weight: null,
        duration: expect.any(Number)
      }));

      if (exercise.duration) {
        expect(exercise.duration).toBeGreaterThanOrEqual(30);
        expect(exercise.duration).toBeLessThanOrEqual(60);
      }
    });
  });

  describe('generateSampleSessions', () => {
    it('generates the correct number of sample sessions', () => {
      const sessions = generateSampleSessions(sampleExercises);
      expect(sessions).toHaveLength(2);
      sessions.forEach(session => {
        expect(session).toEqual(expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          startTime: expect.any(String),
          endTime: expect.any(String),
          exercises: expect.any(Array)
        }));
      });
    });
  });

  describe('insertSession', () => {
    it('inserts a session and its exercises into the database', async () => {
      const session: DevSession = {
        id: 'test-session',
        name: 'Test Session',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        exercises: [
          {
            exerciseId: 'ex1',
            setNumber: 1,
            reps: 10,
            weight: 50,
            duration: null,
            notes: 'Test note'
          }
        ]
      };

      await insertSession(mockDb as any, session);

      expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sessions'),
        expect.arrayContaining([session.id, session.name])
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO session_exercises'),
        expect.arrayContaining([session.id, session.exercises[0].exerciseId])
      );
    });
  });

  describe('addSessions', () => {
    it('bulk inserts multiple sessions and their exercises', async () => {
      await addSessions(mockDb as any, 2, sampleExercises);

      expect(mockDb.execAsync).toHaveBeenCalledTimes(2);
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sessions')
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO session_exercises')
      );
    });

    it('handles empty exercise list', async () => {
      await expect(addSessions(mockDb as any, 2, [])).rejects.toThrow();
    });

    it('rejects negative session count', async () => {
      await expect(addSessions(mockDb as any, -1, sampleExercises))
        .rejects.toThrow('Session count cannot be negative');
    });

    it('adds the correct number of sessions', async () => {
      const count = 5;
      await addSessions(mockDb as any, count, sampleExercises);

      // Extract the VALUES clause from the first execAsync call
      const firstCall = mockDb.execAsync.mock.calls[0][0];
      const valueMatches = firstCall.match(/VALUES/g);
      expect(valueMatches).toHaveLength(1); // Should only have one VALUES clause

      // Count the number of value groups (each session creates one group)
      const sessionGroups = firstCall.split('VALUES')[1].trim().split('),');
      expect(sessionGroups).toHaveLength(count);
    });

    it('removes sessions when count is decreased', async () => {
      // First add 5 sessions
      await addSessions(mockDb as any, 5, sampleExercises);
      
      // Then update to 3 sessions (should remove 2)
      await addSessions(mockDb as any, 3, sampleExercises);

      // Should have called execAsync for both operations
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sessions')
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO session_exercises')
      );
    });
  });
}); 