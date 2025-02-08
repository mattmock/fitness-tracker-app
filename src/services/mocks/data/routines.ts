import { Routine } from '@db/models/Routine';

export const mockRoutines: Routine[] = [
  {
    id: '1',
    name: 'Full Body Beginner',
    description: 'Basic full body routine for beginners',
    exerciseIds: ['1', '2', '3'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Upper Body Strength',
    description: 'Focus on chest, back, and arms',
    exerciseIds: ['1', '2', '4'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Core Conditioning',
    description: 'Core-focused routine',
    exerciseIds: ['4', '5'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Cardio Blast',
    description: 'High-intensity cardio workout',
    exerciseIds: ['5'],
    createdAt: new Date().toISOString()
  }
]; 