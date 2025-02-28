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
            item={{
              ...exercise,
              setNumber: exercise.sets
            }} 
            onExpand={() => {}}
            onOpenFullView={() => {}}
          />
        ))}
        {session.sessionExercises.length === 0 && (
          <Text style={styles.placeholderText}>No exercises added yet</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.addExerciseButton}
        onPress={onAddExercise}
      >
        <Text style={styles.addExerciseText}>Add Exercise</Text>
      </TouchableOpacity>
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
  addExerciseButton: {
    backgroundColor: '#101112e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
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
  addExerciseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 