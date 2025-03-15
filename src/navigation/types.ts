import { Exercise } from '../types/database';

export type RootStackParamList = {
  Home: undefined;
  ExerciseLibrary: {
    newExerciseId?: string;
  };
  Settings: undefined;
  PlateCalculator: undefined;
  ExerciseList: {
    category: string;
    exercises: Exercise[];
    selectedExercises: string[];
    activeSessionExerciseIds?: string[];
    onExercisesSelected: (selectedExercises: string[]) => void;
  };
  AddExercise: undefined;
  // Add other screens here
}; 