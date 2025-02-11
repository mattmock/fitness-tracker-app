import React, { createContext, useContext, ReactNode } from 'react';
import { useExerciseService } from './ExerciseServiceImpl';
import { IExerciseService } from './ExerciseService';

interface WorkoutDataContextType {
  exerciseService: IExerciseService;
}

const WorkoutDataContext = createContext<WorkoutDataContextType | null>(null);

interface WorkoutDataProviderProps {
  children: ReactNode;
}

export function WorkoutDataServiceProvider({ children }: WorkoutDataProviderProps) {
  const exerciseService = useExerciseService();

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