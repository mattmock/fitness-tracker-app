import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ExerciseSetData } from '../types/interfaces';
import { useDatabaseContext } from '../db';
import { Ionicons } from '@expo/vector-icons';
import ExerciseSet from './ExerciseSet';

interface ExerciseItemProps {
  item: ExerciseSetData;
  onExpand: (expanded: boolean) => void;
  onOpenFullView: (exerciseId: string) => void;
}

export function ExerciseSetGroup({ item, onExpand, onOpenFullView }: ExerciseItemProps) {
  const [exerciseName, setExerciseName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { exerciseService } = useDatabaseContext();
  const [expandAnim] = useState(new Animated.Value(0));
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());
  const [totalSets, setTotalSets] = useState(item.setNumber);
  const [actualReps, setActualReps] = useState<Record<number, number>>({});
  const [weights, setWeights] = useState<Record<number, number>>({});

  const CHEVRON_ANIMATION_CONFIG = {
    DURATION_MS: 200,
    COLLAPSED: 0,
    EXPANDED: 1,
    ROTATION_COLLAPSED: '0deg',
    ROTATION_EXPANDED: '180deg'
  } as const;

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
    const targetValue = isExpanded 
      ? CHEVRON_ANIMATION_CONFIG.EXPANDED 
      : CHEVRON_ANIMATION_CONFIG.COLLAPSED;

    Animated.timing(expandAnim, {
      toValue: targetValue,
      duration: CHEVRON_ANIMATION_CONFIG.DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand(!isExpanded);
  };

  const getChevronRotation = () => {
    return {
      transform: [{
        rotate: expandAnim.interpolate({
          inputRange: [CHEVRON_ANIMATION_CONFIG.COLLAPSED, CHEVRON_ANIMATION_CONFIG.EXPANDED],
          outputRange: [
            CHEVRON_ANIMATION_CONFIG.ROTATION_COLLAPSED,
            CHEVRON_ANIMATION_CONFIG.ROTATION_EXPANDED
          ],
        }),
      }],
    };
  };

  const handleWeightChange = (index: number, weight: number) => {
    setWeights(prev => ({
      ...prev,
      [index]: weight
    }));
  };

  const handleCheckPress = (index: number) => {
    setCompletedSets(prev => {
      const newSet = new Set(prev);
      const isLastCompletedSet = index === Math.max(...Array.from(prev));
      
      if (newSet.has(index)) {
        if (isLastCompletedSet) {
          newSet.delete(index);
          setTotalSets(prev => prev - 1);
        }
      } else {
        newSet.add(index);
        if (index === totalSets - 1) {
          setTotalSets(prev => prev + 1);
          setActualReps(prev => ({
            ...prev,
            [totalSets]: 0
          }));
          setWeights(prev => ({
            ...prev,
            [totalSets]: 0
          }));
        }
      }
      return newSet;
    });
  };

  const handleRepsChange = (index: number, reps: number) => {
    setActualReps(prev => ({
      ...prev,
      [index]: reps
    }));
  };

  const renderSets = () => {
    const sets = [];
    for (let i = 0; i < totalSets; i++) {
      const isLastCompletedSet = i === Math.max(...Array.from(completedSets), -1);
      const isActive = i === totalSets - 1 && !completedSets.has(i);
      const canBeUnchecked = isLastCompletedSet && completedSets.has(i);
      
      sets.push(
        <ExerciseSet
          key={i}
          index={i}
          reps={item.reps ?? 0}
          weight={item.weight ?? 0}
          onCheckPress={() => handleCheckPress(i)}
          isCompleted={completedSets.has(i)}
          isActive={isActive}
          onRepsChange={isActive ? (reps) => handleRepsChange(i, reps) : undefined}
          onWeightChange={isActive ? (weight) => handleWeightChange(i, weight) : undefined}
          actualReps={actualReps[i] ?? 0}
          actualWeight={weights[i] ?? 0}
          canBeUnchecked={canBeUnchecked}
          duration={item.duration}
        />
      );
    }
    return sets;
  };

  // Determine if this is a duration-based exercise
  const isDurationExercise = item.duration !== undefined && item.duration > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        testID="exercise-header"
        onPress={toggleExpand} 
        style={styles.header}
      >
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{exerciseName}</Text>
            <View style={styles.headerRight}>
              <Text style={styles.setCount}>
                {completedSets.size} sets
              </Text>
              {isDurationExercise && (
                <Text style={styles.duration}>{item.duration}s</Text>
              )}
              <Animated.View style={[styles.arrow, getChevronRotation()]}>
                <Ionicons 
                  name="chevron-down"
                  size={24} 
                  color="#666" 
                />
              </Animated.View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => onOpenFullView(item.id)}
          >
            <Text style={styles.detailsLink}>Full View →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.setsContainer}>
          <View style={styles.setHeaders}>
            <View style={styles.setNumberHeader} />
            <View style={styles.setInputHeaders}>
              <Text style={styles.headerText}>Weight</Text>
              <Text style={styles.headerText}>Reps</Text>
              <View style={styles.checkButtonPlaceholder} />
            </View>
          </View>
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
    padding: 16,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setCount: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  duration: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  arrow: {
    marginLeft: 4,
  },
  setsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  setHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  setNumberHeader: {
    width: 60,
  },
  setInputHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  headerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 70,
    textAlign: 'center',
  },
  checkButtonPlaceholder: {
    width: 32,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  detailsLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
}); 