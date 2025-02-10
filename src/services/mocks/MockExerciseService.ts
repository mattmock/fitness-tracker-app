import { IExerciseService } from '../ExerciseService';
import { Exercise, Routine, Session, SessionExercise } from '../../db/models';
import { MockDataGenerator } from './mockDataGenerator';
import { ConfigService } from '../ConfigService';

export class MockExerciseService implements IExerciseService {
  private mockData = MockDataGenerator.generateMockData();
  private removeConfigListener: (() => void) | null = null;

  constructor() {
    // Listen for config changes and regenerate data when they occur
    this.removeConfigListener = ConfigService.addChangeListener(() => {
      console.log('Config changed, regenerating mock data...');
      this.regenerateMockData();
    });

    // Generate initial data
    this.regenerateMockData();
  }

  private regenerateMockData() {
    console.log('Regenerating mock data...');
    this.mockData = MockDataGenerator.generateMockData();
  }

  async getExercises(): Promise<Exercise[]> {
    return Promise.resolve(this.mockData.exercises);
  }

  async getRoutines(): Promise<Routine[]> {
    return Promise.resolve(this.mockData.routines);
  }

  async getSessions(): Promise<Session[]> {
    return Promise.resolve(this.mockData.sessions);
  }

  async getSessionExercises(): Promise<SessionExercise[]> {
    return Promise.resolve(
      this.mockData.sessions.flatMap(session => session.sessionExercises)
    );
  }

  async createSessionWithExercises(exercises: Exercise[]): Promise<Session> {
    if (!exercises || exercises.length === 0) {
      throw new Error('No exercises provided for session creation');
    }

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

    // Add the new session to our mock data
    this.mockData.sessions.unshift(session);
    console.log('Created new session:', session);
    
    return session;
  }

  // Clean up when service is destroyed
  destroy() {
    if (this.removeConfigListener) {
      this.removeConfigListener();
      this.removeConfigListener = null;
    }
  }
} 