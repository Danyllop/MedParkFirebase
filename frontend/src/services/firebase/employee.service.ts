import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface Employee {
  id?: string;
  name: string;
  cpf: string;
  position: string;
  unit: string;
  bond: string;
  phone?: string;
  registrationType: 'PERMANENTE' | 'PROVISORIO';
  expirationDate?: Date | null;
  status: 'ATIVO' | 'INATIVO';
  createdAt?: any;
  updatedAt?: any;
  vehicles?: any[];
}

const COLLECTION_NAME = 'employees';

// Cache simples em memória para evitar leituras excessivas no Spark Plan
let employeeCache: { data: Employee[], timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const employeeService = {
  async getAll(filters: { status?: string; registrationType?: string; search?: string; forceRefresh?: boolean } = {}) {
    // Verificar cache (apenas se não houver filtros complexos para simplificar)
    const now = Date.now();
    if (!filters.forceRefresh && employeeCache && (now - employeeCache.timestamp < CACHE_TTL)) {
       let filtered = [...employeeCache.data];
       if (filters.status) filtered = filtered.filter(e => e.status === filters.status);
       if (filters.registrationType) filtered = filtered.filter(e => e.registrationType === filters.registrationType);
       if (filters.search) {
         const term = filters.search.toUpperCase();
         filtered = filtered.filter(e => e.name.toUpperCase().includes(term) || e.cpf.includes(term));
       }
       return filtered;
    }

    const constraints: QueryConstraint[] = [];
    if (filters.status) constraints.push(where('status', '==', filters.status));
    if (filters.registrationType) constraints.push(where('registrationType', '==', filters.registrationType));

    const q = query(collection(db, COLLECTION_NAME), ...constraints, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
      expirationDate: (doc.data().expirationDate as Timestamp)?.toDate(),
    })) as Employee[];

    // Otimização: Buscar TODOS os veículos ATIVOS em uma única query para evitar N+1 leituras
    // Isso economiza MUITAS leituras no plano Spark.
    const vehicleQuery = query(collection(db, 'vehicles'), where('status', '==', 'ATIVO'));
    const vehicleSnapshot = await getDocs(vehicleQuery);
    const vehiclesByEmployee = vehicleSnapshot.docs.reduce((acc: Record<string, any[]>, d) => {
      const v = { id: d.id, ...d.data() } as any;
      if (!acc[v.employeeId]) acc[v.employeeId] = [];
      acc[v.employeeId].push(v);
      return acc;
    }, {});

    results = results.map(emp => ({
      ...emp,
      vehicles: vehiclesByEmployee[emp.id || ''] || []
    }));

    // Atualizar cache global
    if (!filters.status && !filters.registrationType) {
      employeeCache = { data: results, timestamp: now };
    }

    if (filters.search) {
      const term = filters.search.toUpperCase();
      results = results.filter(emp => 
        emp.name.toUpperCase().includes(term) || 
        emp.cpf.includes(term)
      );
    }

    return results;
  },

  async getById(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    const employee = {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate(),
      expirationDate: (data.expirationDate as Timestamp)?.toDate(),
    } as Employee;

    // Buscar veículos
    const vQuery = query(collection(db, 'vehicles'), where('employeeId', '==', id), where('status', '==', 'ATIVO'));
    const vSnapshot = await getDocs(vQuery);
    employee.vehicles = vSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return employee;
  },

  async create(data: any) {
    return await runTransaction(db, async (transaction) => {
      // 1. Verificar unicidade de CPF
      const q = query(collection(db, COLLECTION_NAME), where('cpf', '==', data.cpf));
      const existing = await getDocs(q);
      if (!existing.empty) {
        throw new Error('CPF já cadastrado para outro funcionário.');
      }

      // 2. Criar Funcionário
      const empRef = doc(collection(db, COLLECTION_NAME));
      const employeePayload = {
        name: data.name.toUpperCase(),
        cpf: data.cpf,
        position: (data.role || data.position).toUpperCase(),
        unit: (data.location || data.unit).toUpperCase(),
        bond: data.bond.toUpperCase(),
        phone: data.phone || null,
        registrationType: data.registrationType || 'PERMANENTE',
        expirationDate: data.expirationDate ? Timestamp.fromDate(new Date(data.expirationDate)) : null,
        status: 'ATIVO',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      transaction.set(empRef, employeePayload);

      // 3. Criar Veículo se fornecido
      if (data.plate && data.model) {
        const vRef = doc(collection(db, 'vehicles'));
        transaction.set(vRef, {
          employeeId: empRef.id,
          owner: data.name.toUpperCase(),
          plate: data.plate.toUpperCase(),
          model: data.model.toUpperCase(),
          color: data.color.toUpperCase(),
          isPrincipal: true,
          status: 'ATIVO',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      return { id: empRef.id, ...employeePayload };
    });
  },

  async update(id: string, data: any) {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    const payload: any = { 
      ...data, 
      updatedAt: serverTimestamp(),
      position: (data.role || data.position)?.toUpperCase(),
      unit: (data.location || data.unit)?.toUpperCase()
    };
    
    delete payload.role;
    delete payload.location;

    if (data.name) payload.name = data.name.toUpperCase();
    if (data.bond) payload.bond = data.bond.toUpperCase();
    if (data.expirationDate) payload.expirationDate = Timestamp.fromDate(new Date(data.expirationDate));

    await updateDoc(docRef, payload);
    return { id, ...payload };
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status: 'INATIVO', updatedAt: serverTimestamp() });
    return { message: 'Funcionário inativado com sucesso.' };
  }
};
