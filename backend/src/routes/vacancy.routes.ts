import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /v1/vacancies
router.get('/', async (req, res) => {
  try {
    const { gate, status, type } = req.query;
    const where: any = {};

    if (gate) where.gate = gate;
    if (status) where.currentStatus = status;
    if (type) where.type = type;

    const vacancies = await prisma.vacancy.findMany({
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

    const vacancy = await prisma.vacancy.create({
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

    const result = await prisma.vacancy.createMany({
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
    const { id } = req.params;
    const { currentStatus, occupantName, occupantPlate, occupantVehicle } = req.body;

    const vacancy = await prisma.vacancy.update({
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
    const vacancy = await prisma.vacancy.update({
      where: { id: req.params.id },
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
    await prisma.vacancy.delete({ where: { id: req.params.id } });
    res.json({ message: 'Vaga excluída.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir vaga.', details: error.message });
  }
});

export default router;
