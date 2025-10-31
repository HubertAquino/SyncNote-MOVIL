# SyncNote

Aplicación móvil (Expo + React Native) para guardar notas y organizar tu día con tareas y recordatorios.

## Requisitos
- Node.js LTS y pnpm o npm
- Expo CLI (se instala al usar `npx expo`)
- iOS Simulator o dispositivo físico con la app Expo Go

### Firebase
- Proyecto en Firebase con Authentication (habilitar método Anónimo)
- Firestore Database (modo de prueba durante desarrollo)
- Configuración web (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
- Coloca las credenciales en `app.json` > `expo.extra.firebase`

## Configurar Firebase paso a paso
1) Crea un proyecto en Firebase Console
- Ve a https://console.firebase.google.com → Agregar proyecto.
- Asigna un nombre (p. ej. "SyncNote").

2) Registra una app Web
- En la pantalla de tu proyecto, haz clic en "Agregar app" → Web.
- Asigna un alias (p. ej. "syncnote-web").
- Obtendrás un objeto de configuración parecido a:

```json
{
	"apiKey": "...",
	"authDomain": "<tu-proyecto>.firebaseapp.com",
	"projectId": "<tu-proyecto>",
	"storageBucket": "<tu-proyecto>.appspot.com",
	"messagingSenderId": "...",
	"appId": "1:...:web:..."
}
```

3) Coloca la configuración en la app
- Abre `app.json` y reemplaza los placeholders en `expo.extra.firebase` con tus valores reales:

```json
{
	"expo": {
		"extra": {
			"firebase": {
				"apiKey": "TU_API_KEY",
				"authDomain": "TU_PROJECT_ID.firebaseapp.com",
				"projectId": "TU_PROJECT_ID",
				"storageBucket": "TU_PROJECT_ID.appspot.com",
				"messagingSenderId": "TU_SENDER_ID",
				"appId": "TU_APP_ID"
			}
		}
	}
}
```

4) Habilita Authentication (anónimo)
- En Firebase Console → Authentication → Métodos de inicio de sesión → habilita "Anónimo".

5) Crea Firestore en modo de prueba (para desarrollo)
- Firebase Console → Firestore Database → Crear base de datos → Modo de prueba.
- Reglas recomendadas para desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /{document=**} {
			allow read, write: if request.time < timestamp.date(2099, 1, 1);
		}
	}
}
```

En producción, restringe por usuario anónimo (uid) y colecciones específicas.

6) Ejecuta la app

```sh
npm install
npm start
```

Escanea el QR con Expo Go. La app inicia sesión anónima y se sincroniza con Firestore automáticamente.

### ¿Cómo saber que está funcionando?
- En la consola de Firebase → Firestore, verás colecciones `notes` y `tasks` con documentos que incluyen el campo `uid` (ID de usuario anónimo).
- Si no colocaste la configuración, la app lanzará `Falta configuración de Firebase en app.json -> expo.extra.firebase`.

### Uso dentro del código
- Inicialización: `src/services/firebase.ts` lee `expo.extra.firebase` y exporta `auth`, `db` y `ensureAnonAuth()`.
- Sincronización: `src/services/sync.ts` expone `startSync()` (se llama en `App.tsx`) y helpers para CRUD en Firestore.

Ejemplos rápidos (TypeScript):

```ts
import { db, ensureAnonAuth } from '@/src/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Garantiza sesión anónima y escribe un doc
await ensureAnonAuth();
await setDoc(doc(db, 'notes', 'demo'), { title: 'Hola', uid: 'se asigna internamente' });

// Lee un doc
const snap = await getDoc(doc(db, 'notes', 'demo'));
console.log('Existe?', snap.exists(), 'data:', snap.data());
```

Para la app:
- Guardar/actualizar Nota: usa `pushNote(note)`.
- Eliminar Nota: `deleteNote(noteId)`.
- Guardar/actualizar Tarea: `pushTask(task)`.
- Eliminar Tarea: `deleteTask(taskId)`.

`startSync()` suscribe cambios remotos y actualiza el almacén local automáticamente.

## Scripts
- `npm start`: inicia el servidor de desarrollo de Expo
- `npm run ios`: compila y corre en iOS
- `npm run android`: compila y corre en Android
- `npm run web`: corre en web (limitado)

## Funcionalidades
- Notas: crear, editar, eliminar
- Tareas: crear, editar, marcar como hechas, recordatorios locales
- Pantalla Hoy: resumen de pendientes y acceso rápido
- Tema claro/oscuro según sistema

## Estructura
- `App.tsx`: navegación principal (Tabs + Stack)
- `src/types/models.ts`: tipos TS para notas y tareas
- `src/storage/repository.ts`: almacenamiento en AsyncStorage
- `src/notifications.ts`: utilidades de notificaciones
- `src/screens/*`: pantallas

## Primer arranque
1. Instala dependencias
2. Inicia Expo

```sh
npm install
npm start
```

Escanea el QR con Expo Go o abre en el simulador.

## Imágenes
Reemplaza los archivos de `assets/` (`icon.png`, `splash.png`, `adaptive-icon.png`).

## Sincronización con Firebase
- La app inicia sesión anónima y sincroniza Notas y Tareas con colecciones `notes` y `tasks` en Firestore.
- Cada documento lleva un campo `uid` con el ID del usuario anónimo para filtrar por usuario.
- Los guardados/eliminaciones hacen push a Firestore; los listeners actualizan el almacenamiento local.
