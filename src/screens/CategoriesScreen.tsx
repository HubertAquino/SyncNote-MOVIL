import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, List, FAB, Dialog, Portal, TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoriesRepo, newId } from '../storage/repository';
import { Category } from '../types/models';

export default function CategoriesScreen() {
  const [cats, setCats] = useState<Category[]>([]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  const reload = async () => setCats(await CategoriesRepo.all());
  useEffect(() => { reload(); }, []);

  const add = async () => {
    const now = Date.now();
    await CategoriesRepo.upsert({ id: newId(), name: name.trim(), createdAt: now });
    setName('');
    setShow(false);
    reload();
  };

  const remove = async (id: string) => {
    await CategoriesRepo.remove(id);
    reload();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.Content title="Categorías" />
        <Appbar.Action icon="plus" onPress={() => setShow(true)} />
      </Appbar.Header>
      <View style={{ padding: 12, gap: 12, flex: 1 }}>
        {cats.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Sin categorías. Agrega una con el botón +</Text>
          </View>
        ) : (
          cats.map(c => (
            <List.Item
              key={c.id}
              title={c.name}
              description={new Date(c.createdAt).toLocaleDateString()}
              right={p => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Button compact onPress={() => remove(c.id)} icon="delete">
                    Eliminar
                  </Button>
                </View>
              )}
            />
          ))
        )}
      </View>
      <Portal>
        <Dialog visible={show} onDismiss={() => setShow(false)}>
          <Dialog.Title>Nueva categoría</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={name} onChangeText={setName} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShow(false)}>Cancelar</Button>
            <Button onPress={add} disabled={!name.trim()}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 }} onPress={() => setShow(true)} />
    </SafeAreaView>
  );
}
