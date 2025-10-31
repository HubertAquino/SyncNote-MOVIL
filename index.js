import { registerRootComponent } from 'expo';
// Fuerza la carga e inicialización de Firebase (incluye initializeAuth) antes de montar la App
import './src/services/firebase';
import App from './App';

// Registra el componente raíz con la clave 'main' que espera React Native
registerRootComponent(App);
