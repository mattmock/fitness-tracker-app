import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Platform } from 'react-native';
import { LoadingSpinner, BackButton, ExerciseTypeCard } from '../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabaseContext } from '../db';
import type { Exercise } from '../db/services/exerciseService';
import type { Routine } from '../db/services/routineService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'exercises' | 'routines';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExerciseGroup {
  name: string;
  exercises: Exercise[];
}

export function ExerciseLibraryScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('exercises');
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [activeSession, setActiveSession] = useState<{ id: string; name: string } | null>(null);
  const { exerciseService, routineService, sessionService } = useDatabaseContext();
  const navigation = useNavigation<NavigationProp>();

  // Fetch active session when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchActiveSession = async () => {
        try {
          const sessions = await sessionService.getAll();
          const today = new Date().toISOString().split('T')[0];
          const todaysSessions = sessions.filter(session => 
            session.startTime.startsWith(today)
          );
          
          if (todaysSessions.length > 0) {
            const latestSession = todaysSessions[todaysSessions.length - 1];
            setActiveSession({
              id: latestSession.id,
              name: latestSession.name
            });
          } else {
            setActiveSession(null);
          }
        } catch (error) {
          console.error('Error fetching active session:', error);
          setActiveSession(null);
        }
      };

      fetchActiveSession();
    }, [sessionService])
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exercisesData, routinesData] = await Promise.all([
          exerciseService.getAll(),
          routineService.getAll()
        ]);
        setExercises(exercisesData);
        setRoutines(routinesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exerciseService, routineService]);

  const getExercisesByGroup = (): ExerciseGroup[] => {
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

  const handleGroupPress = (group: ExerciseGroup) => {
    navigation.navigate('ExerciseList', {
      category: group.name,
      exercises: group.exercises,
      selectedExercises: Array.from(selectedExercises),
      onExercisesSelected: (newSelectedExercises: string[]) => {
        setSelectedExercises(new Set(newSelectedExercises));
      }
    });
  };

  const handleBackPress = () => {
    // Clear selected exercises and navigate back
    setSelectedExercises(new Set());
    navigation.navigate('Home');
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
        // Get the current session to determine the next set number
        const currentSession = await sessionService.getById(activeSession.id);
        if (!currentSession) {
          throw new Error('Active session not found');
        }

        // Get the highest set number for each exercise
        const existingSetNumbers = new Map<string, number>();
        currentSession.exercises.forEach(exercise => {
          const currentMax = existingSetNumbers.get(exercise.exerciseId) || 0;
          existingSetNumbers.set(exercise.exerciseId, Math.max(currentMax, exercise.setNumber));
        });

        // Add new exercises to the existing session
        await Promise.all(selectedExercisesList.map(async exercise => {
          const nextSetNumber = (existingSetNumbers.get(exercise.id) || 0) + 1;
          await sessionService.addExerciseToSession(activeSession.id, {
            exerciseId: exercise.id,
            setNumber: nextSetNumber,
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
      data={getExercisesByGroup()}
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
        selectedExercises.size > 0 && styles.listContentWithButton
      ]}
      ListEmptyComponent={
        <Text style={styles.placeholderText}>No exercise groups found</Text>
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
        <Text style={styles.placeholderText}>No routines found</Text>
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton onPress={handleBackPress} />
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
      {selectedExercises.size > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
          <TouchableOpacity 
            testID="add-to-session-button"
            style={styles.addButton}
            onPress={handleAddToSession}
          >
            <View style={styles.addButtonContent}>
              <Text style={styles.addButtonText}>
                {activeSession 
                  ? `Add to workout (${selectedExercises.size})`
                  : `Start workout (${selectedExercises.size})`
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
}); 