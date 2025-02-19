import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { LoadingSpinner, BackButton, ExerciseTypeCard } from '../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabaseContext } from '../db';
import type { Exercise } from '../db/services/exerciseService';
import type { Routine } from '../db/services/routineService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

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
  const { exerciseService, routineService } = useDatabaseContext();
  const navigation = useNavigation<NavigationProp>();

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
      exercises: group.exercises
    });
  };

  const renderExerciseGroups = () => (
    <FlatList
      data={getExercisesByGroup()}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <ExerciseTypeCard
          title={item.name}
          exerciseCount={item.exercises.length}
          onPress={() => handleGroupPress(item)}
        />
      )}
      contentContainerStyle={styles.listContent}
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

  const renderTabContent = () => {
    if (activeTab === 'exercises') {
      return renderExerciseGroups();
    } else {
      return (
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
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
      </View>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
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
  placeholderText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9CA3AF',
    fontSize: 16,
  },
}); 