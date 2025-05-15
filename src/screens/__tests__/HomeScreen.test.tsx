/**
 * HomeScreen.test.tsx
 * 
 * Tests for the HomeScreen component focusing on:
 * 1. Component rendering and layout
 * 2. Data loading and state management
 * 3. User interactions and navigation
 * 4. Session management
 */

// React and testing libraries
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { jest } from '@jest/globals';
import { ReactTestInstance } from 'react-test-renderer';

// Component under test
import { HomeScreen } from '../HomeScreen';

// Types
import type { Session } from '../../types/database';

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
  useFocusEffect: jest.fn((cb: () => void) => {
    // Call the callback immediately
    cb();
  }),
}));

// Mock database service
const mockGetAll = jest.fn<() => Promise<Session[]>>();
const mockSessionService = {
  getAll: mockGetAll
};
jest.mock('../../db', () => ({
  useDatabaseContext: () => ({
    sessionService: mockSessionService
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
  SafeAreaView: jest.fn(({ children, edges, style }) => (
    <div data-testid="safe-area-view" data-edges={edges} data-style={JSON.stringify(style)}>
      {children}
    </div>
  )),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

// Mock KeyboardAwareScrollView
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: jest.fn(({ children, ...props }) => (
    <div data-testid="keyboard-aware-scroll-view" data-props={JSON.stringify(props)}>
      {children}
    </div>
  )),
}));

// Add these type casts after imports
const SafeAreaViewMock = SafeAreaView as unknown as jest.Mock;
const KeyboardAwareScrollViewMock = KeyboardAwareScrollView as unknown as jest.Mock;
const SessionContainerMock = SessionContainer as unknown as jest.Mock;
const PastSessionBottomSheetMock = PastSessionBottomSheet as unknown as jest.Mock;

// Helper function to render the component and wait for initial data loading
const renderAndWait = async () => {
  let renderResult;
  
  // Render the component
  renderResult = render(<HomeScreen />);
  
  // Wait for the initial data loading to complete
  await waitFor(() => {
    expect(mockGetAll).toHaveBeenCalled();
  });
  
  // Get the SessionContainer props after all state updates have been processed
  await waitFor(() => {
    expect(SessionContainer).toHaveBeenCalled();
  });
  
  const sessionContainerProps = (SessionContainer as jest.Mock).mock.calls[0][0] as {
    activeSession: Session | null;
    onAddExercise: () => void;
  };
  
  return {
    ...renderResult,
    sessionContainerProps
  };
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue([]); // Default: no sessions
  });

  it('renders without crashing', async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId('home-screen')).toBeTruthy();
    });
  });

  it('navigates to ExerciseLibrary when pressing the add button in header', async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId('header-add-button')).toBeTruthy();
    });
    act(() => {
      fireEvent.press(getByTestId('header-add-button'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('ExerciseLibrary', { newExerciseId: undefined });
  });
}); 