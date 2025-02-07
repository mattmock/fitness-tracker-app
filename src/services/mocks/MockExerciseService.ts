import { IExerciseService } from '../ExerciseService';
import { Exercise, Routine, Session, SessionExercise } from '@db/models';
import { mockExercises, mockRoutines, mockSessions } from './mockData';

export class MockExerciseService implements IExerciseService {
  getSessionExercises(): Promise<SessionExercise[]> {
    return Promise.resolve(mockSessions.flatMap(session => session.sessionExercises));
  }
  async getExercises(): Promise<Exercise[]> {
    // Ensure all mock exercises have valid IDs
    const validExercises = mockExercises.map(exercise => {
      if (!exercise.id) {
        console.error('Mock exercise missing ID:', exercise);
        return {
          ...exercise,
          id: Date.now().toString() // Fallback ID if missing
        };
      }
      return exercise;
    });
    return Promise.resolve(validExercises);
  }
  async getRoutines(): Promise<Routine[]> {
    return Promise.resolve(mockRoutines);
  }
  async getSessions(): Promise<Session[]> {
    return Promise.resolve(mockSessions);
  }

  async createSessionWithExercises(exercises: Exercise[]): Promise<Session> {
    if (!exercises || exercises.length === 0) {
      throw new Error('No exercises provided for session creation');
    }

    // Validate exercises
    exercises.forEach(exercise => {
      if (!exercise || !exercise.id) {
        throw new Error(`Invalid exercise in selection: ${JSON.stringify(exercise)}`);
      }
    });

    const sessionId = Date.now().toString();
    const now = new Date().toISOString();

    const session: Session = {
      id: sessionId,
      startTime: now,
      createdAt: now,
      sessionExercises: exercises.map((exercise, index) => ({
        id: `${sessionId}-${index}`,
        exerciseId: exercise.id,
        sessionId: sessionId,
        sets: 3,
        reps: 10,
        completed: false,
        createdAt: now,
      })),
    };

    mockSessions.push(session);
    console.log('Created mock session:', session);
    return session;
  }
  // ... other mock implementations
} 