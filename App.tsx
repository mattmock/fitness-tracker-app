import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DatabaseProvider } from './src/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkoutDataServiceProvider } from './src/services';

export default function App() {
  return (
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
  );
}