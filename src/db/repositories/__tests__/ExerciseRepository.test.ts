import { ExerciseRepository } from '../ExerciseRepository';
import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

jest.mock('expo-sqlite');

// Mock database state
let mockExercises: Array<{
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags: string;
  variations: string;
  createdAt: string;
  updatedAt?: string;
}> = [];

const mockRunAsync = jest.fn().mockImplementation((query, params) => {
  // Handle INSERT
  if (query.startsWith('INSERT')) {
    mockExercises.push({
      id: params[0],
      name: params[1],
      description: params[2],
      category: params[3],
      tags: params[4],
      variations: params[5],
      createdAt: params[6]
    });
  }
  // Handle UPDATE
  else if (query.startsWith('UPDATE')) {
    const index = mockExercises.findIndex(e => e.id === params[6]);
    if (index >= 0) {
      mockExercises[index] = {
        ...mockExercises[index],
        name: params[0] ?? mockExercises[index].name,
        description: params[1] ?? mockExercises[index].description,
        category: params[2] ?? mockExercises[index].category,
        tags: params[3] ?? mockExercises[index].tags,
        variations: params[4] ?? mockExercises[index].variations,
        updatedAt: params[5]
      };
    }
  }
  // Handle DELETE
  else if (query.startsWith('DELETE')) {
    mockExercises = mockExercises.filter(e => e.id !== params[0]);
  }
  return Promise.resolve({});
});

(openDatabaseAsync as jest.Mock).mockImplementation(() => ({
  runAsync: mockRunAsync,
  getFirstAsync: jest.fn().mockImplementation((query, params) => {
    const id = params?.[0];
    const exercise = mockExercises.find(e => e.id === id);
    return Promise.resolve(exercise ? {...exercise} : null);
  }),
  getAllAsync: jest.fn().mockImplementation(() => {
    return Promise.resolve([...mockExercises]);
  }),
  closeAsync: jest.fn()
}));

describe('ExerciseRepository', () => {
  let repo: ExerciseRepository;
  let db: SQLiteDatabase;

  beforeEach(async () => {
    mockExercises = [];
    db = await openDatabaseAsync(':memory:');
    repo = new ExerciseRepository(db);
  });

  it('should create and retrieve an exercise', async () => {
    const id = await repo.create({
      name: 'Push Up',
      description: 'Basic bodyweight exercise',
      category: 'Chest'
    });
    
    const result = await repo.getById(id);
    expect(result?.name).toBe('Push Up');
  });

  it('should update an exercise', async () => {
    const id = await repo.create({ name: 'Old Name' });
    await repo.update(id, { name: 'New Name' });
    
    const updated = await repo.getById(id);
    expect(updated?.name).toBe('New Name');
  });

  it('should delete an exercise', async () => {
    const id = await repo.create({ name: 'To Delete' });
    await repo.delete(id);
    
    const deleted = await repo.getById(id);
    expect(deleted).toBeNull();
  });
}); 