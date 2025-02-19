import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabaseContext } from '../db';
import type { Session as ServiceSession, SessionExercise as ServiceSessionExercise } from '../db/services/sessionService';
import type { Session as ModelSession, SessionExercise as ModelSessionExercise } from '../db/models';
import { ActiveSession } from '../components/ActiveSession';
import { PastSessionBottomSheet } from '../components/PastSessionBottomSheet/index';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { RecentSessionHistory } from '../components/RecentSessionHistory';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Transform service exercise to model exercise
function transformExercise(exercise: ServiceSessionExercise): ModelSessionExercise {
  return {
    ...exercise,
    sets: exercise.setNumber, // Use setNumber as sets
    reps: exercise.reps || 0, // Default to 0 if not set
    completed: true, // Assume completed since these are past exercises
    updatedAt: exercise.createdAt
  };
}

// Transform service session to model session
function transformSession(session: ServiceSession): ModelSession {
  return {
    ...session,
    sessionExercises: session.exercises.map(transformExercise),
    updatedAt: session.createdAt
  };
}

export function transformModelToServiceSession(session: ModelSession): ServiceSession {
  return {
    id: session.id,
    routineId: session.routineId,
    name: 'Workout Session',
    startTime: session.startTime,
    endTime: session.endTime,
    createdAt: session.createdAt,
    exercises: session.sessionExercises.map(ex => ({
      id: ex.id,
      sessionId: ex.sessionId,
      exerciseId: ex.exerciseId,
      setNumber: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      duration: undefined,
      notes: ex.notes,
      createdAt: ex.createdAt
    }))
  };
}

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activeSession, setActiveSession] = useState<ModelSession | null>(null);
  const [pastSessions, setPastSessions] = useState<ModelSession[]>([]);
  const { sessionService } = useDatabaseContext();

  // Calculate snap points based on session count
  const snapPoints = React.useMemo(() => {
    const points = ['10%', '45%'];
    if (pastSessions.length >= 4) {
      points.push('85%');
    }
    return points;
  }, [pastSessions.length]);

  // Refresh active session when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchSessions = async () => {
        try {
          const sessions = await sessionService.getAll();
          console.log('Fetched sessions:', sessions);
          
          const today = new Date().toISOString().split('T')[0];
          const todaysSessions = sessions.filter(session => 
            session.startTime.startsWith(today)
          );
          const pastSessions = sessions.filter(session => 
            !session.startTime.startsWith(today)
          );
          
          console.log('Today\'s sessions:', todaysSessions.length);
          console.log('Past sessions:', pastSessions.length);

          if (todaysSessions.length > 0) {
            setActiveSession(transformSession(todaysSessions[todaysSessions.length - 1]));
          } else {
            setActiveSession(null);
          }

          setPastSessions(pastSessions.map(transformSession));
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
      };

      fetchSessions();
    }, [sessionService])
  );

  const handleAddExercise = () => {
    navigation.navigate('ExerciseLibrary');
  };

  const renderCurrentSession = () => {
    if (!activeSession) {
      return (
        <View style={styles.emptySession}>
          <Text style={styles.placeholderText}>
            Tap Add Exercise to start your workout
          </Text>
          <Image 
            source={require('../../assets/images/empty-current-session-background.jpeg')}
            style={styles.placeholderImage}
          />
          <TouchableOpacity 
            style={styles.addExerciseButton}
            onPress={handleAddExercise}
          >
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ActiveSession 
        session={activeSession}
        onAddExercise={handleAddExercise}
      />
    );
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <Text style={styles.headerText}>Current Session</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Settings')}
                  style={styles.settingsButton}
                >
                  <Ionicons name="settings-outline" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
          <View style={styles.currentSession}>
            {renderCurrentSession()}
          </View>
        </View>
        {pastSessions.length > 0 && (
          <PastSessionBottomSheet initialSnapPoints={snapPoints}>
            <RecentSessionHistory sessions={pastSessions.map(transformModelToServiceSession)} />
          </PastSessionBottomSheet>
        )}
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomColor: '#f0f0f0',
    zIndex: 0,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currentSession: {
    flex: 1,
    paddingHorizontal: 16,
    zIndex: 0,
  },
  emptySession: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsButton: {
    padding: 8,
  },
}); 