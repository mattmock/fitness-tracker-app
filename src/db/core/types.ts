import { type SQLiteDatabase } from 'expo-sqlite';
import type { ExerciseService, RoutineService, SessionService } from '../services';

export interface DatabaseProviderProps {
  children: React.ReactNode;
}

export interface DatabaseContextValue {
  forceReset: () => Promise<void>;
  exerciseService: ExerciseService;
  routineService: RoutineService;
  sessionService: SessionService;
}

export type DatabaseInitFunction = (db: SQLiteDatabase) => Promise<void>; 