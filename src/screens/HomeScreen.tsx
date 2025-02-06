import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleAddExercise = () => {
    navigation.navigate('ExerciseLibrary');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerText}>Current Session</Text>
      <View style={styles.content}>
        <View style={styles.currentSession}>
          <View style={styles.sessionContainer}>
            <Text style={styles.placeholderText}>
              Tap Add Exercise to start your workout
            </Text>
            <Image 
              source={require('../../assets/images/empty-current-session-background.jpeg')}
              style={styles.placeholderImage}
            />
            <TouchableOpacity 
              style={styles.addExerciseButton}
              onPress={handleAddExercise}
            >
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.history}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {/* TODO: Add recent workouts list */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 34,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  currentSession: {
    flex: 1,
    marginBottom: 24,
  },
  sessionContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  placeholderImage: {
    position: 'absolute',
    width: '80%',
    height: '50%',
    opacity: 0.15,
    resizeMode: 'contain',
    alignSelf: 'center',
    top: '25%',
  },
  addExerciseButton: {
    backgroundColor: '#101112e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '75%',
    opacity: 0.9,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addExerciseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  history: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
}); 