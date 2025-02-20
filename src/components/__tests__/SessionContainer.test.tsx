import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SessionContainer } from '../SessionContainer';
import { ActiveSession } from '../ActiveSession';

// Mock the ActiveSession component
jest.mock('../ActiveSession', () => ({
  ActiveSession: jest.fn(() => null)
}));

// Mock the image require
jest.mock('../../../assets/images/empty-current-session-background.jpeg', () => 'mocked-image');

describe('SessionContainer', () => {
  const mockOnAddExercise = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty session state when activeSession is null', () => {
    const { getByText, getByTestId } = render(
      <SessionContainer
        activeSession={null}
        onAddExercise={mockOnAddExercise}
      />
    );

    // Verify empty state text is shown
    expect(getByText('Tap Add Exercise to start your workout')).toBeTruthy();

    // Test the add exercise button
    const addButton = getByText('Add Exercise');
    fireEvent.press(addButton);
    expect(mockOnAddExercise).toHaveBeenCalledTimes(1);
  });

  it('renders ActiveSession when activeSession is provided', () => {
    const mockSession = {
      id: 'test-session',
      startTime: '2024-03-14T10:00:00Z',
      createdAt: '2024-03-14T10:00:00Z',
      sessionExercises: []
    };

    render(
      <SessionContainer
        activeSession={mockSession}
        onAddExercise={mockOnAddExercise}
      />
    );

    // Verify ActiveSession was called with correct props
    expect(ActiveSession).toHaveBeenCalledWith(
      {
        session: mockSession,
        onAddExercise: mockOnAddExercise
      },
      expect.any(Object)
    );
  });
}); 