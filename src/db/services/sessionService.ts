import { type SQLiteDatabase } from 'expo-sqlite';
import { Session, SessionExercise } from '../models';

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
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  notes: string | null;
  completed: number | null;
  created_at: string;
  updated_at: string | null;
}

// Helper function to escape SQL strings
function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

// Helper function to convert value to SQL value string
function toSqlValue(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) {
    return 'NULL';
  } else if (typeof value === 'string') {
    return `'${escapeSqlString(value)}'`;
  } else if (typeof value === 'boolean') {
    return value ? '1' : '0';
  } else {
    return value.toString();
  }
}

export class SessionService {
  constructor(private db: SQLiteDatabase) {}

  async create(
    session: Omit<Session, 'id' | 'createdAt' | 'sessionExercises'>,
    exercises: Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'>[]
  ): Promise<Session> {
    const id = `session_${Date.now()}`;
    const createdAt = new Date().toISOString();
    
    // Insert session
    await this.db.execAsync(`
      INSERT INTO sessions (
        id, 
        routine_id, 
        name, 
        notes, 
        start_time, 
        end_time, 
        created_at
      ) VALUES (
        ${toSqlValue(id)}, 
        ${toSqlValue(session.routineId)}, 
        ${toSqlValue(session.name)}, 
        ${toSqlValue(session.notes)}, 
        ${toSqlValue(session.startTime)}, 
        ${toSqlValue(session.endTime)}, 
        ${toSqlValue(createdAt)}
      )
    `);
    // Insert exercises
    for (const exercise of exercises) {
      await this.db.execAsync(
        `INSERT INTO session_exercises (
          session_id, exercise_id, set_number, reps, weight, duration, notes, created_at
        ) VALUES (
          ${toSqlValue(id)}, 
          ${toSqlValue(exercise.exerciseId)}, 
          ${toSqlValue(exercise.setNumber)}, 
          ${toSqlValue(exercise.reps)}, 
          ${toSqlValue(exercise.weight)}, 
          ${toSqlValue(exercise.duration)}, 
          ${toSqlValue(exercise.notes)}, 
          ${toSqlValue(createdAt)}
        )`
      );
    }
    
    // Return the created session with exercises
    return {
      ...session,
      id,
      createdAt,
      sessionExercises: exercises.map((exercise, index) => ({
        ...exercise,
        id: `${id}_${exercise.exerciseId}_${index}`,
        sessionId: id,
        createdAt
      }))
    };
  }

  async getById(id: string): Promise<Session | null> {
    type SessionExerciseRow = {
      exercise_id: string | null;
      set_number: number | null;
      reps: number | null;
      weight: number | null;
      duration: number | null;
      exercise_notes: string | null;
      completed: number | null;
    };
    
    const rows = await this.db.getAllAsync<SessionRow & SessionExerciseRow>(
      `SELECT 
        s.*, 
        se.exercise_id, 
        se.set_number, 
        se.reps, 
        se.weight, 
        se.duration, 
        se.notes as exercise_notes,
        se.completed
       FROM sessions s
       LEFT JOIN session_exercises se ON s.id = se.session_id
       WHERE s.id = '${id}'`
    );

    if (!rows?.length) {
      return null;
    }

    const sessionRow = rows[0];
    const exercises = rows
      .filter(row => row.exercise_id)
      .map(row => ({
        id: `${sessionRow.id}-${row.exercise_id}-${row.set_number}`,
        sessionId: sessionRow.id,
        exerciseId: row.exercise_id!,
        setNumber: row.set_number!,
        reps: row.reps ?? undefined,
        weight: row.weight ?? undefined,
        duration: row.duration ?? undefined,
        notes: row.exercise_notes ?? undefined,
        completed: row.completed ? true : false,
        createdAt: sessionRow.created_at
      }));

    return {
      id: sessionRow.id,
      routineId: sessionRow.routine_id ?? undefined,
      name: sessionRow.name,
      notes: sessionRow.notes ?? undefined,
      startTime: sessionRow.start_time,
      endTime: sessionRow.end_time ?? undefined,
      createdAt: sessionRow.created_at,
      sessionExercises: exercises
    };
  }

  async getAll(): Promise<Session[]> {
    type SessionWithExerciseRow = SessionRow & { 
      exercise_id: string | null; 
      set_number: number | null; 
      reps: number | null; 
      weight: number | null; 
      duration: number | null; 
      exercise_notes: string | null;
      completed: number | null 
    };
    
    const rows = await this.db.getAllAsync<SessionWithExerciseRow>(
      `SELECT 
        s.*, 
        se.exercise_id, 
        se.set_number, 
        se.reps, 
        se.weight, 
        se.duration, 
        se.notes as exercise_notes,
        se.completed
       FROM sessions s
       LEFT JOIN session_exercises se ON s.id = se.session_id
       ORDER BY s.created_at DESC`
    );

    if (!rows?.length) {
      return [];
    }

    const sessionMap = new Map<string, Session>();

    rows.forEach(row => {
      sessionMap.set(row.id, {
        id: row.id,
        routineId: row.routine_id ?? undefined,
        name: row.name,
        notes: row.notes ?? undefined,
        startTime: row.start_time,
        endTime: row.end_time ?? undefined,
        createdAt: row.created_at,
        sessionExercises: []
      });
    });

    const exercises = await this.db.getAllAsync<SessionExerciseRow>(
      `SELECT * FROM session_exercises`
    );

    for (const exercise of exercises) {
      const session = sessionMap.get(exercise.session_id);
      if (session) {
        session.sessionExercises.push({
          id: `${exercise.session_id}-${exercise.exercise_id}-${exercise.set_number}`,
          sessionId: exercise.session_id,
          exerciseId: exercise.exercise_id,
          setNumber: exercise.set_number!,
          reps: exercise.reps ?? undefined,
          weight: exercise.weight ?? undefined,
          duration: exercise.duration ?? undefined,
          notes: exercise.notes ?? undefined,
          completed: exercise.completed ? true : false,
          createdAt: exercise.created_at
        });
      }
    }

    return Array.from(sessionMap.values());
  }

  async update(id: string, session: Partial<Omit<Session, 'id' | 'createdAt' | 'sessionExercises'>>): Promise<void> {
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
    type SessionWithExerciseRow = SessionRow & { 
      exercise_id: string | null; 
      set_number: number | null; 
      reps: number | null; 
      weight: number | null; 
      duration: number | null; 
      exercise_notes: string | null;
      completed: number | null 
    };
    
    const rows = await this.db.getAllAsync<SessionWithExerciseRow>(
      `SELECT 
        s.*, 
        se.exercise_id, 
        se.set_number, 
        se.reps, 
        se.weight, 
        se.duration, 
        se.notes as exercise_notes,
        se.completed
       FROM sessions s
       LEFT JOIN session_exercises se ON s.id = se.session_id
       WHERE s.start_time >= '${startDate}' AND s.start_time <= '${endDate}'
       ORDER BY s.start_time DESC`
    );

    if (!rows?.length) {
      return [];
    }

    const sessionMap = new Map<string, Session>();

    rows.forEach(row => {
      sessionMap.set(row.id, {
        id: row.id,
        routineId: row.routine_id ?? undefined,
        name: row.name,
        notes: row.notes ?? undefined,
        startTime: row.start_time,
        endTime: row.end_time ?? undefined,
        createdAt: row.created_at,
        sessionExercises: []
      });
    });

    const exercises = await this.db.getAllAsync<SessionExerciseRow>(
      `SELECT * FROM session_exercises`
    );

    for (const exercise of exercises) {
      const session = sessionMap.get(exercise.session_id);
      if (session) {
        session.sessionExercises.push({
          id: `${exercise.session_id}-${exercise.exercise_id}-${exercise.set_number}`,
          sessionId: exercise.session_id,
          exerciseId: exercise.exercise_id,
          setNumber: exercise.set_number!,
          reps: exercise.reps ?? undefined,
          weight: exercise.weight ?? undefined,
          duration: exercise.duration ?? undefined,
          notes: exercise.notes ?? undefined,
          completed: exercise.completed ? true : false,
          createdAt: exercise.created_at
        });
      }
    }

    return Array.from(sessionMap.values());
  }

  async addExerciseToSession(
    sessionId: string,
    exercise: Omit<SessionExercise, 'id' | 'sessionId' | 'createdAt'>
  ): Promise<void> {
    const createdAt = new Date().toISOString();
    
    await this.db.execAsync(
      `INSERT INTO session_exercises (
        session_id, exercise_id, set_number, reps, weight, duration, notes, completed, created_at
      ) VALUES (
        ${toSqlValue(sessionId)}, 
        ${toSqlValue(exercise.exerciseId)}, 
        ${toSqlValue(exercise.setNumber)}, 
        ${toSqlValue(exercise.reps)}, 
        ${toSqlValue(exercise.weight)}, 
        ${toSqlValue(exercise.duration)}, 
        ${toSqlValue(exercise.notes)}, 
        ${exercise.completed !== undefined ? (exercise.completed ? 1 : 0) : 'NULL'}, 
        ${toSqlValue(createdAt)}
      )`
    );
  }
} 