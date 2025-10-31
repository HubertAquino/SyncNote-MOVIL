import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, TextInput, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { NotesRepo, newId } from '../storage/repository';
import { pushNote, deleteNote } from '../services/sync';
import { Note } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteEditor'>;

export default function NoteEditorScreen({ route, navigation }: Props) {
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    (async () => {
      if (route.params?.id) {
        const n = await NotesRepo.get(route.params.id);
        if (n) setNote(n);
      } else {
        const now = Date.now();
        setNote({ id: newId(), title: '', content: '', createdAt: now, updatedAt: now });
      }
    })();
  }, [route.params]);

  if (!note) return null;

  const save = async () => {
    const updated = { ...note, updatedAt: Date.now() };
    await NotesRepo.upsert(updated);
    await pushNote(updated);
    navigation.goBack();
  };

  const remove = async () => {
    await NotesRepo.remove(note.id);
    await deleteNote(note.id);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={note.title || 'Nueva nota'} />
        <Appbar.Action icon="content-save" onPress={save} />
        <Appbar.Action icon="delete" onPress={remove} />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 8 }}>
        <TextInput label="Título" value={note.title} onChangeText={(t) => setNote({ ...note, title: t })} />
        <TextInput label="Contenido" value={note.content} onChangeText={(t) => setNote({ ...note, content: t })} multiline numberOfLines={8} />
        <Button mode="contained" onPress={save}>Guardar</Button>
      </View>
    </View>
  );
}
