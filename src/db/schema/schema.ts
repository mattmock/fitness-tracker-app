import * as SQLite from 'expo-sqlite';
import { indexes } from './indexes';

export const DATABASE_NAME = 'fitness_tracker.db';

export const schema = {
  version: 2,
  statements: [
    `CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS routine_exercises (
      routine_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL,
      duration INTEGER,
      notes TEXT,
      order_index INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (routine_id, exercise_id),
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT,
      name TEXT NOT NULL,
      notes TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL
    );`,

    `CREATE TABLE IF NOT EXISTS session_exercises (
      session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER,
      weight REAL,
      duration INTEGER,
      notes TEXT,
      completed INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      PRIMARY KEY (session_id, exercise_id, set_number),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );`,

    ...indexes
  ]
};