/**
 * Session Development Utilities
 * Session-specific utilities for development and testing purposes.
 */

import { faker } from '@faker-js/faker';
import { generateId } from './devCommonUtils';
import type { Exercise } from './devExerciseUtils';
import type { SQLiteDatabase } from 'expo-sqlite';

// Only define what we need for generation that's different from the model
export interface DevSessionExercise {
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  notes: string | null;
}

export interface DevSession {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  exercises: DevSessionExercise[];
}

/**
 * Generates a random past date within the specified range
 */
export function generatePastDate(minDays: number = 1, maxDays: number = 30): Date {
  const daysAgo = faker.number.int({ min: minDays, max: maxDays });
  const result = faker.date.recent({ days: daysAgo });
  // Set a random hour between 6 AM and 9 PM
  result.setHours(faker.number.int({ min: 6, max: 21 }), 
                  faker.number.int({ min: 0, max: 59 }));
  return result;
}

/**
 * Generates a session with random exercises and realistic data
 */
export function generateSession(existingExercises: { id: string; category: string }[]): DevSession {
  const startTime = generatePastDate();
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + faker.number.int({ min: 30, max: 90 }));

  const sessionExercises = faker.helpers.arrayElements(existingExercises, { min: 2, max: 6 })
    .map((exercise, index) => {
      const isCardio = exercise.category === 'Cardio';
      const isMobility = exercise.category === 'Mobility';
      
      const maybeNotes = faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 });
      
      return {
        exerciseId: exercise.id,
        setNumber: index + 1,
        reps: isCardio ? faker.number.int({ min: 20, max: 50 }) :
              isMobility ? null : faker.number.int({ min: 8, max: 15 }),
        weight: isCardio || isMobility ? null : faker.number.int({ min: 10, max: 100 }),
        duration: isCardio ? faker.number.int({ min: 30, max: 300 }) :
                 isMobility ? faker.number.int({ min: 30, max: 60 }) : null,
        notes: maybeNotes || null
      };
    });

  return {
    id: generateId(),
    name: `${faker.date.weekday()} Workout`,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    exercises: sessionExercises
  };
}

/**
 * Generate initial sample sessions using the provided exercises
 */
export function generateSampleSessions(exercises: Exercise[]): DevSession[] {
  return Array.from({ length: 2 }, () => generateSession(exercises));
}

/**
 * Database Operations
 */

/**
 * Insert a single session and its exercises into the database
 */
export async function insertSession(db: SQLiteDatabase, data: DevSession): Promise<void> {
  const timestamp = new Date().toISOString();
  
  await db.runAsync(
    'INSERT INTO sessions (id, name, start_time, end_time, created_at) VALUES (?, ?, ?, ?, ?)',
    [
      data.id,
      data.name,
      data.startTime,
      data.endTime,
      timestamp
    ]
  );

  if (data.exercises) {
    for (const exercise of data.exercises) {
      await db.runAsync(
        `INSERT INTO session_exercises (
          session_id, exercise_id, set_number, 
          reps, weight, duration, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          exercise.exerciseId,
          exercise.setNumber,
          exercise.reps,
          exercise.weight,
          exercise.duration,
          exercise.notes,
          timestamp
        ]
      );
    }
  }
}

/**
 * Add multiple sessions to the database using existing exercises
 */
export async function addSessions(db: SQLiteDatabase, count: number, existingExercises: { id: string; category: string }[]): Promise<void> {
  if (count < 0) {
    throw new Error('Session count cannot be negative');
  }
  
  if (!existingExercises || existingExercises.length === 0) {
    throw new Error('Cannot create sessions with no exercises');
  }

  const timestamp = new Date().toISOString();
  
  // Generate sessions
  const sessions = Array.from({ length: count }, () => generateSession(existingExercises));
  
  // Bulk insert sessions
  const sessionValues = sessions.map(session => 
    `(${[
      `'${session.id}'`,
      `'${session.name}'`,
      `'${session.startTime}'`,
      `'${session.endTime}'`,
      `'${timestamp}'`
    ].join(', ')})`
  ).join(',\n');

  await db.execAsync(`
    INSERT INTO sessions (id, name, start_time, end_time, created_at)
    VALUES ${sessionValues}
  `);

  // Bulk insert session exercises
  const exerciseValues = sessions.flatMap(session => 
    session.exercises.map(exercise => 
      `(${[
        `'${session.id}'`,
        `'${exercise.exerciseId}'`,
        exercise.setNumber,
        exercise.reps === null ? 'NULL' : exercise.reps,
        exercise.weight === null ? 'NULL' : exercise.weight,
        exercise.duration === null ? 'NULL' : exercise.duration,
        exercise.notes === null ? 'NULL' : `'${exercise.notes}'`,
        `'${timestamp}'`
      ].join(', ')})`
    )
  ).join(',\n');

  if (exerciseValues) {
    await db.execAsync(`
      INSERT INTO session_exercises (
        session_id, exercise_id, set_number, 
        reps, weight, duration, notes, created_at
      ) VALUES ${exerciseValues}
    `);
  }
}

/**
 * Remove a session and its exercises from the database
 */
export async function removeSession(db: SQLiteDatabase, sessionId: string): Promise<void> {
  // Delete session exercises first (due to foreign key constraint)
  await db.execAsync(`DELETE FROM session_exercises WHERE session_id = '${sessionId}'`);
  
  // Delete session
  await db.execAsync(`DELETE FROM sessions WHERE id = '${sessionId}'`);
} 