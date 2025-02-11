import React, { Suspense, PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseProvider } from './src/db/DatabaseProvider';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkoutDataServiceProvider } from './src/services';

function Fallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function AppContent() {
  const content = (
    <React.Fragment>
      <AppNavigator />
      <StatusBar style="dark" />
    </React.Fragment>
  );

  return (
    <NavigationContainer children={content} />
  );
}

function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider children={
          <Suspense fallback={<Fallback />}>
            <WorkoutDataServiceProvider children={children} />
          </Suspense>
        } />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});