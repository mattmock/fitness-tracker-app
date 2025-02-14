import React from 'react';
import { render, renderHook } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DatabaseContext, useDatabaseContext } from '../hooks';
import type { DatabaseContextValue } from '../types';
import { ExerciseService, RoutineService, SessionService } from '../../services';
import type { SQLiteDatabase } from 'expo-sqlite';

// Mock database
const mockDb = {} as SQLiteDatabase;

// Mock services
class MockExerciseService extends ExerciseService {
  getAll = jest.fn();
  getById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  searchByName = jest.fn();
  getByCategory = jest.fn();
}

class MockRoutineService extends RoutineService {
  getAll = jest.fn();
  getById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  updateExercises = jest.fn();
  searchByName = jest.fn();
}

class MockSessionService extends SessionService {
  getAll = jest.fn();
  getById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  updateExercise = jest.fn();
  getByDateRange = jest.fn();
}

const mockContextValue: DatabaseContextValue = {
  forceReset: jest.fn(),
  exerciseService: new MockExerciseService(mockDb),
  routineService: new MockRoutineService(mockDb),
  sessionService: new MockSessionService(mockDb),
};

describe('Database Hooks', () => {
  describe('useDatabaseContext', () => {
    it('throws error when used outside DatabaseProvider', () => {
      expect(() => {
        renderHook(() => useDatabaseContext());
      }).toThrow('useDatabaseContext must be used within a DatabaseProvider');
    });

    it('returns context value when used within DatabaseProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseContext.Provider value={mockContextValue}>
          {children}
        </DatabaseContext.Provider>
      );

      const { result } = renderHook(() => useDatabaseContext(), { wrapper });
      expect(result.current).toBe(mockContextValue);
    });

    it('provides access to database services', () => {
      const TestComponent = () => {
        const { exerciseService, routineService, sessionService } = useDatabaseContext();
        return (
          <Text>
            {Boolean(exerciseService && routineService && sessionService).toString()}
          </Text>
        );
      };

      const { getByText } = render(
        <DatabaseContext.Provider value={mockContextValue}>
          <TestComponent />
        </DatabaseContext.Provider>
      );

      expect(getByText('true')).toBeTruthy();
    });
  });
}); 