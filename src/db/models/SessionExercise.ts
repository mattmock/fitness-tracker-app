export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;  // Reference to static exercise
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
} 