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

export interface AccessLog {
  id?: string;
  vacancyId?: string;
  vehicleId?: string;
  employeeId?: string;
  contractorId?: string;
  operatorId: string;
  event: 'ENTRADA' | 'SAIDA' | 'RESERVA' | 'LIBERACAO';
  spot: string;
  ownerName: string;
  ownerRole?: string;
  ownerPhone?: string;
  plate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  entryTime?: any;
  exitTime?: any;
  destination?: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'access_logs';

export const accessService = {
  async registerEntry(data: any, operatorId: string) {
    return await runTransaction(db, async (transaction) => {
      // 1. Validar Anti-passback (simples)
      if (data.plate) {
        const q = query(collection(db, COLLECTION_NAME), 
          where('plate', '==', data.plate), 
          where('event', '==', 'ENTRADA'),
          where('exitTime', '==', null)
        );
        const existing = await getDocs(q);
        if (!existing.empty) {
          throw new Error('Acesso Negado: Veículo já possui entrada ativa.');
        }
      }

      // 2. Buscar Snapshots (Simulação do Hono)
      let snapshotRole = 'NÃO INFORMADO';
      let snapshotPhone = null;
      if (data.employeeId) {
        const empRef = doc(db, 'employees', data.employeeId);
        const empSnap = await transaction.get(empRef);
        if (empSnap.exists()) {
          snapshotRole = empSnap.data().position;
          snapshotPhone = empSnap.data().phone;
        }
      }

      // 3. Atualizar Vaga
      if (data.vacancyId) {
        const vRef = doc(db, 'vacancies', data.vacancyId);
        transaction.update(vRef, {
          currentStatus: 'OCUPADA',
          occupantName: data.ownerName,
          occupantPlate: data.plate,
          occupantVehicle: data.vehicleModel ? `${data.vehicleModel} (${data.vehicleColor})` : null,
          updatedAt: serverTimestamp()
        });
      }

      // 4. Criar Log
      const logRef = doc(collection(db, COLLECTION_NAME));
      const logData = {
        ...data,
        operatorId,
        event: 'ENTRADA',
        ownerRole: snapshotRole,
        ownerPhone: snapshotPhone,
        entryTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        exitTime: null
      };

      transaction.set(logRef, logData);
      return { id: logRef.id, ...logData };
    });
  },

  async registerExit(data: { vacancyId?: string; plate?: string; ownerName: string; spot: string }, operatorId: string) {
    return await runTransaction(db, async (transaction) => {
      // 1. Liberar Vaga
      if (data.vacancyId) {
        const vRef = doc(db, 'vacancies', data.vacancyId);
        transaction.update(vRef, {
          currentStatus: 'DISPONIVEL',
          occupantName: null,
          occupantPlate: null,
          occupantVehicle: null,
          updatedAt: serverTimestamp()
        });
      }

      // 2. Marcar Saída no Log de Entrada
      if (data.plate) {
        const q = query(collection(db, COLLECTION_NAME), 
          where('plate', '==', data.plate), 
          where('event', '==', 'ENTRADA'),
          where('exitTime', '==', null)
        );
        const entrySnapshot = await getDocs(q);
        if (!entrySnapshot.empty) {
          const entryId = entrySnapshot.docs[0].id;
          transaction.update(doc(db, COLLECTION_NAME, entryId), { exitTime: serverTimestamp() });
        }
      }

      // 3. Criar Log de Saída
      const logRef = doc(collection(db, COLLECTION_NAME));
      const logData = {
        ...data,
        operatorId,
        event: 'SAIDA',
        exitTime: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      transaction.set(logRef, logData);
      return { id: logRef.id, ...logData };
    });
  },

  async getHistory(filters: { spot?: string; plate?: string; event?: string } = {}) {
    const constraints: any[] = [orderBy('createdAt', 'desc'), limit(100)];
    if (filters.event) constraints.push(where('event', '==', filters.event));
    if (filters.plate) constraints.push(where('plate', '==', filters.plate.toUpperCase()));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      entryTime: (doc.data().entryTime as Timestamp)?.toDate(),
      exitTime: (doc.data().exitTime as Timestamp)?.toDate(),
    }));
  }
};
