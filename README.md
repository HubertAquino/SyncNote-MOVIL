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
