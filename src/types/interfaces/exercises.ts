/**
 * Specialized interfaces for Exercise types following the Interface Segregation Principle.
 * Each interface contains only the properties needed for its specific use case.
 */

import { Exercise } from '../database';

/**
 * Represents an exercise in a list view with minimal properties.
 */
export interface ExerciseListItem {
  id: string;
  name: string;
  category: string | undefined;
  tags?: string[];
}

/**
 * Represents detailed information about an exercise.
 */
export interface ExerciseDetail {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  variations?: string[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Data needed when selecting an exercise for a workout.
 */
export interface ExerciseSelectionData {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  selected?: boolean;
  inActiveSession?: boolean;
}

/**
 * Data needed when creating or editing an exercise.
 */
export interface ExerciseFormData {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  variations?: string[];
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
 * Converts a full Exercise to an ExerciseListItem.
 */
export function toExerciseListItem(exercise: Exercise): ExerciseListItem {
  return {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    tags: exercise.tags
  };
}

/**
 * Converts a full Exercise to an ExerciseDetail.
 */
export function toExerciseDetail(exercise: Exercise): ExerciseDetail {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    category: exercise.category,
    tags: exercise.tags,
    variations: exercise.variations,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt
  };
}

/**
 * Converts a full Exercise to an ExerciseSelectionData.
 */
export function toExerciseSelectionData(
  exercise: Exercise, 
  selected: boolean = false,
  inActiveSession: boolean = false
): ExerciseSelectionData {
  return {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    tags: exercise.tags,
    selected,
    inActiveSession
  };
}

/**
 * Converts a full Exercise to ExerciseFormData for editing.
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
 * Creates a new Exercise from form data and an ID.
 */
export function createExerciseFromFormData(
  formData: ExerciseFormData, 
  id: string
): Exercise {
  return {
    id,
    name: formData.name,
    description: formData.description,
    category: formData.category,
    tags: formData.tags,
    variations: formData.variations,
    createdAt: new Date().toISOString()
  };
}

/**
 * Groups exercises by their categories.
 */
export function groupExercisesByCategory(exercises: ExerciseListItem[]): ExerciseGroup[] {
  const groups: Record<string, ExerciseListItem[]> = {};
  
  // Group exercises by category
  exercises.forEach(exercise => {
    const category = exercise.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(exercise);
  });
  
  // Convert to array of ExerciseGroup
  return Object.entries(groups).map(([name, exercises]) => ({
    name,
    exercises
  }));
} 