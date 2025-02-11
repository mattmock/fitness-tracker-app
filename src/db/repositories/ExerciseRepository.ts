import { SQLiteDatabase } from 'expo-sqlite';

export interface Exercise {
  id: string;
  name: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exerciseIds: string[];
  createdAt: string;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  completed: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  startTime: string;
  createdAt: string;
  sessionExercises: SessionExercise[];
}

interface ExerciseRow {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string;
}

interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  exercise_ids: string | null;
  created_at: string;
}

interface SessionRow {
  id: string;
  name: string;
  routine_id: string | null;
  notes: string | null;
  start_time: string;
  end_time: string | null;
  created_at: string;
  session_id: string | null;
  exercise_id: string | null;
  set_number: number | null;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  se_created_at: string | null;
}

interface SQLiteResult<T> {
  rows: T[];
  insertId?: number;
  rowsAffected: number;
}

export class ExerciseRepository {
  constructor(private db: SQLiteDatabase) {
    console.log('Exercise repository initialized');
  }

  async getExercises(): Promise<Exercise[]> {
    console.log('Fetching exercises from database...');
    try {
      const query = 'SELECT * FROM exercises ORDER BY name';
      console.log('Executing query:', query);
      const rows = await this.db.getAllAsync<ExerciseRow>(query);
      console.log('Raw results:', JSON.stringify(rows, null, 2));
      if (!rows?.length) {
        console.log('No exercises found');
        return [];
      }
      console.log(`Retrieved ${rows.length} exercises:`, JSON.stringify(rows, null, 2));
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category ?? undefined,
        description: row.description ?? undefined,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

  async getRoutines(): Promise<Routine[]> {
    console.log('Fetching routines from database...');
    try {
      const query = `
        SELECT r.*, GROUP_CONCAT(re.exercise_id) as exercise_ids 
        FROM routines r 
        LEFT JOIN routine_exercises re ON r.id = re.routine_id 
        GROUP BY r.id 
        ORDER BY r.name
      `;
      console.log('Executing query:', query);
      const rows = await this.db.getAllAsync<RoutineRow>(query);
      console.log('Raw results:', JSON.stringify(rows, null, 2));
      if (!rows?.length) {
        console.log('No routines found');
        return [];
      }
      console.log(`Retrieved ${rows.length} routines:`, JSON.stringify(rows, null, 2));
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        exerciseIds: row.exercise_ids ? row.exercise_ids.split(',') : [],
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }

  async getSessions(): Promise<Session[]> {
    console.log('Fetching sessions from database...');
    try {
      const query = `
        SELECT 
          s.*,
          se.session_id,
          se.exercise_id,
          se.set_number,
          se.reps,
          se.weight,
          se.duration,
          se.notes,
          se.created_at as se_created_at
        FROM sessions s 
        LEFT JOIN session_exercises se ON s.id = se.session_id 
        ORDER BY s.start_time DESC
      `;
      console.log('Executing query:', query);
      const rows = await this.db.getAllAsync<SessionRow>(query);
      console.log('Raw results:', JSON.stringify(rows, null, 2));
      if (!rows?.length) {
        console.log('No sessions found');
        return [];
      }
      console.log(`Retrieved ${rows.length} session rows:`, JSON.stringify(rows, null, 2));

      const sessionsMap = new Map<string, Session>();
      
      rows.forEach(row => {
        if (!sessionsMap.has(row.id)) {
          sessionsMap.set(row.id, {
            id: row.id,
            startTime: row.start_time,
            createdAt: row.created_at,
            sessionExercises: []
          });
        }

        if (row.exercise_id && row.session_id) {
          const session = sessionsMap.get(row.id)!;
          session.sessionExercises.push({
            id: `${row.session_id}-${row.exercise_id}-${row.set_number}`,
            sessionId: row.session_id,
            exerciseId: row.exercise_id,
            sets: row.set_number ?? 1,
            reps: row.reps ?? 0,
            completed: false,
            createdAt: row.se_created_at!
          });
        }
      });

      const sessions = Array.from(sessionsMap.values());
      console.log(`Processed into ${sessions.length} sessions:`, JSON.stringify(sessions, null, 2));
      return sessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  async createSession(exercises: Exercise[]): Promise<Session> {
    console.log('Creating new session...');
    const sessionId = Date.now().toString();
    const now = new Date().toISOString();

    // Create session
    await this.db.execAsync(
      `INSERT INTO sessions (id, name, start_time, created_at) VALUES ('${sessionId}', 'New Session', '${now}', '${now}')`
    );

    // Create session exercises
    const sessionExercises: SessionExercise[] = exercises.map((exercise, index) => ({
      id: `${sessionId}-${exercise.id}-1`, // Using set_number 1 for initial set
      sessionId,
      exerciseId: exercise.id,
      sets: 1,
      reps: 10,
      completed: false,
      createdAt: now
    }));

    // Insert session exercises
    for (const se of sessionExercises) {
      await this.db.execAsync(
        `INSERT INTO session_exercises 
         (session_id, exercise_id, set_number, reps, created_at) 
         VALUES ('${se.sessionId}', '${se.exerciseId}', 1, ${se.reps}, '${se.createdAt}')`
      );
    }

    console.log(`Created session with ${sessionExercises.length} exercises`);
    return {
      id: sessionId,
      startTime: now,
      createdAt: now,
      sessionExercises
    };
  }
} 