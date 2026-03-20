import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface Contractor {
  id?: string;
  companyId: string;
  name: string;
  cpf: string;
  role?: string;
  phone?: string;
  manager?: string;
  status: 'ATIVO' | 'INATIVO';
  company?: {
    id: string;
    name: string;
  };
}

export interface ContractorVehicle {
  id?: string;
  contractorId: string;
  companyId: string;
  plate: string;
  model: string;
  color: string;
}

const COLLECTION_NAME = 'contractors';
const VEHICLES_COLLECTION = 'contractor_vehicles';

export const contractorService = {
  async getAll(filters: { search?: string; companyId?: string } = {}) {
    const constraints: any[] = [where('status', '==', 'ATIVO'), orderBy('createdAt', 'desc')];
    if (filters.companyId) constraints.push(where('companyId', '==', filters.companyId));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);
    
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Contractor[];

    if (filters.search) {
      const term = filters.search.toUpperCase();
      results = results.filter(c => 
        c.name.toUpperCase().includes(term) || 
        c.cpf.includes(term)
      );
    }

    return results;
  },

  async create(data: Omit<Contractor, 'id' | 'status'>) {
    const payload = {
      ...data,
      name: data.name.toUpperCase(),
      role: data.role?.toUpperCase(),
      manager: data.manager?.toUpperCase(),
      status: 'ATIVO',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  },

  async update(id: string, data: Partial<Contractor>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload: any = { ...data, updatedAt: serverTimestamp() };
    if (data.name) payload.name = data.name.toUpperCase();
    if (data.role) payload.role = data.role.toUpperCase();

    await updateDoc(docRef, payload);
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status: 'INATIVO', updatedAt: serverTimestamp() });
  },

  // Veículos de Prestadores
  async addVehicle(contractorId: string, companyId: string, data: Omit<ContractorVehicle, 'id' | 'contractorId' | 'companyId'>) {
    const payload = {
      ...data,
      contractorId,
      companyId,
      plate: data.plate.toUpperCase(),
      model: data.model.toUpperCase(),
      color: data.color.toUpperCase(),
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), payload);
    return { id: docRef.id, ...payload };
  },

  async getVehicles(contractorId: string) {
    const q = query(collection(db, VEHICLES_COLLECTION), where('contractorId', '==', contractorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContractorVehicle[];
  },

  async getAllVehicles() {
    const q = query(collection(db, VEHICLES_COLLECTION), orderBy('plate'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContractorVehicle[];
  }
};
