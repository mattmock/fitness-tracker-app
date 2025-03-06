import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components';
import type { Exercise } from '../db/services/exerciseService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useDatabaseContext } from '../db';
import { useFocusEffect } from '@react-navigation/native';

type ExerciseListScreenProps = NativeStackScreenProps<RootStackParamList, 'ExerciseList'>;

export function ExerciseListScreen({ route, navigation }: ExerciseListScreenProps) {
  const { category, exercises, selectedExercises: initialSelectedExercises, onExercisesSelected } = route.params;
  const [selectedExercises, setSelectedExercises] = React.useState<Set<string>>(new Set(initialSelectedExercises));
  const [localSelectedCount, setLocalSelectedCount] = React.useState(
    exercises.filter(ex => initialSelectedExercises.includes(ex.id)).length
  );

  const handleBackPress = () => {
    // Restore original selections when going back
    onExercisesSelected(initialSelectedExercises);
    navigation.goBack();
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    const newSelection = new Set(selectedExercises);
    if (newSelection.has(exerciseId)) {
      newSelection.delete(exerciseId);
      setLocalSelectedCount(prev => prev - 1);
    } else {
      newSelection.add(exerciseId);
      setLocalSelectedCount(prev => prev + 1);
    }
    setSelectedExercises(newSelection);
    onExercisesSelected(Array.from(newSelection));
  };

  const handleSelectAndGoBack = () => {
    // Keep current selections when using the select button
    navigation.goBack();
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.has(item.id);
    
    return (
      <TouchableOpacity 
        testID={`exercise-item-${item.id}`}
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
          localSelectedCount > 0 && styles.listContentWithButton
        ]}
        ListEmptyComponent={
          <Text style={styles.placeholderText}>No exercises found</Text>
        }
      />
      {localSelectedCount > 0 && (
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