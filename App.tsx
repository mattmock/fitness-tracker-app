import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DatabaseProvider } from './src/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkoutDataServiceProvider } from './src/services';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <DatabaseProvider>
        <SafeAreaProvider>
          <WorkoutDataServiceProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <AppNavigator />
            </NavigationContainer>
          </WorkoutDataServiceProvider>
        </SafeAreaProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});