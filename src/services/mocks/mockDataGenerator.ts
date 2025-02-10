import { faker } from '@faker-js/faker';
import { Exercise, Routine, Session, SessionExercise } from '../../db/models';
import { ConfigService } from '../ConfigService';

// Exercise categories
const EXERCISE_CATEGORIES = [
  'Upper Body',
  'Lower Body',
  'Core',
  'Cardio',
  'Full Body',
  'Olympic Lifts',
  'Mobility'
] as const;

export class MockDataGenerator {
  private static generateExercise(): Exercise {
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
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
      ]),
      category: faker.helpers.arrayElement(EXERCISE_CATEGORIES),
      description: faker.lorem.sentence(),
      createdAt: faker.date.past().toISOString(),
    };
  }

  private static generateSessionExercise(sessionId: string, exerciseId: string): SessionExercise {
    return {
      id: faker.string.uuid(),
      sessionId,
      exerciseId,
      sets: faker.number.int({ min: 2, max: 5 }),
      reps: faker.number.int({ min: 8, max: 15 }),
      completed: faker.datatype.boolean(),
      createdAt: faker.date.past().toISOString(),
    };
  }

  private static generateSession(exercises: Exercise[]): Session {
    const sessionId = faker.string.uuid();
    const startTime = faker.date.recent({ days: 30 }).toISOString();
    
    // Randomly select 2-4 exercises for this session
    const sessionExercises = faker.helpers.arrayElements(exercises, { min: 2, max: 4 })
      .map(exercise => this.generateSessionExercise(sessionId, exercise.id));

    return {
      id: sessionId,
      startTime,
      createdAt: startTime,
      sessionExercises,
    };
  }

  private static generateRoutine(exercises: Exercise[]): Routine {
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Full Body Workout',
        'Upper Body Focus',
        'Lower Body Power',
        'Core Strength',
        'Cardio Blast',
        'Recovery Day'
      ]),
      description: faker.lorem.sentence(),
      exerciseIds: faker.helpers.arrayElements(exercises, { min: 3, max: 6 })
        .map(exercise => exercise.id),
      createdAt: faker.date.past().toISOString(),
    };
  }

  static generateMockData() {
    // Generate exercises
    const exercises: Exercise[] = Array.from(
      { length: ConfigService.exerciseCount },
      () => this.generateExercise()
    );

    // Generate sessions
    const sessions: Session[] = Array.from(
      { length: ConfigService.sessionCount },
      () => this.generateSession(exercises)
    ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Generate routines
    const routines: Routine[] = Array.from(
      { length: ConfigService.routineCount },
      () => this.generateRoutine(exercises)
    );

    return {
      exercises,
      sessions,
      routines,
    };
  }
} 
