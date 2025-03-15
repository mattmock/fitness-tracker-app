/**
 * Database types index file
 * Contains all database-related type definitions
 */

/**
 * Represents an exercise definition in the application
 * 
 * Exercise defines a type of physical activity that can be performed
 * during workout sessions.
 */
export interface Exercise {
  /** Unique identifier for the exercise */
  id: string;
  
  /** Name of the exercise */
  name: string;
  
  /** Optional description of how to perform the exercise */
  description?: string;
  
  /** Optional category for grouping exercises (e.g., "Strength", "Cardio") */
  category?: string;
  
  /** Optional tags for filtering and organizing exercises */
  tags?: string[];
  
  /** Optional variations of this exercise */
  variations?: string[];
  
  /** ISO string representing when this exercise was created */
  createdAt: string;
  
  /** ISO string representing when this exercise was last updated */
  updatedAt?: string;
}

/**
 * Represents a workout routine in the application
 * 
 * A routine is a predefined collection of exercises that can be used
 * as a template for workout sessions.
 */
export interface Routine {
  /** Unique identifier for the routine */
  id: string;
  
  /** Name of the routine */
  name: string;
  
  /** Optional description of the routine */
  description?: string;
  
  /** Collection of exercise IDs included in this routine */
  exerciseIds: string[];
  
  /** ISO string representing when this routine was created */
  createdAt: string;
  
  /** ISO string representing when this routine was last updated */
  updatedAt?: string;
}

/**
 * Represents an exercise performed during a specific workout session
 * 
 * SessionExercise connects a static exercise definition to a specific session,
 * including details like reps, weight, and completion status.
 */
export interface SessionExercise {
  /** Unique identifier for the session exercise */
  id: string;
  
  /** Reference to the parent session */
  sessionId: string;
  
  /** Reference to the static exercise definition */
  exerciseId: string;
  
  /** Set number within the session (for ordering) */
  setNumber: number;
  
  /** Number of repetitions performed (if applicable) */
  reps?: number;
  
  /** Weight used for the exercise (if applicable) */
  weight?: number;
  
  /** Duration of the exercise in seconds (if applicable) */
  duration?: number;
  
  /** Optional notes about this specific exercise performance */
  notes?: string;
  
  /** Whether this exercise has been completed */
  completed?: boolean;
  
  /** ISO string representing when this record was created */
  createdAt: string;
  
  /** ISO string representing when this record was last updated */
  updatedAt?: string;
}

/**
 * Represents a workout session in the application
 * 
 * A session is a collection of exercises performed during a specific time period.
 * It may be associated with a routine or created as a standalone session.
 */
export interface Session {
  /** Unique identifier for the session */
  id: string;
  
  /** Optional reference to the originating routine */
  routineId?: string;
  
  /** Name of the session */
  name: string;
  
  /** Optional notes about the session */
  notes?: string;
  
  /** ISO string representing when the session started */
  startTime: string;
  
  /** ISO string representing when the session ended (if completed) */
  endTime?: string;
  
  /** Collection of exercises performed during this session */
  sessionExercises: SessionExercise[];
  
  /** ISO string representing when the session was created */
  createdAt: string;
  
  /** ISO string representing when the session was last updated */
  updatedAt?: string;
} 