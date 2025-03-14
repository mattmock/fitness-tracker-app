export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;            // Reference to static exercise
  setNumber: number;             // Added from service definition
  reps?: number;
  weight?: number;
  duration?: number;             // Added from service definition
  notes?: string;
  completed?: boolean;           // Track exercise completion status
  createdAt: string;
  updatedAt?: string;
} 