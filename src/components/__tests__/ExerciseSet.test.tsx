import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ExerciseSet from '../ExerciseSet';

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

describe('ExerciseSet', () => {
  const defaultProps = {
    index: 0,
    reps: 10,
    weight: 100,
    onCheckPress: jest.fn(),
    isActive: false,
    onRepsChange: jest.fn(),
    onWeightChange: jest.fn(),
    actualReps: 0,
    actualWeight: 0,
  };

  const durationProps = {
    index: 0,
    reps: 0,
    weight: 0,
    duration: 60,
    onCheckPress: jest.fn(),
    isActive: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Focus on critical rendering states
  it('renders correctly for different set states', () => {
    const { getByText, getAllByRole, rerender } = render(
      <ExerciseSet {...defaultProps} isActive={true} />
    );

    // Active set should show inputs
    expect(getByText('Set 1')).toBeTruthy();
    expect(getAllByRole('spinbutton')).toHaveLength(2);

    // Completed set should show values
    rerender(
      <ExerciseSet {...defaultProps} isCompleted={true} actualReps={8} actualWeight={90} />
    );
    expect(getByText('90')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();

    // Duration-based set should show duration
    rerender(<ExerciseSet {...durationProps} />);
    expect(getByText('60s')).toBeTruthy();
  });

  // Focus on critical user interactions
  it('handles user interactions correctly', () => {
    const onWeightChange = jest.fn();
    const onRepsChange = jest.fn();
    const onCheckPress = jest.fn();

    const { getAllByRole, getByTestId } = render(
      <ExerciseSet
        {...defaultProps}
        isActive={true}
        onWeightChange={onWeightChange}
        onRepsChange={onRepsChange}
        onCheckPress={onCheckPress}
      />
    );

    // Test weight input
    const weightInput = getAllByRole('spinbutton')[0];
    fireEvent.changeText(weightInput, '95');
    expect(onWeightChange).toHaveBeenCalledWith(95);

    // Test reps input
    const repsInput = getAllByRole('spinbutton')[1];
    fireEvent.changeText(repsInput, '12');
    expect(onRepsChange).toHaveBeenCalledWith(12);

    // Test check press
    fireEvent.press(getByTestId('check-button'));
    expect(onCheckPress).toHaveBeenCalled();
  });

  // Focus on critical state changes
  it('handles state changes correctly', () => {
    const { getByTestId, rerender } = render(
      <ExerciseSet {...defaultProps} isActive={true} />
    );

    // Active set should have outline checkmark
    expect(getByTestId('check-icon')).toHaveProp('color', '#9CA3AF');

    // Completed set that can be unchecked should have green checkmark
    rerender(<ExerciseSet {...defaultProps} isCompleted={true} canBeUnchecked={true} />);
    expect(getByTestId('check-icon')).toHaveProp('color', '#4CAF50');

    // Past completed set should have gray checkmark
    rerender(<ExerciseSet {...defaultProps} isCompleted={true} canBeUnchecked={false} />);
    expect(getByTestId('check-icon')).toHaveProp('color', '#E0E0E0');
  });
}); 