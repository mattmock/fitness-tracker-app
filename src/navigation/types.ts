import { Exercise } from '../db/models';

export type RootStackParamList = {
  Home: undefined;
  ExerciseLibrary: undefined;
  Settings: undefined;
  PlateCalculator: undefined;
  ExerciseList: {
    category: string;
    exercises: Exercise[];
    selectedExercises: string[];
    onExercisesSelected: (selectedExercises: string[]) => void;
  };
  AddExercise: undefined;
  // Add other screens here
}; 