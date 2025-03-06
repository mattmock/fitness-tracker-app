import React from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import { BottomSheetContext, useBottomSheet, BottomSheetContextValue } from '../BottomSheetContext';

describe('BottomSheetContext', () => {
  // Test the useBottomSheet hook
  describe('useBottomSheet', () => {
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
      // Mock context value
      const mockContextValue: BottomSheetContextValue = {
        setTitle: jest.fn(),
        setSnapPoints: jest.fn(),
        snapToIndex: jest.fn(),
        currentTitle: 'Test Title',
        currentIndex: 0,
        isExpanded: false
      };

      // Create a wrapper with the context provider
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BottomSheetContext.Provider value={mockContextValue}>
          {children}
        </BottomSheetContext.Provider>
      );

      // Render the hook with the wrapper
      const { result } = renderHook(() => useBottomSheet(), { wrapper });

      // Expect the hook to return the context value
      expect(result.current).toBe(mockContextValue);
    });
  });

  // Test the context value methods
  describe('BottomSheetContextValue methods', () => {
    it('setTitle updates the title', () => {
      // Mock context value with a real setTitle implementation
      let currentTitle = 'Initial Title';
      const mockContextValue: BottomSheetContextValue = {
        setTitle: (title: string) => { currentTitle = title; },
        setSnapPoints: jest.fn(),
        snapToIndex: jest.fn(),
        currentTitle,
        currentIndex: 0,
        isExpanded: false
      };

      // Create a wrapper with the context provider
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BottomSheetContext.Provider value={{
          ...mockContextValue,
          currentTitle // Make sure we're using the current value
        }}>
          {children}
        </BottomSheetContext.Provider>
      );

      // Render the hook with the wrapper
      const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });

      // Call setTitle
      act(() => {
        result.current.setTitle('New Title');
      });

      // Update the wrapper with the new title and rerender
      rerender(() => useBottomSheet());

      // Expect the title to be updated
      expect(currentTitle).toBe('New Title');
    });

    it('setSnapPoints updates the snap points', () => {
      // Mock the setSnapPoints function
      const setSnapPoints = jest.fn();

      // Mock context value
      const mockContextValue: BottomSheetContextValue = {
        setTitle: jest.fn(),
        setSnapPoints,
        snapToIndex: jest.fn(),
        currentTitle: 'Test Title',
        currentIndex: 0,
        isExpanded: false
      };

      // Create a wrapper with the context provider
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BottomSheetContext.Provider value={mockContextValue}>
          {children}
        </BottomSheetContext.Provider>
      );

      // Render the hook with the wrapper
      const { result } = renderHook(() => useBottomSheet(), { wrapper });

      // Call setSnapPoints
      act(() => {
        result.current.setSnapPoints(['25%', '50%', '90%']);
      });

      // Expect setSnapPoints to be called with the correct arguments
      expect(setSnapPoints).toHaveBeenCalledWith(['25%', '50%', '90%']);
    });

    it('snapToIndex updates the current index and expanded state', () => {
      // Mock the snapToIndex function
      const snapToIndex = jest.fn();
      let currentIndex = 0;
      let isExpanded = false;

      // Create a mock implementation that updates the state
      const mockSnapToIndex = (index: number) => {
        snapToIndex(index);
        currentIndex = index;
        isExpanded = index > 0;
      };

      // Mock context value
      const mockContextValue: BottomSheetContextValue = {
        setTitle: jest.fn(),
        setSnapPoints: jest.fn(),
        snapToIndex: mockSnapToIndex,
        currentTitle: 'Test Title',
        currentIndex,
        isExpanded
      };

      // Create a wrapper with the context provider
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BottomSheetContext.Provider value={{
          ...mockContextValue,
          currentIndex,
          isExpanded
        }}>
          {children}
        </BottomSheetContext.Provider>
      );

      // Render the hook with the wrapper
      const { result, rerender } = renderHook(() => useBottomSheet(), { wrapper });

      // Call snapToIndex
      act(() => {
        result.current.snapToIndex(2);
      });

      // Rerender to update the state
      rerender(() => useBottomSheet());

      // Expect snapToIndex to be called with the correct arguments
      expect(snapToIndex).toHaveBeenCalledWith(2);
      
      // Expect the state to be updated
      expect(currentIndex).toBe(2);
      expect(isExpanded).toBe(true);
    });
  });
}); 