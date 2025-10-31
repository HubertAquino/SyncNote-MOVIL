import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text, Button, Card, List } from 'react-native-paper';
import { TasksRepo, NotesRepo } from '../storage/repository';
import { Task } from '../types/models';
import { useNavigation } from '@react-navigation/native';

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  const nav = useNavigation<any>();

  useEffect(() => {
    const load = async () => {
      const [allTasks, notes] = await Promise.all([TasksRepo.all(), NotesRepo.all()]);
      setTasks(allTasks);
      setNotesCount(notes.length);
    };
    const id = setInterval(load, 1000);
    load();
    return () => clearInterval(id);
  }, []);

  const pendingToday = useMemo(() => tasks.filter(t => t.status === 'pending'), [tasks]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineMedium" accessibilityRole="header">Tu día</Text>
      <Card style={{ marginTop: 12 }}>
        <Card.Title title={`Tareas pendientes: ${pendingToday.length}`} />
        <Card.Content>
          {pendingToday.slice(0, 5).map(t => (
            <List.Item key={t.id} title={t.title} left={p => <List.Icon {...p} icon="check-circle-outline" />} />
          ))}
          {pendingToday.length === 0 && <Text>No tienes tareas pendientes. ¡Bien!</Text>}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => nav.navigate('Tareas' as never)}>Ver tareas</Button>
        </Card.Actions>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Card.Title title={`Notas guardadas: ${notesCount}`} />
        <Card.Actions>
          <Button onPress={() => nav.navigate('Notas' as never)}>Ver notas</Button>
        </Card.Actions>
      </Card>
    </View>
  );
}
