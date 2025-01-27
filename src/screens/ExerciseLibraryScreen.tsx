import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ExerciseLibraryScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search exercises..."
          />
        </View>
        <View style={styles.categories}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {/* TODO: Add category list/grid */}
        </View>
        <View style={styles.exerciseList}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {/* TODO: Add exercise list */}
        </View>
      </View>
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
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categories: {
    marginBottom: 24,
  },
  exerciseList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
}); 