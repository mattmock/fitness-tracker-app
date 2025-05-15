import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecentSessionHistory } from '../RecentSessionHistory';
import type { Session } from '../../types/database';
import { DatabaseProvider } from '../../db/core/provider';
import { BottomSheetContext } from '../PastSessionBottomSheet/BottomSheetContext';

// Mock the database context
jest.mock('../../db/core/hooks', () => {
  const actual = jest.requireActual('../../db/core/hooks');
  const exercises = [
    { id: 'ex-1', name: 'Bench Press' },
    { id: 'ex-2', name: 'Squats' },
    { id: 'ex-3', name: 'Plank' },
    { id: 'ex-4', name: 'Bench Press' },
  ];
  return {
    ...actual,
    useDatabaseContext: () => ({
      exerciseService: {
        getExerciseById: jest.fn().mockImplementation((id: string) => {
          return Promise.resolve(exercises.find(e => e.id === id));
        }),
        getAll: jest.fn().mockResolvedValue(exercises),
      },
    }),
  };
});

// Mock the animated components
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useAnimatedProps: () => ({}),
  useAnimatedStyle: () => ({}),
  withTiming: (value: any) => value,
  withSpring: (value: any) => value,
  useSharedValue: (value: any) => ({ value }),
  createAnimatedComponent: (Component: any) => Component,
}));

// Mock SQLiteProvider
jest.mock('expo-sqlite', () => ({
  SQLiteProvider: ({ children }: { children: React.ReactNode }) => children,
  useSQLiteContext: () => ({}),
}));

const MockBottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Provide all required properties for the context
  const mockValue = {
    open: jest.fn(),
    close: jest.fn(),
    isOpen: false,
    setContent: jest.fn(),
    setSnapPoints: jest.fn(),
    setInitialSnap: jest.fn(),
    setOnClose: jest.fn(),
    setTitle: jest.fn(),
    snapToIndex: jest.fn(),
    currentTitle: '',
    currentIndex: 0,
    isExpanded: false,
  };
  return (
    <BottomSheetContext.Provider value={mockValue}>
      {children}
    </BottomSheetContext.Provider>
  );
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <DatabaseProvider>
      <MockBottomSheetProvider>
        {ui}
      </MockBottomSheetProvider>
    </DatabaseProvider>
  );
};

describe('RecentSessionHistory', () => {
  const mockSessions: Session[] = [
    {
      id: 'session-1',
      name: 'Morning Workout',
      startTime: '2024-03-14T10:00:00Z',
      createdAt: '2024-03-14T10:00:00Z',
      sessionExercises: [
        {
          id: 'exercise-1',
          sessionId: 'session-1',
          exerciseId: 'ex-1',
          setNumber: 1,
          weight: 50,
          reps: 12,
          completed: true,
          createdAt: '2024-03-14T10:00:00Z',
        },
      ],
    },
  ];

  it('renders sessions correctly', () => {
    const { getByText } = renderWithProvider(
      <RecentSessionHistory sessions={mockSessions} />
    );

    // The UI shows formatted date and time instead of the session name
    expect(getByText('Mar 14, 2024')).toBeTruthy();
    expect(getByText('3:00 AM')).toBeTruthy();
    expect(getByText('1 exercise')).toBeTruthy();
  });

  it('expands a session when clicked and shows exercise details', async () => {
    const { getByText, findByText, queryByText } = renderWithProvider(
      <RecentSessionHistory sessions={mockSessions} />
    );

    // Initially, exercise details should not be visible
    expect(queryByText('Bench Press')).toBeNull();

    // Click on the first session to expand
    fireEvent.press(getByText('1 exercise'));

    // Now exercise details should be visible (wait for async rendering)
    expect(await findByText('Bench Press')).toBeTruthy();
  });

  it('collapses an expanded session when clicked again', async () => {
    const { getByText, findByText, queryByText } = renderWithProvider(
      <RecentSessionHistory sessions={mockSessions} />
    );

    // Click to expand
    fireEvent.press(getByText('1 exercise'));
    expect(await findByText('Bench Press')).toBeTruthy();

    // Click again to collapse
    fireEvent.press(getByText('1 exercise'));
    // Wait for the element to be removed
    await waitFor(() => {
      expect(queryByText('Bench Press')).toBeNull();
    });
  });

  it('displays different types of exercise details correctly', async () => {
    const sessionsWithDifferentExercises: Session[] = [
      {
        id: 'session-2',
        name: 'Evening Workout',
        startTime: '2024-03-14T18:00:00Z',
        createdAt: '2024-03-14T18:00:00Z',
        sessionExercises: [
          {
            id: 'exercise-2',
            sessionId: 'session-2',
            exerciseId: 'ex-2',
            setNumber: 1,
            weight: 80,
            reps: 10,
            completed: true,
            createdAt: '2024-03-14T18:00:00Z',
          },
          {
            id: 'exercise-3',
            sessionId: 'session-2',
            exerciseId: 'ex-3',
            setNumber: 1,
            duration: 300,
            completed: true,
            createdAt: '2024-03-14T18:00:00Z',
          },
        ],
      },
    ];

    const { findByText, queryByText } = renderWithProvider(
      <RecentSessionHistory sessions={sessionsWithDifferentExercises} />
    );

    // Expand the session
    fireEvent.press(queryByText('2 exercises')!);

    // Verify that weight-based exercise details are displayed correctly
    expect(await findByText('Squats')).toBeTruthy();
    expect(await findByText(/10 reps/)).toBeTruthy();
    expect(await findByText(/80kg/)).toBeTruthy();
    
    // Verify that duration-based exercise details are displayed correctly
    expect(await findByText('Plank')).toBeTruthy();
    expect(await findByText(/300s duration/)).toBeTruthy();
  });

  it('handles exercises with missing fields gracefully', async () => {
    const sessionWithMissingFields: Session = {
      id: 'session-3',
      name: 'Quick Workout',
      startTime: '2024-03-14T20:00:00Z',
      createdAt: '2024-03-14T20:00:00Z',
      sessionExercises: [
        {
          id: 'exercise-4',
          sessionId: 'session-3',
          exerciseId: 'ex-1',
          setNumber: 1,
          createdAt: '2024-03-14T20:00:00Z',
        }
      ]
    };

    const { findByText, getByText } = renderWithProvider(
      <RecentSessionHistory sessions={[sessionWithMissingFields]} />
    );

    // Expand the session
    const sessionHeader = getByText('1 exercise');
    fireEvent.press(sessionHeader);

    // Verify that the exercise is displayed with minimal details
    expect(await findByText('Bench Press')).toBeTruthy();
    expect(await findByText('No details')).toBeTruthy();
  });

  it('shows "See all past sessions" button when there are more than 6 sessions', () => {
    const manySessions = Array.from({ length: 7 }, (_, i) => ({
      id: `session-${i + 1}`,
      name: `Workout ${i + 1}`,
      startTime: `2024-03-${String(14 - i).padStart(2, '0')}T10:00:00Z`,
      createdAt: `2024-03-${String(14 - i).padStart(2, '0')}T10:00:00Z`,
      sessionExercises: [],
    }));

    const { getByText } = renderWithProvider(
      <RecentSessionHistory sessions={manySessions} />
    );

    expect(getByText('See all past sessions')).toBeTruthy();
  });

  it('does not show "See all past sessions" button when there are 6 or fewer sessions', () => {
    const { queryByText } = renderWithProvider(
      <RecentSessionHistory sessions={mockSessions} />
    );

    expect(queryByText('See all past sessions')).toBeNull();
  });
}); 