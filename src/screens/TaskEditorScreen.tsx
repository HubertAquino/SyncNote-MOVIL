import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, TextInput, Button, Switch, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { TasksRepo, newId } from '../storage/repository';
import { Task } from '../types/models';
import { scheduleReminder } from '../notifications';
import { pushTask, deleteTask } from '../services/sync';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskEditor'>;

export default function TaskEditorScreen({ route, navigation }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [remind, setRemind] = useState(false);

  useEffect(() => {
    (async () => {
      if (route.params?.id) {
        const t = await TasksRepo.get(route.params.id);
        if (t) {
          setTask(t);
          setRemind(Boolean(t.remindAt));
        }
      } else {
        const now = Date.now();
        setTask({ id: newId(), title: '', description: '', status: 'pending', createdAt: now, updatedAt: now });
      }
    })();
  }, [route.params]);

  if (!task) return null;

  const save = async () => {
    const updated = { ...task, updatedAt: Date.now() };
    await TasksRepo.upsert(updated);
    await pushTask(updated);
    if (remind && updated.dueAt) {
      await scheduleReminder(updated.id, 'Recordatorio', updated.title, new Date(updated.dueAt));
    }
    navigation.goBack();
  };

  const remove = async () => {
    await TasksRepo.remove(task.id);
    await deleteTask(task.id);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={task.title || 'Nueva tarea'} />
        <Appbar.Action icon="content-save" onPress={save} />
        <Appbar.Action icon="delete" onPress={remove} />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 8 }}>
        <TextInput label="Título" value={task.title} onChangeText={(t) => setTask({ ...task, title: t })} />
        <TextInput label="Descripción" value={task.description} onChangeText={(t) => setTask({ ...task, description: t })} multiline />
        <TextInput label="Fecha límite (ISO)" value={task.dueAt ? new Date(task.dueAt).toISOString() : ''} onChangeText={(t) => setTask({ ...task, dueAt: t ? Date.parse(t) : undefined })} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <HelperText type="info">Programar recordatorio en la fecha límite</HelperText>
          <Switch value={remind} onValueChange={setRemind} />
        </View>
        <Button mode="contained" onPress={save}>Guardar</Button>
      </View>
    </View>
  );
}
