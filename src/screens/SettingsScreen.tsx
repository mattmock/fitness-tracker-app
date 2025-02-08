import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfigService } from '../services/ConfigService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const mockDataLevels = ['empty', 'minimal', 'full'] as const;

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleSetMockData = (level: typeof mockDataLevels[number]) => {
    ConfigService.setMockDataLevel(level);
    // Force a navigation reset to refresh the data
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mock Data Level</Text>
        <Text style={styles.description}>
          Change the amount of mock data shown in the app
        </Text>
        <View style={styles.buttonGroup}>
          {mockDataLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.button,
                ConfigService.mockDataLevel === level && styles.activeButton,
              ]}
              onPress={() => handleSetMockData(level)}
            >
              <Text style={[
                styles.buttonText,
                ConfigService.mockDataLevel === level && styles.activeButtonText
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
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
}); 