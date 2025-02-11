import { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'fitness_tracker.db';

export const schema = [
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
    created_at TEXT NOT NULL,
    PRIMARY KEY (session_id, exercise_id, set_number),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  );`
];

export async function clearDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    DROP TABLE IF EXISTS session_exercises;
    DROP TABLE IF EXISTS routine_exercises;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS routines;
    DROP TABLE IF EXISTS exercises;
  `);

  // Recreate tables
  for (const table of schema) {
    await db.execAsync(table);
  }
}

export async function seedDatabase(db: SQLiteDatabase) {
  // Sample data
  await db.execAsync(`
    INSERT INTO exercises (id, name, category, description, created_at) 
    VALUES 
      ('1', 'Push-ups', 'Upper Body', 'Basic push-up exercise', datetime('now')),
      ('2', 'Squats', 'Lower Body', 'Basic squat exercise', datetime('now')),
      ('3', 'Plank', 'Core', 'Basic plank exercise', datetime('now'));

    INSERT INTO routines (id, name, description, created_at)
    VALUES 
      ('1', 'Full Body Workout', 'Basic full body routine', datetime('now'));

    INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
    VALUES 
      ('1', '1', 3, 10, 0, datetime('now')),
      ('1', '2', 3, 10, 1, datetime('now')),
      ('1', '3', 3, 30, 2, datetime('now'));
  `);
}

export async function reseedDatabase(db: SQLiteDatabase) {
  await clearDatabase(db);
  await seedDatabase(db);
}