import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface Company {
  id?: string;
  name: string;
  taxId: string;
  segment: string;
  contact?: string;
  status: 'ATIVO' | 'INATIVO';
  contractorsCount?: number;
}

const COLLECTION_NAME = 'companies';

export const companyService = {
  async getAll(filters: { search?: string } = {}) {
    const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'ATIVO'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Company[];

    if (filters.search) {
      const term = filters.search.toUpperCase();
      results = results.filter(c => 
        c.name.toUpperCase().includes(term) || 
        c.taxId.includes(term)
      );
    }

    // Nota: Contagem de contratados seria feita com subcoleção ou nova query
    return results;
  },

  async create(data: Omit<Company, 'id' | 'status'>) {
    const q = query(collection(db, COLLECTION_NAME), where('taxId', '==', data.taxId));
    const existing = await getDocs(q);
    if (!existing.empty) throw new Error('CNPJ/CPF já cadastrado.');

    const payload = {
      ...data,
      name: data.name.toUpperCase(),
      segment: data.segment.toUpperCase(),
      status: 'ATIVO',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  },

  async update(id: string, data: Partial<Company>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload: any = { ...data, updatedAt: serverTimestamp() };
    if (data.name) payload.name = data.name.toUpperCase();
    if (data.segment) payload.segment = data.segment.toUpperCase();

    await updateDoc(docRef, payload);
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status: 'INATIVO', updatedAt: serverTimestamp() });
  }
};
