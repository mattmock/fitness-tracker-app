import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabaseContext } from '../db';
import type { Session as ServiceSession, SessionExercise as ServiceSessionExercise } from '../db/services/sessionService';
import type { Session as ModelSession, SessionExercise as ModelSessionExercise } from '../db/models';
import { SessionContainer } from '../components/SessionContainer';
import { PastSessionBottomSheet } from '../components/PastSessionBottomSheet/index';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { RecentSessionHistory } from '../components/RecentSessionHistory';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          {/* Main content with scrollable header */}
          <KeyboardAwareScrollView
            style={styles.keyboardAwareView}
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={Platform.OS === 'ios' ? 50 : 30}
            extraHeight={Platform.OS === 'ios' ? 30 : 20}
            enableResetScrollToCoords={true}
            resetScrollToCoords={{ x: 0, y: 0 }}
            keyboardOpeningTime={0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.mainContent}>
                {/* Header (now scrollable with content) */}
                <View style={styles.headerContainer}>
                  <View style={styles.headerContent}>
                    <Text style={styles.headerText}>Current Session</Text>
                    <TouchableOpacity 
                      onPress={handleAddExercise}
                      style={styles.settingsButton}
                      testID="header-add-button"
                    >
                      <Ionicons name="add" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Session container */}
                <View style={styles.sessionContainer}>
                  <SessionContainer 
                    activeSession={activeSession}
                    onAddExercise={handleAddExercise}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>
          
          {/* Bottom sheet */}
          {pastSessions.length > 0 && (
            <PastSessionBottomSheet initialSnapPoints={snapPoints}>
              <RecentSessionHistory sessions={pastSessions.map(transformModelToServiceSession)} />
            </PastSessionBottomSheet>
          )}
        </View>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAwareView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  sessionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Padding to ensure content is visible above the bottom sheet
  },
}); 