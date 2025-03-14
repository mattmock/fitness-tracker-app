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

// React and testing libraries
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';

// Component under test
import { HomeScreen } from '../HomeScreen';

// Types
import type { Session } from '../../db/models';

// Components used in tests
import { SessionContainer } from '../../components/SessionContainer';
import { PastSessionBottomSheet } from '../../components/PastSessionBottomSheet';

// Third-party libraries
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  // Simple mock that just calls the callback once
  useFocusEffect: jest.fn(cb => cb()),
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

// Helper function to render the component and wait for initial data loading
const renderAndWait = async () => {
  // Render the component
  const renderResult = render(<HomeScreen />);
  
  // Wait for the initial data loading to complete
  await waitFor(() => {
    expect(mockGetAll).toHaveBeenCalled();
  }, { timeout: 3000 }); // Increase timeout to ensure async operations complete
  
  // Get the SessionContainer props after all state updates have been processed
  await waitFor(() => {
    expect(SessionContainer).toHaveBeenCalled();
  }, { timeout: 3000 });
  
  const sessionContainerProps = (SessionContainer as jest.Mock).mock.calls[0][0];
  
  return {
    ...renderResult,
    sessionContainerProps
  };
};

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
      }, { timeout: 3000 });
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
      }, { timeout: 3000 });
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
      }, { timeout: 3000 });
    });

    it('handles today\'s session correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockTodaySession = {
        id: 'today-session',
        name: 'Today Session',
        startTime: `${today}T10:00:00Z`,
        createdAt: `${today}T10:00:00Z`,
        sessionExercises: []
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
      }, { timeout: 3000 });
    });

    it('handles past sessions correctly', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const mockPastSession = {
        id: 'past-session',
        name: 'Past Session',
        startTime: `${yesterday}T10:00:00Z`,
        createdAt: `${yesterday}T10:00:00Z`,
        sessionExercises: []
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
      }, { timeout: 3000 });
    });

    it('navigates to ExerciseLibrary when adding exercise', async () => {
      const { sessionContainerProps } = await renderAndWait();
      
      sessionContainerProps.onAddExercise();
      
      expect(mockNavigate).toHaveBeenCalledWith('ExerciseLibrary', { newExerciseId: undefined });
    });

    it('navigates to ExerciseLibrary when pressing the add button in header', async () => {
      const { getByTestId } = await renderAndWait();
      
      fireEvent.press(getByTestId('header-add-button'));
      
      expect(mockNavigate).toHaveBeenCalledWith('ExerciseLibrary', { newExerciseId: undefined });
    });
  });
}); 