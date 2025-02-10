import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfigService } from '../services/ConfigService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const mockDataLevels = ['empty', 'minimal', 'full'] as const;

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [sessionCount, setSessionCount] = React.useState(ConfigService.sessionCount.toString());
  const [exerciseCount, setExerciseCount] = React.useState(ConfigService.exerciseCount.toString());
  const [routineCount, setRoutineCount] = React.useState(ConfigService.routineCount.toString());

  const handleSaveSettings = () => {
    ConfigService.setSessionCount(Number(sessionCount));
    ConfigService.setExerciseCount(Number(exerciseCount));
    ConfigService.setRoutineCount(Number(routineCount));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Number of Past Sessions</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={sessionCount}
            onChangeText={setSessionCount}
            placeholder="Enter number of sessions"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Number of Exercises</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={exerciseCount}
            onChangeText={setExerciseCount}
            placeholder="Enter number of exercises"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Number of Routines</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={routineCount}
            onChangeText={setRoutineCount}
            placeholder="Enter number of routines"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
  },
  inputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 