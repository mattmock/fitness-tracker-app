import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { Session as ModelSession } from '../db/models';
import { ActiveSession } from './ActiveSession';

interface SessionContainerProps {
  activeSession: ModelSession | null;
  onAddExercise: () => void;
}

export function SessionContainer({ activeSession, onAddExercise }: SessionContainerProps) {
  if (!activeSession) {
    return (
      <View style={styles.emptySession}>
        <Text style={styles.placeholderText}>
          Tap Add Exercise to start your workout
        </Text>
        <Image 
          source={require('../../assets/images/dumbbells1.png')}
          style={styles.placeholderImage}
        />
        <TouchableOpacity 
          style={styles.addExerciseButton}
          onPress={onAddExercise}
        >
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActiveSession 
        session={activeSession}
        onAddExercise={onAddExercise}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptySession: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: '60%',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  placeholderImage: {
    position: 'absolute',
    width: '80%',
    height: '50%',
    opacity: 0.15,
    resizeMode: 'contain',
    alignSelf: 'center',
    top: '25%',
  },
  addExerciseButton: {
    backgroundColor: '#101112e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '75%',
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