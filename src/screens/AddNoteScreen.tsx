import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, TextInput, Button, Switch, HelperText, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { CategoriesRepo, NotesRepo, newId } from '../storage/repository';
import { Note, Category } from '../types/models';
import { pushNote } from '../services/sync';

export default function AddNoteScreen() {
  const nav = useNavigation<any>();
  const [note, setNote] = useState<Note | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const now = Date.now();
      setNote({ id: newId(), title: '', content: '', createdAt: now, updatedAt: now, pinned: false });
      setCats(await CategoriesRepo.all());
    })();
  }, []);

  if (!note) return null;

  const save = async () => {
    const updated = { ...note, updatedAt: Date.now() };
    await NotesRepo.upsert(updated);
    await pushNote(updated);
    nav.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => nav.goBack()} />
        <Appbar.Content title="Nueva nota" />
        <Appbar.Action icon="content-save" onPress={save} />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 12 }}>
        <TextInput label="Título" value={note.title} onChangeText={(t) => setNote({ ...note, title: t })} />
        <TextInput label="Contenido" value={note.content} onChangeText={(t) => setNote({ ...note, content: t })} multiline numberOfLines={8} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <HelperText type="info">Marcar como principal</HelperText>
          <Switch value={!!note.pinned} onValueChange={(v) => setNote({ ...note, pinned: v })} />
        </View>
        <Menu
          visible={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          anchor={<Button mode="outlined" onPress={() => setMenuOpen(true)}>{cats.find(c => c.id === note.categoryId)?.name || 'Seleccionar categoría'}</Button>}
        >
          {cats.length === 0 ? (
            <Menu.Item title="Sin categorías" />
          ) : (
            cats.map(c => (
              <Menu.Item key={c.id} title={c.name} onPress={() => { setNote({ ...note, categoryId: c.id }); setMenuOpen(false); }} />
            ))
          )}
          {note.categoryId ? <Menu.Item title="Quitar categoría" onPress={() => { setNote({ ...note, categoryId: undefined }); setMenuOpen(false); }} /> : null}
        </Menu>
        <Button mode="contained" onPress={save}>Guardar</Button>
      </View>
    </View>
  );
}
