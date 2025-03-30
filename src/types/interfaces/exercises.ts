/**
 * Specialized exercise interfaces based on different use cases.
 * This implements the Interface Segregation Principle.
 */
import { Exercise } from '../database';

/**
 * Represents an exercise in a list or selection view.
 * Contains only the properties needed for display in lists.
 */
export interface ExerciseListItem {
  /** Unique identifier for the exercise */
  id: string;
  
  /** Name of the exercise */
  name: string;
  
  /** Optional category for grouping exercises */
  category?: string;
  
  /** Optional description (may be truncated in UI) */
  description?: string;
}

/**
 * Represents an exercise in library/category view.
 * Used for grouping exercises by category.
 */
export interface ExerciseGroup {
  /** Category name */
  name: string;
  
  /** Exercises in this category */
  exercises: ExerciseListItem[];
}

/**
 * Detailed exercise information for full view.
 * Contains all properties needed for detailed display.
 */
export interface ExerciseDetail {
  /** Unique identifier for the exercise */
  id: string;
  
  /** Name of the exercise */
  name: string;
  
  /** Full description of how to perform the exercise */
  description?: string;
  
  /** Category for the exercise */
  category?: string;
  
  /** Tags for filtering and organizing */
  tags?: string[];
  
  /** Related variations of this exercise */
  variations?: string[];
}

/**
 * Properties needed when creating/editing an exercise.
 */
export interface ExerciseFormData {
  /** Name of the exercise */
  name: string;
  
  /** Description of how to perform the exercise */
  description?: string;
  
  /** Category for grouping */
  category?: string;
  
  /** Tags for filtering and organizing */
  tags?: string[];
  
  /** Related variations */
  variations?: string[];
}

/**
 * Minimal exercise data for selection contexts
 */
export interface ExerciseSelectionData {
  /** Unique identifier for the exercise */
  id: string;
  
  /** Name of the exercise */
  name: string;
  
  /** Whether the exercise is currently selected */
  selected?: boolean;
  
  /** Whether the exercise is part of an active session */
  inActiveSession?: boolean;
}

/**
 * Helper functions to convert between interfaces
 */

/**
 * Convert a full Exercise to an ExerciseListItem interface.
 */
export function toExerciseListItem(exercise: Exercise): ExerciseListItem {
  return {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    description: exercise.description
  };
}

/**
 * Convert a full Exercise to an ExerciseDetail interface.
 */
export function toExerciseDetail(exercise: Exercise): ExerciseDetail {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    category: exercise.category,
    tags: exercise.tags,
    variations: exercise.variations
  };
}

/**
 * Convert a full Exercise to an ExerciseSelectionData interface.
 */
export function toExerciseSelectionData(
  exercise: Exercise, 
  selected: boolean = false,
  inActiveSession: boolean = false
): ExerciseSelectionData {
  return {
    id: exercise.id,
    name: exercise.name,
    selected,
    inActiveSession
  };
}

/**
 * Convert an Exercise to ExerciseFormData for editing.
 */
export function toExerciseFormData(exercise: Exercise): ExerciseFormData {
  return {
    name: exercise.name,
    description: exercise.description,
    category: exercise.category,
    tags: exercise.tags,
    variations: exercise.variations
  };
}

/**
 * Group exercises by category
 */
export function groupExercisesByCategory(exercises: Exercise[]): ExerciseGroup[] {
  const groups = new Map<string, ExerciseListItem[]>();
  
  exercises.forEach(exercise => {
    const group = exercise.category || 'Other';
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)?.push(toExerciseListItem(exercise));
  });

  return Array.from(groups.entries()).map(([name, exercises]) => ({
    name,
    exercises
  }));
} 