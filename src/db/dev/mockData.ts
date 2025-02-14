import { faker } from '@faker-js/faker';
import type { Exercise, Routine, Session, SessionExercise } from '../services';
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
      reps: faker.number.int({ min: 8, max: 15 }),
      weight: faker.number.float({ min: 5, max: 100, fractionDigits: 1 }),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 })
    };
  }

  static generateSession(exerciseIds: string[]): Omit<Session, 'id' | 'createdAt' | 'exercises'> & { exercises: Array<Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'>> } {
    const selectedExerciseIds = faker.helpers.arrayElements(exerciseIds, { min: 2, max: 4 });
    const startTime = faker.date.recent({ days: 30 }).toISOString();
    
    return {
      name: faker.helpers.arrayElement([
        'Morning Workout',
        'Evening Session',
        'Quick Workout',
        'Strength Training',
        'Recovery Session'
      ]),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
      startTime,
      endTime: faker.helpers.maybe(() => faker.date.soon({ days: 1, refDate: startTime }).toISOString(), { probability: 0.8 }),
      exercises: selectedExerciseIds.map(id => this.generateSessionExercise(id))
    };
  }

  static async generateMockData(count: { exercises?: number; routines?: number; sessions?: number } = {}) {
    const config = ConfigService.getInstance().getConfig();
    if (!config.useMocks) {
      throw new Error('Mock data generation is disabled. Enable it in ConfigService first.');
    }

    const exerciseCount = count.exercises ?? 10;
    const routineCount = count.routines ?? 5;
    const sessionCount = count.sessions ?? 20;

    // Generate exercises
    const exercises = Array.from(
      { length: exerciseCount },
      () => this.generateExercise()
    );

    // Generate routines using exercise IDs
    const routines = Array.from(
      { length: routineCount },
      () => this.generateRoutine(exercises.map(e => e.id))
    );

    // Generate sessions using exercise IDs
    const sessions = Array.from(
      { length: sessionCount },
      () => this.generateSession(exercises.map(e => e.id))
    );

    return {
      exercises,
      routines,
      sessions
    };
  }
} 