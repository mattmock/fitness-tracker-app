// React and React Native
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';

// Navigation
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Third-party libraries
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';

// Local components
import { SessionContainer } from '../components/SessionContainer';
import { PastSessionBottomSheet } from '../components/PastSessionBottomSheet/index';
import { RecentSessionHistory } from '../components/RecentSessionHistory';

// Hooks and types
import { useDatabaseContext } from '../db';
import type { Session } from '../types/database';
import { SessionDisplay, toSessionDisplay } from '../types/interfaces';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [pastSessions, setPastSessions] = useState<SessionDisplay[]>([]);
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
          const pastSessionsFull = sessions.filter(session => 
            !session.startTime.startsWith(today)
          );
          
          console.log('Today\'s sessions:', todaysSessions.length);
          console.log('Past sessions:', pastSessionsFull.length);

          if (todaysSessions.length > 0) {
            setActiveSession(todaysSessions[todaysSessions.length - 1]);
          } else {
            setActiveSession(null);
          }

          // Convert full Session objects to SessionDisplay objects
          const pastSessionsDisplay = pastSessionsFull.map(toSessionDisplay);
          setPastSessions(pastSessionsDisplay);
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
      };

      fetchSessions();
    }, [sessionService])
  );

  const handleAddExercise = () => {
    navigation.navigate('ExerciseLibrary', { newExerciseId: undefined });
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
              <RecentSessionHistory sessions={pastSessions} />
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