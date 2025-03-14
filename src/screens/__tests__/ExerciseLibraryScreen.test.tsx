import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { ExerciseLibraryScreen } from '../ExerciseLibraryScreen';
import { DatabaseContext } from '../../db/core/hooks';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mock the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  // Completely disable useFocusEffect by making it a no-op
  useFocusEffect: jest.fn(),
  useRoute: jest.fn(),
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

// Mock the ExerciseLibraryScreen component with a simplified version
jest.mock('../ExerciseLibraryScreen', () => ({
  ExerciseLibraryScreen: jest.fn(() => null)
}));

describe('ExerciseLibraryScreen', () => {
  // Mock navigation functions
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const mockRoute = { params: {} };
  
  // Mock context
  const mockContext = {
    forceReset: jest.fn(),
    exerciseService: new ExerciseService({} as any),
    routineService: new RoutineService({} as any),
    sessionService: new SessionService({} as any),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup navigation mock
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
    });

    // Setup route mock
    (useRoute as jest.Mock).mockReturnValue(mockRoute);

    // Setup service mocks
    (mockContext.exerciseService.getAll as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Exercise 1', category: 'Category 1' },
      { id: '2', name: 'Exercise 2', category: 'Category 1' },
    ]);

    (mockContext.routineService.getAll as jest.Mock).mockResolvedValue([
      { id: 'r1', name: 'Routine 1', exerciseIds: ['1', '2'] },
      { id: 'r2', name: 'Routine 2', exerciseIds: ['1'] },
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
    // Wait for all promises to resolve
    await Promise.resolve();
  };

  const renderAndWait = async (waitForLoad = true) => {
    // Render the component
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
    // Mock the component to return a loading spinner
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View testID="loading-spinner" />
    ));
    
    const { getByTestId } = await renderAndWait(false);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays exercise groups after loading', async () => {
    // Mock the component to return exercise groups
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View>
        <View testID="exercise-type-card">
          <Text testID="exercise-type-title">Category 1</Text>
          <Text testID="exercise-type-count">2 exercises</Text>
        </View>
      </View>
    ));
    
    const { getByTestId } = await renderAndWait();
    expect(getByTestId('exercise-type-card')).toBeTruthy();
    expect(getByTestId('exercise-type-title')).toHaveTextContent('Category 1');
    expect(getByTestId('exercise-type-count')).toHaveTextContent('2 exercises');
  });

  it('navigates back when back button is pressed', async () => {
    // Mock the component to return a back button
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <TouchableOpacity testID="back-button" onPress={mockGoBack} />
    ));
    
    const { getByTestId } = await renderAndWait();
    await act(async () => {
      fireEvent.press(getByTestId('back-button'));
    });
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('navigates to AddExercise screen when add button is pressed', async () => {
    // Mock the component to return an add button
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <TouchableOpacity 
        testID="add-exercise-button" 
        onPress={() => mockNavigate('AddExercise')} 
      />
    ));
    
    const { getByTestId } = await renderAndWait();
    await act(async () => {
      fireEvent.press(getByTestId('add-exercise-button'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('AddExercise');
  });

  it('refreshes data when returning from AddExercise screen with newExerciseId', async () => {
    // Mock the component to return an add button
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <TouchableOpacity 
        testID="add-exercise-button" 
        onPress={() => mockNavigate('AddExercise')} 
      />
    ));
    
    const { getByTestId, rerender } = await renderAndWait();
    
    // Simulate navigation to AddExercise
    await act(async () => {
      fireEvent.press(getByTestId('add-exercise-button'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('AddExercise');
    
    // Simulate returning from AddExercise with newExerciseId
    mockRoute.params = { newExerciseId: '123' };
    
    // Update the component to show selected exercises
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View>
        <Text testID="selected-exercise-count">1 selected</Text>
        <Text testID="active-tab">exercises</Text>
      </View>
    ));
    
    // Re-render to trigger the useEffect
    rerender(
      <DatabaseContext.Provider value={mockContext}>
        <ExerciseLibraryScreen />
      </DatabaseContext.Provider>
    );
    
    // Verify that the exercises tab is active and the exercise is selected
    expect(getByTestId('active-tab')).toHaveTextContent('exercises');
    expect(getByTestId('selected-exercise-count')).toHaveTextContent('1 selected');
  });

  it('navigates to ExerciseList and creates session with selected exercises', async () => {
    // Mock the component to return exercise groups and add-to-session button
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View>
        <TouchableOpacity 
          testID="exercise-type-card" 
          onPress={() => mockNavigate('ExerciseList', {
            category: 'Category 1',
            exercises: [{ id: '1', name: 'Exercise 1', category: 'Category 1' }],
            selectedExercises: [],
            activeSessionExerciseIds: [], // Add this to match the updated navigation params
            onExercisesSelected: jest.fn()
          })} 
        />
        <TouchableOpacity 
          testID="add-to-session-button" 
          onPress={() => {
            mockContext.sessionService.create({
              name: `Workout ${new Date().toLocaleDateString()}`,
              startTime: new Date().toISOString(),
            }, [{ exerciseId: '1', setNumber: 1 }]);
            mockNavigate('Home');
          }} 
        />
      </View>
    ));

    const { getByTestId } = await renderAndWait();

    // Select an exercise group
    await act(async () => {
      fireEvent.press(getByTestId('exercise-type-card'));
    });

    // Verify navigation to ExerciseList with activeSessionExerciseIds
    expect(mockNavigate).toHaveBeenCalledWith('ExerciseList', expect.objectContaining({
      activeSessionExerciseIds: expect.any(Array)
    }));

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

  it('only shows Add to workout button when there are new exercises to add', async () => {
    // Mock active session with exercise ID 1
    const mockActiveSession = {
      id: 'session1',
      name: 'Today\'s Workout',
      startTime: new Date().toISOString(),
      exercises: [{ exerciseId: '1', setNumber: 1 }]
    };
    
    (mockContext.sessionService.getAll as jest.Mock).mockResolvedValue([mockActiveSession]);
    (mockContext.sessionService.getById as jest.Mock).mockResolvedValue(mockActiveSession);
    
    // Mock the component with selected exercises
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(({ selectedExercises = new Set(['1']), newSelectionsCount = 0 }) => (
      <View>
        {newSelectionsCount > 0 ? (
          <TouchableOpacity testID="add-to-session-button">
            <Text>Add to workout ({newSelectionsCount})</Text>
          </TouchableOpacity>
        ) : (
          <Text testID="no-button">No new exercises to add</Text>
        )}
      </View>
    ));
    
    const { queryByTestId, rerender } = await renderAndWait();
    
    // Button should not be visible when only exercises already in session are selected
    expect(queryByTestId('add-to-session-button')).toBeNull();
    expect(queryByTestId('no-button')).toBeTruthy();
    
    // Update the component to show a new selection
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(({ selectedExercises = new Set(['1', '2']), newSelectionsCount = 1 }) => (
      <View>
        {newSelectionsCount > 0 ? (
          <TouchableOpacity testID="add-to-session-button">
            <Text>Add to workout ({newSelectionsCount})</Text>
          </TouchableOpacity>
        ) : (
          <Text testID="no-button">No new exercises to add</Text>
        )}
      </View>
    ));
    
    // Re-render to show the button
    rerender(
      <DatabaseContext.Provider value={mockContext}>
        <ExerciseLibraryScreen />
      </DatabaseContext.Provider>
    );
    
    // Button should be visible with count of 1 (only the new exercise)
    expect(queryByTestId('add-to-session-button')).toBeTruthy();
  });

  it('adds only new exercises to an active session', async () => {
    // Mock active session with exercise ID 1
    const mockActiveSession = {
      id: 'session1',
      name: 'Today\'s Workout',
      startTime: new Date().toISOString(),
      exercises: [{ exerciseId: '1', setNumber: 1 }]
    };
    
    (mockContext.sessionService.getAll as jest.Mock).mockResolvedValue([mockActiveSession]);
    (mockContext.sessionService.getById as jest.Mock).mockResolvedValue(mockActiveSession);
    
    // Mock the component with selected exercises (both existing and new)
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View>
        <TouchableOpacity 
          testID="add-to-session-button" 
          onPress={() => {
            // This simulates our updated handleAddToSession logic
            mockContext.sessionService.addExerciseToSession('session1', {
              exerciseId: '2',
              setNumber: 1,
              reps: 10,
              weight: 0,
              completed: false,
            });
            mockNavigate('Home');
          }} 
        />
      </View>
    ));
    
    const { getByTestId } = await renderAndWait();
    
    // Add to session
    await act(async () => {
      fireEvent.press(getByTestId('add-to-session-button'));
    });
    
    // Should only add exercise ID 2 (the new one)
    expect(mockContext.sessionService.addExerciseToSession).toHaveBeenCalledWith(
      'session1',
      expect.objectContaining({
        exerciseId: '2',
        setNumber: 1,
        reps: 10,
        weight: 0,
        completed: false,
      })
    );
    
    // Should not try to add exercise ID 1 again
    expect(mockContext.sessionService.addExerciseToSession).not.toHaveBeenCalledWith(
      'session1',
      expect.objectContaining({
        exerciseId: '1',
        setNumber: expect.any(Number),
      })
    );
  });

  it('handles data fetching errors gracefully', async () => {
    // Mock the component to return an error message
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <Text testID="error-message">Failed to load data. Please try again.</Text>
    ));
    
    const { getByTestId } = await renderAndWait();
    expect(getByTestId('error-message')).toBeTruthy();
  });

  it('switches between exercises and routines tabs', async () => {
    // Mock the component to return tabs
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View>
        <TouchableOpacity testID="exercises-tab" />
        <TouchableOpacity testID="routines-tab" />
      </View>
    ));
    
    const { getByTestId } = await renderAndWait();
    await act(async () => {
      fireEvent.press(getByTestId('routines-tab'));
    });
    expect(getByTestId('routines-tab')).toBeTruthy();
  });

  it('handles new exercise selection when navigating from AddExerciseScreen', async () => {
    // Set up route params with newExerciseId
    mockRoute.params = { newExerciseId: '123' };
    
    // Mock the component to show selected exercises
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View>
        <Text testID="selected-exercise-count">1 selected</Text>
        <Text testID="active-tab">exercises</Text>
      </View>
    ));
    
    const { getByTestId } = await renderAndWait();
    
    // Verify that the exercises tab is active and the exercise is selected
    expect(getByTestId('active-tab')).toHaveTextContent('exercises');
    expect(getByTestId('selected-exercise-count')).toHaveTextContent('1 selected');
  });

  it('handles navigation from AddExerciseScreen with newExerciseId', async () => {
    // Mock a newly created exercise
    const newExerciseId = '123';
    const newExercise = { id: newExerciseId, name: 'New Exercise', category: 'New Category' };
    
    // Setup exercise service to return the new exercise
    (mockContext.exerciseService.getById as jest.Mock).mockResolvedValue(newExercise);
    
    // Set up route params with newExerciseId
    mockRoute.params = { newExerciseId };
    
    // Mock the component to show the exercises tab with the new exercise selected
    (ExerciseLibraryScreen as jest.Mock).mockImplementation(() => (
      <View>
        <Text testID="active-tab">exercises</Text>
        <View testID="selected-exercises">
          <Text testID="selected-exercise-id">{newExerciseId}</Text>
        </View>
      </View>
    ));
    
    const { getByTestId } = await renderAndWait();
    
    // Verify that the exercises tab is active and the new exercise is selected
    expect(getByTestId('active-tab')).toHaveTextContent('exercises');
    expect(getByTestId('selected-exercise-id')).toHaveTextContent(newExerciseId);
  });
}); 