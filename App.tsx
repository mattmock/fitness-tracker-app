import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExerciseLibraryScreen } from './src/screens/ExerciseLibraryScreen';
import { PlateCalculatorScreen } from './src/screens/PlateCalculatorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DatabaseProvider } from './src/db';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DatabaseProvider>
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
                tabBarIcon: ({ focused, color, size }) => (
                  <MaterialCommunityIcons 
                    name="home" 
                    size={size} 
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen 
              name="Exercises" 
              component={ExerciseLibraryScreen}
              options={{
                title: 'Exercises',
                tabBarIcon: ({ focused, color, size }) => (
                  <MaterialCommunityIcons 
                    name="dumbbell" 
                    size={size} 
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen 
              name="Calculator" 
              component={PlateCalculatorScreen}
              options={{
                title: 'Plates',
                tabBarIcon: ({ focused, color, size }) => (
                  <MaterialCommunityIcons 
                    name="calculator" 
                    size={size} 
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                title: 'Settings',
                tabBarIcon: ({ focused, color, size }) => (
                  <MaterialCommunityIcons 
                    name="cog" 
                    size={size} 
                    color={color}
                  />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </DatabaseProvider>
  );
}
