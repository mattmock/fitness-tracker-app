import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useDatabaseContext } from '../db';
import { Ionicons } from '@expo/vector-icons';
import { useBottomSheet } from './PastSessionBottomSheet/BottomSheetContext';
import { SessionDisplay, SessionExerciseDisplay } from '../types/interfaces';

interface RecentSessionHistoryProps {
  sessions: SessionDisplay[];
}

export function RecentSessionHistory({ sessions }: RecentSessionHistoryProps) {
  const displayedSessions = sessions.slice(0, 6);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const { exerciseService } = useDatabaseContext();
  const [exerciseNames, setExerciseNames] = useState<Record<string, string>>({});
  const bottomSheet = useBottomSheet();

  // Fetch exercise names when a session is expanded
  useEffect(() => {
    if (expandedSessionId) {
      const fetchExerciseNames = async () => {
        const exercises = await exerciseService.getAll();
        const names: Record<string, string> = {};
        exercises.forEach(exercise => {
          names[exercise.id] = exercise.name;
        });
        setExerciseNames(names);
      };
      fetchExerciseNames();
    }
  }, [expandedSessionId, exerciseService]);

  const renderExerciseItem = (exercise: SessionExerciseDisplay) => {
    const exerciseName = exerciseNames[exercise.exerciseId] || 'Loading...';
    
    // Determine what details to show based on available fields
    let details = 'No details';
    
    if (exercise.duration) {
      // Duration-based exercise
      details = `${exercise.duration}s duration`;
      if (exercise.setNumber) {
        details = `${exercise.setNumber} sets × ${details}`;
      }
    } else if (exercise.reps || exercise.weight) {
      // Weight/reps-based exercise
      const setsText = exercise.setNumber ? `${exercise.setNumber} sets` : '';
      const repsText = exercise.reps ? `${exercise.reps} reps` : '';
      const weightText = exercise.weight ? `${exercise.weight}kg` : '';
      
      details = [setsText, repsText, weightText].filter(Boolean).join(' × ');
      if (!details) {
        details = 'No details';
      }
    }
    
    return (
      <View style={styles.exerciseItem} key={exercise.id}>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        <Text style={styles.exerciseDetails}>{details}</Text>
      </View>
    );
  };

  const renderSessionItem = ({ item }: { item: SessionDisplay }) => {
    const date = new Date(item.startTime);
    const formattedDate = format(date, 'MMM d, yyyy');
    const formattedTime = format(date, 'h:mm a');
    const isExpanded = expandedSessionId === item.id;

    // Show up to 3 exercises, then "and X more" if there are more
    const displayedExercises = item.sessionExercises.slice(0, 3);
    const remainingCount = Math.max(0, item.sessionExercises.length - 3);

    return (
      <TouchableOpacity 
        style={[styles.sessionItem, isExpanded && styles.sessionItemExpanded]}
        onPress={() => setExpandedSessionId(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionDate}>{formattedDate}</Text>
            <Text style={styles.sessionTime}>{formattedTime}</Text>
          </View>
          <View style={styles.sessionSummary}>
            <Text style={styles.exerciseCount}>
              {item.sessionExercises.length} exercise{item.sessionExercises.length !== 1 ? 's' : ''}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666"
            />
          </View>
        </View>
        
        {isExpanded && (
          <View style={styles.exercisesList}>
            {displayedExercises.map(renderExerciseItem)}
            {remainingCount > 0 && (
              <Text style={styles.moreExercises}>and {remainingCount} more exercise{remainingCount > 1 ? 's' : ''}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (sessions.length <= 6) return null;
    
    return (
      <TouchableOpacity style={styles.seeAllButton}>
        <Text style={styles.seeAllButtonText}>See all past sessions</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderFooter}
        scrollEnabled={bottomSheet.isExpanded}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  sessionItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionItemExpanded: {
    backgroundColor: '#f0f9ff',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 16,
    color: '#666',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666',
  },
  exercisesList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  moreExercises: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  seeAllButton: {
    backgroundColor: '#101112e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 0,
    opacity: 0.9,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seeAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 