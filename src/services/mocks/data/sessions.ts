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
  },
  {
    id: 'cardio-1',
    startTime: new Date('2023-08-15T07:00:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-6',
        exerciseId: '5',
        sets: 5,
        reps: 15,
        completed: true,
        createdAt: new Date('2023-08-15T07:00:00Z').toISOString(),
        sessionId: 'cardio-1'
      }
    ],
    createdAt: new Date('2023-08-15T07:00:00Z').toISOString()
  },
  {
    id: 'core-1',
    startTime: new Date('2023-07-22T18:00:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-7',
        exerciseId: '4',
        sets: 3,
        reps: 30,
        completed: true,
        createdAt: new Date('2023-07-22T18:00:00Z').toISOString(),
        sessionId: 'core-1'
      },
      {
        id: 'ex-8',
        exerciseId: '5',
        sets: 3,
        reps: 12,
        completed: true,
        createdAt: new Date('2023-07-22T18:00:00Z').toISOString(),
        sessionId: 'core-1'
      }
    ],
    createdAt: new Date('2023-07-22T18:00:00Z').toISOString()
  },
  {
    id: 'full-body-2',
    startTime: new Date('2023-06-10T10:00:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-9',
        exerciseId: '1',
        sets: 3,
        reps: 12,
        completed: true,
        createdAt: new Date('2023-06-10T10:00:00Z').toISOString(),
        sessionId: 'full-body-2'
      },
      {
        id: 'ex-10',
        exerciseId: '3',
        sets: 3,
        reps: 10,
        completed: true,
        createdAt: new Date('2023-06-10T10:00:00Z').toISOString(),
        sessionId: 'full-body-2'
      },
      {
        id: 'ex-11',
        exerciseId: '4',
        sets: 3,
        reps: 20,
        completed: true,
        createdAt: new Date('2023-06-10T10:00:00Z').toISOString(),
        sessionId: 'full-body-2'
      }
    ],
    createdAt: new Date('2023-06-10T10:00:00Z').toISOString()
  },
  {
    id: 'strength-1',
    startTime: new Date('2023-05-01T16:00:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-12',
        exerciseId: '2',
        sets: 4,
        reps: 8,
        completed: true,
        createdAt: new Date('2023-05-01T16:00:00Z').toISOString(),
        sessionId: 'strength-1'
      },
      {
        id: 'ex-13',
        exerciseId: '3',
        sets: 4,
        reps: 10,
        completed: true,
        createdAt: new Date('2023-05-01T16:00:00Z').toISOString(),
        sessionId: 'strength-1'
      }
    ],
    createdAt: new Date('2023-05-01T16:00:00Z').toISOString()
  },
  {
    id: 'hiit-1',
    startTime: new Date('2023-04-15T09:30:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-14',
        exerciseId: '5',
        sets: 5,
        reps: 20,
        completed: true,
        createdAt: new Date('2023-04-15T09:30:00Z').toISOString(),
        sessionId: 'hiit-1'
      },
      {
        id: 'ex-15',
        exerciseId: '1',
        sets: 3,
        reps: 15,
        completed: true,
        createdAt: new Date('2023-04-15T09:30:00Z').toISOString(),
        sessionId: 'hiit-1'
      }
    ],
    createdAt: new Date('2023-04-15T09:30:00Z').toISOString()
  },
  {
    id: 'recovery-1',
    startTime: new Date('2023-03-20T11:00:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-16',
        exerciseId: '4',
        sets: 2,
        reps: 30,
        completed: true,
        createdAt: new Date('2023-03-20T11:00:00Z').toISOString(),
        sessionId: 'recovery-1'
      },
      {
        id: 'ex-17',
        exerciseId: '3',
        sets: 2,
        reps: 12,
        completed: true,
        createdAt: new Date('2023-03-20T11:00:00Z').toISOString(),
        sessionId: 'recovery-1'
      }
    ],
    createdAt: new Date('2023-03-20T11:00:00Z').toISOString()
  },
  {
    id: 'full-body-3',
    startTime: new Date('2023-02-10T17:00:00Z').toISOString(),
    sessionExercises: [
      {
        id: 'ex-18',
        exerciseId: '1',
        sets: 3,
        reps: 12,
        completed: true,
        createdAt: new Date('2023-02-10T17:00:00Z').toISOString(),
        sessionId: 'full-body-3'
      },
      {
        id: 'ex-19',
        exerciseId: '2',
        sets: 3,
        reps: 10,
        completed: true,
        createdAt: new Date('2023-02-10T17:00:00Z').toISOString(),
        sessionId: 'full-body-3'
      },
      {
        id: 'ex-20',
        exerciseId: '3',
        sets: 3,
        reps: 12,
        completed: true,
        createdAt: new Date('2023-02-10T17:00:00Z').toISOString(),
        sessionId: 'full-body-3'
      }
    ],
    createdAt: new Date('2023-02-10T17:00:00Z').toISOString()
  }
]; 