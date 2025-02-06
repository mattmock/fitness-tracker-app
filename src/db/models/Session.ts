import { SessionExercise } from './SessionExercise';

export interface Session {
  id: string;
  routineId?: string;  // Optional reference to originating routine
  startTime: string;
  endTime?: string;
  sessionExercises: SessionExercise[];  // Full objects, not just IDs
  createdAt: string;
  updatedAt?: string;
} 