import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExerciseLibraryScreen } from './src/screens/ExerciseLibraryScreen';
import { PlateCalculatorScreen } from './src/screens/PlateCalculatorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#4A90E2',
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
            },
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Session',
            }}
          />
          <Tab.Screen 
            name="Exercises" 
            component={ExerciseLibraryScreen}
            options={{
              title: 'Exercises',
            }}
          />
          <Tab.Screen 
            name="Calculator" 
            component={PlateCalculatorScreen}
            options={{
              title: 'Plates',
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
