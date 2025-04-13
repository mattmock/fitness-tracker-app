import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components';
import { ExerciseSelectionData } from '../types/interfaces';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useDatabaseContext } from '../db';
import { useFocusEffect } from '@react-navigation/native';

type ExerciseListScreenProps = NativeStackScreenProps<RootStackParamList, 'ExerciseList'>;

export function ExerciseListScreen({ route, navigation }: ExerciseListScreenProps) {
  const { category, exercises, onExercisesSelected } = route.params;
  const [selectedExercises, setSelectedExercises] = React.useState<Set<string>>(
    new Set(exercises.filter(ex => ex.selected || ex.inActiveSession).map(ex => ex.id))
  );
  const [localSelectedCount, setLocalSelectedCount] = React.useState(0);
  
  // Calculate the count of selected exercises that are NOT in the active session
  useEffect(() => {
    const newCount = Array.from(selectedExercises).filter(id => {
      const exercise = exercises.find(ex => ex.id === id);
      // Only count exercises that are selected AND not in active session
      return exercise && !exercise.inActiveSession;
    }).length;
    setLocalSelectedCount(newCount);
  }, [selectedExercises, exercises]);

  const handleBackPress = () => {
    // When going back, only include newly selected exercises
    const finalSelection = Array.from(selectedExercises).filter(id => {
      const exercise = exercises.find(ex => ex.id === id);
      return exercise && !exercise.inActiveSession;
    });
    onExercisesSelected(finalSelection);
    navigation.goBack();
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    // Don't allow deselection of exercises in active session
    if (exercise.inActiveSession) {
      return; // Exercise is in active session, don't allow toggling
    }

    const newSelection = new Set(selectedExercises);
    if (newSelection.has(exerciseId)) {
      newSelection.delete(exerciseId);
    } else {
      newSelection.add(exerciseId);
    }
    setSelectedExercises(newSelection);
  };

  const handleSelectAndGoBack = () => {
    // Only include newly selected exercises when using the select button
    const finalSelection = Array.from(selectedExercises).filter(id => {
      const exercise = exercises.find(ex => ex.id === id);
      return exercise && !exercise.inActiveSession;
    });
    onExercisesSelected(finalSelection);
    navigation.goBack();
  };

  const renderExerciseCard = ({ item }: { item: ExerciseSelectionData }) => {
    const isSelected = selectedExercises.has(item.id);
    
    return (
      <TouchableOpacity 
        testID={`exercise-item-${item.id}`}
        style={[
          styles.card, 
          isSelected && styles.selectedCard,
          item.inActiveSession && styles.activeSessionCard
        ]}
        onPress={() => toggleExerciseSelection(item.id)}
        activeOpacity={item.inActiveSession && isSelected ? 1 : 0.7} // Disable press effect for hard-selected items
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <View style={[
                styles.checkbox, 
                isSelected && styles.checkboxSelected,
                item.inActiveSession && isSelected && styles.checkboxActiveSession
              ]}>
                {isSelected && (
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={item.inActiveSession ? "#555" : "#007AFF"} 
                  />
                )}
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.inActiveSession && isSelected && (
                <View style={styles.activeSessionBadge}>
                  <Text style={styles.activeSessionBadgeText}>In Session</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Only show the Select button if there are new selections (not in active session)
  const showSelectButton = localSelectedCount > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton onPress={handleBackPress} />
      </View>
      <Text style={styles.title}>{category}</Text>
      <FlatList
        testID="exercise-list"
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseCard}
        contentContainerStyle={[
          styles.listContent,
          showSelectButton && styles.listContentWithButton
        ]}
        ListEmptyComponent={
          <Text style={styles.placeholderText}>No exercises found</Text>
        }
      />
      {showSelectButton && (
        <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
          <TouchableOpacity 
            testID="select-exercises-button"
            style={styles.addButton}
            onPress={handleSelectAndGoBack}
          >
            <View style={styles.addButtonContent}>
              <Text style={styles.addButtonText}>
                Select {localSelectedCount}
              </Text>
              <Ionicons name="chevron-back" size={20} color="#fff" />
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
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  listContentWithButton: {
    paddingBottom: 100, // Extra padding for the button
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#007AFF',
  },
  activeSessionCard: {
    borderColor: '#555',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  checkboxActiveSession: {
    borderColor: '#555',
    backgroundColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 34, // Aligns with text after checkbox
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
  activeSessionBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  activeSessionBadgeText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
}); 