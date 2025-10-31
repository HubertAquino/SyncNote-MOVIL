import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, TextInput, Button, Switch, HelperText } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      if (route.params?.id) {
        const t = await TasksRepo.get(route.params.id);
        if (t) {
          setTask(t);
          setRemind(Boolean(t.remindAt));
          if (t.dueAt) setTempDate(new Date(t.dueAt));
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
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={task.title || 'Nueva tarea'} />
        <Appbar.Action icon="content-save" onPress={save} />
        <Appbar.Action icon="delete" onPress={remove} />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 8 }}>
        <TextInput label="Título" value={task.title} onChangeText={(t) => setTask({ ...task, title: t })} />
        <TextInput label="Descripción" value={task.description} onChangeText={(t) => setTask({ ...task, description: t })} multiline />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Button mode="outlined" onPress={() => setShowDate(true)}>
            {task.dueAt ? new Date(task.dueAt).toLocaleString() : 'Elegir fecha/hora'}
          </Button>
          {task.dueAt ? (
            <Button onPress={() => setTask({ ...task, dueAt: undefined })}>
              Quitar fecha
            </Button>
          ) : null}
        </View>
        {showDate && (
          <DateTimePicker
            value={task.dueAt ? new Date(task.dueAt) : tempDate}
            mode="date"
            display="default"
            onChange={(e: DateTimePickerEvent, d?: Date) => {
              setShowDate(false);
              if (d) {
                // Mantener hora previa
                const base = task.dueAt ? new Date(task.dueAt) : tempDate;
                const merged = new Date(d);
                merged.setHours(base.getHours(), base.getMinutes(), 0, 0);
                setTempDate(merged);
                setShowTime(true);
              }
            }}
          />
        )}
        {showTime && (
          <DateTimePicker
            value={task.dueAt ? new Date(task.dueAt) : tempDate}
            mode="time"
            display="default"
            onChange={(e: DateTimePickerEvent, d?: Date) => {
              setShowTime(false);
              if (d) {
                const merged = new Date(tempDate);
                merged.setHours(d.getHours(), d.getMinutes(), 0, 0);
                setTempDate(merged);
                setTask({ ...task, dueAt: merged.getTime() });
              }
            }}
          />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <HelperText type="info">Programar recordatorio en la fecha límite</HelperText>
          <Switch value={remind} onValueChange={setRemind} />
        </View>
        <Button mode="contained" onPress={save}>Guardar</Button>
      </View>
    </View>
  );
}
