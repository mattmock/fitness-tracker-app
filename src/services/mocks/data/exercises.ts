import { Exercise } from '@db/models/Exercise';

export const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-up',
    description: 'Basic bodyweight exercise for upper body',
    category: 'Chest',
    tags: ['bodyweight', 'upper body'],
    variations: ['Wide push-up', 'Diamond push-up'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Pull-up',
    description: 'Upper body strength exercise',
    category: 'Back',
    tags: ['bodyweight', 'pulling'],
    variations: ['Chin-up', 'Weighted pull-up'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Squat',
    description: 'Fundamental lower body exercise',
    category: 'Legs',
    tags: ['bodyweight', 'lower body'],
    variations: ['Jump squat', 'Pistol squat'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Plank',
    description: 'Core stability exercise',
    category: 'Core',
    tags: ['bodyweight', 'isometric'],
    variations: ['Side plank', 'Plank with leg lift'],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Burpee',
    description: 'Full body conditioning exercise',
    category: 'Cardio',
    tags: ['bodyweight', 'metabolic'],
    variations: ['Half burpee', 'Burpee with push-up'],
    createdAt: new Date().toISOString()
  }
]; 