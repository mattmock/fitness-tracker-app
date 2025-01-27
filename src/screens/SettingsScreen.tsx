import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          <View style={styles.setting}>
            <Text>Use Metric System</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Preferences</Text>
          <View style={styles.setting}>
            <Text>Auto-start Rest Timer</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          {/* TODO: Add more settings */}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
}); 