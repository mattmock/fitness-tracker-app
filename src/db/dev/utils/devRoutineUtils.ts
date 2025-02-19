/**
 * Routine Development Utilities
 * Routine-specific utilities for development and testing purposes.
 */

import { faker } from '@faker-js/faker';
import { generateId } from './devCommonUtils';
import type { Exercise, ExerciseCategory } from './devExerciseUtils';
import type { SQLiteDatabase } from 'expo-sqlite';

export interface Routine {
  id: string;
  name: string;
  description: string;
}

export interface RoutineExercise {
  routineId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
  orderIndex: number;
}

export interface RoutineTemplate {
  name: string;
  description: string;
  categories: ExerciseCategory[];
}

// Generate routines with meaningful names and appropriate exercises
export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    name: 'Full Body Strength',
    description: 'A comprehensive full-body workout targeting all major muscle groups',
    categories: ['Upper Body', 'Lower Body', 'Core']
  },
  {
    name: 'Upper Body Focus',
    description: 'Intensive upper body training session',
    categories: ['Upper Body', 'Core']
  },
  {
    name: 'Lower Body Power',
    description: 'Build strength and power in your legs',
    categories: ['Lower Body', 'Core']
  },
  {
    name: 'Cardio Blast',
    description: 'High-intensity cardiovascular workout',
    categories: ['Cardio', 'Full Body']
  },
  {
    name: 'Mobility & Recovery',
    description: 'Focus on flexibility and mobility',
    categories: ['Mobility', 'Core']
  }
];

/**
 * Generate the default set of routines
 */
export const DEV_ROUTINES = ROUTINE_TEMPLATES.map((template): Routine => ({
  id: generateId(),
  name: template.name,
  description: template.description,
}));

/**
 * Generate routine exercises with appropriate exercises based on category
 */
export function generateRoutineExercises(routines: Routine[], exercises: Exercise[]): RoutineExercise[] {
  return routines.flatMap((routine, routineIndex) => {
    const template = ROUTINE_TEMPLATES[routineIndex];
    const categoryExercises = exercises.filter(ex => 
      template.categories.includes(ex.category)
    );

    return faker.helpers.arrayElements(categoryExercises, { min: 3, max: 5 })
      .map((exercise, index): RoutineExercise => ({
        routineId: routine.id,
        exerciseId: exercise.id,
        sets: faker.number.int({ min: 2, max: 5 }),
        reps: faker.number.int({ min: 8, max: 15 }),
        weight: Math.random() > 0.3 ? faker.number.int({ min: 5, max: 100 }) : undefined,
        duration: Math.random() > 0.7 ? faker.number.int({ min: 30, max: 300 }) : undefined,
        notes: Math.random() > 0.8 ? faker.lorem.sentence() : undefined,
        orderIndex: index
      }));
  });
}

// Generate initial routine-exercise relationships
export const DEV_ROUTINE_EXERCISES: RoutineExercise[] = [];

/**
 * Database Operations
 */

/**
 * Insert a single routine into the database
 */
export async function insertRoutine(db: SQLiteDatabase, data: Routine): Promise<void> {
  const timestamp = new Date().toISOString();
  
  await db.runAsync(
    'INSERT INTO routines (id, name, description, created_at) VALUES (?, ?, ?, ?)',
    [
      data.id,
      data.name,
      data.description || null,
      timestamp
    ]
  );
}

/**
 * Insert a routine-exercise relationship into the database
 */
export async function insertRoutineExercise(db: SQLiteDatabase, data: RoutineExercise): Promise<void> {
  const timestamp = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO routine_exercises (
      routine_id, exercise_id, sets, reps, weight, duration, notes, order_index, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.routineId,
      data.exerciseId,
      data.sets,
      data.reps,
      data.weight || null,
      data.duration || null,
      data.notes || null,
      data.orderIndex,
      timestamp
    ]
  );
}

/**
 * Add multiple routines to the database
 */
export async function addRoutines(db: SQLiteDatabase, count: number, existingRoutines?: Routine[]): Promise<void> {
  if (count < 0) {
    throw new Error('Routine count cannot be negative');
  }

  const timestamp = new Date().toISOString();
  
  // Use provided routines or generate new ones
  const routines = existingRoutines || Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    name: ROUTINE_TEMPLATES[i % ROUTINE_TEMPLATES.length].name,
    description: ROUTINE_TEMPLATES[i % ROUTINE_TEMPLATES.length].description,
  }));

  // Bulk insert all routines
  const values = routines.map(routine => 
    `(${[
      `'${routine.id}'`,
      `'${routine.name}'`,
      `'${routine.description}'`,
      `'${timestamp}'`
    ].join(', ')})`
  ).join(',\n');

  await db.execAsync(`
    INSERT INTO routines (id, name, description, created_at)
    VALUES ${values}
  `);

  // Check for existing exercises and add them to routines if they exist
  const existingExercises = await db.getAllAsync<Exercise>(
    'SELECT id, name, category, description FROM exercises'
  );

  if (existingExercises && existingExercises.length > 0) {
    const routineExercises = generateRoutineExercises(routines, existingExercises);
    if (routineExercises.length > 0) {
      await addRoutineExercises(db, routineExercises);
    }
  }
}

/**
 * Add multiple routine-exercise relationships to the database
 */
export async function addRoutineExercises(db: SQLiteDatabase, relationships: RoutineExercise[]): Promise<void> {
  const timestamp = new Date().toISOString();
  
  if (relationships.length === 0) return;

  // Bulk insert all relationships
  const values = relationships.map(rel => 
    `(${[
      `'${rel.routineId}'`,
      `'${rel.exerciseId}'`,
      rel.sets,
      rel.reps,
      rel.weight !== undefined ? rel.weight : 'NULL',
      rel.duration !== undefined ? rel.duration : 'NULL',
      rel.notes !== undefined ? `'${rel.notes}'` : 'NULL',
      rel.orderIndex,
      `'${timestamp}'`
    ].join(', ')})`
  ).join(',\n');

  await db.execAsync(`
    INSERT INTO routine_exercises (
      routine_id, exercise_id, sets, reps, weight, duration, notes, order_index, created_at
    )
    VALUES ${values}
  `);
} 