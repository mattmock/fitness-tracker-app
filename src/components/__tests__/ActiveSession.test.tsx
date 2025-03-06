import React from 'react';
import { render } from '@testing-library/react-native';
import { ActiveSession } from '../ActiveSession';
import { ExerciseSetGroup } from '../ExerciseSetGroup';

// Mock the ExerciseItem component
jest.mock('../ExerciseSetGroup', () => ({
  ExerciseSetGroup: jest.fn(() => null)
}));

describe('ActiveSession', () => {
  const mockOnAddExercise = jest.fn();
  const mockDate = new Date('2024-03-14T10:00:00Z');

  const mockSession = {
    id: 'test-session',
    startTime: mockDate.toISOString(),
    createdAt: mockDate.toISOString(),
    sessionExercises: [
      {
        id: 'exercise-1',
        sessionId: 'test-session',
        exerciseId: 'ex-1',
        sets: 3,
        reps: 12,
        weight: 50,
        completed: false,
        createdAt: mockDate.toISOString()
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders session start time correctly', () => {
    const { getByText } = render(
      <ActiveSession
        session={mockSession}
        onAddExercise={mockOnAddExercise}
      />
    );

    expect(getByText(`Started at ${mockDate.toLocaleTimeString()}`)).toBeTruthy();
  });

  it('renders exercise list when exercises exist', () => {
    render(
      <ActiveSession
        session={mockSession}
        onAddExercise={mockOnAddExercise}
      />
    );

    // Verify ExerciseItem was called with correct props
    expect(ExerciseSetGroup).toHaveBeenCalledWith(
      {
        item: {
          ...mockSession.sessionExercises[0],
          setNumber: 3,
          sets: 3,
          weight: 50,
          sessionId: 'test-session'
        },
        onExpand: expect.any(Function),
        onOpenFullView: expect.any(Function)
      },
      expect.any(Object)
    );
  });

  it('renders placeholder text when no exercises exist', () => {
    const emptySession = {
      ...mockSession,
      sessionExercises: []
    };

    const { getByText } = render(
      <ActiveSession
        session={emptySession}
        onAddExercise={mockOnAddExercise}
      />
    );

    expect(getByText('No exercises added yet')).toBeTruthy();
  });
}); 