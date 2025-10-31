import React from 'react';
import { View } from 'react-native';
import { Appbar, List, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelAllReminders } from '../notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.Content title="Ajustes" />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 12, flex: 1 }}>
        <List.Item title="Tema" description="Usa el del sistema" left={p => <List.Icon {...p} icon="theme-light-dark" />} />
        <List.Item title="Notificaciones" description="Recordatorios locales" left={p => <List.Icon {...p} icon="bell" />} />
        <Button mode="contained" onPress={async () => { await cancelAllReminders(); }}>Cancelar recordatorios</Button>
        <Button mode="outlined" onPress={async () => { await AsyncStorage.clear(); }}>Borrar datos locales</Button>
      </View>
    </SafeAreaView>
  );
}
