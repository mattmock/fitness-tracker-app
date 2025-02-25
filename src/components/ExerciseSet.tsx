import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ExerciseSetProps {
  index: number;
  reps: number;
  weight: number;
  onCheckPress: () => void;
  isCompleted?: boolean;
  isActive: boolean;
  onRepsChange?: (reps: number) => void;
  onWeightChange?: (weight: number) => void;
  actualReps?: number;
  actualWeight?: number;
  canBeUnchecked?: boolean;
}

const ExerciseSet: React.FC<ExerciseSetProps> = ({ 
  index, 
  reps, 
  weight,
  onCheckPress, 
  isCompleted,
  isActive,
  onRepsChange,
  onWeightChange,
  actualReps,
  actualWeight,
  canBeUnchecked
}) => {
  const [repsInput, setRepsInput] = useState(actualReps?.toString() ?? '0');
  const [weightInput, setWeightInput] = useState(actualWeight?.toString() ?? '0');
  
  const weightInputRef = useRef<TextInput>(null);
  const repsInputRef = useRef<TextInput>(null);

  const handleRepsInputChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setRepsInput(numericValue);
    const newReps = parseInt(numericValue) || 0;
    onRepsChange?.(newReps);
  };

  const handleWeightInputChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setWeightInput(numericValue);
    const newWeight = parseInt(numericValue) || 0;
    onWeightChange?.(newWeight);
  };

  return (
    <View style={[
      styles.setRow,
      isActive ? styles.activeSetRow : styles.completedSetRow
    ]}>
      <Text style={[
        styles.setNumber,
        !isActive && styles.completedSetNumber
      ]}>Set {index + 1}</Text>
      <View style={styles.setInputs}>
        {isActive ? (
          <TouchableOpacity 
            testID="input-container"
            style={styles.setValueInput} 
            onPress={() => weightInputRef.current?.focus()}
          >
            <TextInput
              ref={weightInputRef}
              style={styles.setButtonText}
              value={weightInput}
              onChangeText={handleWeightInputChange}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
              accessibilityRole="spinbutton"
              accessibilityLabel={`Weight for set ${index + 1}`}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.completedSetValue}>
            <Text style={styles.setButtonText}>{actualWeight ?? 0}</Text>
          </View>
        )}
        {isActive ? (
          <TouchableOpacity 
            testID="input-container"
            style={styles.setValueInput} 
            onPress={() => repsInputRef.current?.focus()}
          >
            <TextInput
              ref={repsInputRef}
              style={styles.setButtonText}
              value={repsInput}
              onChangeText={handleRepsInputChange}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
              accessibilityRole="spinbutton"
              accessibilityLabel={`Reps for set ${index + 1}`}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.completedSetValue}>
            <Text style={styles.setButtonText}>{actualReps ?? 0}</Text>
          </View>
        )}
        {(isActive || isCompleted) && (
          <TouchableOpacity 
            testID="check-button"
            style={styles.checkButton}
            onPress={onCheckPress}
            disabled={isCompleted && !canBeUnchecked}
          >
            <Ionicons 
              testID="check-icon"
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24} 
              color={
                isCompleted 
                  ? (canBeUnchecked ? "#4CAF50" : "#E0E0E0") 
                  : "#9CA3AF"
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeSetRow: {
    marginTop: 16,
    marginBottom: 12,
  },
  completedSetRow: {
    marginBottom: 4,
  },
  setNumber: {
    fontSize: 17,
    fontWeight: '500',
    color: '#666',
    width: 60,
  },
  completedSetNumber: {
    fontSize: 15,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setValueInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 41,
  },
  completedSetValue: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 41,
  },
  setButtonText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkButton: {
    padding: 4,
  },
});

export default ExerciseSet; 