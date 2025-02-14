import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { View, Text } from 'react-native';
import { DatabaseProvider } from '../provider';
import { DATABASE_NAME } from '../../schema/schema';
import * as databaseSetup from '../databaseSetup';
import { ExerciseService, RoutineService, SessionService } from '../../services';
import { DatabaseContext } from '../hooks';
import type { DatabaseContextValue } from '../types';

// Mock the services
class MockExerciseService {
    constructor(public db: any) {}
}

class MockRoutineService {
    constructor(public db: any) {}
}

class MockSessionService {
    constructor(public db: any) {}
}

jest.mock('../../services', () => ({
    ExerciseService: jest.fn().mockImplementation((db) => new MockExerciseService(db)),
    RoutineService: jest.fn().mockImplementation((db) => new MockRoutineService(db)),
    SessionService: jest.fn().mockImplementation((db) => new MockSessionService(db)),
}));

// Mock SQLite database
const mockExecAsync = jest.fn(() => Promise.resolve());
const mockDb = {
    execAsync: mockExecAsync,
    // Add other methods as needed
};

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
    SQLiteProvider: ({ children, onInit }: { children: React.ReactNode, onInit?: (db: any) => Promise<void> }) => {
        // Call onInit immediately if provided
        if (onInit) {
            onInit(mockDb);
        }
        return children;
    },
    useSQLiteContext: () => mockDb,
}));

const MockChild = () => <Text testID="test-child">Test Child</Text>;

describe('DatabaseProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock migrateDbIfNeeded for each test
        jest.spyOn(databaseSetup, 'migrateDbIfNeeded').mockResolvedValue();
    });

    it('renders children', async () => {
        render(<DatabaseProvider><MockChild /></DatabaseProvider>);
        expect(screen.getByTestId('test-child')).toBeTruthy();
    });

    it('calls migrateDbIfNeeded on initialization', async () => {
        render(<DatabaseProvider><MockChild /></DatabaseProvider>);
        await waitFor(() => {
            expect(databaseSetup.migrateDbIfNeeded).toHaveBeenCalledTimes(1);
            expect(databaseSetup.migrateDbIfNeeded).toHaveBeenCalledWith(mockDb);
        });
    });

    it('provides the database context with services', async () => {
        let contextValue: DatabaseContextValue | null = null;
        const TestComponent = () => {
            const context = React.useContext(DatabaseContext);
            contextValue = context;
            return <Text>Test</Text>;
        };

        render(
            <DatabaseProvider>
                <TestComponent />
            </DatabaseProvider>
        );

        await waitFor(() => {
            expect(contextValue).not.toBeNull();
            if (contextValue) {
                expect(contextValue.exerciseService).toBeDefined();
                expect(contextValue.routineService).toBeDefined();
                expect(contextValue.sessionService).toBeDefined();
            }
        });

        expect(ExerciseService).toHaveBeenCalledWith(mockDb);
        expect(RoutineService).toHaveBeenCalledWith(mockDb);
        expect(SessionService).toHaveBeenCalledWith(mockDb);
    });
});

describe('DatabaseProvider with SQLite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock migrateDbIfNeeded for each test
        jest.spyOn(databaseSetup, 'migrateDbIfNeeded').mockResolvedValue();
    });

    it('provides the forceReset function in the context', async () => {
        mockExecAsync.mockResolvedValueOnce(undefined); // For PRAGMA user_version = 0

        let contextValue: DatabaseContextValue | null = null;
        const TestComponent = () => {
            const context = React.useContext(DatabaseContext);
            contextValue = context;
            return <Text testID="reset-button">Reset</Text>;
        };

        render(
            <DatabaseProvider>
                <TestComponent />
            </DatabaseProvider>
        );

        await waitFor(() => {
            expect(contextValue).not.toBeNull();
        });

        // TypeScript type guard and assertion
        if (!contextValue) {
            throw new Error('Context should be defined here');
        }

        const typedContext = contextValue as DatabaseContextValue;
        expect(typeof typedContext.forceReset).toBe('function');
        await act(async () => {
            await typedContext.forceReset();
        });

        expect(mockExecAsync).toHaveBeenCalledWith('PRAGMA user_version = 0');
        expect(databaseSetup.migrateDbIfNeeded).toHaveBeenCalledTimes(2); // Once on init, once on reset
    });

    it('handles errors during forceReset', async () => {
        mockExecAsync.mockRejectedValueOnce(new Error('Reset Error'));
        const consoleErrorSpy = jest.spyOn(console, 'error');

        let contextValue: DatabaseContextValue | null = null;
        const TestComponent = () => {
            const context = React.useContext(DatabaseContext);
            contextValue = context;
            return <Text testID="reset-button">Reset</Text>;
        };

        render(
            <DatabaseProvider>
                <TestComponent />
            </DatabaseProvider>
        );

        await waitFor(() => {
            expect(contextValue).not.toBeNull();
        });

        // TypeScript type guard and assertion
        if (!contextValue) {
            throw new Error('Context should be defined here');
        }

        const typedContext = contextValue as DatabaseContextValue;
        expect(typeof typedContext.forceReset).toBe('function');
        await expect(typedContext.forceReset()).rejects.toThrow('Reset Error');

        expect(consoleErrorSpy).toHaveBeenCalledWith('[Provider] Force reset failed:', new Error('Reset Error'));
        consoleErrorSpy.mockRestore();
    });
});