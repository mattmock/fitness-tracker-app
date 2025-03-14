import { SessionExercise } from './SessionExercise';

export interface Session {
  id: string;
  routineId?: string;  // Optional reference to originating routine
  name: string;                  // Added from service definition
  notes?: string;                // Added from service definition
  startTime: string;
  endTime?: string;
  sessionExercises: SessionExercise[];  // Full objects, not just IDs
  createdAt: string;
  updatedAt?: string;
} 