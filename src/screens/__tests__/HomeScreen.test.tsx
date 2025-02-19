import type { Session as ServiceSession, SessionExercise as ServiceSessionExercise } from '../../db/services/sessionService';
import type { Session as ModelSession, SessionExercise as ModelSessionExercise } from '../../db/models';
import { transformModelToServiceSession } from '../HomeScreen';

describe('HomeScreen transform functions', () => {
  describe('transformModelToServiceSession', () => {
    it('transforms a model session to a service session correctly', () => {
      const modelSession: ModelSession = {
        id: 'test-id',
        routineId: 'routine-1',
        startTime: '2024-03-14T10:00:00Z',
        endTime: '2024-03-14T11:00:00Z',
        createdAt: '2024-03-14T10:00:00Z',
        sessionExercises: [{
          id: 'exercise-1',
          sessionId: 'test-id',
          exerciseId: 'ex-1',
          sets: 3,
          reps: 12,
          weight: 100,
          notes: 'Test notes',
          completed: true,
          createdAt: '2024-03-14T10:00:00Z'
        }]
      };

      const expectedServiceSession: ServiceSession = {
        id: 'test-id',
        routineId: 'routine-1',
        name: 'Workout Session',
        startTime: '2024-03-14T10:00:00Z',
        endTime: '2024-03-14T11:00:00Z',
        createdAt: '2024-03-14T10:00:00Z',
        exercises: [{
          id: 'exercise-1',
          sessionId: 'test-id',
          exerciseId: 'ex-1',
          setNumber: 3,
          reps: 12,
          weight: 100,
          duration: undefined,
          notes: 'Test notes',
          createdAt: '2024-03-14T10:00:00Z'
        }]
      };

      const result = transformModelToServiceSession(modelSession);
      expect(result).toEqual(expectedServiceSession);
    });

    it('handles empty session exercises', () => {
      const modelSession: ModelSession = {
        id: 'test-id',
        startTime: '2024-03-14T10:00:00Z',
        createdAt: '2024-03-14T10:00:00Z',
        sessionExercises: []
      };

      const expectedServiceSession: ServiceSession = {
        id: 'test-id',
        name: 'Workout Session',
        startTime: '2024-03-14T10:00:00Z',
        createdAt: '2024-03-14T10:00:00Z',
        exercises: []
      };

      const result = transformModelToServiceSession(modelSession);
      expect(result).toEqual(expectedServiceSession);
    });

    it('handles optional fields correctly', () => {
      const modelSession: ModelSession = {
        id: 'test-id',
        routineId: undefined,
        startTime: '2024-03-14T10:00:00Z',
        endTime: undefined,
        createdAt: '2024-03-14T10:00:00Z',
        sessionExercises: [{
          id: 'exercise-1',
          sessionId: 'test-id',
          exerciseId: 'ex-1',
          sets: 3,
          reps: 0,
          weight: undefined,
          notes: undefined,
          completed: true,
          createdAt: '2024-03-14T10:00:00Z'
        }]
      };

      const expectedServiceSession: ServiceSession = {
        id: 'test-id',
        name: 'Workout Session',
        startTime: '2024-03-14T10:00:00Z',
        createdAt: '2024-03-14T10:00:00Z',
        exercises: [{
          id: 'exercise-1',
          sessionId: 'test-id',
          exerciseId: 'ex-1',
          setNumber: 3,
          reps: 0,
          duration: undefined,
          createdAt: '2024-03-14T10:00:00Z'
        }]
      };

      const result = transformModelToServiceSession(modelSession);
      expect(result).toEqual(expectedServiceSession);
    });
  });
}); 