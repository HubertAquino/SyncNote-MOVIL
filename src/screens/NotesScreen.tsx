import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, FAB, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotesRepo } from '../storage/repository';
import { Note } from '../types/models';
import { useNavigation } from '@react-navigation/native';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const nav = useNavigation<any>();

  useEffect(() => {
    const id = setInterval(async () => {
      setNotes(await NotesRepo.all());
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.Content title="Notas" />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 12, flex: 1 }}>
        {notes.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Sin notas aún.</Text>
          </View>
        ) : (
          notes.map(n => (
            <List.Item
              key={n.id}
              title={n.title || 'Sin título'}
              description={new Date(n.updatedAt).toLocaleString()}
              onPress={() => nav.navigate('NoteEditor' as never, { id: n.id } as never)}
              left={p => <List.Icon {...p} icon="note-text" />}
            />
          ))
        )}
      </View>
      <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 }} onPress={() => nav.navigate('NoteEditor' as never)} />
    </SafeAreaView>
  );
}
