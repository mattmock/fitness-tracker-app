import { type SQLiteDatabase } from '../core/sqlite';
import { Routine } from '../../types/database';

interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  exercise_ids: string | null;
  created_at: string;
}

// Helper function to escape SQL strings
function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

// Helper function to convert value to SQL value string
function toSqlValue(value: string | undefined | null): string {
  if (value === undefined || value === null) {
    return 'NULL';
  }
  return `'${escapeSqlString(value)}'`;
}

export class RoutineService {
  constructor(private db: SQLiteDatabase) {}

  async create(routine: Omit<Routine, 'createdAt'>): Promise<Routine> {
    if (!routine.id || !routine.name) {
      throw new Error('Routine must have an id and name');
    }

    const createdAt = new Date().toISOString();
    const newRoutine = { ...routine, createdAt };

    // Start a transaction
    await this.db.execAsync('BEGIN TRANSACTION');

    try {
      // Insert routine
      await this.db.execAsync(
        `INSERT INTO routines (id, name, description, created_at) 
         VALUES (${toSqlValue(newRoutine.id)}, ${toSqlValue(newRoutine.name)}, 
                 ${toSqlValue(newRoutine.description)}, 
                 ${toSqlValue(createdAt)})`
      );

      // Insert routine exercises
      for (const [index, exerciseId] of newRoutine.exerciseIds.entries()) {
        await this.db.execAsync(
          `INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
           VALUES (${toSqlValue(newRoutine.id)}, ${toSqlValue(exerciseId)}, 3, 10, ${index}, ${toSqlValue(createdAt)})`
        );
      }

      await this.db.execAsync('COMMIT');
      return newRoutine;
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async getById(id: string): Promise<Routine | null> {
    const result = await this.db.getAllAsync<RoutineRow>(
      `SELECT r.*, GROUP_CONCAT(re.exercise_id) as exercise_ids
       FROM routines r
       LEFT JOIN routine_exercises re ON r.id = re.routine_id
       WHERE r.id = ${toSqlValue(id)}
       GROUP BY r.id`
    );

    if (!result?.length) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      exerciseIds: row.exercise_ids ? row.exercise_ids.split(',') : [],
      createdAt: row.created_at
    };
  }

  async getAll(): Promise<Routine[]> {
    const rows = await this.db.getAllAsync<RoutineRow>(
      `SELECT r.*, GROUP_CONCAT(re.exercise_id) as exercise_ids
       FROM routines r
       LEFT JOIN routine_exercises re ON r.id = re.routine_id
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );

    if (!rows?.length) {
      return [];
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      exerciseIds: row.exercise_ids ? row.exercise_ids.split(',') : [],
      createdAt: row.created_at
    }));
  }

  async update(id: string, routine: Partial<Omit<Routine, 'id' | 'createdAt' | 'exerciseIds'>>): Promise<void> {
    const updates = Object.entries(routine)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ${toSqlValue(value)}`)
      .join(', ');

    if (!updates) return;

    await this.db.execAsync(
      `UPDATE routines SET ${updates} WHERE id = ${toSqlValue(id)}`
    );
  }

  async updateExercises(routineId: string, exerciseIds: string[]): Promise<void> {
    await this.db.execAsync('BEGIN TRANSACTION');

    try {
      await this.db.execAsync(
        `DELETE FROM routine_exercises WHERE routine_id = ${toSqlValue(routineId)}`
      );

      for (const [index, exerciseId] of exerciseIds.entries()) {
        await this.db.execAsync(
          `INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index, created_at)
           VALUES (${toSqlValue(routineId)}, ${toSqlValue(exerciseId)}, 3, 10, ${index}, ${toSqlValue(new Date().toISOString())})`
        );
      }

      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.execAsync('BEGIN TRANSACTION');

    try {
      await this.db.execAsync(
        `DELETE FROM routine_exercises WHERE routine_id = ${toSqlValue(id)}`
      );
      await this.db.execAsync(
        `DELETE FROM routines WHERE id = ${toSqlValue(id)}`
      );
      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async searchByName(query: string): Promise<Routine[]> {
    const rows = await this.db.getAllAsync<RoutineRow>(
      `SELECT r.*, GROUP_CONCAT(re.exercise_id) as exercise_ids
       FROM routines r
       LEFT JOIN routine_exercises re ON r.id = re.routine_id
       WHERE r.name LIKE '%${escapeSqlString(query)}%'
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );

    if (!rows?.length) {
      return [];
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      exerciseIds: row.exercise_ids ? row.exercise_ids.split(',') : [],
      createdAt: row.created_at
    }));
  }
} 