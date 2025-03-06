/**
 * HomeScreen.test.tsx
 * 
 * Note: This test file currently has some React act() warnings related to state updates
 * in the HomeScreen component. These warnings occur because some state updates in the
 * component are not wrapped in act() calls during testing. While the tests are passing,
 * these warnings should be addressed in the future for better test reliability.
 * 
 * The warnings specifically relate to:
 * 1. setActiveSession() calls in the useFocusEffect hook
 * 2. setPastSessions() calls in the useFocusEffect hook
 * 
 * Future improvements should include properly wrapping these state updates in act()
 * or using more robust testing patterns for asynchronous state updates.
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import type { Session as ServiceSession, SessionExercise as ServiceSessionExercise } from '../../db/services/sessionService';
import type { Session as ModelSession, SessionExercise as ModelSessionExercise } from '../../db/models';
import { transformModelToServiceSession } from '../HomeScreen';
import { SessionContainer } from '../../components/SessionContainer';
import { PastSessionBottomSheet } from '../../components/PastSessionBottomSheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.fn(({ children }) => children),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

// Mock KeyboardAwareScrollView
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: jest.fn(({ children }) => children),
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

    it('uses SafeAreaView for layout', async () => {
      render(<HomeScreen />);
      
      await waitFor(() => {
        expect(SafeAreaView).toHaveBeenCalledWith(
          expect.objectContaining({
            style: expect.objectContaining({
              flex: 1,
            }),
            edges: ['top'],
          }),
          expect.anything()
        );
      });
    });

    it('configures KeyboardAwareScrollView correctly', async () => {
      render(<HomeScreen />);
      
      await waitFor(() => {
        expect(KeyboardAwareScrollView).toHaveBeenCalledWith(
          expect.objectContaining({
            enableOnAndroid: true,
            enableAutomaticScroll: true,
            keyboardShouldPersistTaps: 'handled',
            enableResetScrollToCoords: true,
            resetScrollToCoords: { x: 0, y: 0 },
          }),
          expect.anything()
        );
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

    it('navigates to ExerciseLibrary when pressing the add button in header', async () => {
      const { getByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalled();
      });

      // Find and press the add button in the header
      const addButton = getByTestId('header-add-button');
      fireEvent.press(addButton);

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