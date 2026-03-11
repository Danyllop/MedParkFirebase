import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// POST /v1/access/entry
router.post('/entry', async (req: AuthRequest, res) => {
  try {
    const { vacancyId, spot, ownerName, plate, vehicleId, contractorId, contractorVehicleId, destination } = req.body;

    // Anti-passback: verificar se veículo/pessoa já está dentro
    if (plate) {
      const alreadyInside = await prisma.accessLog.findFirst({
        where: { plate, event: 'ENTRADA', exitTime: null },
        orderBy: { createdAt: 'desc' },
      });

      if (alreadyInside) {
        res.status(409).json({ error: `Veículo ${plate} já possui entrada ativa na vaga ${alreadyInside.spot}. Registre a saída primeiro.` });
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
        },
      });
    }

    const log = await prisma.accessLog.create({
      data: {
        vacancyId,
        vehicleId,
        contractorId,
        contractorVehicleId,
        operatorId: req.user!.userId,
        event: 'ENTRADA',
        spot,
        ownerName,
        plate,
        entryTime: new Date(),
        destination,
      },
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

    // Criar log de saída
    const log = await prisma.accessLog.create({
      data: {
        vacancyId,
        operatorId: req.user!.userId,
        event: 'SAIDA',
        spot,
        ownerName,
        plate,
      },
    });

    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao registrar saída.', details: error.message });
  }
});

// GET /v1/access/history
router.get('/history', async (req, res) => {
  try {
    const { spot, plate, event, limit = '100', offset = '0' } = req.query;
    const where: any = {};

    if (spot) where.spot = { contains: (spot as string).toUpperCase() };
    if (plate) where.plate = { contains: (plate as string).toUpperCase() };
    if (event) where.event = event;

    const [logs, total] = await Promise.all([
      prisma.accessLog.findMany({
        where,
        include: {
          operator: { select: { id: true, fullName: true } },
          vacancy: { select: { id: true, number: true, gate: true } },
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
