import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSQLiteContext } from 'expo-sqlite';
import { useDatabaseContext } from '../db/DatabaseProvider';
import { clearDevDatabase, seedDevDatabase } from '../db/dev/devDatabaseUtils';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const db = useSQLiteContext();
  const { forceReset } = useDatabaseContext();

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
              await clearDevDatabase(db);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to clear database:', error);
              Alert.alert('Error', 'Failed to clear database');
            }
          },
        },
      ]
    );
  };

  const handleReseedDatabase = () => {
    Alert.alert(
      'Reseed Database',
      'This will clear the current data and add fresh seed data. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reseed',
          onPress: async () => {
            try {
              console.log('Starting database reseed process...');
              console.log('Step 1: Clearing database...');
              await clearDevDatabase(db);
              console.log('Database cleared successfully');
              
              console.log('Step 2: Seeding database with initial data...');
              await seedDevDatabase(db);
              console.log('Database seeded successfully');
              
              console.log('Database reseed process completed');
              
              // Show success message and delay navigation
              Alert.alert(
                'Success',
                'Database has been reseeded successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              console.error('Failed to reseed database:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              Alert.alert('Error', 'Failed to reseed database. Check console for details.');
            }
          },
        },
      ]
    );
  };

  const handleForceReset = () => {
    Alert.alert(
      'Force Reset Database',
      'This will reset the database to its initial state based on your environment settings. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await forceReset();
              navigation.goBack();
            } catch (error) {
              console.error('Failed to reset database:', error);
              Alert.alert('Error', 'Failed to reset database');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Controls</Text>
        <View style={styles.databaseControls}>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearDatabase}
          >
            <Text style={styles.buttonText}>Clear Database</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleReseedDatabase}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Reseed Database</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleForceReset}
          >
            <Text style={styles.buttonText}>Force Reset Database</Text>
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
    marginBottom: 16,
    marginTop: 24,
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
}); 