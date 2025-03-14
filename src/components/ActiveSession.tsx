import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform
} from 'react-native';
import { Session } from '../db/models';
import { ExerciseSetGroup } from './ExerciseSetGroup';

interface ActiveSessionProps {
  session: Session;
  onAddExercise: () => void;
}

export function ActiveSession({ session, onAddExercise }: ActiveSessionProps) {
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTime}>
          Started at {new Date(session.startTime).toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.exerciseList}>
        {session.sessionExercises.map(exercise => (
          <ExerciseSetGroup 
            key={exercise.id}
            item={exercise} 
            onExpand={() => {}}
            onOpenFullView={() => {}}
          />
        ))}
        {session.sessionExercises.length === 0 && (
          <Text style={styles.placeholderText}>No exercises added yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionTime: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  exerciseList: {
    paddingBottom: 16,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 