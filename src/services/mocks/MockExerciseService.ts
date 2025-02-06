import { IExerciseService } from '../ExerciseService';
import { Exercise, Routine, Session, SessionExercise } from '@db/models';
import { mockExercises, mockRoutines, mockSessions } from './mockData';

export class MockExerciseService implements IExerciseService {
  getSessionExercises(): Promise<SessionExercise[]> {
      throw new Error('Method not implemented.');
  }
  async getExercises(): Promise<Exercise[]> {
    return Promise.resolve(mockExercises);
  }
  async getRoutines(): Promise<Routine[]> {
    return Promise.resolve(mockRoutines);
  }
  async getSessions(): Promise<Session[]> {
    return Promise.resolve(mockSessions);
  }
  // ... other mock implementations
} 