import React from 'react';
import { render } from '@testing-library/react-native';
import { ActiveSession } from '../ActiveSession';
import { ExerciseSetGroup } from '../ExerciseSetGroup';
import { ActiveSessionData, ExerciseSetData, toExerciseSetData } from '../../types/interfaces';

// Mock the ExerciseItem component
jest.mock('../ExerciseSetGroup', () => ({
  ExerciseSetGroup: jest.fn(() => null)
}));

// Mock our interface adapter functions
jest.mock('../../types/interfaces', () => ({
  ...jest.requireActual('../../types/interfaces'),
  toExerciseSetData: jest.fn((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    setNumber: exercise.setNumber,
    reps: exercise.reps,
    weight: exercise.weight,
    duration: exercise.duration,
    notes: exercise.notes,
    completed: exercise.completed
  }))
}));

describe('ActiveSession', () => {
  const mockOnAddExercise = jest.fn();
  const mockDate = new Date('2024-03-14T10:00:00Z');

  const mockSession: ActiveSessionData = {
    id: 'test-session',
    name: 'Test Session',
    startTime: mockDate.toISOString(),
    sessionExercises: [
      {
        id: 'exercise-1',
        exerciseId: 'ex-1',
        setNumber: 1,
        reps: 12,
        weight: 50,
      }
    ]
  };
  
  const expectedExerciseSetData: ExerciseSetData = {
    id: 'exercise-1',
    exerciseId: 'ex-1',
    setNumber: 1,
    reps: 12,
    weight: 50,
    duration: undefined,
    notes: undefined,
    completed: undefined
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
    const mockSession = {
      id: 'test-session',
      name: 'Test Session',
      startTime: '2024-03-14T10:00:00Z',
      createdAt: '2024-03-14T10:00:00Z',
      sessionExercises: [
        {
          id: 'exercise-1',
          sessionId: 'test-session',
          exerciseId: 'ex-1',
          setNumber: 1,
          reps: 12,
          weight: 50,
          createdAt: '2024-03-14T10:00:00Z'
        }
      ]
    };

    render(
      <ActiveSession
        session={mockSession}
        onAddExercise={jest.fn()}
      />
    );
    
    // Verify ExerciseSetGroup was called with the correct props
    const call = (ExerciseSetGroup as jest.Mock).mock.calls[0][0];
    expect(call).toEqual(expect.objectContaining({
      item: toExerciseSetData(mockSession.sessionExercises[0]),
      onExpand: expect.any(Function),
      onOpenFullView: expect.any(Function)
    }));
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