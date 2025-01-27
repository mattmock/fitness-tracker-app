import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function PlateCalculatorScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Target Weight</Text>
          <TextInput 
            style={styles.weightInput}
            placeholder="Enter weight..."
            keyboardType="numeric"
          />
        </View>
        <View style={styles.barSection}>
          <Text style={styles.sectionTitle}>Bar Weight</Text>
          {/* TODO: Add bar weight selector */}
        </View>
        <View style={styles.plateSection}>
          <Text style={styles.sectionTitle}>Plates Needed</Text>
          {/* TODO: Add visual plate representation */}
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
  inputSection: {
    marginBottom: 24,
  },
  weightInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  barSection: {
    marginBottom: 24,
  },
  plateSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
}); 