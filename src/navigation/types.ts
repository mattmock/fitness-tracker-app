import { Exercise } from '../types/database';
import { ExerciseListItem, ExerciseSelectionData } from '../types/interfaces';

export type RootStackParamList = {
  Home: undefined;
  ExerciseLibrary: {
    newExerciseId?: string;
  };
  Settings: undefined;
  PlateCalculator: undefined;
  ExerciseList: {
    category: string;
    exercises: ExerciseSelectionData[];
    onExercisesSelected: (selectedExercises: string[]) => void;
  };
  AddExercise: undefined;
  // Add other screens here
}; 