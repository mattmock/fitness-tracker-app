/**
 * Exercise Development Utilities
 * Exercise-specific utilities for development and testing purposes.
 */

import { faker } from '@faker-js/faker';
import { generateId } from './devCommonUtils';
import type { SQLiteDatabase } from 'expo-sqlite';

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

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];

// Common exercises for each category
export const EXERCISES_BY_CATEGORY = {
  'Upper Body': [
    'Push-ups',
    'Pull-ups',
    'Bench Press',
    'Shoulder Press',
    'Tricep Dips',
    'Rows',
    'Lateral Raises'
  ],
  'Lower Body': [
    'Squats',
    'Deadlifts',
    'Lunges',
    'Leg Press',
    'Calf Raises',
    'Hip Thrusts',
    'Box Jumps'
  ],
  'Core': [
    'Plank',
    'Crunches',
    'Russian Twists',
    'Dead Bug',
    'Bird Dog',
    'Leg Raises',
    'Side Planks'
  ],
  'Cardio': [
    'Running',
    'Cycling',
    'Jump Rope',
    'Burpees',
    'Mountain Climbers',
    'High Knees',
    'Jumping Jacks'
  ],
  'Full Body': [
    'Thrusters',
    'Clean and Press',
    'Turkish Get-ups',
    'Renegade Rows',
    'Man Makers',
    'Devil Press'
  ],
  'Olympic Lifts': [
    'Clean',
    'Snatch',
    'Clean and Jerk',
    'Power Clean',
    'Power Snatch',
    'Hang Clean'
  ],
  'Mobility': [
    'Cat-Cow',
    'Downward Dog',
    'World\'s Greatest Stretch',
    'Hip Opener',
    'Shoulder Dislocates',
    'Ankle Mobility'
  ]
} as const;

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
}

/**
 * Generate a single exercise with faker data
 */
export function generateExercise(category?: ExerciseCategory): Exercise {
  const selectedCategory = category || faker.helpers.arrayElement(EXERCISE_CATEGORIES);
  return {
    id: generateId(),
    name: faker.helpers.arrayElement(EXERCISES_BY_CATEGORY[selectedCategory]),
    category: selectedCategory,
    description: faker.lorem.sentence(),
  };
}

/**
 * Generate the default set of exercises (one from each category)
 */
export const DEV_EXERCISES = EXERCISE_CATEGORIES.map((category) => 
  generateExercise(category)
);

/**
 * Basic exercises used when minimum required exercises are needed
 */
export const BASE_EXERCISES: Exercise[] = [
  {
    id: generateId(),
    name: 'Push-ups',
    category: 'Upper Body',
    description: 'Basic upper body pushing movement'
  },
  {
    id: generateId(),
    name: 'Squats',
    category: 'Lower Body',
    description: 'Fundamental lower body exercise'
  }
];

/**
 * Database Operations
 */

/**
 * Insert a single exercise into the database
 */
export async function insertExercise(db: SQLiteDatabase, data: Exercise): Promise<void> {
  const timestamp = new Date().toISOString();
  
  await db.runAsync(
    'INSERT INTO exercises (id, name, category, description, created_at) VALUES (?, ?, ?, ?, ?)',
    [
      data.id,
      data.name,
      data.category || null,
      data.description || null,
      timestamp
    ]
  );
}

/**
 * Add multiple exercises to the database
 */
export async function addExercises(db: SQLiteDatabase, count: number, existingExercises?: Exercise[]): Promise<void> {
  if (count < 0) {
    throw new Error('Exercise count cannot be negative');
  }

  const timestamp = new Date().toISOString();
  
  // Use provided exercises or generate new ones
  const exercises = existingExercises || Array.from({ length: count }, () => generateExercise());
  
  // Bulk insert all exercises
  const values = exercises.map(exercise => 
    `(${[
      `'${exercise.id}'`,
      `'${exercise.name}'`,
      `'${exercise.category}'`,
      `'${exercise.description}'`,
      `'${timestamp}'`
    ].join(', ')})`
  ).join(',\n');

  await db.execAsync(`
    INSERT INTO exercises (id, name, category, description, created_at)
    VALUES ${values}
  `);
}

/**
 * Ensure minimum required exercises exist in the database
 */
export async function ensureMinimumExercises(db: SQLiteDatabase, minCount: number = 2): Promise<{ id: string; name: string; category: string }[]> {
  const existingExercises = await db.getAllAsync<{id: string, name: string, category: string}>(
    'SELECT id, name, category FROM exercises'
  );
  
  if (!existingExercises || existingExercises.length < minCount) {
    const exercisesToAdd = minCount - (existingExercises?.length ?? 0);
    await addExercises(db, exercisesToAdd, BASE_EXERCISES.slice(0, exercisesToAdd));
    return db.getAllAsync<{id: string, name: string, category: string}>(
      'SELECT id, name, category FROM exercises'
    );
  }

  return existingExercises;
} 