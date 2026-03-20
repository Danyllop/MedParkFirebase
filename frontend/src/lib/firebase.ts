import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// O usuário deve substituir estas configurações pelas do seu console Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "SUA_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seu-projeto-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seu-projeto-firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "sua-ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "sua-APP-ID"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

// Habilita Persistência Offline
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Múltiplas abas abertas, persistência só funciona em uma por vez.
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // O navegador não suporta persistência.
      console.warn('Firestore persistence is not supported by this browser');
    }
  });
}

export default app;
