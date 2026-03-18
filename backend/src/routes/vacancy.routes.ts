import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// /v1/vacancies/next-number
router.get('/next-number', async (req, res) => {
  try {
    const { gate } = req.query;
    if (!gate) {
      res.status(400).json({ error: 'Parâmetro gate é obrigatório.' });
      return;
    }

    const gateStr = String(gate).toUpperCase() as 'A' | 'E';

    // Busca TODOS os números existentes para este portão
    const existingVacancies = await (prisma.vacancy as any).findMany({
      where: { gate: gateStr },
      select: { number: true },
    });

    // Extrai a parte numérica e pega o MÁXIMO — resistente a gaps de deleção
    const prefix = gateStr === 'A' ? 'A-' : 'E-';
    const defaultStart = gateStr === 'A' ? 1 : 201;

    let maxNum = defaultStart - 1;
    for (const v of existingVacancies) {
      const parsed = parseInt(v.number.replace(prefix, ''), 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }

    const nextNumber = `${prefix}${String(maxNum + 1).padStart(3, '0')}`;

    res.json({ nextNumber });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao calcular próximo número.', details: error.message });
  }
});


// GET /v1/vacancies
router.get('/', async (req, res) => {
  try {
    const { gate, status, type } = req.query;
    const where: any = {};

    if (gate) where.gate = gate as string;
    if (status) where.currentStatus = status as string;
    if (type) where.type = type as string;

    const vacancies = await (prisma.vacancy as any).findMany({
      where,
      orderBy: { number: 'asc' },
    });

    res.json(vacancies);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar vagas.', details: error.message });
  }
});

// POST /v1/vacancies
router.post('/', requireRole('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const { gate, number, type, locality } = req.body;

    const vacancy = await (prisma.vacancy as any).create({
      data: { gate, number, type, locality },
    });

    res.status(201).json(vacancy);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Vaga já existe para este portão.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar vaga.', details: error.message });
  }
});

// POST /v1/vacancies/batch - Criação em lote
router.post('/batch', requireRole('ADMIN'), async (req, res) => {
  try {
    const { vacancies } = req.body; // Array de { gate, number, type, locality }

    const result = await (prisma.vacancy as any).createMany({
      data: vacancies,
      skipDuplicates: true,
    });

    res.status(201).json({ message: `${result.count} vagas criadas com sucesso.` });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar vagas em lote.', details: error.message });
  }
});

// PATCH /v1/vacancies/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = req.params.id as string;
    const { currentStatus, occupantName, occupantPlate, occupantVehicle } = req.body;

    const vacancy = await (prisma.vacancy as any).update({
      where: { id },
      data: {
        currentStatus,
        occupantName: currentStatus === 'LIVRE' ? null : occupantName,
        occupantPlate: currentStatus === 'LIVRE' ? null : occupantPlate,
        occupantVehicle: currentStatus === 'LIVRE' ? null : occupantVehicle,
      },
    });

    res.json(vacancy);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar status da vaga.', details: error.message });
  }
});

// PATCH /v1/vacancies/:id
router.patch('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const id = String(req.params.id);
    const vacancy = await (prisma.vacancy as any).update({
      where: { id: id },
      data: req.body,
    });
    res.json(vacancy);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar vaga.', details: error.message });
  }
});

// DELETE /v1/vacancies/:id
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const id = req.params.id as string;
    
    const vacancy = await (prisma.vacancy as any).findUnique({ where: { id: id } });
    
    if (!vacancy) {
      res.status(404).json({ error: 'Vaga não encontrada.' });
      return;
    }

    if (vacancy.currentStatus !== 'LIVRE') {
      res.status(400).json({ error: 'Não é possível excluir uma vaga ocupada ou reservada.' });
      return;
    }

    await (prisma.vacancy as any).delete({ where: { id: id } });
    res.json({ message: 'Vaga excluída com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir vaga.', details: error.message });
  }
});

// PATCH /v1/vacancies/:id/reserve - Alternar reserva
router.patch('/:id/reserve', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    
    const vacancy = await (prisma.vacancy as any).findUnique({ where: { id: id } });
    
    if (!vacancy) {
      res.status(404).json({ error: 'Vaga não encontrada.' });
      return;
    }

    if (vacancy.currentStatus === 'OCUPADA') {
      res.status(400).json({ error: 'Não é possível reservar uma vaga ocupada.' });
      return;
    }

    const newStatus = vacancy.currentStatus === 'RESERVADA' ? 'LIVRE' : 'RESERVADA';
    
    const updated = await (prisma.vacancy as any).update({
      where: { id: id },
      data: { currentStatus: newStatus }
    });

    // Registrar no histórico de auditoria
    const eventType = newStatus === 'RESERVADA' ? 'RESERVA' : 'LIBERACAO';
    await (prisma.accessLog as any).create({
      data: {
        vacancyId: vacancy.id,
        operatorId: req.user!.userId,
        event: eventType,
        spot: vacancy.number,
        ownerName: 'SISTEMA', // Usar 'SISTEMA' como nome fica melhor no relatório
        ownerRole: 'RESERVA/LIBERAÇÃO', // Fica mais claro na coluna Cargo/Função
        createdAt: new Date(),
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao processar reserva.', details: error.message });
  }
});

export default router;
