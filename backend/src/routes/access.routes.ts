import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// POST /v1/access/entry
router.post('/entry', async (req: AuthRequest, res) => {
  try {
    const { vacancyId, spot, ownerName, plate, vehicleId, contractorId, employeeId, contractorVehicleId, destination } = req.body;

    // 1. Snapshot do Proprietário (Cargo/Função e Telefone)
    let snapshotRole = 'NÃO INFORMADO';
    let snapshotPhone = null;
    if (employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (emp) {
        snapshotRole = emp.position || 'NÃO INFORMADO';
        snapshotPhone = emp.phone;
      }
    } else if (contractorId) {
      const cont = await prisma.contractor.findUnique({ where: { id: contractorId } });
      if (cont) {
        snapshotRole = cont.role || 'PRESTADOR';
        snapshotPhone = cont.phone;
      }
    }

    // 2. Snapshot do Veículo (Modelo/Cor)
    let snapshotModel = null;
    let snapshotColor = null;
    if (vehicleId) {
      const v = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (v) {
        snapshotModel = v.model;
        snapshotColor = v.color;
      }
    } else if (contractorVehicleId) {
      const cv = await prisma.contractorVehicle.findUnique({ where: { id: contractorVehicleId } });
      if (cv) {
        snapshotModel = cv.model;
        snapshotColor = cv.color;
      }
    }

    // Regra de Negócio: Validação Cruzada de Presença (Anti-passback Global)
    const activeConditions: any[] = [];
    if (plate) activeConditions.push({ plate, exitTime: null });
    if (employeeId) activeConditions.push({ employeeId, exitTime: null });
    if (contractorId) activeConditions.push({ contractorId, exitTime: null });
    if (vehicleId) activeConditions.push({ vehicleId, exitTime: null });

    if (activeConditions.length > 0) {
      const activeEntry = await prisma.accessLog.findFirst({
        where: {
          OR: activeConditions,
          event: 'ENTRADA'
        },
        include: {
          vacancy: {
            select: { gate: true, number: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      if (activeEntry) {
        const gateName = activeEntry.vacancy?.gate === 'A' ? 'Portaria A' : 'Portaria E';
        const spotNum = activeEntry.spot || activeEntry.vacancy?.number;
        res.status(409).json({ 
          error: 'ACESSO NEGADO: Presença detectada em outro pátio.',
          details: `O registro já possui uma entrada ativa no ${gateName} (Vaga ${spotNum}).`
        });
        return;
      }
    }

    // Atualizar status da vaga
    if (vacancyId) {
      await prisma.vacancy.update({
        where: { id: vacancyId },
        data: {
          currentStatus: 'OCUPADA',
          occupantName: ownerName,
          occupantPlate: plate,
          occupantVehicle: snapshotModel ? `${snapshotModel} (${snapshotColor})` : null
        },
      });
    }

    const log = await prisma.accessLog.create({
      data: {
        vacancyId,
        vehicleId,
        contractorId,
        employeeId,
        contractorVehicleId,
        operatorId: req.user!.userId,
        event: 'ENTRADA',
        spot,
        ownerName,
        ownerRole: snapshotRole,
        ownerPhone: snapshotPhone,
        plate,
        vehicleModel: snapshotModel,
        vehicleColor: snapshotColor,
        entryTime: new Date(),
        destination,
      } as any, // Cast to any because TS might not see new schema fields yet
    });

    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao registrar entrada.', details: error.message });
  }
});

// POST /v1/access/exit
router.post('/exit', async (req: AuthRequest, res) => {
  try {
    const { vacancyId, spot, ownerName, plate } = req.body;

    // Liberar vaga
    if (vacancyId) {
      await prisma.vacancy.update({
        where: { id: vacancyId },
        data: {
          currentStatus: 'LIVRE',
          occupantName: null,
          occupantPlate: null,
          occupantVehicle: null,
        },
      });
    }

    // Atualizar log de entrada com hora de saída
    if (plate) {
      const entryLog = await prisma.accessLog.findFirst({
        where: { plate, event: 'ENTRADA', exitTime: null },
        orderBy: { createdAt: 'desc' },
      });

      if (entryLog) {
        await prisma.accessLog.update({
          where: { id: entryLog.id },
          data: { exitTime: new Date() },
        });
      }
    }

    // Criar log de saída com os mesmos dados da entrada (melhor para visualização em linha única futuramente)
    // Mas por enquanto mantemos a criação do evento SAIDA
    const log = await prisma.accessLog.create({
      data: {
        vacancyId,
        operatorId: req.user!.userId,
        event: 'SAIDA',
        spot,
        ownerName,
        plate,
        exitTime: new Date(),
      } as any,
    });

    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao registrar saída.', details: error.message });
  }
});

// GET /v1/access/history
router.get('/history', async (req, res) => {
  try {
    const { spot, plate, event, limit = '200', offset = '0' } = req.query;
    const where: any = {};

    if (spot) where.spot = { contains: (spot as string).toUpperCase() };
    if (plate) where.plate = { contains: (plate as string).toUpperCase() };
    if (event) where.event = event;

    const [logs, total] = await Promise.all([
      prisma.accessLog.findMany({
        where,
        include: {
          operator: { select: { id: true, fullName: true, role: true } },
          vacancy: { select: { id: true, number: true, gate: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.accessLog.count({ where }),
    ]);

    res.json({ data: logs, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar histórico.', details: error.message });
  }
});

export default router;
