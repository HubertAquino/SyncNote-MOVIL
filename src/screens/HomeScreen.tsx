import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, List, Text, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotesRepo, TasksRepo } from '../storage/repository';
import { Note, Task } from '../types/models';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const nav = useNavigation<any>();

  useEffect(() => {
    const load = async () => {
      const [allNotes, allTasks] = await Promise.all([NotesRepo.all(), TasksRepo.all()]);
      setNotes(allNotes);
      setTasks(allTasks);
    };
    const id = setInterval(load, 800);
    load();
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.Content title="Inicio" />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 12, flex: 1 }}>
        {(() => {
          const pinned = notes.filter(n => n.pinned);
          const now = Date.now();
          const soonMs = 24 * 60 * 60 * 1000; // 24h
          const dueSoon = tasks
            .filter(t => t.status === 'pending' && t.dueAt && t.dueAt <= now + soonMs)
            .sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0));

          const hasAny = pinned.length > 0 || dueSoon.length > 0;
          if (!hasAny) {
            return (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="titleMedium" style={{ textAlign: 'center' }}>
                  No hay notas principales ni tareas próximas.
                </Text>
                <Text style={{ textAlign: 'center', marginTop: 8 }}>
                  Marca notas como "Principal" o asigna fecha a tus tareas.
                </Text>
              </View>
            );
          }

          return (
            <>
              {pinned.length > 0 && <List.Subheader>Notas principales</List.Subheader>}
              {pinned.map(n => (
                <List.Item
                  key={n.id}
                  title={n.title || 'Sin título'}
                  description={new Date(n.updatedAt).toLocaleString()}
                  onPress={() => nav.navigate('NoteEditor' as never, { id: n.id } as never)}
                  left={p => <List.Icon {...p} icon="pin" />}
                />
              ))}

              {dueSoon.length > 0 && <List.Subheader>Tareas próximas</List.Subheader>}
              {dueSoon.map(t => (
                <List.Item
                  key={t.id}
                  title={t.title}
                  description={t.dueAt ? new Date(t.dueAt).toLocaleString() : undefined}
                  onPress={() => nav.navigate('TaskEditor' as never, { id: t.id } as never)}
                  left={p => <List.Icon {...p} icon={t.dueAt && t.dueAt < Date.now() ? 'alert' : 'clock-outline'} />}
                />
              ))}
            </>
          );
        })()}
      </View>
      <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 }} onPress={() => nav.navigate('NoteEditor' as never)} />
    </SafeAreaView>
  );
}
