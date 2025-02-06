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