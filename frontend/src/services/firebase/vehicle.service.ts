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
  limit, 
  Timestamp,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface Vehicle {
  id?: string;
  employeeId: string;
  plate: string;
  stickerNumber?: number | null;
  model: string;
  color: string;
  isPrincipal: boolean;
  status: 'ATIVO' | 'INATIVO';
  createdAt?: any;
  updatedAt?: any;
  employee?: {
    id: string;
    name: string;
    cpf: string;
  };
}

const COLLECTION_NAME = 'vehicles';

// Cache simples em memória para evitar leituras excessivas no Spark Plan
let vehicleCache: { data: Vehicle[], timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const vehicleService = {
  async getAll(filters: { search?: string; forceRefresh?: boolean } = {}) {
    // Verificar cache
    const now = Date.now();
    if (!filters.forceRefresh && vehicleCache && (now - vehicleCache.timestamp < CACHE_TTL)) {
       let filtered = [...vehicleCache.data];
       if (filters.search) {
         const term = filters.search.toUpperCase();
         filtered = filtered.filter(v => 
           v.plate.toUpperCase().includes(term) || 
           v.model.toUpperCase().includes(term) ||
           v.employee?.name.toUpperCase().includes(term)
         );
       }
       return filtered;
    }

    // Para simplificar a pesquisa por múltiplos campos (placa, modelo, nome do dono),
    // buscaremos os ativos e filtraremos no cliente.
    const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'ATIVO'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
    })) as Vehicle[];

    // Atualizar cache
    vehicleCache = { data: results, timestamp: now };

    if (filters.search) {
      const term = filters.search.toUpperCase();
      results = results.filter(v => 
        v.plate.toUpperCase().includes(term) || 
        v.model.toUpperCase().includes(term) ||
        v.employee?.name.toUpperCase().includes(term)
      );
    }

    return results;
  },

  async getNextStickerNumber() {
    const q = query(collection(db, COLLECTION_NAME), orderBy('stickerNumber', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return 11000;
    
    const lastSticker = snapshot.docs[0].data().stickerNumber || 0;
    return lastSticker < 11000 ? 11000 : lastSticker + 1;
  },

  async create(data: Omit<Vehicle, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    // Verificação de unicidade (Placa)
    const plateCheck = query(collection(db, COLLECTION_NAME), where('plate', '==', data.plate.toUpperCase()), where('status', '==', 'ATIVO'));
    const plateExists = await getDocs(plateCheck);
    if (!plateExists.empty) {
      throw new Error('Placa já cadastrada no sistema.');
    }

    // Buscar dados básicos do funcionário para desnormalização (facilita listagem)
    const empRef = doc(db, 'employees', data.employeeId);
    const empSnap = await getDoc(empRef);
    const empData = empSnap.exists() ? empSnap.data() : null;

    const payload = {
      ...data,
      plate: data.plate.toUpperCase(),
      model: data.model.toUpperCase(),
      color: data.color.toUpperCase(),
      status: 'ATIVO',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      employee: empData ? {
        id: empSnap.id,
        name: empData.name,
        cpf: empData.cpf
      } : undefined
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  },

  async update(id: string, data: Partial<Vehicle>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    const payload: any = { ...data, updatedAt: serverTimestamp() };
    if (data.plate) payload.plate = data.plate.toUpperCase();
    if (data.model) payload.model = data.model.toUpperCase();
    if (data.color) payload.color = data.color.toUpperCase();

    await updateDoc(docRef, payload);
    return { id, ...payload };
  },

  async togglePrincipal(id: string, employeeId: string) {
    return await runTransaction(db, async (transaction) => {
      // 1. Buscar todos os veículos do funcionário
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('employeeId', '==', employeeId),
        where('status', '==', 'ATIVO')
      );
      const snapshot = await getDocs(q);

      // 2. Marcar o selecionado como principal e os outros como não principal
      snapshot.docs.forEach((vDoc) => {
        transaction.update(vDoc.ref, { 
          isPrincipal: vDoc.id === id,
          updatedAt: serverTimestamp() 
        });
      });
    });
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status: 'INATIVO', updatedAt: serverTimestamp() });
    return { message: 'Veículo inativado com sucesso.' };
  },

  async getByEmployee(employeeId: string) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('employeeId', '==', employeeId),
      where('status', '==', 'ATIVO')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vehicle[];
  }
};
