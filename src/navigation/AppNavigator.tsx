import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ExerciseLibraryScreen } from '../screens/ExerciseLibraryScreen';
import { ExerciseListScreen } from '../screens/ExerciseListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PlateCalculatorScreen } from '../screens/PlateCalculatorScreen';

const Stack = createNativeStackNavigator();

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
        component={ExerciseListScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="PlateCalculator"
        component={PlateCalculatorScreen}
        options={{ title: 'Plate Calculator' }}
      />
    </Stack.Navigator>
  );
} 