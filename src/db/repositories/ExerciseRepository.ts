import { SQLiteDatabase } from 'expo-sqlite';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  variations?: string[];
  createdAt: string;
  updatedAt?: string;
}

export class ExerciseRepository {
  constructor(private db: SQLiteDatabase) {}

  async create(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.runAsync(
      `INSERT INTO Exercise (id, name, description, category, tags, variations, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        exercise.name,
        exercise.description ?? null,
        exercise.category ?? null,
        JSON.stringify(exercise.tags ?? []),
        JSON.stringify(exercise.variations ?? []),
        new Date().toISOString()
      ]
    );
    return id;
  }

  async getById(id: string): Promise<Exercise | null> {
    const result = await this.db.getFirstAsync<{
      id: string;
      name: string;
      description?: string;
      category?: string;
      tags: string;
      variations: string;
      createdAt: string;
      updatedAt?: string;
    }>('SELECT * FROM Exercise WHERE id = ?', [id]);

    if (!result) return null;

    return {
      ...result,
      tags: JSON.parse(result.tags || '[]'),
      variations: JSON.parse(result.variations || '[]')
    };
  }

  async getAll(): Promise<Exercise[]> {
    const results = await this.db.getAllAsync<{
      id: string;
      name: string;
      description?: string;
      category?: string;
      tags: string;
      variations: string;
      createdAt: string;
      updatedAt?: string;
    }>('SELECT * FROM Exercise ORDER BY name ASC');

    return (results || []).map(ex => ({
      ...ex,
      tags: JSON.parse(ex.tags || '[]'),
      variations: JSON.parse(ex.variations || '[]')
    }));
  }

  async update(id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>): Promise<void> {
    // Validate at least one field is being updated
    if (Object.keys(exercise).length === 0) {
      throw new Error('No fields provided for update');
    }

    await this.db.runAsync(
      `UPDATE Exercise SET
        name = ?,
        description = ?,
        category = ?,
        tags = ?,
        variations = ?,
        updatedAt = ?
       WHERE id = ?`,
      [
        exercise.name ?? null,  // Explicit null for optional fields
        exercise.description ?? null,
        exercise.category ?? null,
        exercise.tags ? JSON.stringify(exercise.tags) : null,
        exercise.variations ? JSON.stringify(exercise.variations) : null,
        new Date().toISOString(),
        id
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM Exercise WHERE id = ?',
      [id]
    );
  }

  // ... more methods to come ...
} 