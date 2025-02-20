import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDevDatabase } from '../db/dev/devDatabaseUtils';
import { BackButton } from '../components';
import { useSQLiteContext } from 'expo-sqlite';
import { SessionService } from '../db/services';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DataCountRowProps {
  label: string;
  value: string;
  onUpdate: (value: string) => void;
}

function DataCountRow({ label, value, onUpdate }: DataCountRowProps) {
  const [inputValue, setInputValue] = useState(value);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleUpdate = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      setInputValue(value); // Reset to previous valid value
      return;
    }

    if (numValue < 0) {
      Alert.alert('Invalid Input', 'Number cannot be negative');
      setInputValue(value); // Reset to previous valid value
      return;
    }
    
    console.log(`Updating ${label} count to:`, numValue); // Debug log
    onUpdate(numValue.toString());
  };

  const handleChangeText = (text: string) => {
    // Only allow non-negative numbers (no minus sign)
    if (/^\d*$/.test(text)) {
      setInputValue(text);
    }
  };

  return (
    <View style={styles.dataCountRow}>
      <Text style={styles.dataCountLabel}>{label}:</Text>
      <View style={styles.dataCountInput}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          maxLength={3} // Prevent unreasonably large numbers
          returnKeyType="done"
          onSubmitEditing={handleUpdate}
        />
        <TouchableOpacity
          style={[
            styles.updateButton,
            (!inputValue || inputValue === value) && styles.updateButtonDisabled
          ]}
          onPress={handleUpdate}
          disabled={!inputValue || inputValue === value}
        >
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const devDb = useDevDatabase();
  const db = useSQLiteContext();
  const sessionService = new SessionService(db);
  
  const [counts, setCounts] = useState({
    sessions: '0',
    exercises: '0',
    routines: '0'
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current counts from database
  const fetchCounts = async () => {
    try {
      console.log('Fetching database counts...');
      const dbCounts = await devDb.getCounts();
      console.log('Received counts:', dbCounts);
      setCounts({
        sessions: dbCounts.sessions.toString(),
        exercises: dbCounts.exercises.toString(),
        routines: dbCounts.routines.toString()
      });
    } catch (error) {
      console.error('Failed to fetch counts:', error);
      Alert.alert('Error', 'Failed to fetch database counts');
    }
  };

  // Fetch counts on mount
  useEffect(() => {
    fetchCounts();
  }, []);

  const handleUpdateCount = async (type: keyof typeof counts, value: string) => {
    if (isUpdating) return;
    
    try {
      console.log(`Updating ${type} count to ${value}...`);
      setIsUpdating(true);
      
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        throw new Error('Invalid number');
      }

      // Update the count for the specific table
      await devDb.updateRowCount(type, numValue);
      
      console.log('Update complete, refreshing counts...');
      await fetchCounts();
      
      Alert.alert('Success', `${type} count updated successfully`);
    } catch (error) {
      console.error(`Failed to update ${type} count:`, error);
      Alert.alert('Error', `Failed to update ${type} count`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearDatabase = () => {
    Alert.alert(
      'Clear Database',
      'Are you sure you want to clear all data? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await devDb.clearDatabase();
              await fetchCounts();
              Alert.alert('Success', 'Database cleared successfully');
            } catch (error) {
              console.error('Failed to clear database:', error);
              Alert.alert('Error', 'Failed to clear database');
            }
          },
        },
      ]
    );
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will reset the database to its default state with sample data. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              console.log('Starting database reset...');
              await devDb.resetDatabaseToDefault();
              console.log('Database reset completed');
              
              await fetchCounts();
              
              Alert.alert(
                'Success',
                'Database has been reset successfully',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Failed to reset database:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              Alert.alert('Error', 'Failed to reset database. Check console for details.');
            }
          },
        },
      ]
    );
  };

  const handleClearCurrentSession = () => {
    Alert.alert(
      'Clear Current Session',
      'Are you sure you want to clear the current session? This will remove all exercises from the current session.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get all sessions and find the most recent one that hasn't ended
              const sessions = await sessionService.getAll();
              const currentSession = sessions.find(session => !session.endTime);
              
              if (currentSession) {
                await sessionService.delete(currentSession.id);
                Alert.alert('Success', 'Current session cleared successfully');
              } else {
                Alert.alert('Info', 'No active session to clear');
              }
            } catch (error) {
              console.error('Failed to clear current session:', error);
              Alert.alert('Error', 'Failed to clear current session');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Row Counts</Text>
        <View style={styles.dataCountsContainer}>
          <DataCountRow
            label="Past Sessions"
            value={counts.sessions}
            onUpdate={(value) => handleUpdateCount('sessions', value)}
          />
          <DataCountRow
            label="Exercises"
            value={counts.exercises}
            onUpdate={(value) => handleUpdateCount('exercises', value)}
          />
          <DataCountRow
            label="Routines"
            value={counts.routines}
            onUpdate={(value) => handleUpdateCount('routines', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Controls</Text>
        <View style={styles.databaseControls}>
          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleClearCurrentSession}
          >
            <Text style={styles.buttonText}>Clear Current Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearDatabase}
          >
            <Text style={styles.buttonText}>Clear Database</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleResetDatabase}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Reset Database</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 24,
  },
  dataCountsContainer: {
    gap: 12,
  },
  dataCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataCountLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  dataCountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  databaseControls: {
    marginTop: 16,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ff3b30',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  warningButton: {
    backgroundColor: '#ff9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  updateButtonDisabled: {
    opacity: 0.5,
  },
});