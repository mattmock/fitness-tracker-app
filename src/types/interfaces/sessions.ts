/**
 * Specialized session interfaces based on different use cases.
 * This implements the Interface Segregation Principle.
 */
import { Session, SessionExercise } from '../database';

/**
 * Read-only properties for displaying session information.
 * Use this for history views, reporting, and anywhere sessions 
 * are only displayed, not modified.
 */
export interface SessionDisplay {
  /** Unique identifier for the session */
  id: string;
  
  /** Name of the session */
  name: string;
  
  /** ISO string representing when the session started */
  startTime: string;
  
  /** ISO string representing when the session ended (if completed) */
  endTime?: string;
  
  /** Collection of exercises performed during this session (simplified) */
  sessionExercises: SessionExerciseDisplay[];
  
  /** ISO string representing when the session was created */
  createdAt: string;
}

/**
 * Read-only properties for displaying session exercise information.
 */
export interface SessionExerciseDisplay {
  /** Unique identifier for the session exercise */
  id: string;
  
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
  
  /** Whether this exercise has been completed */
  completed?: boolean;
}

/**
 * Properties needed for active session tracking.
 * Used when a user is actively working with a session.
 */
export interface ActiveSessionData {
  /** Unique identifier for the session */
  id: string;
  
  /** Name of the session */
  name: string;
  
  /** ISO string representing when the session started */
  startTime: string;
  
  /** Collection of exercises performed during this session, with full detail */
  sessionExercises: ActiveSessionExerciseData[];
}

/**
 * Properties needed for working with an active session exercise.
 */
export interface ActiveSessionExerciseData {
  /** Unique identifier for the session exercise */
  id: string;
  
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
}

/**
 * Interface for components that need to display or edit exercise data
 * but are agnostic to the specific source (SessionExercise, ActiveSessionExerciseData, etc.)
 */
export interface ExerciseSetData {
  /** Unique identifier for the exercise set */
  id: string;
  
  /** Reference to the exercise definition */
  exerciseId: string;
  
  /** Set number */
  setNumber: number;
  
  /** Number of repetitions (if applicable) */
  reps?: number;
  
  /** Weight used (if applicable) */
  weight?: number;
  
  /** Duration in seconds (if applicable) */
  duration?: number;
  
  /** Optional notes */
  notes?: string;
  
  /** Whether this exercise has been completed */
  completed?: boolean;
}

/**
 * Properties needed when creating a new session.
 */
export interface SessionWriteData {
  /** Optional reference to the originating routine */
  routineId?: string;
  
  /** Name of the session */
  name: string;
  
  /** Optional notes about the session */
  notes?: string;
  
  /** ISO string representing when the session started */
  startTime: string;
}

/**
 * Helper functions to convert between interfaces
 */

/**
 * Convert a full Session to a SessionDisplay interface.
 */
export function toSessionDisplay(session: Session): SessionDisplay {
  return {
    id: session.id,
    name: session.name,
    startTime: session.startTime,
    endTime: session.endTime,
    sessionExercises: session.sessionExercises.map(toSessionExerciseDisplay),
    createdAt: session.createdAt
  };
}

/**
 * Convert a full SessionExercise to a SessionExerciseDisplay interface.
 */
export function toSessionExerciseDisplay(exercise: SessionExercise): SessionExerciseDisplay {
  return {
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    setNumber: exercise.setNumber,
    reps: exercise.reps,
    weight: exercise.weight,
    duration: exercise.duration,
    completed: exercise.completed
  };
}

/**
 * Convert a full Session to an ActiveSessionData interface.
 */
export function toActiveSessionData(session: Session): ActiveSessionData {
  return {
    id: session.id,
    name: session.name,
    startTime: session.startTime,
    sessionExercises: session.sessionExercises.map(toActiveSessionExerciseData)
  };
}

/**
 * Convert a full SessionExercise to an ActiveSessionExerciseData interface.
 */
export function toActiveSessionExerciseData(exercise: SessionExercise): ActiveSessionExerciseData {
  return {
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    setNumber: exercise.setNumber,
    reps: exercise.reps,
    weight: exercise.weight,
    duration: exercise.duration,
    notes: exercise.notes,
    completed: exercise.completed
  };
}

/**
 * Convert any exercise type to ExerciseSetData
 */
export function toExerciseSetData(exercise: SessionExercise | ActiveSessionExerciseData | SessionExerciseDisplay): ExerciseSetData {
  return {
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    setNumber: exercise.setNumber,
    reps: exercise.reps,
    weight: exercise.weight,
    duration: exercise.duration,
    notes: 'notes' in exercise ? exercise.notes : undefined,
    completed: exercise.completed,
  };
} 