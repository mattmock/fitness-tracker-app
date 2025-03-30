import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SessionContainer } from '../SessionContainer';
import { ActiveSession } from '../ActiveSession';
import { ActiveSessionData, toActiveSessionData } from '../../types/interfaces';
import { Session } from '../../types/database';

// Mock the ActiveSession component
jest.mock('../ActiveSession', () => ({
  ActiveSession: jest.fn(() => null)
}));

// Mock the image require
jest.mock('../../../assets/images/dumbbells1.png', () => 'mocked-image');

// Mock our interface adapter functions
jest.mock('../../types/interfaces', () => ({
  ...jest.requireActual('../../types/interfaces'),
  toActiveSessionData: jest.fn((session) => ({
    id: session.id,
    name: session.name,
    startTime: session.startTime,
    sessionExercises: session.sessionExercises || []
  }))
}));

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
    expect(getByText('Tap Start Session to add exercises')).toBeTruthy();

    // Test the start session button
    const startButton = getByTestId('start-session-button');
    fireEvent.press(startButton);
    expect(mockOnAddExercise).toHaveBeenCalledTimes(1);
  });

  it('renders ActiveSession when activeSession is provided', () => {
    const mockSession: Session = {
      id: 'test-session',
      name: 'Test Session',
      startTime: '2024-03-14T10:00:00Z',
      createdAt: '2024-03-14T10:00:00Z',
      sessionExercises: []
    };

    const expectedActiveSessionData: ActiveSessionData = {
      id: 'test-session',
      name: 'Test Session',
      startTime: '2024-03-14T10:00:00Z',
      sessionExercises: []
    };

    render(
      <SessionContainer
        activeSession={mockSession}
        onAddExercise={mockOnAddExercise}
      />
    );

    // Verify toActiveSessionData was called
    expect(toActiveSessionData).toHaveBeenCalledWith(mockSession);

    // Verify ActiveSession was called with correct props
    expect(ActiveSession).toHaveBeenCalledWith(
      {
        session: expectedActiveSessionData,
        onAddExercise: mockOnAddExercise
      },
      expect.any(Object)
    );
  });
}); 