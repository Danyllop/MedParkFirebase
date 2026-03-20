import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// O usuário deve substituir estas configurações pelas do seu console Firebase (ATUALIZADO)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC-7dVFd1ZYP1DGa8lRpMivMsz5GDZs4HQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medpark-saas.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medpark-saas",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medpark-saas.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "418562245724",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:418562245724:web:e6cd56193a29fe3266d299"
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
