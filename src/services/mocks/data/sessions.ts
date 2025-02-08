import { Session } from '@db/models/Session';

export const mockSessions: Session[] = [
  {
    id: 'minimal-1',
    startTime: new Date().toISOString(),
    sessionExercises: [
      {
        id: 'minimal-ex-1',
        exerciseId: '1',
        sets: 3,
        reps: 10,
        completed: true,
        createdAt: new Date().toISOString(),
        sessionId: 'minimal-1'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'full-body-1',
    startTime: new Date('2023-10-15T09:00:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-1',
        exerciseId: '1',
        sets: 3,
        reps: 12,
        completed: true,
        createdAt: new Date().toISOString(),
        sessionId: 'full-body-1'
      },
      {
        id: 'ex-2',
        exerciseId: '2',
        sets: 3,
        reps: 8,
        completed: true,
        createdAt: new Date().toISOString(),
        sessionId: 'full-body-1'
      },
      {
        id: 'ex-3',
        exerciseId: '3',
        sets: 3,
        reps: 10,
        completed: true,
        createdAt: new Date().toISOString(),
        sessionId: 'full-body-1'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'upper-body-1',
    startTime: new Date('2023-10-13T17:30:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-4',
        exerciseId: '1',
        sets: 4,
        reps: 10,
        completed: true,
        createdAt: new Date().toISOString(),
        sessionId: 'upper-body-1'
      },
      {
        id: 'ex-5',
        exerciseId: '2',
        sets: 4,
        reps: 8,
        completed: true,
        createdAt: new Date().toISOString(),
        sessionId: 'upper-body-1'
      }
    ],
    createdAt: new Date().toISOString()
  }
]; 