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
  id: (index + 1).toString(),
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

export const DEV_ROUTINES = ROUTINE_TEMPLATES.map((template, index) => ({
  id: (index + 1).toString(),
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
    .map((exercise, index) => ({
      routineId: routine.id,
      exerciseId: exercise.id,
      sets: faker.number.int({ min: 3, max: 5 }),
      reps: exercise.category === 'Cardio' 
        ? faker.number.int({ min: 20, max: 30 })  // More reps for cardio
        : faker.number.int({ min: 8, max: 15 }),  // Standard reps for strength
      orderIndex: index,
    }));
});

// Generate sample sessions based on the routines
export const DEV_SAMPLE_SESSIONS = [
  {
    id: 'sample-1',
    name: 'Morning Workout',
    routineId: '1', // Full Body Strength
    exercises: [
      { exerciseId: '1', setNumber: 1, reps: 12 }, // Upper body exercise
      { exerciseId: '1', setNumber: 2, reps: 10 },
      { exerciseId: '2', setNumber: 1, reps: 15 }, // Lower body exercise
    ]
  },
  {
    id: 'sample-2',
    name: 'Evening Session',
    routineId: '2', // Upper Body Focus
    exercises: [
      { exerciseId: '1', setNumber: 1, reps: 10 },
      { exerciseId: '3', setNumber: 1, reps: 12 },
    ]
  }
]; 