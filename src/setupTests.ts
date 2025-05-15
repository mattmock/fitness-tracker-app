import '@testing-library/react-native';
import type { TimerOptions } from 'node:timers';

// Polyfill for setImmediate
if (typeof global.setImmediate === 'undefined') {
  const setImmediatePolyfill = (callback: (...args: any[]) => void, ...args: any[]): NodeJS.Timeout => {
    return setTimeout(callback, 0, ...args);
  };
  
  // Add the promisify method to match the Node.js type
  setImmediatePolyfill.__promisify__ = <T>(value?: T, options?: TimerOptions): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(value as T), 0);
    });
  };

  global.setImmediate = setImmediatePolyfill as unknown as typeof setImmediate;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toHaveProp(prop: string, value?: any): R;
    }
  }
}

// Mock Expo Font module
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock the AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return {
    ...Reanimated,
    useAnimatedStyle: () => ({}),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
    withSpring: (value: number) => value,
    withDelay: (delay: number, value: number) => value,
    withSequence: (...values: number[]) => values[values.length - 1],
    withRepeat: (value: number) => value,
    cancelAnimation: jest.fn(),
    runOnJS: (fn: Function) => fn,
  };
});

// Silence specific warnings that might occur during testing
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('useNativeDriver') ||
     args[0].includes('AnimatedComponent'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Add any other global mocks needed for your tests 