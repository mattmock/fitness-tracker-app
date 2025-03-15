import { type SQLiteDatabase } from 'expo-sqlite';
import { Exercise } from '../../types/database';

interface ExerciseRow {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string;
}

// Helper function to escape SQL strings
function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

// Helper function to convert value to SQL value string
function toSqlValue(value: string | string[] | undefined | null): string {
  if (value === undefined || value === null) {
    return 'NULL';
  }
  if (Array.isArray(value)) {
    return `'${JSON.stringify(value)}'`;
  }
  return `'${escapeSqlString(value)}'`;
}

export class ExerciseService {
  constructor(private db: SQLiteDatabase) {}

  async create(exercise: Omit<Exercise, 'createdAt'>): Promise<Exercise> {
    if (!exercise.id || !exercise.name) {
      throw new Error('Exercise must have an id and name');
    }

    const createdAt = new Date().toISOString();
    const newExercise = { ...exercise, createdAt };

    await this.db.execAsync(
      `INSERT INTO exercises (id, name, category, description, created_at) 
       VALUES (${toSqlValue(newExercise.id)}, ${toSqlValue(newExercise.name)}, 
               ${toSqlValue(newExercise.category)}, 
               ${toSqlValue(newExercise.description)}, 
               ${toSqlValue(createdAt)})`
    );

    return newExercise;
  }

  async getById(id: string): Promise<Exercise | null> {
    const result = await this.db.getAllAsync<ExerciseRow>(
      `SELECT * FROM exercises WHERE id = ${toSqlValue(id)}`
    );
    
    if (!result?.length) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      category: row.category ?? undefined,
      description: row.description ?? undefined,
      createdAt: row.created_at
    };
  }

  async getAll(): Promise<Exercise[]> {
    const rows = await this.db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises ORDER BY created_at DESC'
    );

    if (!rows?.length) {
      return [];
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category ?? undefined,
      description: row.description ?? undefined,
      createdAt: row.created_at
    }));
  }

  async update(id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>): Promise<void> {
    const updates = Object.entries(exercise)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ${toSqlValue(value)}`)
      .join(', ');

    if (!updates) return;

    await this.db.execAsync(
      `UPDATE exercises SET ${updates} WHERE id = ${toSqlValue(id)}`
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execAsync(
      `DELETE FROM exercises WHERE id = ${toSqlValue(id)}`
    );
  }

  async searchByName(query: string): Promise<Exercise[]> {
    const rows = await this.db.getAllAsync<ExerciseRow>(
      `SELECT * FROM exercises WHERE name LIKE '%${escapeSqlString(query)}%' ORDER BY created_at DESC`
    );

    if (!rows?.length) {
      return [];
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category ?? undefined,
      description: row.description ?? undefined,
      createdAt: row.created_at
    }));
  }

  async getByCategory(category: string): Promise<Exercise[]> {
    const rows = await this.db.getAllAsync<ExerciseRow>(
      `SELECT * FROM exercises WHERE category = ${toSqlValue(category)} ORDER BY created_at DESC`
    );

    if (!rows?.length) {
      return [];
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category ?? undefined,
      description: row.description ?? undefined,
      createdAt: row.created_at
    }));
  }
} 