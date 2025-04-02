/**
 * Specialized routine interfaces based on different use cases.
 * This implements the Interface Segregation Principle.
 */
import { Routine } from '../database';

/**
 * Represents a routine in a list view.
 * Contains only the properties needed for display in lists.
 */
export interface RoutineListItem {
  /** Unique identifier for the routine */
  id: string;
  
  /** Name of the routine */
  name: string;
  
  /** Optional description of the routine */
  description?: string;
  
  /** Number of exercises in this routine */
  exerciseCount: number;
}

/**
 * Detailed routine information.
 * Contains all properties needed for detailed display.
 */
export interface RoutineDetail {
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
}

/**
 * Properties needed when creating/editing a routine.
 */
export interface RoutineFormData {
  /** Name of the routine */
  name: string;
  
  /** Optional description of the routine */
  description?: string;
  
  /** Collection of exercise IDs to include in this routine */
  exerciseIds: string[];
}

/**
 * Properties needed when starting a routine as a session.
 */
export interface RoutineSessionData {
  /** Unique identifier for the routine */
  id: string;
  
  /** Name of the routine */
  name: string;
  
  /** Collection of exercise IDs included in this routine */
  exerciseIds: string[];
}

/**
 * Helper functions to convert between interfaces
 */

/**
 * Convert a full Routine to a RoutineListItem interface.
 */
export function toRoutineListItem(routine: Routine): RoutineListItem {
  return {
    id: routine.id,
    name: routine.name,
    description: routine.description,
    exerciseCount: routine.exerciseIds.length
  };
}

/**
 * Convert a full Routine to a RoutineDetail interface.
 */
export function toRoutineDetail(routine: Routine): RoutineDetail {
  return {
    id: routine.id,
    name: routine.name,
    description: routine.description,
    exerciseIds: routine.exerciseIds,
    createdAt: routine.createdAt,
  };
}

/**
 * Convert a Routine to RoutineFormData for editing.
 */
export function toRoutineFormData(routine: Routine): RoutineFormData {
  return {
    name: routine.name,
    description: routine.description,
    exerciseIds: routine.exerciseIds
  };
}

/**
 * Convert a Routine to RoutineSessionData for starting a session.
 */
export function toRoutineSessionData(routine: Routine): RoutineSessionData {
  return {
    id: routine.id,
    name: routine.name,
    exerciseIds: routine.exerciseIds
  };
} 