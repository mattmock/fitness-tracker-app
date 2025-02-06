import React, { createContext, useContext, ReactNode } from 'react';
import { ExerciseService } from './ExerciseServiceImpl';
import { MockExerciseService } from './mocks/MockExerciseService';
import { IExerciseService } from './ExerciseService';
import { ConfigService } from './ConfigService';

interface WorkoutDataContextType {
  exerciseService: IExerciseService;
}

const WorkoutDataContext = createContext<WorkoutDataContextType | null>(null);

interface WorkoutDataProviderProps {
  children: ReactNode;
}

export function WorkoutDataServiceProvider({ children }: WorkoutDataProviderProps) {
  const exerciseService = ConfigService.useMocks ? new MockExerciseService() : new ExerciseService();

  return (
    <WorkoutDataContext.Provider value={{ exerciseService }}>
      {children}
    </WorkoutDataContext.Provider>
  );
}

export function useWorkoutData(): WorkoutDataContextType {
  const context = useContext(WorkoutDataContext);
  if (!context) {
    throw new Error('useWorkoutData must be used within a WorkoutDataServiceProvider');
  }
  return context;
} 