import { db, ensureAnonAuth } from './firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { NotesRepo, TasksRepo } from '../storage/repository';
import { Note, Task } from '../types/models';

const COL_NOTES = 'notes';
const COL_TASKS = 'tasks';

export async function startSync(userId?: string) {
  const user = await ensureAnonAuth();
  const uid = user.uid;

  // Pull inicial
  await pullAll(uid);

  // Suscripciones
  onSnapshot(query(collection(db, COL_NOTES), where('uid', '==', uid)), async (snap) => {
    const all: Note[] = [];
    snap.forEach(d => {
      const data = d.data() as any;
      if (data.uid === uid) all.push({ ...data, id: d.id });
    });
    // Reemplaza almacenamiento local por el remoto más reciente
    for (const n of all) await NotesRepo.upsert(n);
  });

  onSnapshot(query(collection(db, COL_TASKS), where('uid', '==', uid)), async (snap) => {
    const all: Task[] = [];
    snap.forEach(d => {
      const data = d.data() as any;
      if (data.uid === uid) all.push({ ...data, id: d.id });
    });
    for (const t of all) await TasksRepo.upsert(t);
  });
}

export async function pushNote(n: Note, uid?: string) {
  const user = await ensureAnonAuth();
  const u = uid || user.uid;
  await setDoc(doc(db, COL_NOTES, n.id), { ...n, uid: u });
}

export async function deleteNote(id: string) {
  await deleteDoc(doc(db, COL_NOTES, id));
}

export async function pushTask(t: Task, uid?: string) {
  const user = await ensureAnonAuth();
  const u = uid || user.uid;
  await setDoc(doc(db, COL_TASKS, t.id), { ...t, uid: u });
}

export async function deleteTask(id: string) {
  await deleteDoc(doc(db, COL_TASKS, id));
}

async function pullAll(uid: string) {
  const nq = query(collection(db, COL_NOTES), where('uid', '==', uid));
  const tq = query(collection(db, COL_TASKS), where('uid', '==', uid));
  const [ns, ts] = await Promise.all([getDocs(nq), getDocs(tq)]);

  for (const d of ns.docs) await NotesRepo.upsert({ ...(d.data() as any), id: d.id });
  for (const d of ts.docs) await TasksRepo.upsert({ ...(d.data() as any), id: d.id });
}
