import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface ExerciseTypeCardProps {
  title: string;
  exerciseCount: number;
  onPress: () => void;
}

export function ExerciseTypeCard({ title, exerciseCount, onPress }: ExerciseTypeCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>
          {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
}); 