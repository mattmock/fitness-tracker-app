module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|expo-sqlite|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@env$': '<rootDir>/src/__mocks__/env.js',
    // Animation and gesture mocks
    '^react-native-gesture-handler$': '<rootDir>/src/__mocks__/react-native-gesture-handler/mock.js',
    '^@gorhom/bottom-sheet$': '<rootDir>/src/__mocks__/@gorhom/bottom-sheet/mock.js',
    '^react-native/Libraries/Animated/Animated$': '<rootDir>/src/__mocks__/react-native/Animated.js',
    '^react-native-reanimated$': '<rootDir>/src/__mocks__/react-native-reanimated/mock.js',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testTimeout: 10000
}; 