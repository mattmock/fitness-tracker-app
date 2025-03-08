import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddExerciseScreen } from '../AddExerciseScreen';
import { useNavigation } from '@react-navigation/native';
import { useDatabaseContext } from '../../db';

// Mock the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock the database context
jest.mock('../../db', () => ({
  useDatabaseContext: jest.fn(),
}));

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('AddExerciseScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const mockExerciseService = {
    create: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useDatabaseContext as jest.Mock).mockReturnValue({
      exerciseService: mockExerciseService,
    });
  });

  it('renders all form elements correctly', () => {
    const { getByPlaceholderText, getByText } = render(<AddExerciseScreen />);

    // Check for all form elements
    expect(getByPlaceholderText('Exercise name')).toBeTruthy();
    expect(getByText('Select a category')).toBeTruthy();
    expect(getByPlaceholderText('Exercise description (optional)')).toBeTruthy();
    expect(getByText('Add Exercise')).toBeTruthy();
  });

  it('handles name input correctly', () => {
    const { getByPlaceholderText } = render(<AddExerciseScreen />);
    const nameInput = getByPlaceholderText('Exercise name');

    fireEvent.changeText(nameInput, 'Bench Press');
    expect(nameInput.props.value).toBe('Bench Press');
  });

  it('handles description input correctly', () => {
    const { getByPlaceholderText } = render(<AddExerciseScreen />);
    const descriptionInput = getByPlaceholderText('Exercise description (optional)');

    fireEvent.changeText(descriptionInput, 'A compound chest exercise');
    expect(descriptionInput.props.value).toBe('A compound chest exercise');
  });

  it('opens category dropdown when pressed', () => {
    const { getByText } = render(<AddExerciseScreen />);
    const categoryButton = getByText('Select a category');

    fireEvent.press(categoryButton);
    expect(getByText('Select Category')).toBeTruthy();
  });

  it('selects a category and updates the display', () => {
    const { getByText } = render(<AddExerciseScreen />);
    
    // Open dropdown
    fireEvent.press(getByText('Select a category'));
    
    // Select a category
    fireEvent.press(getByText('Upper Body'));
    
    // Check if the button text updated
    expect(getByText('Upper Body')).toBeTruthy();
  });

  it('shows validation error when trying to save without a name', async () => {
    const { getByText } = render(<AddExerciseScreen />);
    
    // Try to save without entering a name
    fireEvent.press(getByText('Add Exercise'));
    
    // Verify that create was not called
    expect(mockExerciseService.create).not.toHaveBeenCalled();
  });

  it('successfully saves a new exercise and navigates to ExerciseLibrary with newExerciseId', async () => {
    const { getByPlaceholderText, getByText } = render(<AddExerciseScreen />);
    
    // Fill in the form
    fireEvent.changeText(getByPlaceholderText('Exercise name'), 'Bench Press');
    fireEvent.changeText(getByPlaceholderText('Exercise description (optional)'), 'A compound chest exercise');
    
    // Select a category
    fireEvent.press(getByText('Select a category'));
    fireEvent.press(getByText('Upper Body'));
    
    // Save the exercise
    fireEvent.press(getByText('Add Exercise'));
    
    // Verify that create was called with correct data
    await waitFor(() => {
      expect(mockExerciseService.create).toHaveBeenCalledWith({
        id: expect.any(String),
        name: 'Bench Press',
        category: 'Upper Body',
        description: 'A compound chest exercise',
      });
    });
    
    // Verify navigation to ExerciseLibrary with newExerciseId
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ExerciseLibrary', {
      newExerciseId: expect.any(String),
    });
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });

  it('handles database error when saving', async () => {
    // Mock the create function to throw an error
    mockExerciseService.create.mockRejectedValueOnce(new Error('Database error'));
    
    const { getByPlaceholderText, getByText } = render(<AddExerciseScreen />);
    
    // Fill in the form
    fireEvent.changeText(getByPlaceholderText('Exercise name'), 'Bench Press');
    
    // Try to save
    fireEvent.press(getByText('Add Exercise'));
    
    // Verify that create was called
    await waitFor(() => {
      expect(mockExerciseService.create).toHaveBeenCalled();
    });
    
    // Verify that navigation was not called (error case)
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });
}); 