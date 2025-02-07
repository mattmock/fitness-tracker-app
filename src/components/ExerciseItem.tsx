import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SessionExercise } from '../db/models';
import { useWorkoutData } from '../services';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseItemProps {
  item: SessionExercise;
  onExpand: (expanded: boolean) => void;
}

export function ExerciseItem({ item, onExpand }: ExerciseItemProps) {
  const [exerciseName, setExerciseName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { exerciseService } = useWorkoutData();
  const [expandAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchExerciseName = async () => {
      try {
        const exercises = await exerciseService.getExercises();
        const exercise = exercises.find(e => e.id === item.exerciseId);
        if (exercise) {
          setExerciseName(exercise.name);
        }
      } catch (error) {
        console.error('Failed to fetch exercise details:', error);
      }
    };

    fetchExerciseName();
  }, [item.exerciseId, exerciseService]);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand(!isExpanded);
  };

  const renderSet = (index: number) => (
    <View key={index} style={styles.setRow}>
      <Text style={styles.setNumber}>Set {index + 1}</Text>
      <View style={styles.setInputs}>
        <TouchableOpacity style={styles.setButton}>
          <Text style={styles.setButtonText}>10</Text>
          <Text style={styles.setLabel}>reps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.setButton}>
          <Text style={styles.setButtonText}>0</Text>
          <Text style={styles.setLabel}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkButton}>
          <Ionicons 
            name="checkmark-circle-outline"
            size={24} 
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const maxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [72, 280], // Height for header + 3 sets
  });

  return (
    <Animated.View style={[styles.container, { maxHeight }]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.exerciseName}>{exerciseName || 'Loading...'}</Text>
          <View style={styles.exerciseStatus}>
            <Text style={styles.exerciseProgress}>
              3 sets × 10 reps
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666"
            />
          </View>
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.setsContainer}>
          {[0, 1, 2].map(renderSet)}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
  },
  exerciseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseProgress: {
    fontSize: 16,
    color: '#666',
  },
  setsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 17,
    fontWeight: '500',
    color: '#666',
    width: 60,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    width: 70,
    alignItems: 'center',
  },
  setButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  setLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checkButton: {
    padding: 4,
  },
}); 