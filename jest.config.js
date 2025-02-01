module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo/vector-icons/.*)'
  ],
  moduleNameMapper: {
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.ts',
  }
}; 