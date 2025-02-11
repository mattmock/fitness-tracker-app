/**
 * Development Database Utilities
 * These utilities are for development and testing purposes only.
 * They should not be included in production builds.
 */

import { SQLiteDatabase } from 'expo-sqlite';
import { schema } from '../database';
import { DEV_EXERCISES, DEV_ROUTINES, DEV_ROUTINE_EXERCISES, DEV_SAMPLE_SESSIONS } from './devSeedData';

/**
 * Formats a date for SQLite (YYYY-MM-DD HH:MM:SS)
 */
function formatDateForSQLite(date: Date): string {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Clears all tables from the development database
 */
export async function clearDevDatabase(db: SQLiteDatabase) {
  console.log('[Dev] Starting database clear process...');
  
  const tables = ['session_exercises', 'routine_exercises', 'sessions', 'routines', 'exercises'];
  
  // Drop all tables
  for (const table of tables) {
    console.log(`[Dev] Dropping table: ${table}`);
    await db.execAsync(`DROP TABLE IF EXISTS ${table};`);
  }
  console.log('[Dev] All tables dropped successfully');

  // Recreate schema
  console.log('[Dev] Recreating schema...');
  for (const statement of schema) {
    try {
      await db.execAsync(statement);
    } catch (error) {
      console.error('[Dev] Error executing schema statement:', error);
      throw error;
    }
  }

  // Verify tables
  console.log('[Dev] Verifying table creation...');
  for (const table of tables) {
    const result = await db.getFirstAsync<{count: number}>(
      `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='${table}'`
    );
    console.log(`[Dev] Table ${table} exists:`, result?.count === 1);
    if (result?.count !== 1) {
      throw new Error(`[Dev] Failed to create table: ${table}`);
    }
  }

  console.log('[Dev] Database clear process complete');
}

/**
 * Seeds the development database with sample data
 */
export async function seedDevDatabase(db: SQLiteDatabase) {
  console.log('[Dev] Seeding development data...');

  // Insert exercises
  console.log('[Dev] Step 1: Inserting exercises...');
  for (const exercise of DEV_EXERCISES) {
    await db.execAsync(`
      INSERT INTO exercises (id, name, category, description, created_at) 
      VALUES ('${exercise.id}', '${exercise.name}', '${exercise.category}', '${exercise.description}', datetime('now'))
    `);
  }

  // Insert routines
  console.log('[Dev] Step 2: Inserting routines...');
  for (const routine of DEV_ROUTINES) {
    await db.execAsync(`
      INSERT INTO routines (id, name, description, created_at)
      VALUES ('${routine.id}', '${routine.name}', '${routine.description}', datetime('now'))
    `);
  }

  // Insert routine exercises
  console.log('[Dev] Step 3: Inserting routine exercises...');
  for (const re of DEV_ROUTINE_EXERCISES) {
    await db.execAsync(`
      INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
      VALUES ('${re.routineId}', '${re.exerciseId}', ${re.sets}, ${re.reps}, ${re.orderIndex}, datetime('now'))
    `);
  }

  // Insert sample sessions
  console.log('[Dev] Step 4: Inserting sample sessions...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  
  for (const session of DEV_SAMPLE_SESSIONS) {
    const timestamp = session.id === 'sample-1' 
      ? formatDateForSQLite(yesterday)
      : formatDateForSQLite(twoHoursAgo);
    
    await db.execAsync(`
      INSERT INTO sessions (id, name, routine_id, start_time, created_at) 
      VALUES ('${session.id}', '${session.name}', '${session.routineId}', '${timestamp}', '${timestamp}')
    `);

    for (const exercise of session.exercises) {
      await db.execAsync(`
        INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, created_at)
        VALUES ('${session.id}', '${exercise.exerciseId}', ${exercise.setNumber}, ${exercise.reps}, '${timestamp}')
      `);
    }
  }

  // Verify data
  const counts = await Promise.all([
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM exercises'),
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM routines'),
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM routine_exercises'),
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM sessions'),
    db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM session_exercises')
  ]);

  console.log('[Dev] Final Database State:');
  console.log(`[Dev] - Exercises: ${counts[0]?.count ?? 0}`);
  console.log(`[Dev] - Routines: ${counts[1]?.count ?? 0}`);
  console.log(`[Dev] - Routine Exercises: ${counts[2]?.count ?? 0}`);
  console.log(`[Dev] - Sessions: ${counts[3]?.count ?? 0}`);
  console.log(`[Dev] - Session Exercises: ${counts[4]?.count ?? 0}`);

  console.log('[Dev] Development seeding complete');
}

/**
 * Resets the development database to its initial state
 */
export async function resetDevDatabase(db: SQLiteDatabase) {
  await clearDevDatabase(db);
  await seedDevDatabase(db);
} 