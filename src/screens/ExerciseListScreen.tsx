import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components';
import { Exercise } from '../db/models';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useWorkoutData } from '../services';
import { Ionicons } from '@expo/vector-icons';

type ExerciseListScreenProps = NativeStackScreenProps<RootStackParamList, 'ExerciseList'>;

export function ExerciseListScreen({ route, navigation }: ExerciseListScreenProps) {
  const { category, exercises } = route.params;
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const { exerciseService } = useWorkoutData();

  const toggleExerciseSelection = (exerciseId: string) => {
    const newSelection = new Set(selectedExercises);
    if (newSelection.has(exerciseId)) {
      newSelection.delete(exerciseId);
    } else {
      newSelection.add(exerciseId);
    }
    setSelectedExercises(newSelection);
  };

  const handleAddToSession = async () => {
    try {
      if (selectedExercises.size === 0) return;
      if (!exercises || exercises.length === 0) {
        console.error('No exercises available');
        return;
      }

      // Create or get today's session and add exercises
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

      console.log('Creating session with exercises:', selectedExercisesList);
      const session = await exerciseService.createSessionWithExercises(selectedExercisesList);
      console.log('Session created:', session);
      
      // Navigate back to home screen
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to create session:', error);
      // TODO: Show error toast/alert
    }
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.has(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => toggleExerciseSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#007AFF" />
                )}
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
          </View>
          {item.description && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton />
      </View>
      <Text style={styles.title}>{category}</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.placeholderText}>No exercises found</Text>
        }
      />
      <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.addButton,
            selectedExercises.size === 0 && styles.addButtonDisabled
          ]}
          onPress={handleAddToSession}
          disabled={selectedExercises.size === 0}
        >
          <Text style={styles.addButtonText}>
            Add to Session ({selectedExercises.size})
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 12 : 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#101112e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
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
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9CA3AF',
    fontSize: 16,
  },
}); 