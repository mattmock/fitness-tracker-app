import { Exercise } from '@db/models/Exercise';
import { Routine } from '@db/models/Routine';
import { Session } from '@db/models/Session';

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
    name: 'Squat',
    description: 'Fundamental lower body exercise',
    category: 'Legs',
    tags: ['bodyweight', 'lower body'],
    variations: ['Jump squat', 'Pistol squat'],
    createdAt: new Date().toISOString()
  }
];

export const mockRoutines: Routine[] = [
  {
    id: '1',
    name: 'Full Body Beginner',
    description: 'Basic full body routine for beginners',
    exerciseIds: ['1', '2'],
    createdAt: new Date().toISOString()
  }
]; 

export const mockSessions: Session[] = [
  {
    id: '1',
    startTime: new Date().toISOString(),
    sessionExercises: [
      {
        id: '1',
        exerciseId: '1',
        sets: 3,
        reps: 10,   
        createdAt: new Date().toISOString(),
        sessionId: '1',
        completed: false
      },
      {
        id: '2',
        exerciseId: '2',
        sets: 3,
        reps: 10,
        createdAt: new Date().toISOString(),
        sessionId: '1',
        completed: false
      }
    ],
    createdAt: new Date().toISOString()
  }
]; 

