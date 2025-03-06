import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { ExerciseLibraryScreen } from '../ExerciseLibraryScreen';
import { DatabaseContext } from '../../db/core/hooks';
import { useNavigation } from '@react-navigation/native';

// Mock the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: jest.fn((callback) => {
    // Execute the callback immediately
    callback();
  }),
}));

// Mock the components
jest.mock('../../components', () => ({
  LoadingSpinner: jest.fn(() => null),
  BackButton: jest.fn(() => null),
  ExerciseTypeCard: jest.fn(() => null),
}));

// Mock the services
jest.mock('../../db/services/exerciseService', () => ({
  ExerciseService: jest.fn().mockImplementation(() => ({
    getAll: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchByName: jest.fn(),
    getByCategory: jest.fn(),
  })),
}));

jest.mock('../../db/services/routineService', () => ({
  RoutineService: jest.fn().mockImplementation(() => ({
    getAll: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    updateExercises: jest.fn(),
    delete: jest.fn(),
    searchByName: jest.fn(),
  })),
}));

jest.mock('../../db/services/sessionService', () => ({
  SessionService: jest.fn().mockImplementation(() => ({
    getAll: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    updateExercise: jest.fn(),
    delete: jest.fn(),
    getByDateRange: jest.fn(),
    addExerciseToSession: jest.fn(),
  })),
}));

// Import mocked components and services
import { LoadingSpinner, BackButton, ExerciseTypeCard } from '../../components';
import { ExerciseService } from '../../db/services/exerciseService';
import { RoutineService } from '../../db/services/routineService';
import { SessionService } from '../../db/services/sessionService';

jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: jest.fn(callback => callback()),
}));

describe('ExerciseLibraryScreen', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const mockContext = {
    forceReset: jest.fn(),
    exerciseService: new ExerciseService({} as any),
    routineService: new RoutineService({} as any),
    sessionService: new SessionService({} as any),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
    });
    
    // Mock return values for service methods
    (mockContext.exerciseService.getAll as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Exercise 1', category: 'Category 1' },
      { id: '2', name: 'Exercise 2', category: 'Category 1' },
    ]);
    (mockContext.routineService.getAll as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Routine 1', exerciseIds: ['1', '2'] },
      { id: '2', name: 'Routine 2', exerciseIds: ['1'] },
    ]);
    (mockContext.sessionService.getAll as jest.Mock).mockResolvedValue([]);

    // Mock component implementations
    (LoadingSpinner as jest.Mock).mockImplementation(() => (
      <View testID="loading-spinner" />
    ));
    (BackButton as jest.Mock).mockImplementation(({ onPress }) => (
      <TouchableOpacity testID="back-button" onPress={onPress} />
    ));
    (ExerciseTypeCard as jest.Mock).mockImplementation(({ title, exerciseCount, onPress }) => (
      <TouchableOpacity testID="exercise-type-card" onPress={onPress}>
        <Text testID="exercise-type-title">{title}</Text>
        <Text testID="exercise-type-count">{exerciseCount} exercises</Text>
      </TouchableOpacity>
    ));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const waitForComponentToLoad = async () => {
    await act(async () => {
      // Wait for all promises to resolve
      await Promise.resolve();
    });
  };

  const renderAndWait = async (waitForLoad = true) => {
    const result = render(
      <DatabaseContext.Provider value={mockContext}>
        <ExerciseLibraryScreen />
      </DatabaseContext.Provider>
    );

    if (waitForLoad) {
      await waitForComponentToLoad();
    }

    return result;
  };

  it('renders loading spinner initially', async () => {
    const { getByTestId } = await renderAndWait(false);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays exercise groups after loading', async () => {
    const { getByTestId } = await renderAndWait();
    expect(getByTestId('exercise-type-card')).toBeTruthy();
    expect(getByTestId('exercise-type-title')).toHaveTextContent('Category 1');
    expect(getByTestId('exercise-type-count')).toHaveTextContent('2 exercises');
  });

  it('navigates back when back button is pressed', async () => {
    const { getByTestId } = await renderAndWait();
    await act(async () => {
      fireEvent.press(getByTestId('back-button'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('handles exercise selection and session creation', async () => {
    // Mock the navigation hook before rendering
    const mockNavigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });

    // Mock the session service create method
    (mockContext.sessionService.create as jest.Mock).mockResolvedValue({ id: 'session1' });

    const { getByTestId } = await renderAndWait();

    // Select an exercise group
    await act(async () => {
      fireEvent.press(getByTestId('exercise-type-card'));
    });

    // Verify navigation to ExerciseList
    expect(mockNavigate).toHaveBeenCalledWith('ExerciseList', expect.any(Object));

    // Mock the onExercisesSelected callback
    const onExercisesSelected = mockNavigate.mock.calls[0][1].onExercisesSelected;
    await act(async () => {
      onExercisesSelected(['1']); // Use the ID from our mocked exercises
    });

    // Create session
    await act(async () => {
      fireEvent.press(getByTestId('add-to-session-button'));
    });

    expect(mockContext.sessionService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining('Workout'),
        startTime: expect.any(String),
      }),
      expect.arrayContaining([
        expect.objectContaining({
          exerciseId: '1',
          setNumber: 1,
        }),
      ])
    );
  });

  it('handles data fetching errors gracefully', async () => {
    (mockContext.exerciseService.getAll as jest.Mock).mockRejectedValue(new Error('Failed to fetch exercises'));
    
    const { getByText } = await renderAndWait();
    expect(getByText('No exercise groups found')).toBeTruthy();
  });

  it('switches between exercises and routines tabs', async () => {
    const { getByTestId, getAllByTestId } = await renderAndWait();

    // Switch to routines tab
    await act(async () => {
      fireEvent.press(getByTestId('routines-tab'));
    });

    // Wait for the component to load
    await waitForComponentToLoad();

    // Check that we have the correct number of routine cards
    const cards = getAllByTestId('exercise-type-card');
    expect(cards.length).toBe(2);

    // Check the first routine card's title
    const titles = getAllByTestId('exercise-type-title');
    expect(titles[0]).toHaveTextContent('Routine 1');

    // Check the first routine card's count
    const counts = getAllByTestId('exercise-type-count');
    expect(counts[0]).toHaveTextContent('2 exercises');
  });
}); 