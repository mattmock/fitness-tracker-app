import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ExerciseSetGroup } from '../ExerciseSetGroup';
import { useDatabaseContext } from '../../db';

// Mock the database context
jest.mock('../../db', () => ({
  useDatabaseContext: jest.fn(),
}));

describe('ExerciseSetGroup', () => {
  const mockExercise = {
    id: '1',
    name: 'Bench Press',
  };

  const defaultProps = {
    item: {
      id: '1',
      sessionId: 'session1',
      exerciseId: '1',
      setNumber: 3,
      reps: 10,
      weight: 100,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    onExpand: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDatabaseContext as jest.Mock).mockReturnValue({
      exerciseService: {
        getById: jest.fn().mockResolvedValue(mockExercise),
      },
    });
  });

  it('renders exercise name and initial state', async () => {
    const { getByText, queryByText } = render(
      <ExerciseSetGroup {...defaultProps} />
    );

    // Wait for exercise name to be fetched
    await act(async () => {
      await Promise.resolve();
    });

    expect(getByText('Bench Press')).toBeTruthy();
    expect(getByText('0 sets')).toBeTruthy();
    // Content should be collapsed initially
    expect(queryByText('Weight')).toBeNull();
    expect(queryByText('Reps')).toBeNull();
  });

  it('expands and collapses when header is pressed', async () => {
    const { getByText, queryByText, getByTestId } = render(
      <ExerciseSetGroup {...defaultProps} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Initially collapsed
    expect(queryByText('Weight')).toBeNull();

    // Expand
    fireEvent.press(getByTestId('exercise-header'));
    expect(getByText('Weight')).toBeTruthy();
    expect(getByText('Reps')).toBeTruthy();

    // Collapse
    fireEvent.press(getByTestId('exercise-header'));
    expect(queryByText('Weight')).toBeNull();
  });

  it('manages sets completion correctly', async () => {
    const { getByText, getAllByTestId, getByTestId } = render(
      <ExerciseSetGroup {...defaultProps} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Expand to see sets
    fireEvent.press(getByTestId('exercise-header'));

    // Complete first set
    fireEvent.press(getAllByTestId('check-button')[0]);
    expect(getByText('1 sets')).toBeTruthy();

    // Complete second set
    fireEvent.press(getAllByTestId('check-button')[1]);
    expect(getByText('2 sets')).toBeTruthy();

    // Uncheck last completed set
    fireEvent.press(getAllByTestId('check-button')[1]);
    expect(getByText('1 sets')).toBeTruthy();
  });

  it('adds new set when completing the last set', async () => {
    const { getAllByTestId, getAllByText, getByTestId } = render(
      <ExerciseSetGroup {...defaultProps} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Expand to see sets
    fireEvent.press(getByTestId('exercise-header'));

    // Initially 3 sets
    expect(getAllByText(/Set \d/).length).toBe(3);

    // Complete the last set
    const checkButtons = getAllByTestId('check-button');
    fireEvent.press(checkButtons[checkButtons.length - 1]);

    // Should now have 4 sets
    expect(getAllByText(/Set \d/).length).toBe(4);
  });

  it('handles weight and reps input for active set', async () => {
    const { getAllByTestId, getAllByRole, getByTestId } = render(
      <ExerciseSetGroup {...defaultProps} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Expand to see sets
    fireEvent.press(getByTestId('exercise-header'));

    // Get the active set inputs
    const textInputs = getAllByRole('spinbutton');
    
    // Update weight
    fireEvent.changeText(textInputs[0], '95');
    expect(textInputs[0].props.value).toBe('95');

    // Update reps
    fireEvent.changeText(textInputs[1], '12');
    expect(textInputs[1].props.value).toBe('12');
  });

  it('maintains completed set values after completion', async () => {
    const { getAllByTestId, getAllByRole, getByText, getByTestId } = render(
      <ExerciseSetGroup {...defaultProps} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Expand to see sets
    fireEvent.press(getByTestId('exercise-header'));

    // Set values for active set
    const textInputs = getAllByRole('spinbutton');
    fireEvent.changeText(textInputs[0], '95'); // weight
    fireEvent.changeText(textInputs[1], '12'); // reps

    // Complete the set
    const checkButtons = getAllByTestId('check-button');
    fireEvent.press(checkButtons[0]);

    // Verify completed set shows the entered values
    expect(getByText('95')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });
}); 