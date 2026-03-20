import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface Vacancy {
  id?: string;
  gate: 'A' | 'E';
  number: string;
  type: 'COMUM' | 'DIRETORIA' | 'PNE' | 'IDOSO' | 'ALMOXARIFADO' | 'CEROF';
  locality: 'EXTERNA' | 'SUBSOLO_1' | 'SUBSOLO_2' | 'AREA_1' | 'AREA_2' | 'AREA_3' | 'AREA_4' | 'AREA_5';
  currentStatus: 'DISPONIVEL' | 'OCUPADA' | 'RESERVADA' | 'BLOQUEADA';
  occupantName?: string | null;
  occupantPlate?: string | null;
  occupantVehicle?: string | null;
  destination?: string | null;
}

const COLLECTION_NAME = 'vacancies';

// Cache para evitar excesso de leituras em navegação rápida
let vacancyCache: Record<string, { data: Vacancy[], timestamp: number }> = {};
const CACHE_TTL = 30 * 1000; // 30 segundos de cache para vagas (deve ser baixo)

export const vacancyService = {
  async getAll(filters: { gate?: string; status?: string; type?: string; forceRefresh?: boolean } = {}) {
    const cacheKey = JSON.stringify({ gate: filters.gate, status: filters.status, type: filters.type });
    const now = Date.now();
    
    if (!filters.forceRefresh && vacancyCache[cacheKey] && (now - vacancyCache[cacheKey].timestamp < CACHE_TTL)) {
      return vacancyCache[cacheKey].data;
    }

    const constraints: any[] = [];
    if (filters.gate) constraints.push(where('gate', '==', filters.gate));
    if (filters.status) constraints.push(where('currentStatus', '==', filters.status));
    if (filters.type) constraints.push(where('type', '==', filters.type));

    const q = query(collection(db, COLLECTION_NAME), ...constraints, orderBy('number', 'asc'));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vacancy[];

    // Atualizar cache
    vacancyCache[cacheKey] = { data: results, timestamp: now };
    
    return results;
  },

  async getNextNumber(gate: 'A' | 'E') {
    const q = query(collection(db, COLLECTION_NAME), where('gate', '==', gate), orderBy('number', 'desc'));
    const snapshot = await getDocs(q);
    
    const prefix = gate === 'A' ? 'A-' : 'E-';
    const defaultStart = gate === 'A' ? 1 : 201;

    let maxNum = defaultStart - 1;
    snapshot.docs.forEach(doc => {
      const num = parseInt(doc.data().number.replace(prefix, ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    });

    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  },

  async create(data: Omit<Vacancy, 'id' | 'currentStatus'>) {
    const payload = {
      ...data,
      currentStatus: 'DISPONIVEL',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  },

  async updateStatus(id: string, update: Partial<Vacancy>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = {
      ...update,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, payload);
  },

  async toggleReserve(id: string, operatorId: string) {
    return await runTransaction(db, async (transaction) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await transaction.get(docRef);
      
      if (!docSnap.exists()) throw new Error("Vaga não encontrada.");
      
      const data = docSnap.data() as Vacancy;
      if (data.currentStatus === 'OCUPADA') throw new Error("Não é possível reservar vaga ocupada.");

      const newStatus = data.currentStatus === 'RESERVADA' ? 'DISPONIVEL' : 'RESERVADA';
      transaction.update(docRef, { 
        currentStatus: newStatus, 
        occupantName: null,
        occupantPlate: null,
        occupantVehicle: null,
        updatedAt: serverTimestamp() 
      });

      // Auditoria
      const logRef = doc(collection(db, 'access_logs'));
      transaction.set(logRef, {
        vacancyId: id,
        operatorId,
        event: newStatus === 'RESERVADA' ? 'RESERVA' : 'LIBERACAO',
        spot: data.number,
        ownerName: 'SISTEMA',
        ownerRole: 'RESERVA/LIBERAÇÃO',
        createdAt: serverTimestamp()
      });

      return { ...data, currentStatus: newStatus };
    });
  },

  async occupy(id: string, entryData: { occupantName: string; occupantPlate: string; occupantVehicle: string; operatorId: string }) {
    return await runTransaction(db, async (transaction) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await transaction.get(docRef);
      
      if (!docSnap.exists()) throw new Error("Vaga não encontrada.");
      
      const data = docSnap.data() as Vacancy;
      if (data.currentStatus === 'OCUPADA') throw new Error("Vaga já está ocupada.");

      transaction.update(docRef, { 
        currentStatus: 'OCUPADA', 
        occupantName: entryData.occupantName,
        occupantPlate: entryData.occupantPlate,
        occupantVehicle: entryData.occupantVehicle,
        updatedAt: serverTimestamp() 
      });

      // Auditoria
      const logRef = doc(collection(db, 'access_logs'));
      transaction.set(logRef, {
        vacancyId: id,
        operatorId: entryData.operatorId,
        event: 'ENTRADA',
        spot: data.number,
        ownerName: entryData.occupantName,
        plate: entryData.occupantPlate,
        vehicle: entryData.occupantVehicle,
        createdAt: serverTimestamp()
      });

      return { ...data, currentStatus: 'OCUPADA', ...entryData };
    });
  },

  async release(id: string, operatorId: string) {
    return await runTransaction(db, async (transaction) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await transaction.get(docRef);
      
      if (!docSnap.exists()) throw new Error("Vaga não encontrada.");
      
      const data = docSnap.data() as Vacancy;
      
      transaction.update(docRef, { 
        currentStatus: 'DISPONIVEL', 
        occupantName: null,
        occupantPlate: null,
        occupantVehicle: null,
        updatedAt: serverTimestamp() 
      });

      // Auditoria
      const logRef = doc(collection(db, 'access_logs'));
      transaction.set(logRef, {
        vacancyId: id,
        operatorId,
        event: 'SAIDA',
        spot: data.number,
        ownerName: data.occupantName || 'S/N',
        plate: data.occupantPlate || 'S/P',
        createdAt: serverTimestamp()
      });

      return { ...data, currentStatus: 'DISPONIVEL' };
    });
  }
};
