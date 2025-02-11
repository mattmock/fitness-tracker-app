import { IExerciseService } from './ExerciseService';
import { Exercise, Routine, Session, SessionExercise } from '../db/models';
import { ExerciseRepository } from '../db/repositories';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

export function useExerciseService(): IExerciseService {
  const db = useSQLiteContext();
  const repository = useMemo(() => new ExerciseRepository(db), [db]);

  return {
    getExercises: () => repository.getExercises(),
    getRoutines: () => repository.getRoutines(),
    getSessions: () => repository.getSessions(),
    getSessionExercises: async () => {
      const sessions = await repository.getSessions();
      return sessions.flatMap(session => session.sessionExercises);
    },
    createSessionWithExercises: (exercises: Exercise[]) => repository.createSession(exercises)
  };
} 