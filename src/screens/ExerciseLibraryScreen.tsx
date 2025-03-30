import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Platform } from 'react-native';
import { LoadingSpinner, BackButton, ExerciseTypeCard } from '../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabaseContext } from '../db';
import type { Exercise, Routine, Session, SessionExercise } from '../types/database';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { ExerciseGroup, groupExercisesByCategory } from '../types/interfaces';

type TabType = 'exercises' | 'routines';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExerciseLibraryRouteProp = RouteProp<RootStackParamList, 'ExerciseLibrary'>;

// Keeping this interface temporarily for backward compatibility
// Eventually all usages should be replaced with ExerciseGroup from interfaces
interface ExerciseGroupLegacy {
  name: string;
  exercises: Exercise[];
}

export function ExerciseLibraryScreen() {
  const { exerciseService, sessionService, routineService } = useDatabaseContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('exercises');
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [activeSession, setActiveSession] = useState<{ id: string; name: string } | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [activeSessionExerciseIds, setActiveSessionExerciseIds] = useState<string[]>([]);
  const [newSelectionsCount, setNewSelectionsCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExerciseLibraryRouteProp>();

  // Handle new exercise selection when navigating from AddExerciseScreen
  useEffect(() => {
    if (route.params?.newExerciseId) {
      // Switch to exercises tab if not already active
      setActiveTab('exercises');
      // Add the new exercise to selected exercises
      setSelectedExercises(prev => new Set([...prev, route.params.newExerciseId as string]));
    }
  }, [route.params?.newExerciseId]);

  // Update the count of new selections (not in active session)
  useEffect(() => {
    if (currentSession) {
      // Calculate how many selected exercises are not already in the session
      const count = Array.from(selectedExercises).filter(id => 
        !activeSessionExerciseIds.includes(id)
      ).length;
      setNewSelectionsCount(count);
    } else {
      // If no active session, all selections are new
      setNewSelectionsCount(selectedExercises.size);
    }
  }, [selectedExercises, activeSessionExerciseIds, currentSession]);

  // Fetch active session when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSession = async () => {
        try {
          const activeSessions = await sessionService.getAll();
          const activeSession = activeSessions.find(s => !s.endTime);
          
          if (activeSession) {
            setActiveSession(activeSession);
            // Update to use sessionExercises instead of exercises
            const exerciseIds = activeSession.sessionExercises.map((ex: SessionExercise) => ex.exerciseId);
            setActiveSessionExerciseIds(exerciseIds);
          }
        } catch (error) {
          console.error('Error fetching active session:', error);
        }
      };

      fetchActiveSession();
    }, [sessionService])
  );

  // Fetch exercises and routines when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setError(null);
          const [exercisesData, routinesData] = await Promise.all([
            exerciseService.getAll(),
            routineService.getAll()
          ]);
          setExercises(exercisesData);
          setRoutines(routinesData);
        } catch (error) {
          console.error('Failed to fetch data:', error);
          setError('Failed to load data. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [exerciseService, routineService])
  );

  // Use the existing getExercisesByGroup function, but rename it for clarity as we're phasing it out
  const getExercisesByGroupLegacy = (): ExerciseGroupLegacy[] => {
    const groups = new Map<string, Exercise[]>();
    
    exercises.forEach(exercise => {
      const group = exercise.category || 'Other';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)?.push(exercise);
    });

    return Array.from(groups.entries()).map(([name, exercises]) => ({
      name,
      exercises
    }));
  };

  // New function that uses our interface
  const getExerciseGroups = (): ExerciseGroup[] => {
    return groupExercisesByCategory(exercises);
  };

  // Update handleGroupPress to work with our new groups
  const handleGroupPress = (group: ExerciseGroupLegacy) => {
    // Make sure exercises in the active session are pre-selected
    const combinedSelectedExercises = new Set(selectedExercises);
    activeSessionExerciseIds.forEach(id => {
      combinedSelectedExercises.add(id);
    });
    
    navigation.navigate('ExerciseList', {
      category: group.name,
      exercises: group.exercises,
      selectedExercises: Array.from(combinedSelectedExercises),
      activeSessionExerciseIds, // Pass the active session exercise IDs
      onExercisesSelected: (newSelectedExercises: string[]) => {
        setSelectedExercises(new Set(newSelectedExercises));
      }
    });
  };

  const handleBackPress = () => {
    // Clear selected exercises and navigate back
    setSelectedExercises(new Set());
    navigation.goBack();
  };

  const handleAddNewExercise = () => {
    navigation.navigate('AddExercise');
  };

  const handleAddToSession = async () => {
    try {
      if (selectedExercises.size === 0) return;

      const selectedExercisesList = exercises.filter(exercise => {
        if (!exercise || !exercise.id) {
          console.error('Invalid exercise:', exercise);
          return false;
        }
        return selectedExercises.has(exercise.id);
      });

      if (selectedExercisesList.length === 0) {
        console.error('No valid exercises selected');
        return;
      }

      console.log('Adding exercises to session:', selectedExercisesList);
      
      if (activeSession) {
        // Get the current session
        const currentSession = await sessionService.getById(activeSession.id);
        if (!currentSession) {
          throw new Error('Active session not found');
        }

        // Check which exercises are already in the session to avoid duplicates
        const existingExerciseIds = new Set(
          currentSession.sessionExercises.map((exercise: SessionExercise) => exercise.exerciseId)
        );

        // Filter out exercises that are already in the session
        const newExercisesToAdd = selectedExercisesList.filter(
          exercise => !existingExerciseIds.has(exercise.id)
        );
        
        if (newExercisesToAdd.length === 0) {
          // Show feedback that no new exercises were added
          console.log('All selected exercises are already in this session');
          // TODO: Consider adding a toast or alert here
          return;
        }

        // Add only new exercises to the session
        await Promise.all(newExercisesToAdd.map(async exercise => {
          await sessionService.addExerciseToSession(activeSession.id, {
            exerciseId: exercise.id,
            setNumber: 1,
            reps: 10, // Add default reps value
            weight: 0, // Add default weight value
            completed: false, // Add default completed value
          });
        }));
      } else {
        // Create a new session with the selected exercises
        await sessionService.create({
          name: `Workout ${new Date().toLocaleDateString()}`,
          startTime: new Date().toISOString(),
        }, selectedExercisesList.map(exercise => ({
          exerciseId: exercise.id,
          setNumber: 1,
          reps: 10, // Add default reps value
          weight: 0, // Add default weight value
          completed: false, // Add default completed value
        })));
      }

      // Clear selected exercises and navigate back to home
      setSelectedExercises(new Set());
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to handle exercises:', error);
    }
  };

  const renderExerciseGroups = () => (
    <FlatList
      data={getExercisesByGroupLegacy()}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => {
        // Calculate how many exercises are selected in this group
        const selectedInGroup = item.exercises.filter(ex => selectedExercises.has(ex.id)).length;
        
        return (
          <ExerciseTypeCard
            title={item.name}
            exerciseCount={item.exercises.length}
            selectedCount={selectedInGroup}
            onPress={() => handleGroupPress(item)}
          />
        );
      }}
      contentContainerStyle={[
        styles.listContent,
        showAddButton && styles.listContentWithButton
      ]}
      ListEmptyComponent={
        error ? (
          <Text style={styles.errorText} testID="error-message">{error}</Text>
        ) : (
          <Text style={styles.placeholderText}>No exercise groups found</Text>
        )
      }
    />
  );

  const renderRoutineCard = ({ item }: { item: Routine }) => (
    <ExerciseTypeCard
      title={item.name}
      exerciseCount={item.exerciseIds.length}
      onPress={() => {/* TODO: Handle routine press */}}
    />
  );

  const renderRoutineGroups = () => (
    <FlatList
      data={routines}
      keyExtractor={(item) => item.id}
      renderItem={renderRoutineCard}
      ListEmptyComponent={
        error ? (
          <Text style={styles.errorText} testID="error-message">{error}</Text>
        ) : (
          <Text style={styles.placeholderText}>No routines found</Text>
        )
      }
      contentContainerStyle={styles.listContent}
    />
  );

  const renderTabContent = () => {
    if (activeTab === 'exercises') {
      return renderExerciseGroups();
    } else {
      return renderRoutineGroups();
    }
  };

  // Only show the button if there are new selections to add
  const showAddButton = newSelectionsCount > 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton onPress={handleBackPress} />
        <TouchableOpacity 
          style={styles.addExerciseButton}
          onPress={handleAddNewExercise}
          testID="add-exercise-button"
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput 
          testID="search-input"
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          onChangeText={(text) => {
            // TODO: Implement search functionality
          }}
        />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          testID="exercises-tab"
          style={[
            styles.tab, 
            activeTab === 'exercises' && styles.activeTab
          ]}
          onPress={() => setActiveTab('exercises')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'exercises' && styles.activeTabText
          ]}>
            Exercises
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          testID="routines-tab"
          style={[
            styles.tab, 
            activeTab === 'routines' && styles.activeTab
          ]}
          onPress={() => setActiveTab('routines')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'routines' && styles.activeTabText
          ]}>
            Routines
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      {showAddButton && (
        <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
          <TouchableOpacity 
            testID="add-to-session-button"
            style={styles.addButton}
            onPress={handleAddToSession}
          >
            <View style={styles.addButtonContent}>
              <Text style={styles.addButtonText}>
                {activeSession 
                  ? `Add to workout (${newSelectionsCount})`
                  : `Start workout (${newSelectionsCount})`
                }
              </Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    minHeight: 48,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#e8e8e8',
  },
  tabText: {
    fontSize: 17,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listContentWithButton: {
    paddingBottom: 100, // Extra padding for the button
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9CA3AF',
    fontSize: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
  },
  addButton: {
    backgroundColor: '#101112e5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
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
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  addExerciseButton: {
    padding: 8,
  },
}); 