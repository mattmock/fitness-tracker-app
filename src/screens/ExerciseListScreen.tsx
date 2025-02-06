import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components';
import { Exercise } from '../db/models';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseList'>;

export function ExerciseListScreen(props: Props) {
  const { category, exercises } = props.route.params;

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9CA3AF',
    fontSize: 16,
  },
}); 