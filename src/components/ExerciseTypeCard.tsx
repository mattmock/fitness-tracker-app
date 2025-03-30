import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseGroup } from '../types/interfaces';

interface ExerciseTypeCardProps {
  title: string;
  exerciseCount: number;
  selectedCount?: number;
  onPress: () => void;
  testID?: string;
}

/**
 * Card component that displays an exercise category with count information
 * Used in the exercise library screen
 */
export function ExerciseTypeCard({ title, exerciseCount, selectedCount = 0, onPress, testID = "exercise-type-card" }: ExerciseTypeCardProps) {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.cardContent}>
        <View style={styles.mainContent}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countContainer}>
            <Text style={styles.count}>
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
            </Text>
            {selectedCount > 0 && (
              <Text style={styles.selectedCount}>
                {selectedCount} selected
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );
}

// Creating a factory function to create ExerciseTypeCard props from ExerciseGroup
export function createExerciseTypeCardProps(
  group: ExerciseGroup, 
  selectedExerciseIds: Set<string>,
  onPress: () => void
): ExerciseTypeCardProps {
  const exerciseCount = group.exercises.length;
  const selectedCount = group.exercises.filter(ex => 
    selectedExerciseIds.has(ex.id)
  ).length;
  
  return {
    title: group.name,
    exerciseCount,
    selectedCount,
    onPress
  };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
}); 