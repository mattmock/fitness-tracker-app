/**
 * Database indexes for performance optimization.
 */
export const indexes = [
  // Exercises
  'CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);',
  'CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);',

  // Routines
  'CREATE INDEX IF NOT EXISTS idx_routines_name ON routines(name);',

  // Sessions
  'CREATE INDEX IF NOT EXISTS idx_sessions_routine_id ON sessions(routine_id);',
  'CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);',

  // Session Exercises
  'CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise_id ON session_exercises(exercise_id);',
  'CREATE INDEX IF NOT EXISTS idx_session_exercises_session_id ON session_exercises(session_id);',

  // Routine Exercises
  'CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise_id ON routine_exercises(exercise_id);',
  'CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON routine_exercises(routine_id);',
]; 