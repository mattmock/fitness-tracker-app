import { IExerciseService } from '../ExerciseService';
import { Exercise, Routine, Session, SessionExercise } from '@db/models';
import { mockExercises, mockRoutines, mockSessions } from './mockData';
import { ConfigService } from '../ConfigService';
import { mockSessions as mockSessionsData } from './data/sessions';

export class MockExerciseService implements IExerciseService {
  private getMockSessions(): Session[] {
    const dataLevel = ConfigService.mockDataLevel;
    console.log('Using mock data level:', dataLevel);
    
    switch (dataLevel) {
      case 'empty':
        return [];
      case 'minimal':
        return mockSessionsData.slice(0, 1);
      case 'full':
      default:
        return [...mockSessionsData];
    }
  }

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
    const sessions = this.getMockSessions();
    console.log('Returning sessions:', sessions.length);
    return Promise.resolve(sessions);
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