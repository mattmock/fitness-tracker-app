export interface Routine {
  id: string;
  name: string;
  description?: string;
  exerciseIds: string[];
  createdAt: string;
  updatedAt?: string;
} 