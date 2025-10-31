import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

let app = getApps()[0];
if (!app) {
  const cfg = (Constants.expoConfig?.extra as any)?.firebase || (Constants.manifest?.extra as any)?.firebase;
  if (!cfg) throw new Error('Falta configuración de Firebase en app.json -> expo.extra.firebase');
  app = initializeApp(cfg);
}

// En React Native necesitamos registrar explícitamente el componente de Auth y
// establecer persistencia usando AsyncStorage. Si ya existe, getAuth() lo retornará.
let _auth: ReturnType<typeof getAuth>;
try {
  // Intento directo: si ya existe, lo devuelve; si no está registrado, lanzará.
  _auth = getAuth(app);
} catch (e) {
  try {
    // Registra el componente de Auth explícitamente para RN/Expo
    _auth = initializeAuth(app, { persistence: inMemoryPersistence });
  } catch (e2) {
    // Último recurso: cargar compat para forzar el registro del componente 'auth'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('firebase/compat/auth');
    _auth = getAuth(app);
  }
}

export const auth = _auth;
export const db = getFirestore(app);

export async function ensureAnonAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) { unsub(); resolve(u); return; }
        const res = await signInAnonymously(auth);
        unsub();
        resolve(res.user);
      } catch (e) {
        unsub();
        reject(e);
      }
    });
  });
}
