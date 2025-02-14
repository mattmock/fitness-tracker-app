/**
 * Development Seed Data
 * This file contains sample data used for development and testing purposes only.
 * DO NOT use this data in production.
 */

import { faker } from '@faker-js/faker';

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

// Common exercises for each category
const EXERCISES_BY_CATEGORY = {
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

// Generate exercises (one from each category to ensure variety)
export const DEV_EXERCISES = EXERCISE_CATEGORIES.map((category, index) => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(EXERCISES_BY_CATEGORY[category]),
  category,
  description: faker.lorem.sentence(),
}));

// Generate routines with meaningful names and appropriate exercises
const ROUTINE_TEMPLATES = [
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

export const DEV_ROUTINES = ROUTINE_TEMPLATES.map((template) => ({
  id: faker.string.uuid(),
  name: template.name,
  description: template.description,
}));

// Generate routine exercises with appropriate sets/reps based on category
export const DEV_ROUTINE_EXERCISES = DEV_ROUTINES.flatMap((routine, routineIndex) => {
  const template = ROUTINE_TEMPLATES[routineIndex];
  const categoryExercises = DEV_EXERCISES.filter(ex => 
    template.categories.includes(ex.category)
  );

  return faker.helpers.arrayElements(categoryExercises, { min: 3, max: 5 })
    .map((exercise) => ({
      routineId: routine.id,
      exerciseId: exercise.id,
    }));
});

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
export function generateSession(existingExercises: { id: string; category: string }[] = DEV_EXERCISES): any {
  const startTime = generatePastDate();
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + faker.number.int({ min: 30, max: 90 }));

  const sessionExercises = faker.helpers.arrayElements(existingExercises, { min: 2, max: 6 })
    .map((exercise, index) => {
      const isCardio = exercise.category === 'Cardio';
      const isMobility = exercise.category === 'Mobility';
      
      return {
        exerciseId: exercise.id,
        setNumber: index + 1,
        reps: isCardio ? faker.number.int({ min: 20, max: 50 }) :
              isMobility ? null : faker.number.int({ min: 8, max: 15 }),
        weight: isCardio || isMobility ? null : faker.number.int({ min: 10, max: 100 }),
        duration: isCardio ? faker.number.int({ min: 30, max: 300 }) :
                 isMobility ? faker.number.int({ min: 30, max: 60 }) : null,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 })
      };
    });

  return {
    id: faker.string.uuid(),
    name: `${faker.date.weekday()} Workout`,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    exercises: sessionExercises
  };
}

// Generate initial sample sessions
export const DEV_SAMPLE_SESSIONS = Array.from({ length: 2 }, () => generateSession()); 