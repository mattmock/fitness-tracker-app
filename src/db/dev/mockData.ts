import { faker } from '@faker-js/faker';
import type { Exercise, Routine, Session, SessionExercise } from '../../types/database';
import { ConfigService } from '../../config/ConfigService';

// Exercise categories
export const EXERCISE_CATEGORIES = [
  'Upper Body',
  'Lower Body',
  'Core',
  'Cardio',
  'Full Body',
  'Olympic Lifts',
  'Mobility'
] as const;

// Common exercise names for more realistic data
const EXERCISE_NAMES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Pull-ups',
  'Push-ups',
  'Shoulder Press',
  'Lunges',
  'Rows',
  'Plank',
  'Burpees'
] as const;

// Common routine names for more realistic data
const ROUTINE_NAMES = [
  'Full Body Workout',
  'Upper Body Focus',
  'Lower Body Power',
  'Core Strength',
  'Cardio Blast',
  'Recovery Day'
] as const;

export class MockDataGenerator {
  static generateExercise(): Omit<Exercise, 'createdAt'> {
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(EXERCISE_NAMES),
      category: faker.helpers.arrayElement(EXERCISE_CATEGORIES),
      description: faker.lorem.sentence()
    };
  }

  static generateRoutine(exerciseIds: string[]): Omit<Routine, 'createdAt'> {
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(ROUTINE_NAMES),
      description: faker.lorem.sentence(),
      exerciseIds: faker.helpers.arrayElements(exerciseIds, { min: 3, max: 6 })
    };
  }

  static generateSessionExercise(exerciseId: string): Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'> {
    return {
      exerciseId,
      setNumber: faker.number.int({ min: 1, max: 5 }),
      reps: faker.number.int({ min: 5, max: 20 }),
      weight: faker.number.int({ min: 5, max: 100 }),
      duration: faker.datatype.boolean() ? faker.number.int({ min: 30, max: 120 }) : undefined,
      notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined
    };
  }

  static generateSession(exerciseIds: string[]): Omit<Session, 'id' | 'createdAt' | 'sessionExercises'> & { sessionExercises: Array<Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'>> } {
    const sessionNames = ['Morning Workout', 'Evening Session', 'Quick Workout', 'Strength Training', 'Recovery Session'];
    const startTime = faker.date.recent({ days: 14 }).toISOString();
    
    // Generate 1-5 random exercises for this session
    const sessionExerciseCount = faker.number.int({ min: 1, max: 5 });
    const selectedExerciseIds = faker.helpers.arrayElements(exerciseIds, sessionExerciseCount);
    const sessionExercises = selectedExerciseIds.map(id => this.generateSessionExercise(id));
    
    return {
      name: faker.helpers.arrayElement(sessionNames),
      notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
      startTime,
      endTime: faker.datatype.boolean() ? new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString() : undefined,
      sessionExercises
    };
  }

  static async generateMockData(count: { exercises?: number; routines?: number; sessions?: number } = {}) {
    const config = ConfigService.getInstance().getConfig();
    if (!config.useMocks) {
      throw new Error('Mock data generation is disabled. Enable it in ConfigService first.');
    }

    const exerciseCount = count.exercises ?? 20;
    const routineCount = count.routines ?? 5;
    const sessionCount = count.sessions ?? 10;
    
    // Generate exercises
    const exercises: Exercise[] = [];
    for (let i = 0; i < exerciseCount; i++) {
      const exercise = {
        ...this.generateExercise(),
        id: `ex-${i + 1}`,
        createdAt: new Date().toISOString()
      };
      exercises.push(exercise);
    }
    
    // Generate routines
    const routines: Routine[] = [];
    const exerciseIds = exercises.map(e => e.id);
    for (let i = 0; i < routineCount; i++) {
      const routine = {
        ...this.generateRoutine(exerciseIds),
        id: `routine-${i + 1}`,
        createdAt: new Date().toISOString()
      };
      routines.push(routine);
    }
    
    // Generate sessions
    const sessions: Session[] = [];
    for (let i = 0; i < sessionCount; i++) {
      const sessionData = this.generateSession(exerciseIds);
      const session: Session = {
        id: `session-${i + 1}`,
        ...sessionData,
        sessionExercises: sessionData.sessionExercises.map((exercise, j) => ({
          ...exercise,
          id: `session-${i + 1}-exercise-${j + 1}`,
          sessionId: `session-${i + 1}`,
          createdAt: new Date().toISOString()
        })),
        createdAt: new Date().toISOString()
      };
      sessions.push(session);
    }
    
    return { exercises, routines, sessions };
  }
} 