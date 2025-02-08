import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SessionExercise } from '../db/models';
import { useWorkoutData } from '../services';
import { Ionicons } from '@expo/vector-icons';
import ExerciseSet from './ExerciseSet';

interface ExerciseItemProps {
  item: SessionExercise;
  onExpand: (expanded: boolean) => void;
}

export function ExerciseItem({ item, onExpand }: ExerciseItemProps) {
  const [exerciseName, setExerciseName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { exerciseService } = useWorkoutData();
  const [expandAnim] = useState(new Animated.Value(0));
  const [sets, setSets] = useState<number>(item.sets || 1);

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

  const handleCheckPress = (index: number) => {
    if (index === sets - 1) {
      setSets(prev => prev + 1);
    }
  };

  const renderSets = () => {
    return Array.from({ length: sets }).map((_, index) => (
      <ExerciseSet
        key={index}
        index={index}
        reps={item.reps}
        onCheckPress={() => handleCheckPress(index)}
      />
    ));
  };

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
              {item.sets} sets × {item.reps} reps
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
          {renderSets()}
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
}); 