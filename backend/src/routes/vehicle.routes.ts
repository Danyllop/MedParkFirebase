import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /v1/vehicles
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where: any = {};

    if (search) {
      const term = (search as string).toUpperCase();
      where.OR = [
        { plate: { contains: term, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
        { employee: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { employee: { select: { id: true, name: true, cpf: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(vehicles);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar veículos.', details: error.message });
  }
});

// GET /v1/vehicles/next-sticker
router.get('/next-sticker', async (_req, res) => {
  try {
    const maxSticker = await prisma.vehicle.aggregate({ _max: { stickerNumber: true } });
    const current = maxSticker._max.stickerNumber || 0;
    const next = current < 11000 ? 11000 : current + 1;
    res.json({ nextSticker: next });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao gerar adesivo.', details: error.message });
  }
});

// POST /v1/vehicles
router.post('/', async (req, res) => {
  try {
    const { employeeId, plate, stickerNumber, model, color, isPrimary } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        employeeId,
        plate: plate.toUpperCase(),
        stickerNumber: stickerNumber ? parseInt(stickerNumber) : null,
        model: model.toUpperCase(),
        color: color.toUpperCase(),
        isPrimary: isPrimary ?? true,
      },
      include: { employee: { select: { id: true, name: true } } },
    });

    res.status(201).json(vehicle);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Placa ou número de adesivo já cadastrado.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao cadastrar veículo.', details: error.message });
  }
});

// PATCH /v1/vehicles/:id
router.patch('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.plate) data.plate = data.plate.toUpperCase();
    if (data.model) data.model = data.model.toUpperCase();
    if (data.color) data.color = data.color.toUpperCase();

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data,
    });

    res.json(vehicle);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar veículo.', details: error.message });
  }
});

// DELETE /v1/vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.vehicle.update({ where: { id: req.params.id }, data: { status: 'INATIVO' } });
    res.json({ message: 'Veículo inativado.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao inativar veículo.', details: error.message });
  }
});

export default router;
