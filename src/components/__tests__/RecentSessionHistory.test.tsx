import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { RecentSessionHistory } from '../RecentSessionHistory';
import { format } from 'date-fns';
import type { Session } from '../../db/models';

// Polyfill for setImmediate which is used by React Native but not available in Jest
// @ts-ignore - Ignoring type issues with setImmediate polyfill
global.setImmediate = global.setImmediate || function(callback: Function, ...args: any[]) {
  return setTimeout(callback, 0, ...args);
};

// Mock React's useState and useEffect to control state directly
const mockSetExpandedSessionId = jest.fn();
let mockExpandedSessionId: string | null = null;
const mockSetExerciseNames = jest.fn();
let mockExerciseNames = {};

// Store the useEffect callback for testing
let savedEffectCallback: Function | null = null;

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn((initialValue) => {
      // For exerciseNames state
      if (initialValue && typeof initialValue === 'object' && Object.keys(initialValue).length === 0) {
        return [mockExerciseNames, mockSetExerciseNames];
      }
      // For expandedSessionId state
      return [mockExpandedSessionId, (id: string | null) => {
        mockExpandedSessionId = id;
        mockSetExpandedSessionId(id);
      }];
    }),
    useEffect: jest.fn((callback, deps) => {
      // Save the callback for testing
      savedEffectCallback = callback;
      
      // Immediately set exercise names when expandedSessionId changes
      if (deps && deps.length > 0 && deps[0] !== null) {
        // Call the effect function to simulate the useEffect behavior
        callback();
      }
    })
  };
});

// Mock the useBottomSheet hook
jest.mock('../PastSessionBottomSheet/BottomSheetContext', () => ({
  useBottomSheet: () => ({
    isExpanded: true
  })
}));

// Mock the database context
const mockExercises = [
  { id: 'ex-1', name: 'Bench Press', category: 'Chest' },
  { id: 'ex-2', name: 'Squats', category: 'Legs' },
  { id: 'ex-3', name: 'Treadmill', category: 'Cardio' }
];

const mockGetAll = jest.fn().mockResolvedValue(mockExercises);

jest.mock('../../db', () => ({
  useDatabaseContext: () => ({
    exerciseService: {
      getAll: mockGetAll
    }
  })
}));

describe('RecentSessionHistory', () => {
  const mockDate = new Date('2024-03-01T10:00:00Z');
  const formattedDate = format(mockDate, 'MMM d, yyyy');
  const formattedTime = format(mockDate, 'h:mm a');

  const mockSessions: Session[] = [
    {
      id: 'session-1',
      name: 'Morning Workout',
      startTime: '2024-03-01T10:00:00Z',
      createdAt: '2024-03-01T10:00:00Z',
      sessionExercises: [
        {
          id: 'exercise-1',
          sessionId: 'session-1',
          exerciseId: 'ex-1',
          setNumber: 3,
          reps: 12,
          weight: 100,
          notes: 'Test notes',
          createdAt: '2024-03-01T10:00:00Z'
        }
      ]
    },
    {
      id: 'session-2',
      name: 'Evening Workout',
      startTime: '2024-02-28T18:00:00Z',
      createdAt: '2024-02-28T18:00:00Z',
      sessionExercises: [
        {
          id: 'exercise-2',
          sessionId: 'session-2',
          exerciseId: 'ex-2',
          setNumber: 4,
          reps: 10,
          weight: 80,
          createdAt: '2024-02-28T18:00:00Z'
        },
        {
          id: 'exercise-3',
          sessionId: 'session-2',
          exerciseId: 'ex-3',
          setNumber: 1,
          duration: 60,
          createdAt: '2024-02-28T18:00:00Z'
        }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockExpandedSessionId = null;
    mockExerciseNames = {};
    savedEffectCallback = null;
  });

  it('renders sessions correctly', () => {
    const { getByText } = render(
      <RecentSessionHistory sessions={mockSessions} />
    );

    // Check if session dates are displayed
    expect(getByText(formattedDate)).toBeTruthy();
    
    // Check if exercise counts are displayed
    expect(getByText('1 exercise')).toBeTruthy();
    expect(getByText('2 exercises')).toBeTruthy();
  });

  it('expands a session when clicked and shows exercise details', () => {
    // Setup exercise names for the expanded session
    mockExerciseNames = {
      'ex-1': 'Bench Press',
      'ex-2': 'Squats',
      'ex-3': 'Treadmill'
    };

    const { getByText, queryByText } = render(
      <RecentSessionHistory sessions={mockSessions} />
    );

    // Initially, exercise details should not be visible
    expect(queryByText('Bench Press')).toBeNull();

    // Click on the first session
    fireEvent.press(getByText('1 exercise'));

    // Verify that setExpandedSessionId was called with the correct session ID
    expect(mockSetExpandedSessionId).toHaveBeenCalledWith('session-1');
    
    // Simulate the state update
    mockExpandedSessionId = 'session-1';
    
    // Re-render with the updated state
    const { queryByText: queryAfterExpand } = render(
      <RecentSessionHistory sessions={mockSessions} />
    );
    
    // Verify that the exercise service getAll method was called
    expect(mockGetAll).toHaveBeenCalled();
    
    // Verify that exercise details are now visible
    expect(queryAfterExpand('Bench Press')).not.toBeNull();
    expect(queryAfterExpand('3 sets × 12 reps × 100kg')).not.toBeNull();
  });

  it('collapses an expanded session when clicked again', () => {
    // Setup initial expanded state
    mockExpandedSessionId = 'session-1';
    mockExerciseNames = {
      'ex-1': 'Bench Press',
      'ex-2': 'Squats',
      'ex-3': 'Treadmill'
    };

    const { getByText, queryByText } = render(
      <RecentSessionHistory sessions={mockSessions} />
    );

    // Initially, exercise details should be visible
    expect(queryByText('Bench Press')).not.toBeNull();

    // Click on the first session again to collapse
    fireEvent.press(getByText('1 exercise'));

    // Verify that setExpandedSessionId was called with null
    expect(mockSetExpandedSessionId).toHaveBeenCalledWith(null);
    
    // Simulate the state update
    mockExpandedSessionId = null;
    
    // Re-render with the updated state
    const { queryByText: queryAfterCollapse } = render(
      <RecentSessionHistory sessions={mockSessions} />
    );
    
    // Verify that exercise details are no longer visible
    expect(queryAfterCollapse('Bench Press')).toBeNull();
  });

  it('displays different types of exercise details correctly', () => {
    // Setup expanded state for the second session
    mockExpandedSessionId = 'session-2';
    mockExerciseNames = {
      'ex-1': 'Bench Press',
      'ex-2': 'Squats',
      'ex-3': 'Treadmill'
    };

    const { queryByText } = render(
      <RecentSessionHistory sessions={mockSessions} />
    );

    // Verify that weight-based exercise details are displayed correctly
    expect(queryByText('Squats')).not.toBeNull();
    expect(queryByText('4 sets × 10 reps × 80kg')).not.toBeNull();
    
    // Verify that duration-based exercise details are displayed correctly
    expect(queryByText('Treadmill')).not.toBeNull();
    expect(queryByText('1 sets × 60s duration')).not.toBeNull();
  });

  it('handles exercises with missing fields gracefully', () => {
    // Create a session with exercises that have missing fields
    const sessionWithMissingFields: Session = {
      id: 'session-3',
      name: 'Incomplete Workout',
      startTime: '2024-03-02T10:00:00Z',
      createdAt: '2024-03-02T10:00:00Z',
      sessionExercises: [
        {
          id: 'exercise-4',
          sessionId: 'session-3',
          exerciseId: 'ex-1',
          setNumber: 1,
          // No sets, reps, or weight
          createdAt: '2024-03-02T10:00:00Z'
        },
        {
          id: 'exercise-5',
          sessionId: 'session-3',
          exerciseId: 'ex-2',
          setNumber: 2,
          reps: 10,
          // No sets or weight
          createdAt: '2024-03-02T10:00:00Z'
        }
      ]
    };

    // Setup expanded state for the new session
    mockExpandedSessionId = 'session-3';
    mockExerciseNames = {
      'ex-1': 'Bench Press',
      'ex-2': 'Squats'
    };

    const { queryByText } = render(
      <RecentSessionHistory sessions={[sessionWithMissingFields]} />
    );

    // Verify that exercises with missing fields are displayed correctly
    expect(queryByText('Bench Press')).not.toBeNull();
    expect(queryByText('No details')).not.toBeNull();
    
    expect(queryByText('Squats')).not.toBeNull();
    expect(queryByText('2 sets × 10 reps')).not.toBeNull();
  });

  it('shows "See all past sessions" button when there are more than 6 sessions', () => {
    // Create 7 sessions
    const manySessions = Array(7).fill(null).map((_, i) => ({
      ...mockSessions[0],
      id: `session-${i + 1}`
    }));

    const { getByText } = render(
      <RecentSessionHistory sessions={manySessions} />
    );

    expect(getByText('See all past sessions')).toBeTruthy();
  });

  it('does not show "See all past sessions" button when there are 6 or fewer sessions', () => {
    const { queryByText } = render(
      <RecentSessionHistory sessions={mockSessions} />
    );

    expect(queryByText('See all past sessions')).toBeNull();
  });
}); 