import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ExerciseLibraryScreen } from '../ExerciseLibraryScreen';
import type { Exercise } from '../../db/services/exerciseService';
import type { Routine } from '../../db/services/routineService';

// Mock InteractionManager
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: (callback: Function) => callback(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock database context
const mockGetAllExercises = jest.fn();
const mockGetAllRoutines = jest.fn();
jest.mock('../../db', () => ({
  useDatabaseContext: () => ({
    exerciseService: {
      getAll: mockGetAllExercises,
    },
    routineService: {
      getAll: mockGetAllRoutines,
    },
  }),
}));

// Mock components
jest.mock('../../components', () => {
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    LoadingSpinner: () => <View testID="loading-spinner" />,
    BackButton: () => null,
    ExerciseTypeCard: ({ onPress, title, exerciseCount }: { 
      onPress: () => void;
      title: string;
      exerciseCount: number;
    }) => (
      <TouchableOpacity testID="exercise-type-card" onPress={onPress}>
        <Text>{title} ({exerciseCount})</Text>
      </TouchableOpacity>
    ),
  };
});

describe('ExerciseLibraryScreen', () => {
  const mockExercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      category: 'Bodyweight',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Squats',
      category: 'Bodyweight',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Bench Press',
      category: 'Strength',
      createdAt: new Date().toISOString(),
    },
  ];

  const mockRoutines: Routine[] = [
    {
      id: '1',
      name: 'Full Body Workout',
      exerciseIds: ['1', '2'],
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Upper Body',
      exerciseIds: ['1', '3'],
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllExercises.mockResolvedValue(mockExercises);
    mockGetAllRoutines.mockResolvedValue(mockRoutines);
  });

  it('renders loading spinner initially', () => {
    const { getByTestId } = render(<ExerciseLibraryScreen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('fetches and displays exercise groups', async () => {
    const { getAllByTestId } = render(<ExerciseLibraryScreen />);

    await waitFor(() => {
      const cards = getAllByTestId('exercise-type-card');
      // Should show 2 categories: Bodyweight and Strength
      expect(cards).toHaveLength(2);
    });
  });

  it('navigates to exercise list when group is pressed', async () => {
    const { getAllByTestId } = render(<ExerciseLibraryScreen />);

    await waitFor(() => {
      const cards = getAllByTestId('exercise-type-card');
      fireEvent.press(cards[0]);
    });

    expect(mockNavigate).toHaveBeenCalledWith('ExerciseList', {
      category: 'Bodyweight',
      exercises: expect.arrayContaining([
        expect.objectContaining({ name: 'Push-ups' }),
        expect.objectContaining({ name: 'Squats' }),
      ]),
    });
  });

  it('switches between exercises and routines tabs', async () => {
    const { getByText, getAllByTestId } = render(<ExerciseLibraryScreen />);

    await waitFor(() => {
      // Initially should show exercise groups
      expect(getAllByTestId('exercise-type-card')).toHaveLength(2);
    });

    // Switch to routines tab
    fireEvent.press(getByText('Routines'));

    await waitFor(() => {
      const cards = getAllByTestId('exercise-type-card');
      // Should show 2 routines
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveTextContent('Full Body Workout (2)');
    });
  });

  it('handles error when fetching data', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetAllExercises.mockRejectedValue(new Error('Failed to fetch'));

    render(<ExerciseLibraryScreen />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to fetch data:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('displays empty state when no exercises found', async () => {
    mockGetAllExercises.mockResolvedValue([]);
    mockGetAllRoutines.mockResolvedValue([]);

    const { getByText } = render(<ExerciseLibraryScreen />);

    await waitFor(() => {
      expect(getByText('No exercise groups found')).toBeTruthy();
    });

    // Switch to routines tab
    fireEvent.press(getByText('Routines'));

    await waitFor(() => {
      expect(getByText('No routines found')).toBeTruthy();
    });
  });
}); 