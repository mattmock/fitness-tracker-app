import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { ExerciseListScreen } from '../ExerciseListScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ExerciseSelectionData } from '../../types/interfaces';
import { RouteProp } from '@react-navigation/native';

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock the route
const createMockRoute = (params = {}) => {
  const createExercise = (id: string, selected = false, inActiveSession = false): ExerciseSelectionData => ({
    id,
    name: `Exercise ${id}`,
    category: 'Test Category',
    selected,
    inActiveSession,
    tags: []
  });

  const defaultExercises = [
    createExercise('1'),
    createExercise('2'),
    createExercise('3')
  ];

  return {
    params: {
      category: 'Test Category',
      exercises: defaultExercises,
      onExercisesSelected: jest.fn(),
      ...params,
    },
  };
};

// Mock the components
jest.mock('../../components', () => ({
  BackButton: jest.fn(() => null),
}));

// Mock InteractionManager to immediately execute callbacks
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: jest.fn(callback => callback()),
}));

describe('ExerciseListScreen', () => {
  // Helper function to wait for component updates
  const waitForComponentToLoad = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup BackButton mock implementation for each test
    require('../../components').BackButton.mockImplementation((props: any) => (
      <TouchableOpacity testID="back-button" onPress={props.onPress} />
    ));
  });

  it('renders exercise list correctly', async () => {
    const mockRoute = createMockRoute();
    const { getAllByTestId } = render(
      <ExerciseListScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any} 
      />
    );

    await waitForComponentToLoad();

    // Should render 3 exercise cards
    expect(getAllByTestId(/exercise-item-/)).toHaveLength(3);
  });

  it('allows toggling exercise selection', async () => {
    const mockRoute = createMockRoute();
    const { getByTestId } = render(
      <ExerciseListScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any} 
      />
    );

    await waitForComponentToLoad();

    // Select an exercise
    await act(async () => {
      fireEvent.press(getByTestId('exercise-item-1'));
    });
    
    // Press the Select button to trigger selection callback
    await act(async () => {
      fireEvent.press(getByTestId('select-exercises-button'));
    });
    
    // The onExercisesSelected should be called with the selected exercise
    expect(mockRoute.params.onExercisesSelected).toHaveBeenCalledWith(['1']);
  });

  it('pre-selects exercises from initialSelectedExercises', async () => {
    const mockRoute = createMockRoute({
      exercises: [
        { id: '1', name: 'Exercise 1', category: 'Test Category', selected: true, inActiveSession: false, tags: [] },
        { id: '2', name: 'Exercise 2', category: 'Test Category', selected: true, inActiveSession: false, tags: [] },
        { id: '3', name: 'Exercise 3', category: 'Test Category', selected: false, inActiveSession: false, tags: [] }
      ]
    });
    
    const { getByTestId } = render(
      <ExerciseListScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any} 
      />
    );

    await waitForComponentToLoad();

    // Deselect an exercise
    await act(async () => {
      fireEvent.press(getByTestId('exercise-item-1'));
    });
    
    // Press back to trigger selection callback
    await act(async () => {
      fireEvent.press(getByTestId('back-button'));
    });
    
    // The onExercisesSelected should be called with only the remaining selected exercise
    expect(mockRoute.params.onExercisesSelected).toHaveBeenCalledWith(['2']);
  });

  it('prevents deselection of exercises in active session', async () => {
    const mockRoute = createMockRoute({
      exercises: [
        { id: '1', name: 'Exercise 1', category: 'Test Category', selected: true, inActiveSession: true, tags: [] },
        { id: '2', name: 'Exercise 2', category: 'Test Category', selected: true, inActiveSession: false, tags: [] },
        { id: '3', name: 'Exercise 3', category: 'Test Category', selected: false, inActiveSession: false, tags: [] }
      ]
    });
    
    const { getByTestId } = render(
      <ExerciseListScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any} 
      />
    );

    await waitForComponentToLoad();

    // Try to deselect exercise 1 (in active session)
    await act(async () => {
      fireEvent.press(getByTestId('exercise-item-1'));
    });
    
    // Try to deselect exercise 2 (not in active session)
    await act(async () => {
      fireEvent.press(getByTestId('exercise-item-2'));
    });
    
    // Press back to trigger selection callback
    await act(async () => {
      fireEvent.press(getByTestId('back-button'));
    });
    
    // The onExercisesSelected should be called with only newly selected exercises
    expect(mockRoute.params.onExercisesSelected).toHaveBeenCalledWith([]);
  });

  it('only shows count of new selections in the Select button', async () => {
    const mockRoute = createMockRoute({
      exercises: [
        { id: '1', name: 'Exercise 1', category: 'Test Category', selected: true, inActiveSession: true, tags: [] },
        { id: '2', name: 'Exercise 2', category: 'Test Category', selected: true, inActiveSession: false, tags: [] },
        { id: '3', name: 'Exercise 3', category: 'Test Category', selected: true, inActiveSession: false, tags: [] }
      ]
    });
    
    const { getByTestId, getByText } = render(
      <ExerciseListScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any} 
      />
    );

    await waitForComponentToLoad();

    // The Select button should show a count of 2 (not 3, since one is in active session)
    expect(getByText('Select 2')).toBeTruthy();
    
    // Deselect exercise 2
    await act(async () => {
      fireEvent.press(getByTestId('exercise-item-2'));
    });
    
    // The Select button should now show a count of 1
    expect(getByText('Select 1')).toBeTruthy();
  });

  it('navigates back when back button is pressed', async () => {
    const mockRoute = createMockRoute();
    const { getByTestId } = render(
      <ExerciseListScreen 
        navigation={mockNavigation as any} 
        route={mockRoute as any} 
      />
    );

    await waitForComponentToLoad();

    // Press back button
    await act(async () => {
      fireEvent.press(getByTestId('back-button'));
    });
    
    // Should call navigation.goBack
    expect(mockNavigation.goBack).toHaveBeenCalled();
    
    // Should restore original selections
    expect(mockRoute.params.onExercisesSelected).toHaveBeenCalledWith([]);
  });

  it('keeps selections when Select button is pressed', () => {
    const mockRoute = {
      params: {
        category: 'Test Category',
        exercises: [
          { id: '1', name: 'Exercise 1', category: 'Test Category', selected: false, inActiveSession: false, tags: [] },
          { id: '2', name: 'Exercise 2', category: 'Test Category', selected: false, inActiveSession: false, tags: [] },
          { id: '3', name: 'Exercise 3', category: 'Test Category', selected: false, inActiveSession: false, tags: [] },
        ],
        onExercisesSelected: jest.fn(),
      },
      key: 'test-key',
      name: 'ExerciseList',
    } as RouteProp<RootStackParamList, 'ExerciseList'>;

    const { getByTestId } = render(
      <ExerciseListScreen route={mockRoute} navigation={mockNavigation as any} />
    );

    // First select exercise 1
    fireEvent.press(getByTestId('exercise-item-1'));
    // Then select exercise 2
    fireEvent.press(getByTestId('exercise-item-2'));
    
    // Press the Select button
    fireEvent.press(getByTestId('select-exercises-button'));
    
    // Should keep selections in the order they were selected
    expect(mockRoute.params.onExercisesSelected).toHaveBeenCalledWith(['1', '2']);
  });
}); 