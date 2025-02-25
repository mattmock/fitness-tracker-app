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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic card information', () => {
    const { getByText } = render(<ExerciseTypeCard {...defaultProps} />);

    expect(getByText('Upper Body')).toBeTruthy();
    expect(getByText('5 exercises')).toBeTruthy();
  });

  it('uses singular form for single exercise', () => {
    const { getByText } = render(
      <ExerciseTypeCard {...defaultProps} exerciseCount={1} />
    );

    expect(getByText('1 exercise')).toBeTruthy();
  });

  it('does not show selected count when none selected', () => {
    const { queryByText } = render(<ExerciseTypeCard {...defaultProps} />);

    expect(queryByText('0 selected')).toBeNull();
  });

  it('shows selected count when exercises are selected', () => {
    const { getByText } = render(
      <ExerciseTypeCard {...defaultProps} selectedCount={2} />
    );

    expect(getByText('2 selected')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ExerciseTypeCard {...defaultProps} onPress={onPress} />
    );

    fireEvent.press(getByTestId('exercise-type-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
}); 