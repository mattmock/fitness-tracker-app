import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { Session as ModelSession } from '../types/database';
import { ActiveSession } from './ActiveSession';
import { toActiveSessionData } from '../types/interfaces';

interface SessionContainerProps {
  activeSession: ModelSession | null;
  onAddExercise: () => void;
}

export function SessionContainer({ activeSession, onAddExercise }: SessionContainerProps) {
  if (!activeSession) {
    return (
      <View style={styles.emptySession}>
        <Text style={styles.placeholderText}>
          Tap <Text style={{fontWeight: 'bold'}}>Start Session</Text> to add exercises
        </Text>
        <Image 
          source={require('../../assets/images/dumbbells1.png')}
          style={styles.placeholderImage}
        />
        <TouchableOpacity 
          style={styles.startSessionButton}
          onPress={onAddExercise}
          testID="start-session-button"
        >
          <Text style={styles.startSessionText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Convert to ActiveSessionData before passing to ActiveSession
  const activeSessionData = toActiveSessionData(activeSession);

  return (
    <View style={styles.container}>
      <ActiveSession 
        session={activeSessionData}
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
  startSessionButton: {
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
  startSessionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionContainer; 