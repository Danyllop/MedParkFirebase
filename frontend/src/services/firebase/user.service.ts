import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface User {
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'OPERADOR';
  status: 'ATIVO' | 'INATIVO';
  mustChangePassword: boolean;
}

const COLLECTION_NAME = 'users';

export const userService = {
  async getAll() {
    const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'ATIVO'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  },

  async getById(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as User) : null;
  },

  async update(id: string, data: Partial<User>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  // Método para criar o perfil inicial após o primeiro login ou via Admin
  async syncProfile(user: User) {
    const docRef = doc(db, COLLECTION_NAME, user.id);
    await setDoc(docRef, {
      ...user,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
  }
};
