import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, Task, ID } from '../types/models';

const NOTES_KEY = 'syncnote.notes.v1';
const TASKS_KEY = 'syncnote.tasks.v1';

async function getArray<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw) as T[]; } catch { return []; }
}

async function setArray<T>(key: string, arr: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(arr));
}

export const NotesRepo = {
  async all(): Promise<Note[]> {
    return getArray<Note>(NOTES_KEY);
  },
  async get(id: ID): Promise<Note | undefined> {
    const list = await this.all();
    return list.find(n => n.id === id);
  },
  async upsert(note: Note): Promise<void> {
    const list = await this.all();
    const idx = list.findIndex(n => n.id === note.id);
    if (idx >= 0) list[idx] = note; else list.unshift(note);
    await setArray(NOTES_KEY, list);
  },
  async remove(id: ID): Promise<void> {
    const list = await this.all();
    await setArray(NOTES_KEY, list.filter(n => n.id !== id));
  },
};

export const TasksRepo = {
  async all(): Promise<Task[]> {
    return getArray<Task>(TASKS_KEY);
  },
  async get(id: ID): Promise<Task | undefined> {
    const list = await this.all();
    return list.find(t => t.id === id);
  },
  async upsert(task: Task): Promise<void> {
    const list = await this.all();
    const idx = list.findIndex(t => t.id === task.id);
    if (idx >= 0) list[idx] = task; else list.unshift(task);
    await setArray(TASKS_KEY, list);
  },
  async remove(id: ID): Promise<void> {
    const list = await this.all();
    await setArray(TASKS_KEY, list.filter(t => t.id !== id));
  },
  async clearCompleted(): Promise<void> {
    const list = await this.all();
    await setArray(TASKS_KEY, list.filter(t => t.status !== 'done'));
  },
};

export function newId(): ID {
  // Simple UUID-ish
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
