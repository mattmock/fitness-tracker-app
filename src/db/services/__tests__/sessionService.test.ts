import { type SQLiteDatabase } from 'expo-sqlite';
import { SessionService, type Session } from '../sessionService';

// Mock SQLiteDatabase
class MockSQLiteDatabase implements Partial<SQLiteDatabase> {
  execAsync = jest.fn();
  getAllAsync = jest.fn();
}

describe('SessionService', () => {
  let mockDb: MockSQLiteDatabase;
  let service: SessionService;
  const mockDate = '2024-02-13T00:00:00.000Z';
  const mockTimestamp = '1707782400000'; // Equivalent to mockDate

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() and toISOString for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(parseInt(mockTimestamp));
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
    mockDb = new MockSQLiteDatabase();
    service = new SessionService(mockDb as unknown as SQLiteDatabase);
  });

  describe('create', () => {
    const mockSession = {
      name: 'Morning Workout',
      routineId: 'routine-1',
      notes: 'Great session',
      startTime: '2024-02-13T08:00:00.000Z',
      endTime: '2024-02-13T09:00:00.000Z'
    };

    const mockExercises = [
      {
        exerciseId: 'exercise-1',
        setNumber: 1,
        reps: 12,
        weight: 100,
        notes: 'Felt strong'
      },
      {
        exerciseId: 'exercise-1',
        setNumber: 2,
        reps: 10,
        weight: 100
      }
    ];

    it('creates a session with all fields and exercises', async () => {
      await service.create(mockSession, mockExercises);

      // Check session creation
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO sessions (id, routine_id, name, notes, start_time, end_time, created_at)
         VALUES ('${mockTimestamp}', 'routine-1', 'Morning Workout', 'Great session', '2024-02-13T08:00:00.000Z', '2024-02-13T09:00:00.000Z', '${mockDate}')`
      );

      // Check exercise insertions
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, weight, duration, notes, created_at)
           VALUES ('${mockTimestamp}', 'exercise-1', 1, 12, 100, NULL, 'Felt strong', '${mockDate}')`
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, weight, duration, notes, created_at)
           VALUES ('${mockTimestamp}', 'exercise-1', 2, 10, 100, NULL, NULL, '${mockDate}')`
      );

      // Check transaction handling
      expect(mockDb.execAsync).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenCalledWith('COMMIT');
    });

    it('creates a session with minimal fields', async () => {
      const minimalSession = {
        name: 'Quick Workout',
        startTime: '2024-02-13T08:00:00.000Z'
      };

      await service.create(minimalSession, []);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO sessions (id, routine_id, name, notes, start_time, end_time, created_at)
         VALUES ('${mockTimestamp}', NULL, 'Quick Workout', NULL, '2024-02-13T08:00:00.000Z', NULL, '${mockDate}')`
      );
    });

    it('rolls back transaction on error', async () => {
      // Mock the transaction sequence
      mockDb.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION succeeds
        .mockRejectedValueOnce(new Error('Database error')) // First operation fails
        .mockResolvedValueOnce(undefined); // ROLLBACK succeeds

      await expect(service.create(mockSession, mockExercises)).rejects.toThrow('Database error');
      
      // Verify transaction sequence
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    });

    it('throws error when name is missing', async () => {
      const invalidSession = {
        startTime: '2024-02-13T08:00:00.000Z'
      } as Omit<Session, 'id' | 'createdAt' | 'exercises'>;

      await expect(service.create(invalidSession, [])).rejects.toThrow('Session must have a name and start time');
    });

    it('throws error when startTime is missing', async () => {
      const invalidSession = {
        name: 'Morning Workout'
      } as Omit<Session, 'id' | 'createdAt' | 'exercises'>;

      await expect(service.create(invalidSession, [])).rejects.toThrow('Session must have a name and start time');
    });

    it('handles special characters in session name and notes', async () => {
      const sessionWithSpecialChars = {
        name: "O'Connor's Workout",
        notes: "Don't skip leg day!",
        startTime: '2024-02-13T08:00:00.000Z'
      } as Omit<Session, 'id' | 'createdAt' | 'exercises'>;

      await service.create(sessionWithSpecialChars, []);

      // Verify the transaction starts
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');

      // Verify the insert statement with escaped special characters
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(2,
        `INSERT INTO sessions (id, routine_id, name, notes, start_time, end_time, created_at)
         VALUES ('${mockTimestamp}', NULL, 'O''Connor''s Workout', 'Don''t skip leg day!', '2024-02-13T08:00:00.000Z', NULL, '2024-02-13T00:00:00.000Z')`
      );

      // Verify the transaction commits
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'COMMIT');
    });
  });

  describe('getById', () => {
    it('returns null when session not found', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE s.id = 'non-existent'")
      );
    });

    it('returns session with exercises when found', async () => {
      const mockRows = [
        {
          id: 'session-1',
          routine_id: 'routine-1',
          name: 'Morning Workout',
          notes: 'Great session',
          start_time: '2024-02-13T08:00:00.000Z',
          end_time: '2024-02-13T09:00:00.000Z',
          created_at: mockDate,
          session_id: 'session-1',
          exercise_id: 'exercise-1',
          set_number: 1,
          reps: 12,
          weight: 100,
          duration: null,
          exercise_notes: 'Felt strong'
        }
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getById('session-1');

      expect(result).toEqual({
        id: 'session-1',
        routineId: 'routine-1',
        name: 'Morning Workout',
        notes: 'Great session',
        startTime: '2024-02-13T08:00:00.000Z',
        endTime: '2024-02-13T09:00:00.000Z',
        createdAt: mockDate,
        exercises: [{
          id: 'session-1-exercise-1-1',
          sessionId: 'session-1',
          exerciseId: 'exercise-1',
          setNumber: 1,
          reps: 12,
          weight: 100,
          notes: 'Felt strong',
          createdAt: mockDate
        }]
      });
    });

    it('handles session without exercises', async () => {
      const mockRows = [{
        id: 'session-1',
        routine_id: null,
        name: 'Morning Workout',
        notes: null,
        start_time: '2024-02-13T08:00:00.000Z',
        end_time: null,
        created_at: mockDate,
        session_id: 'session-1',
        exercise_id: null,
        set_number: null,
        reps: null,
        weight: null,
        duration: null,
        exercise_notes: null
      }];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getById('session-1');

      expect(result).toEqual({
        id: 'session-1',
        name: 'Morning Workout',
        startTime: '2024-02-13T08:00:00.000Z',
        createdAt: mockDate,
        exercises: []
      });
    });
  });

  describe('getAll', () => {
    it('returns empty array when no sessions exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('returns all sessions with their exercises', async () => {
      const mockRows = [
        {
          id: 'session-1',
          routine_id: 'routine-1',
          name: 'Morning Workout',
          notes: 'Great session',
          start_time: '2024-02-13T08:00:00.000Z',
          end_time: '2024-02-13T09:00:00.000Z',
          created_at: mockDate,
          session_id: 'session-1',
          exercise_id: 'exercise-1',
          set_number: 1,
          reps: 12,
          weight: 100,
          duration: null,
          exercise_notes: 'Felt strong'
        },
        {
          id: 'session-2',
          routine_id: null,
          name: 'Quick Workout',
          notes: null,
          start_time: '2024-02-13T10:00:00.000Z',
          end_time: null,
          created_at: mockDate,
          session_id: 'session-2',
          exercise_id: null,
          set_number: null,
          reps: null,
          weight: null,
          duration: null,
          exercise_notes: null
        }
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getAll();

      expect(result).toEqual([
        {
          id: 'session-1',
          routineId: 'routine-1',
          name: 'Morning Workout',
          notes: 'Great session',
          startTime: '2024-02-13T08:00:00.000Z',
          endTime: '2024-02-13T09:00:00.000Z',
          createdAt: mockDate,
          exercises: [{
            id: 'session-1-exercise-1-1',
            sessionId: 'session-1',
            exerciseId: 'exercise-1',
            setNumber: 1,
            reps: 12,
            weight: 100,
            notes: 'Felt strong',
            createdAt: mockDate
          }]
        },
        {
          id: 'session-2',
          name: 'Quick Workout',
          startTime: '2024-02-13T10:00:00.000Z',
          createdAt: mockDate,
          exercises: []
        }
      ]);
    });
  });

  describe('update', () => {
    it('updates all provided fields', async () => {
      const updates = {
        name: 'Updated Workout',
        notes: 'Updated notes',
        endTime: '2024-02-13T10:00:00.000Z'
      };

      await service.update('session-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE sessions SET name = 'Updated Workout', notes = 'Updated notes', end_time = '2024-02-13T10:00:00.000Z' WHERE id = 'session-1'"
      );
    });

    it('handles partial updates', async () => {
      const updates = {
        name: 'Updated Workout'
      };

      await service.update('session-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE sessions SET name = 'Updated Workout' WHERE id = 'session-1'"
      );
    });

    it('does nothing when no updates provided', async () => {
      await service.update('session-1', {});

      expect(mockDb.execAsync).not.toHaveBeenCalled();
    });

    it('handles empty string values in updates', async () => {
      const updates = {
        name: '',
        notes: ''
      };

      await service.update('session-1', updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE sessions SET name = NULL, notes = NULL WHERE id = 'session-1'"
      );
    });
  });

  describe('updateExercise', () => {
    it('updates all provided exercise fields', async () => {
      const updates = {
        reps: 15,
        weight: 120,
        notes: 'Updated notes'
      };

      await service.updateExercise('session-1', 'exercise-1', 1, updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE session_exercises SET reps = '15', weight = '120', notes = 'Updated notes' WHERE session_id = 'session-1' AND exercise_id = 'exercise-1' AND set_number = 1"
      );
    });

    it('handles partial exercise updates', async () => {
      const updates = {
        reps: 15
      };

      await service.updateExercise('session-1', 'exercise-1', 1, updates);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "UPDATE session_exercises SET reps = '15' WHERE session_id = 'session-1' AND exercise_id = 'exercise-1' AND set_number = 1"
      );
    });

    it('does nothing when no updates provided', async () => {
      await service.updateExercise('session-1', 'exercise-1', 1, {});

      expect(mockDb.execAsync).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes session and its exercises in correct order', async () => {
      await service.delete('session-1');

      expect(mockDb.execAsync).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "DELETE FROM session_exercises WHERE session_id = 'session-1'"
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        "DELETE FROM sessions WHERE id = 'session-1'"
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith('COMMIT');
    });

    it('rolls back transaction on error', async () => {
      // Mock the transaction sequence
      mockDb.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION succeeds
        .mockRejectedValueOnce(new Error('Database error')) // First operation fails
        .mockResolvedValueOnce(undefined); // ROLLBACK succeeds

      await expect(service.delete('session-1')).rejects.toThrow('Database error');
      
      // Verify transaction sequence
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(mockDb.execAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    });
  });

  describe('getByDateRange', () => {
    it('returns empty array when no sessions in range', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await service.getByDateRange('2024-02-13T00:00:00.000Z', '2024-02-14T00:00:00.000Z');

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE s.start_time >= '2024-02-13T00:00:00.000Z' AND s.start_time <= '2024-02-14T00:00:00.000Z'")
      );
    });

    it('returns sessions within date range with exercises', async () => {
      const mockRows = [
        {
          id: 'session-1',
          routine_id: 'routine-1',
          name: 'Morning Workout',
          notes: 'Great session',
          start_time: '2024-02-13T08:00:00.000Z',
          end_time: '2024-02-13T09:00:00.000Z',
          created_at: mockDate,
          exercise_id: 'exercise-1',
          set_number: 1,
          reps: 12,
          weight: 100,
          duration: null,
          exercise_notes: 'Felt strong'
        },
        {
          id: 'session-1',
          routine_id: 'routine-1',
          name: 'Morning Workout',
          notes: 'Great session',
          start_time: '2024-02-13T08:00:00.000Z',
          end_time: '2024-02-13T09:00:00.000Z',
          created_at: mockDate,
          exercise_id: 'exercise-2',
          set_number: 1,
          reps: null,
          weight: null,
          duration: 300,
          exercise_notes: null
        }
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getByDateRange('2024-02-13T00:00:00.000Z', '2024-02-14T00:00:00.000Z');

      expect(result).toEqual([{
        id: 'session-1',
        routineId: 'routine-1',
        name: 'Morning Workout',
        notes: 'Great session',
        startTime: '2024-02-13T08:00:00.000Z',
        endTime: '2024-02-13T09:00:00.000Z',
        createdAt: mockDate,
        exercises: [
          {
            id: 'session-1-exercise-1-1',
            sessionId: 'session-1',
            exerciseId: 'exercise-1',
            setNumber: 1,
            reps: 12,
            weight: 100,
            notes: 'Felt strong',
            createdAt: mockDate
          },
          {
            id: 'session-1-exercise-2-1',
            sessionId: 'session-1',
            exerciseId: 'exercise-2',
            setNumber: 1,
            duration: 300,
            createdAt: mockDate
          }
        ]
      }]);
    });

    it('handles sessions with no exercises in date range', async () => {
      const mockRows = [{
        id: 'session-1',
        routine_id: null,
        name: 'Morning Workout',
        notes: null,
        start_time: '2024-02-13T08:00:00.000Z',
        end_time: null,
        created_at: mockDate,
        exercise_id: null,
        set_number: null,
        reps: null,
        weight: null,
        duration: null,
        exercise_notes: null
      }];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getByDateRange('2024-02-13T00:00:00.000Z', '2024-02-14T00:00:00.000Z');

      expect(result).toEqual([{
        id: 'session-1',
        name: 'Morning Workout',
        startTime: '2024-02-13T08:00:00.000Z',
        createdAt: mockDate,
        exercises: []
      }]);
    });
  });

  describe('getAll additional cases', () => {
    it('handles multiple sessions with mixed exercise data', async () => {
      const mockRows = [
        {
          id: 'session-1',
          routine_id: 'routine-1',
          name: 'Morning Workout',
          notes: 'Great session',
          start_time: '2024-02-13T08:00:00.000Z',
          end_time: '2024-02-13T09:00:00.000Z',
          created_at: mockDate,
          exercise_id: 'exercise-1',
          set_number: 1,
          reps: 12,
          weight: 100,
          duration: null,
          exercise_notes: 'Felt strong'
        },
        {
          id: 'session-2',
          routine_id: null,
          name: 'Evening Workout',
          notes: null,
          start_time: '2024-02-13T18:00:00.000Z',
          end_time: null,
          created_at: mockDate,
          exercise_id: null,
          set_number: null,
          reps: null,
          weight: null,
          duration: null,
          exercise_notes: null
        }
      ];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await service.getAll();

      expect(result).toEqual([
        {
          id: 'session-1',
          routineId: 'routine-1',
          name: 'Morning Workout',
          notes: 'Great session',
          startTime: '2024-02-13T08:00:00.000Z',
          endTime: '2024-02-13T09:00:00.000Z',
          createdAt: mockDate,
          exercises: [{
            id: 'session-1-exercise-1-1',
            sessionId: 'session-1',
            exerciseId: 'exercise-1',
            setNumber: 1,
            reps: 12,
            weight: 100,
            notes: 'Felt strong',
            createdAt: mockDate
          }]
        },
        {
          id: 'session-2',
          name: 'Evening Workout',
          startTime: '2024-02-13T18:00:00.000Z',
          createdAt: mockDate,
          exercises: []
        }
      ]);
    });
  });

  describe('create edge cases', () => {
    it('handles exercise with all optional fields as null', async () => {
      const session = {
        name: 'Workout',
        startTime: '2024-02-13T08:00:00.000Z'
      };
      const exercises = [{
        exerciseId: 'exercise-1',
        setNumber: 1
      }];

      await service.create(session, exercises);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining("VALUES ('1707782400000', NULL, 'Workout', NULL, '2024-02-13T08:00:00.000Z', NULL, '2024-02-13T00:00:00.000Z')")
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining("VALUES ('1707782400000', 'exercise-1', 1, NULL, NULL, NULL, NULL, '2024-02-13T00:00:00.000Z')")
      );
    });
  });

  describe('update edge cases', () => {
    it('handles undefined values in exercise updates', async () => {
      const updates = {
        reps: undefined,
        weight: undefined,
        duration: undefined,
        notes: undefined
      };

      await service.updateExercise('session-1', 'exercise-1', 1, updates);

      // Should not generate any SQL as all values are undefined
      expect(mockDb.execAsync).not.toHaveBeenCalled();
    });
  });

  describe('addExerciseToSession', () => {
    it('adds exercise with all fields to session', async () => {
      const exercise = {
        exerciseId: 'exercise-1',
        setNumber: 1,
        reps: 12,
        weight: 100,
        notes: 'Felt strong'
      };

      await service.addExerciseToSession('session-1', exercise);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, weight, duration, notes, created_at)
       VALUES ('session-1', 'exercise-1', 1, 12, 100, NULL, 'Felt strong', '${mockDate}')`
      );
    });

    it('adds exercise with minimal fields to session', async () => {
      const exercise = {
        exerciseId: 'exercise-1',
        setNumber: 1
      };

      await service.addExerciseToSession('session-1', exercise);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, weight, duration, notes, created_at)
       VALUES ('session-1', 'exercise-1', 1, NULL, NULL, NULL, NULL, '${mockDate}')`
      );
    });

    it('adds exercise with duration instead of reps/weight', async () => {
      const exercise = {
        exerciseId: 'exercise-1',
        setNumber: 1,
        duration: 300
      };

      await service.addExerciseToSession('session-1', exercise);

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        `INSERT INTO session_exercises (session_id, exercise_id, set_number, reps, weight, duration, notes, created_at)
       VALUES ('session-1', 'exercise-1', 1, NULL, NULL, 300, NULL, '${mockDate}')`
      );
    });
  });
}); 