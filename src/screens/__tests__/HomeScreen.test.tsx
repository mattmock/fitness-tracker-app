import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import type { Session as ServiceSession, SessionExercise as ServiceSessionExercise } from '../../db/services/sessionService';
import type { Session as ModelSession, SessionExercise as ModelSessionExercise } from '../../db/models';
import { transformModelToServiceSession } from '../HomeScreen';
import { SessionContainer } from '../../components/SessionContainer';
import { PastSessionBottomSheet } from '../../components/PastSessionBottomSheet';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: jest.fn((callback) => callback()),
}));

// Mock database service
const mockGetAll = jest.fn();
jest.mock('../../db', () => ({
  useDatabaseContext: () => ({
    sessionService: {
      getAll: mockGetAll,
    },
  }),
}));

// Mock components
jest.mock('../../components/SessionContainer', () => ({
  SessionContainer: jest.fn(() => null),
}));

jest.mock('../../components/PastSessionBottomSheet', () => ({
  PastSessionBottomSheet: jest.fn(() => null),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue([]);
  });

  describe('Component Integration', () => {
    it('renders without crashing', async () => {
      render(<HomeScreen />);
      
      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalled();
      });
    });

    it('handles today\'s session correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockTodaySession = {
        id: 'today-session',
        startTime: `${today}T10:00:00Z`,
        createdAt: `${today}T10:00:00Z`,
        exercises: []
      };

      mockGetAll.mockResolvedValueOnce([mockTodaySession]);

      render(<HomeScreen />);

      await waitFor(() => {
        expect(SessionContainer).toHaveBeenCalledWith(
          expect.objectContaining({
            activeSession: expect.objectContaining({
              id: 'today-session'
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('handles past sessions correctly', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const mockPastSession = {
        id: 'past-session',
        startTime: `${yesterday}T10:00:00Z`,
        createdAt: `${yesterday}T10:00:00Z`,
        exercises: []
      };

      mockGetAll.mockResolvedValueOnce([mockPastSession]);

      render(<HomeScreen />);

      await waitFor(() => {
        expect(PastSessionBottomSheet).toHaveBeenCalledWith(
          expect.objectContaining({
            initialSnapPoints: expect.any(Array)
          }),
          expect.any(Object)
        );
      });
    });

    it('navigates to ExerciseLibrary when adding exercise', async () => {
      render(<HomeScreen />);
      
      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalled();
      });

      // Get the SessionContainer props
      const sessionContainerProps = (SessionContainer as jest.Mock).mock.calls[0][0];
      
      // Call the onAddExercise prop
      sessionContainerProps.onAddExercise();

      expect(mockNavigate).toHaveBeenCalledWith('ExerciseLibrary');
    });
  });

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