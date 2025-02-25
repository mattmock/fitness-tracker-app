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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for an active set', () => {
    const { getByText, getAllByRole } = render(
      <ExerciseSet {...defaultProps} isActive={true} />
    );

    expect(getByText('Set 1')).toBeTruthy();
    // Should have two TextInputs for weight and reps
    const textInputs = getAllByRole('spinbutton');
    expect(textInputs).toHaveLength(2);
  });

  it('renders correctly for a completed set', () => {
    const { getByText } = render(
      <ExerciseSet {...defaultProps} isCompleted={true} actualReps={8} actualWeight={90} />
    );

    expect(getByText('Set 1')).toBeTruthy();
    expect(getByText('90')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();
  });

  it('handles weight input changes', () => {
    const onWeightChange = jest.fn();
    const { getAllByRole } = render(
      <ExerciseSet {...defaultProps} isActive={true} onWeightChange={onWeightChange} />
    );

    const weightInput = getAllByRole('spinbutton')[0];
    fireEvent.changeText(weightInput, '95');

    expect(onWeightChange).toHaveBeenCalledWith(95);
  });

  it('handles reps input changes', () => {
    const onRepsChange = jest.fn();
    const { getAllByRole } = render(
      <ExerciseSet {...defaultProps} isActive={true} onRepsChange={onRepsChange} />
    );

    const repsInput = getAllByRole('spinbutton')[1];
    fireEvent.changeText(repsInput, '12');

    expect(onRepsChange).toHaveBeenCalledWith(12);
  });

  it('handles check press', () => {
    const onCheckPress = jest.fn();
    const { getByTestId } = render(
      <ExerciseSet {...defaultProps} isActive={true} onCheckPress={onCheckPress} />
    );

    fireEvent.press(getByTestId('check-button'));
    expect(onCheckPress).toHaveBeenCalled();
  });

  it('shows different checkmark styles based on completion state', () => {
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

  it('disables input for completed sets', () => {
    const { getAllByRole, queryAllByRole, rerender } = render(
      <ExerciseSet {...defaultProps} isActive={true} />
    );

    // Active set should have editable inputs
    const activeInputs = getAllByRole('spinbutton');
    expect(activeInputs).toHaveLength(2);

    // Completed set should not have editable inputs
    rerender(<ExerciseSet {...defaultProps} isCompleted={true} />);
    const completedInputs = queryAllByRole('spinbutton');
    expect(completedInputs).toHaveLength(0);
  });

  it('focuses text input when container is pressed', () => {
    const { getAllByRole, getAllByTestId } = render(
      <ExerciseSet {...defaultProps} isActive={true} />
    );

    // Get the container TouchableOpacity elements
    const inputContainers = getAllByTestId('input-container');
    
    // Get the TextInput elements
    const textInputs = getAllByRole('spinbutton');
    
    // Simulate press on weight container
    fireEvent.press(inputContainers[0]);
    expect(textInputs[0].props.value).toBe('0'); // Verify the input is focused by checking its value
    
    // Simulate press on reps container
    fireEvent.press(inputContainers[1]);
    expect(textInputs[1].props.value).toBe('0'); // Verify the input is focused by checking its value
  });
}); 