import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import type { SessionExercise } from '../db/services/sessionService';
import { useDatabaseContext } from '../db';
import { Ionicons } from '@expo/vector-icons';
import ExerciseSet from './ExerciseSet';

interface ExerciseItemProps {
  item: SessionExercise;
  onExpand: (expanded: boolean) => void;
}

export function ExerciseItem({ item, onExpand }: ExerciseItemProps) {
  const [exerciseName, setExerciseName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { exerciseService } = useDatabaseContext();
  const [expandAnim] = useState(new Animated.Value(0));
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchExerciseName = async () => {
      try {
        const exercise = await exerciseService.getById(item.exerciseId);
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
    setCompletedSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderSets = () => {
    const totalSets = item.setNumber;
    const sets = [];
    for (let i = 0; i < totalSets; i++) {
      sets.push(
        <ExerciseSet
          key={i}
          index={i}
          reps={item.reps ?? 0}
          onCheckPress={() => handleCheckPress(i)}
        />
      );
    }
    return sets;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{exerciseName}</Text>
          <Text style={styles.subtitle}>
            {item.setNumber} sets
            {item.reps ? ` × ${item.reps} reps` : ''}
            {item.weight ? ` @ ${item.weight}kg` : ''}
            {item.duration ? ` for ${item.duration}s` : ''}
          </Text>
        </View>
        <Animated.View
          style={[
            styles.arrow,
            {
              transform: [
                {
                  rotate: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="chevron-down" size={24} color="#666" />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.setsContainer}>
          {renderSets()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    marginLeft: 8,
  },
  setsContainer: {
    padding: 16,
    paddingTop: 0,
  },
}); 