import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /v1/infractions
router.get('/', async (req, res) => {
  try {
    const { severity, status, search, limit = '50', offset = '0' } = req.query;
    const where: any = {};

    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (search) {
      const term = (search as string).toUpperCase();
      where.OR = [
        { plate: { contains: term, mode: 'insensitive' } },
        { type: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [infractions, total] = await Promise.all([
      prisma.infraction.findMany({
        where,
        include: {
          registeredBy: { select: { id: true, fullName: true } },
          vacancy: { select: { id: true, number: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.infraction.count({ where }),
    ]);

    res.json({ data: infractions, total });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar infrações.', details: error.message });
  }
});

// POST /v1/infractions
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { plate, type, location, severity, description, vacancyId } = req.body;

    const infraction = await prisma.infraction.create({
      data: {
        plate: plate.toUpperCase(),
        type,
        location,
        severity,
        description,
        vacancyId,
        registeredById: req.user!.userId,
      },
    });

    res.status(201).json(infraction);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao registrar infração.', details: error.message });
  }
});

// PATCH /v1/infractions/:id
router.patch('/:id', async (req, res) => {
  try {
    const infraction = await prisma.infraction.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(infraction);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar infração.', details: error.message });
  }
});

export default router;
