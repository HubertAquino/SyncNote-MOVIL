import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, FAB, List, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TasksRepo } from '../storage/repository';
import { pushTask } from '../services/sync';
import { Task } from '../types/models';
import { useNavigation } from '@react-navigation/native';

type Filter = 'pending' | 'done' | 'all';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const nav = useNavigation<any>();

  useEffect(() => {
    const id = setInterval(async () => setTasks(await TasksRepo.all()), 800);
    return () => clearInterval(id);
  }, []);

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.Content title="Tareas" />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 12, flex: 1 }}>
        <SegmentedButtons
          value={filter}
          onValueChange={(v: Filter) => setFilter(v)}
          buttons={[
            { value: 'pending', label: 'Pendientes' },
            { value: 'done', label: 'Hechas' },
            { value: 'all', label: 'Todas' },
          ]}
        />

        {filtered.map(t => (
          <List.Item
            key={t.id}
            title={t.title}
            description={t.dueAt ? new Date(t.dueAt).toLocaleString() : undefined}
            left={p => <List.Icon {...p} icon={t.status === 'done' ? 'check-circle' : 'checkbox-blank-circle-outline'} />}
            onPress={() => nav.navigate('TaskEditor' as never, { id: t.id } as never)}
            onLongPress={async () => {
              const updated: Task = { ...t, status: t.status === 'done' ? 'pending' : 'done', updatedAt: Date.now() };
              await TasksRepo.upsert(updated);
              await pushTask(updated);
              setTasks(await TasksRepo.all());
            }}
          />
        ))}
      </View>

      <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 }} onPress={() => nav.navigate('TaskEditor' as never)} />
    </SafeAreaView>
  );
}
