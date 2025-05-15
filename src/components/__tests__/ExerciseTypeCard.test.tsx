import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExerciseTypeCard } from '../ExerciseTypeCard';

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

describe('ExerciseTypeCard', () => {
  const defaultProps = {
    title: 'Upper Body',
    exerciseCount: 5,
    onPress: jest.fn(),
    testID: 'exercise-type-card'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Focus on critical rendering and user interaction
  it('renders correctly and handles user interaction', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ExerciseTypeCard
        title="Strength"
        exerciseCount={5}
        selectedCount={2}
        onPress={onPress}
        testID="exercise-type-card"
      />
    );

    const card = getByTestId('exercise-type-card');
    fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
}); 