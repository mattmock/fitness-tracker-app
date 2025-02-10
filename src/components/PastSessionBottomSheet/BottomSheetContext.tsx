import React from 'react';
import type { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

export interface BottomSheetContextValue {
  // Methods to control the bottom sheet
  setTitle: (title: string) => void;
  setSnapPoints: (points: (string | number)[]) => void;
  snapToIndex: (index: number) => void;
  
  // Current state
  currentTitle: string;
  currentIndex: number;
  isExpanded: boolean;
}

export const BottomSheetContext = React.createContext<BottomSheetContextValue | null>(null);

export function useBottomSheet() {
  const context = React.useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a PastSessionBottomSheet');
  }
  return context;
} 