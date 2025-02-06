import type { Exercise } from '@db/models/Exercise';
import type { Routine } from '@db/models/Routine';
import type { Session } from '@db/models/Session'; 
import type { SessionExercise } from '@db/models/SessionExercise';

export interface IExerciseService {
  getExercises(): Promise<Exercise[]>;
  getRoutines(): Promise<Routine[]>;
  getSessions(): Promise<Session[]>;
  getSessionExercises(): Promise<SessionExercise[]>;
}