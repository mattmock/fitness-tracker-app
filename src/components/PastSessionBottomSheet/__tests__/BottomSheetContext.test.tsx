/**
 * BottomSheetContext.test.tsx
 * 
 * Tests for the BottomSheetContext focusing on:
 * 1. Context initialization and provider setup
 * 2. Hook usage and error handling
 * 3. State management and updates
 * 4. Edge cases and error conditions
 */

import React from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import { BottomSheetContext, useBottomSheet, BottomSheetContextValue } from '../BottomSheetContext';

// Helper function to create a mock context value
const createMockContextValue = (
  overrides: Partial<BottomSheetContextValue> = {}
): BottomSheetContextValue => ({
  setTitle: jest.fn(),
  setSnapPoints: jest.fn(),
  snapToIndex: jest.fn(),
  currentTitle: 'Test Title',
  currentIndex: 0,
  isExpanded: false,
  ...overrides
});

// Helper function to create a wrapper component
const createWrapper = (contextValue: BottomSheetContextValue) => {
  return ({ children }: { children: React.ReactNode }) => (
    <BottomSheetContext.Provider value={contextValue}>
      {children}
    </BottomSheetContext.Provider>
  );
};

describe('BottomSheetContext', () => {
  describe('useBottomSheet Hook', () => {
    it('throws an error when used outside of a provider', () => {
      // Silence the error console during this test
      const originalError = console.error;
      console.error = jest.fn();
      
      // Attempt to use the hook without a provider
      let error;
      try {
        renderHook(() => useBottomSheet());
      } catch (e) {
        error = e;
      }
      
      // Expect an error to be thrown
      expect(error).toEqual(
        Error('useBottomSheet must be used within a PastSessionBottomSheet')
      );
      
      // Restore console.error
      console.error = originalError;
    });

    it('returns the context value when used within a provider', () => {
      const mockContextValue = createMockContextValue();
      const wrapper = createWrapper(mockContextValue);

      const { result } = renderHook(() => useBottomSheet(), { wrapper });
      expect(result.current).toBe(mockContextValue);
    });

    it('maintains referential equality of context value', () => {
      const mockContextValue = createMockContextValue();
      const wrapper = createWrapper(mockContextValue);

      const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });
      const firstResult = result.current;

      // Rerender the component
      rerender(() => useBottomSheet());

      // The context value should maintain referential equality
      expect(result.current).toBe(firstResult);
    });
  });

  describe('Context State Management', () => {
    describe('Title Management', () => {
      it('updates the title correctly', () => {
        let currentTitle = 'Initial Title';
        const mockContextValue = createMockContextValue({
          setTitle: (title: string) => { currentTitle = title; },
          currentTitle
        });

        const wrapper = createWrapper(mockContextValue);
        const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });

        act(() => {
          result.current.setTitle('New Title');
        });

        rerender(() => useBottomSheet());
        expect(currentTitle).toBe('New Title');
      });

      it('handles empty title gracefully', () => {
        let currentTitle = 'Initial Title';
        const mockContextValue = createMockContextValue({
          setTitle: (title: string) => { currentTitle = title; },
          currentTitle
        });

        const wrapper = createWrapper(mockContextValue);
        const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });

        act(() => {
          result.current.setTitle('');
        });

        rerender(() => useBottomSheet());
        expect(currentTitle).toBe('');
      });
    });

    describe('Snap Points Management', () => {
      it('updates snap points correctly', () => {
        const setSnapPoints = jest.fn();
        const mockContextValue = createMockContextValue({ setSnapPoints });
        const wrapper = createWrapper(mockContextValue);

        const { result } = renderHook(() => useBottomSheet(), { wrapper });

        act(() => {
          result.current.setSnapPoints(['25%', '50%', '90%']);
        });

        expect(setSnapPoints).toHaveBeenCalledWith(['25%', '50%', '90%']);
      });

      it('handles empty snap points array', () => {
        const setSnapPoints = jest.fn();
        const mockContextValue = createMockContextValue({ setSnapPoints });
        const wrapper = createWrapper(mockContextValue);

        const { result } = renderHook(() => useBottomSheet(), { wrapper });

        act(() => {
          result.current.setSnapPoints([]);
        });

        expect(setSnapPoints).toHaveBeenCalledWith([]);
      });
    });

    describe('Index and Expansion State', () => {
      it('updates index and expansion state correctly', () => {
        let currentIndex = 0;
        let isExpanded = false;
        const mockContextValue = createMockContextValue({
          snapToIndex: (index: number) => {
            currentIndex = index;
            isExpanded = index > 0;
          },
          currentIndex,
          isExpanded
        });

        const wrapper = createWrapper(mockContextValue);
        const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });

        act(() => {
          result.current.snapToIndex(2);
        });

        rerender(() => useBottomSheet());
        expect(currentIndex).toBe(2);
        expect(isExpanded).toBe(true);
      });

      it('handles negative index gracefully', () => {
        let currentIndex = 0;
        let isExpanded = false;
        const mockContextValue = createMockContextValue({
          snapToIndex: (index: number) => {
            currentIndex = Math.max(0, index);
            isExpanded = currentIndex > 0;
          },
          currentIndex,
          isExpanded
        });

        const wrapper = createWrapper(mockContextValue);
        const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });

        act(() => {
          result.current.snapToIndex(-1);
        });

        rerender(() => useBottomSheet());
        expect(currentIndex).toBe(0);
        expect(isExpanded).toBe(false);
      });

      it('handles out-of-bounds index gracefully', () => {
        let currentIndex = 0;
        let isExpanded = false;
        const mockContextValue = createMockContextValue({
          snapToIndex: (index: number) => {
            currentIndex = Math.min(2, Math.max(0, index));
            isExpanded = currentIndex > 0;
          },
          currentIndex,
          isExpanded
        });

        const wrapper = createWrapper(mockContextValue);
        const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });

        act(() => {
          result.current.snapToIndex(5);
        });

        rerender(() => useBottomSheet());
        expect(currentIndex).toBe(2);
        expect(isExpanded).toBe(true);
      });
    });
  });
}); 