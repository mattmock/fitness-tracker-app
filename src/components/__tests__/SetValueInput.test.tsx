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

  it('renders correctly with default props', () => {
    const { getByRole, getByTestId } = render(
      <SetValueInput {...defaultProps} />
    );

    const input = getByRole('spinbutton');
    const container = getByTestId('input-container');

    expect(input).toBeTruthy();
    expect(input.props.value).toBe('0');
    expect(container).toBeTruthy();
  });

  it('handles text input changes', () => {
    const onChangeText = jest.fn();
    const { getByRole } = render(
      <SetValueInput {...defaultProps} onChangeText={onChangeText} />
    );

    const input = getByRole('spinbutton');
    fireEvent.changeText(input, '5');

    expect(onChangeText).toHaveBeenCalledWith('5');
  });

  it('handles container press', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SetValueInput {...defaultProps} onPress={onPress} />
    );

    const container = getByTestId('input-container');
    fireEvent.press(container);

    expect(onPress).toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<any>();
    const { getByRole } = render(
      <SetValueInput {...defaultProps} ref={ref} />
    );

    const input = getByRole('spinbutton');
    expect(ref.current).toBe(input);
  });

  it('applies custom testID', () => {
    const { getByTestId } = render(
      <SetValueInput {...defaultProps} testID="custom-test-id" />
    );

    expect(getByTestId('custom-test-id')).toBeTruthy();
  });

  it('applies accessibility props', () => {
    const { getByRole } = render(
      <SetValueInput {...defaultProps} accessibilityLabel="Custom label" />
    );

    const input = getByRole('spinbutton');
    expect(input.props.accessibilityLabel).toBe('Custom label');
  });

  it('has correct keyboard type and return key type', () => {
    const { getByRole } = render(
      <SetValueInput {...defaultProps} />
    );

    const input = getByRole('spinbutton');
    expect(input.props.keyboardType).toBe('numeric');
    expect(input.props.returnKeyType).toBe('done');
  });

  it('selects text on focus', () => {
    const { getByRole } = render(
      <SetValueInput {...defaultProps} />
    );

    const input = getByRole('spinbutton');
    expect(input.props.selectTextOnFocus).toBe(true);
  });
}); 