import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Session } from '../db/models';
import { useWorkoutData } from '../services';
import { ActiveSession } from '../components/ActiveSession';
import { RecentSessionHistory } from '../components/RecentSessionHistory';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const { exerciseService } = useWorkoutData();

  // Refresh active session when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSession = async () => {
        try {
          const sessions = await exerciseService.getSessions();
          // Get the most recent session from today
          const today = new Date().toISOString().split('T')[0];
          const todaysSessions = sessions.filter(session => 
            session.startTime.startsWith(today)
          );
          
          if (todaysSessions.length > 0) {
            setActiveSession(todaysSessions[todaysSessions.length - 1]);
          } else {
            setActiveSession(null);
          }
        } catch (error) {
          console.error('Failed to fetch active session:', error);
        }
      };

      fetchActiveSession();
    }, [exerciseService])
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

  const renderSessionHistory = () => {
    return (
      <View style={styles.historyContainer}>
        <RecentSessionHistory />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerText}>Current Session</Text>
      <View style={styles.content}>
        <View style={styles.currentSession}>
          {renderCurrentSession()}
        </View>
        {renderSessionHistory()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 34,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  currentSession: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Make room for collapsed history header
  },
  historyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
  },
  emptySession: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
}); 