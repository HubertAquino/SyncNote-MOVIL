import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { startSync } from './src/services/sync';

import TodayScreen from './src/screens/TodayScreen';
import NotesScreen from './src/screens/NotesScreen';
import TasksScreen from './src/screens/TasksScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import TaskEditorScreen from './src/screens/TaskEditorScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type RootStackParamList = {
  Root: undefined;
  NoteEditor: { id?: string } | undefined;
  TaskEditor: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'calendar-today';
          if (route.name === 'Hoy') iconName = 'calendar-today';
          if (route.name === 'Notas') iconName = 'note-text';
          if (route.name === 'Tareas') iconName = 'check-circle-outline';
          if (route.name === 'Ajustes') iconName = 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Hoy" component={TodayScreen} />
      <Tab.Screen name="Notas" component={NotesScreen} />
      <Tab.Screen name="Tareas" component={TasksScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();

  useEffect(() => {
    // Solicitar permisos de notificaciones en primer arranque
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permisos de notificación no concedidos');
      }
      // Iniciar sincronización Firebase (Auth anónimo + listeners Firestore)
      try {
        await startSync();
      } catch (e) {
        console.warn('Sync Firebase no inició:', e);
      }
    })();
  }, []);

  const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navTheme = scheme === 'dark' ? NavDarkTheme : NavDefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="NoteEditor" component={NoteEditorScreen} options={{ title: 'Editar nota' }} />
          <Stack.Screen name="TaskEditor" component={TaskEditorScreen} options={{ title: 'Editar tarea' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
