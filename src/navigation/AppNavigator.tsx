import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ExerciseLibraryScreen } from '../screens/ExerciseLibraryScreen';
import { ExerciseListScreen } from '../screens/ExerciseListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PlateCalculatorScreen } from '../screens/PlateCalculatorScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />
      <Stack.Screen
        name="ExerciseLibrary"
        component={ExerciseLibraryScreen}
      />
      <Stack.Screen
        name="ExerciseList"
        component={ExerciseListScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="PlateCalculator"
        component={PlateCalculatorScreen}
        options={{ title: 'Plate Calculator' }}
      />
    </Stack.Navigator>
  );
} 