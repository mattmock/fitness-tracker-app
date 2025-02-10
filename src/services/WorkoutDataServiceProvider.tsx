import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
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
  const [exerciseService] = useState<IExerciseService>(() => {
    return ConfigService.useMocks ? new MockExerciseService() : new ExerciseService();
  });

  // Clean up the service when the provider is unmounted
  useEffect(() => {
    return () => {
      if (exerciseService instanceof MockExerciseService) {
        exerciseService.destroy();
      }
    };
  }, [exerciseService]);

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