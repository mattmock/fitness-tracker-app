import { type SQLiteDatabase } from 'expo-sqlite';

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  routineId?: string;
  name: string;
  notes?: string;
  startTime: string;
  endTime?: string;
  createdAt: string;
  exercises: SessionExercise[];
}

interface SessionRow {
  id: string;
  routine_id: string | null;
  name: string;
  notes: string | null;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

interface SessionExerciseRow {
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
}

// Helper function to escape SQL strings
function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

// Helper function to convert value to SQL value string
function toSqlValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return 'NULL';
  }
  return typeof value === 'string' ? `'${escapeSqlString(value)}'` : `'${value}'`;
}

export class SessionService {
  constructor(private db: SQLiteDatabase) {}

  async create(
    session: Omit<Session, 'id' | 'createdAt' | 'exercises'>,
    exercises: Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'>[]
  ): Promise<Session> {
    if (!session.name || !session.startTime) {
      throw new Error('Session must have a name and start time');
    }

    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    await this.db.execAsync('BEGIN TRANSACTION');

    try {
      // Insert session
      await this.db.execAsync(
        `INSERT INTO sessions (id, routine_id, name, notes, start_time, end_time, created_at)
         VALUES (${toSqlValue(id)}, ${session.routineId ? toSqlValue(session.routineId) : 'NULL'}, ${toSqlValue(session.name)}, ${toSqlValue(session.notes)}, ${toSqlValue(session.startTime)}, ${toSqlValue(session.endTime)}, ${toSqlValue(createdAt)})`
      );

      // Insert session exercises
      for (const exercise of exercises) {
        await this.db.execAsync(
          `INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, weight, duration, notes, created_at)
           VALUES (${toSqlValue(id)}, ${toSqlValue(exercise.exerciseId)}, ${exercise.setNumber}, ${exercise.reps ?? 'NULL'}, ${exercise.weight ?? 'NULL'}, ${exercise.duration ?? 'NULL'}, ${toSqlValue(exercise.notes)}, ${toSqlValue(createdAt)})`
        );
      }

      await this.db.execAsync('COMMIT');

      return {
        id,
        ...session,
        createdAt,
        exercises: exercises.map(exercise => ({
          id: `${id}-${exercise.exerciseId}-${exercise.setNumber}`,
          sessionId: id,
          createdAt,
          ...exercise
        }))
      };
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async getById(id: string): Promise<Session | null> {
    const rows = await this.db.getAllAsync<SessionRow & { exercise_id: string | null; set_number: number | null; reps: number | null; weight: number | null; duration: number | null; exercise_notes: string | null }>(
      `SELECT s.*, se.exercise_id, se.set_number, se.reps, se.weight, se.duration, se.notes as exercise_notes
       FROM sessions s
       LEFT JOIN session_exercises se ON s.id = se.session_id
       WHERE s.id = '${id}'`
    );

    if (!rows?.length) {
      return null;
    }

    const session = rows[0];
    return {
      id: session.id,
      routineId: session.routine_id ?? undefined,
      name: session.name,
      notes: session.notes ?? undefined,
      startTime: session.start_time,
      endTime: session.end_time ?? undefined,
      createdAt: session.created_at,
      exercises: rows
        .filter(row => row.exercise_id)
        .map(row => ({
          id: `${session.id}-${row.exercise_id}-${row.set_number}`,
          sessionId: session.id,
          exerciseId: row.exercise_id!,
          setNumber: row.set_number!,
          reps: row.reps ?? undefined,
          weight: row.weight ?? undefined,
          duration: row.duration ?? undefined,
          notes: row.exercise_notes ?? undefined,
          createdAt: session.created_at
        }))
    };
  }

  async getAll(): Promise<Session[]> {
    const rows = await this.db.getAllAsync<SessionRow & { exercise_id: string | null; set_number: number | null; reps: number | null; weight: number | null; duration: number | null; exercise_notes: string | null }>(
      `SELECT s.*, se.exercise_id, se.set_number, se.reps, se.weight, se.duration, se.notes as exercise_notes
       FROM sessions s
       LEFT JOIN session_exercises se ON s.id = se.session_id
       ORDER BY s.created_at DESC`
    );

    if (!rows?.length) {
      return [];
    }

    const sessionsMap = new Map<string, Session>();

    rows.forEach(row => {
      if (!sessionsMap.has(row.id)) {
        sessionsMap.set(row.id, {
          id: row.id,
          routineId: row.routine_id ?? undefined,
          name: row.name,
          notes: row.notes ?? undefined,
          startTime: row.start_time,
          endTime: row.end_time ?? undefined,
          createdAt: row.created_at,
          exercises: []
        });
      }

      if (row.exercise_id) {
        const session = sessionsMap.get(row.id)!;
        session.exercises.push({
          id: `${row.id}-${row.exercise_id}-${row.set_number}`,
          sessionId: row.id,
          exerciseId: row.exercise_id,
          setNumber: row.set_number!,
          reps: row.reps ?? undefined,
          weight: row.weight ?? undefined,
          duration: row.duration ?? undefined,
          notes: row.exercise_notes ?? undefined,
          createdAt: row.created_at
        });
      }
    });

    return Array.from(sessionsMap.values());
  }

  async update(id: string, session: Partial<Omit<Session, 'id' | 'createdAt' | 'exercises'>>): Promise<void> {
    const updates = Object.entries(session)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbKey} = ${value ? `'${value}'` : 'NULL'}`;
      })
      .join(', ');

    if (!updates) return;

    await this.db.execAsync(
      `UPDATE sessions SET ${updates} WHERE id = '${id}'`
    );
  }

  async updateExercise(
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    updates: Partial<Omit<SessionExercise, 'id' | 'sessionId' | 'exerciseId' | 'setNumber' | 'createdAt'>>
  ): Promise<void> {
    const updateFields = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbKey} = ${toSqlValue(value)}`;
      })
      .join(', ');

    if (!updateFields) return;

    await this.db.execAsync(
      `UPDATE session_exercises SET ${updateFields} WHERE session_id = '${sessionId}' AND exercise_id = '${exerciseId}' AND set_number = ${setNumber}`
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execAsync('BEGIN TRANSACTION');

    try {
      await this.db.execAsync(
        `DELETE FROM session_exercises WHERE session_id = '${id}'`
      );
      await this.db.execAsync(
        `DELETE FROM sessions WHERE id = '${id}'`
      );
      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    const rows = await this.db.getAllAsync<SessionRow & { exercise_id: string | null; set_number: number | null; reps: number | null; weight: number | null; duration: number | null; exercise_notes: string | null }>(
      `SELECT s.*, se.exercise_id, se.set_number, se.reps, se.weight, se.duration, se.notes as exercise_notes
       FROM sessions s
       LEFT JOIN session_exercises se ON s.id = se.session_id
       WHERE s.start_time >= '${startDate}' AND s.start_time <= '${endDate}'
       ORDER BY s.start_time DESC`
    );

    if (!rows?.length) {
      return [];
    }

    const sessionsMap = new Map<string, Session>();

    rows.forEach(row => {
      if (!sessionsMap.has(row.id)) {
        sessionsMap.set(row.id, {
          id: row.id,
          routineId: row.routine_id ?? undefined,
          name: row.name,
          notes: row.notes ?? undefined,
          startTime: row.start_time,
          endTime: row.end_time ?? undefined,
          createdAt: row.created_at,
          exercises: []
        });
      }

      if (row.exercise_id) {
        const session = sessionsMap.get(row.id)!;
        session.exercises.push({
          id: `${row.id}-${row.exercise_id}-${row.set_number}`,
          sessionId: row.id,
          exerciseId: row.exercise_id,
          setNumber: row.set_number!,
          reps: row.reps ?? undefined,
          weight: row.weight ?? undefined,
          duration: row.duration ?? undefined,
          notes: row.exercise_notes ?? undefined,
          createdAt: row.created_at
        });
      }
    });

    return Array.from(sessionsMap.values());
  }

  async addExerciseToSession(
    sessionId: string,
    exercise: Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'>
  ): Promise<void> {
    const createdAt = new Date().toISOString();

    await this.db.execAsync(
      `INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, weight, duration, notes, created_at)
       VALUES (${toSqlValue(sessionId)}, ${toSqlValue(exercise.exerciseId)}, ${exercise.setNumber}, ${exercise.reps ?? 'NULL'}, ${exercise.weight ?? 'NULL'}, ${exercise.duration ?? 'NULL'}, ${toSqlValue(exercise.notes)}, ${toSqlValue(createdAt)})`
    );
  }
} 