import { IExerciseService } from './ExerciseService';
import { Exercise, Routine, Session, SessionExercise } from '../db/models';
import { useDatabase } from '../db';

export class ExerciseService implements IExerciseService {
  private db = useDatabase().db;

  async getExercises(): Promise<Exercise[]> {
    if (!this.db) throw new Error('Database not initialized');
    // TODO: Implement actual database query
    return [];
  }

  async getRoutines(): Promise<Routine[]> {
    if (!this.db) throw new Error('Database not initialized');
    // TODO: Implement actual database query
    return [];
  }

  async getSessions(): Promise<Session[]> {
    if (!this.db) throw new Error('Database not initialized');
    // TODO: Implement actual database query
    return [];
  }

  async getSessionExercises(): Promise<SessionExercise[]> {
    if (!this.db) throw new Error('Database not initialized');
    // TODO: Implement actual database query
    return [];
  }
} 