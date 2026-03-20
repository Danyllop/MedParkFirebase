import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface Infraction {
  id?: string;
  vacancyId?: string;
  registeredById: string;
  plate: string;
  type: string;
  location: string;
  severity: 'LEVE' | 'MEDIA' | 'MÉDIA' | 'GRAVE';
  description?: string;
  status: 'PENDENTE' | 'RESOLVIDA';
  createdAt?: any;
  updatedAt?: any;
  registeredBy?: {
    id: string;
    fullName: string;
  };
  vacancy?: {
    id: string;
    number: string;
  };
}

const COLLECTION_NAME = 'infractions';

export const infractionService = {
  async getAll(filters: { severity?: string; status?: string; search?: string } = {}) {
    const constraints: any[] = [orderBy('createdAt', 'desc'), limit(100)];
    if (filters.severity) constraints.push(where('severity', '==', filters.severity));
    if (filters.status) constraints.push(where('status', '==', filters.status));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);
    
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
    })) as Infraction[];

    if (filters.search) {
      const term = filters.search.toUpperCase();
      results = results.filter(inf => 
        inf.plate.toUpperCase().includes(term) || 
        inf.type.toUpperCase().includes(term) ||
        inf.location.toUpperCase().includes(term)
      );
    }

    return results;
  },

  async create(data: Omit<Infraction, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    const payload = {
      ...data,
      plate: data.plate.toUpperCase(),
      status: 'PENDENTE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  },

  async update(id: string, data: Partial<Infraction>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return { id, ...data };
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status: 'RESOLVIDA', updatedAt: serverTimestamp() }); // Let's mark as RESOLVIDA or add INATIVO
    // Actually, let's use a hidden field for soft delete if we want to keep history.
    // For now, I'll just delete it to match the UI behavior of "removing" it.
    // No, better to soft delete.
    await updateDoc(docRef, { isDeleted: true, updatedAt: serverTimestamp() });
  }
};
