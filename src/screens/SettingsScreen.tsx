import React from 'react';
import { View } from 'react-native';
import { List, Button } from 'react-native-paper';
import { cancelAllReminders } from '../notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <List.Item title="Tema" description="Usa el del sistema" left={p => <List.Icon {...p} icon="theme-light-dark" />} />
      <List.Item title="Notificaciones" description="Recordatorios locales" left={p => <List.Icon {...p} icon="bell" />} />
      <Button style={{ margin: 16 }} mode="contained" onPress={async () => { await cancelAllReminders(); }}>Cancelar recordatorios</Button>
      <Button style={{ marginHorizontal: 16 }} mode="outlined" onPress={async () => { await AsyncStorage.clear(); }}>Borrar datos locales</Button>
    </View>
  );
}
