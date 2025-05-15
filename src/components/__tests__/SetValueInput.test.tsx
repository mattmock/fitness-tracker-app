import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SetValueInput from '../SetValueInput';

describe('SetValueInput', () => {
  const defaultProps = {
    value: '0',
    onChangeText: jest.fn(),
    onPress: jest.fn(),
    accessibilityLabel: 'Test input'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Focus on critical rendering and accessibility
  it('renders with correct accessibility and input properties', () => {
    const { getByRole } = render(
      <SetValueInput {...defaultProps} />
    );

    const input = getByRole('spinbutton');
    expect(input.props.value).toBe('0');
    expect(input.props.accessibilityLabel).toBe('Test input');
    expect(input.props.keyboardType).toBe('numeric');
    expect(input.props.returnKeyType).toBe('done');
    expect(input.props.selectTextOnFocus).toBe(true);
    expect(input.props.blurOnSubmit).toBe(true);
  });

  // Focus on critical user interactions
  it('handles user interactions correctly', () => {
    const onChangeText = jest.fn();
    const onPress = jest.fn();
    const mockRef = jest.fn();

    const { getByRole, getByTestId } = render(
      <SetValueInput
        {...defaultProps}
        onChangeText={onChangeText}
        onPress={onPress}
        ref={mockRef}
      />
    );

    // Test text input
    const input = getByRole('spinbutton');
    fireEvent.changeText(input, '5');
    expect(onChangeText).toHaveBeenCalledWith('5');

    // Test container press
    const container = getByTestId('input-container');
    fireEvent.press(container);
    expect(onPress).toHaveBeenCalled();

    // Test ref forwarding
    expect(mockRef).toHaveBeenCalled();
    expect(mockRef.mock.calls[0][0]).not.toBeNull();
  });
}); 