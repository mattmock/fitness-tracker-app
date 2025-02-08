import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ExerciseSetProps {
  index: number;
  reps: number;
  onCheckPress: () => void;
}

const ExerciseSet: React.FC<ExerciseSetProps> = ({ index, reps, onCheckPress }) => {
  return (
    <View style={styles.setRow}>
      <Text style={styles.setNumber}>Set {index + 1}</Text>
      <View style={styles.setInputs}>
        <TouchableOpacity style={styles.setButton}>
          <Text style={styles.setButtonText}>{reps}</Text>
          <Text style={styles.setLabel}>reps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.setButton}>
          <Text style={styles.setButtonText}>0</Text>
          <Text style={styles.setLabel}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.checkButton}
          onPress={onCheckPress}
        >
          <Ionicons 
            name="checkmark-circle-outline"
            size={24} 
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 17,
    fontWeight: '500',
    color: '#666',
    width: 60,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    width: 70,
    alignItems: 'center',
  },
  setButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  setLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checkButton: {
    padding: 4,
  },
});

export default ExerciseSet; 