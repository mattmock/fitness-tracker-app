import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from '@testing-library/react-native';
import { ExerciseLibraryScreen } from '../ExerciseLibraryScreen';
import { useDatabaseContext } from '../../db/core/hooks';

// Mock the components
jest.mock('../../components', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return {
    LoadingSpinner: () => (
      <View testID="loading-spinner">
        <Text>Loading...</Text>
      </View>
    ),
    BackButton: ({ onPress }: { onPress?: () => void }) => (
      <TouchableOpacity testID="header-back-button" onPress={onPress}>
        <Text>Back</Text>
      </TouchableOpacity>
    ),
    ExerciseTypeCard: ({ title, exerciseCount, onPress }: { title: string; exerciseCount: number; onPress: () => void }) => (
      <TouchableOpacity testID="exercise-type-card" onPress={onPress}>
        <Text testID="exercise-type-title">{title}</Text>
        <Text testID="exercise-type-count">{exerciseCount} exercises</Text>
      </TouchableOpacity>
    ),
  };
});

// Mock the database context
jest.mock('../../db/core/hooks', () => ({
  useDatabaseContext: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
  useFocusEffect: (callback: () => void) => {
    callback();
  },
}));

describe('ExerciseLibraryScreen', () => {
  const mockContext = {
    exerciseService: {
      getAll: jest.fn(),
    },
    routineService: {
      getAll: jest.fn(),
    },
    sessionService: {
      getAll: jest.fn(),
      create: jest.fn(),
      getById: jest.fn(),
      addExerciseToSession: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDatabaseContext as jest.Mock).mockReturnValue(mockContext);
    mockContext.exerciseService.getAll.mockResolvedValue([
      { id: '1', name: 'Exercise 1', category: 'Strength' },
      { id: '2', name: 'Exercise 2', category: 'Strength' },
    ]);
    mockContext.routineService.getAll.mockResolvedValue([
      { id: '1', name: 'Routine 1', exerciseIds: ['1', '2'] },
    ]);
    mockContext.sessionService.getAll.mockResolvedValue([]);
  });

  const waitForComponentToLoad = async () => {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  };

  it('renders loading spinner initially', async () => {
    const { getByTestId } = render(<ExerciseLibraryScreen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays exercise groups after loading', async () => {
    const { getByTestId } = render(<ExerciseLibraryScreen />);
    await waitForComponentToLoad();

    expect(getByTestId('exercise-type-card')).toBeTruthy();
  });

  it('navigates back when back button is pressed', async () => {
    const { getByTestId } = render(<ExerciseLibraryScreen />);
    await waitForComponentToLoad();

    await act(async () => {
      fireEvent.press(getByTestId('header-back-button'));
    });
    expect(mockContext.sessionService.getAll).toHaveBeenCalled();
  });

  it('handles exercise selection and session creation', async () => {
    mockContext.sessionService.create.mockResolvedValue({ id: 'session1' });
    
    // Set up navigation mock before rendering
    let onExercisesSelected: (exercises: string[]) => void;
    mockNavigate.mockImplementation((screen, params) => {
      if (screen === 'ExerciseList') {
        onExercisesSelected = params.onExercisesSelected;
      }
    });

    const { getByTestId } = render(<ExerciseLibraryScreen />);
    await waitForComponentToLoad();

    // Select the exercise group
    await act(async () => {
      fireEvent.press(getByTestId('exercise-type-card'));
    });
    await waitForComponentToLoad();

    // Simulate exercise selection
    await act(async () => {
      onExercisesSelected(['1']);
    });
    await waitForComponentToLoad();

    // Wait for the add button to appear
    await waitFor(() => {
      expect(getByTestId('add-to-session-button')).toBeTruthy();
    });

    // Click the add button
    await act(async () => {
      fireEvent.press(getByTestId('add-to-session-button'));
    });
    await waitForComponentToLoad();

    // Verify session was created
    expect(mockContext.sessionService.create).toHaveBeenCalledWith(
      {
        name: expect.any(String),
        startTime: expect.any(String),
      },
      [
        {
          exerciseId: '1',
          setNumber: 1,
        },
      ]
    );
  });

  it('handles data fetching errors gracefully', async () => {
    mockContext.exerciseService.getAll.mockRejectedValue(new Error('Failed to fetch exercises'));
    
    const { getByText } = render(<ExerciseLibraryScreen />);
    await waitForComponentToLoad();

    await waitFor(() => {
      expect(getByText('No exercise groups found')).toBeTruthy();
    });
  });

  it('switches between exercises and routines tabs', async () => {
    const { getByTestId } = render(<ExerciseLibraryScreen />);
    await waitForComponentToLoad();

    // Switch to routines tab
    await act(async () => {
      fireEvent.press(getByTestId('routines-tab'));
    });
    await waitForComponentToLoad();

    // Verify routines are displayed
    const routineCard = getByTestId('exercise-type-card');
    expect(routineCard).toBeTruthy();
    expect(getByTestId('exercise-type-title')).toHaveTextContent('Routine 1');
    expect(getByTestId('exercise-type-count')).toHaveTextContent('2 exercises');
  });
}); 