// Punto de entrada único para servicios de SyncNote
// Importa desde aquí para acceder a Firebase (auth, db) y a la sincronización (CRUD y listeners).

export { auth, db, ensureAnonAuth } from './firebase';
export { startSync, pushNote, deleteNote, pushTask, deleteTask } from './sync';

// Ejemplos de uso:
// import { db, ensureAnonAuth, pushNote } from '@/src/services';
// import { doc, setDoc } from 'firebase/firestore';
// await ensureAnonAuth();
// await pushNote({ id: 'demo', title: 'Hola', content: '...', createdAt: Date.now(), updatedAt: Date.now() });
