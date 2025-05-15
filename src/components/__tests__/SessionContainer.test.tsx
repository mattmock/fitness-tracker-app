import React from 'react';
import { render } from '@testing-library/react-native';
import { SessionContainer } from '../SessionContainer';
import { ActiveSession } from '../ActiveSession';
import type { Session } from '../../types/database';
import { toActiveSessionData } from '../../types/interfaces';

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
  const expectedActiveSessionData: Session = {
    id: 'test-session',
    name: 'Test Session',
    startTime: '2024-03-14T10:00:00Z',
    createdAt: '2024-03-14T10:00:00Z',
    sessionExercises: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ActiveSession when activeSession is provided', () => {
    const mockSession = {
      id: 'test-session',
      name: 'Test Session',
      startTime: '2024-03-14T10:00:00Z',
      createdAt: '2024-03-14T10:00:00Z',
      sessionExercises: []
    };

    const mockOnAddExercise = jest.fn();
    const transformedData = toActiveSessionData(mockSession);

    render(
      <SessionContainer
        activeSession={mockSession}
        onAddExercise={mockOnAddExercise}
      />
    );

    // Verify ActiveSession was called with the correct props
    const call = (ActiveSession as jest.Mock).mock.calls[0][0];
    expect(call).toEqual({
      session: transformedData,
      onAddExercise: mockOnAddExercise
    });
  });

  it('renders empty state when no activeSession is provided', () => {
    const { getByText, getByTestId } = render(
      <SessionContainer
        activeSession={null}
        onAddExercise={mockOnAddExercise}
      />
    );

    // Check for placeholder text
    expect(getByText(/Tap/)).toBeTruthy();
    
    // Check for button text specifically
    const startButton = getByTestId('start-session-button');
    expect(startButton).toBeTruthy();
    expect(startButton).toHaveTextContent('Start Session');
  });
}); 