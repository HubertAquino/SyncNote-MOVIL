import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

let app = getApps()[0];
if (!app) {
  const cfg = (Constants.expoConfig?.extra as any)?.firebase || (Constants.manifest?.extra as any)?.firebase;
  if (!cfg) throw new Error('Falta configuración de Firebase en app.json -> expo.extra.firebase');
  app = initializeApp(cfg);
}

export const auth = getAuth(app);
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
