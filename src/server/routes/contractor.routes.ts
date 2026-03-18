import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /v1/contractors
router.get('/', async (req, res) => {
  try {
    const { search, companyId } = req.query;
    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (search) {
      const term = (search as string).toUpperCase();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { cpf: { contains: term } },
      ];
    }

    const contractors = await prisma.contractor.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        vehicles: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(contractors);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar prestadores.', details: error.message });
  }
});

// POST /v1/contractors
router.post('/', async (req, res) => {
  try {
    const { companyId, name, cpf, role, phone, manager } = req.body;

    const contractor = await prisma.contractor.create({
      data: {
        companyId,
        name: name.toUpperCase(),
        cpf,
        role: role?.toUpperCase(),
        phone,
        manager: manager?.toUpperCase(),
      },
      include: { company: { select: { id: true, name: true } } },
    });

    res.status(201).json(contractor);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar prestador.', details: error.message });
  }
});

// PATCH /v1/contractors/:id
router.patch('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.name) data.name = data.name.toUpperCase();
    if (data.role) data.role = data.role.toUpperCase();

    const contractor = await prisma.contractor.update({ where: { id: req.params.id }, data });
    res.json(contractor);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar prestador.', details: error.message });
  }
});

// POST /v1/contractors/:id/vehicles
router.post('/:id/vehicles', async (req, res) => {
  try {
    const { plate, model, color, companyId } = req.body;

    const vehicle = await prisma.contractorVehicle.create({
      data: {
        contractorId: req.params.id,
        companyId,
        plate: plate.toUpperCase(),
        model: model.toUpperCase(),
        color: color.toUpperCase(),
      },
    });

    res.status(201).json(vehicle);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar veículo do prestador.', details: error.message });
  }
});

// DELETE /v1/contractors/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.contractor.update({ where: { id: req.params.id }, data: { status: 'INATIVO' } });
    res.json({ message: 'Prestador inativado.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao inativar prestador.', details: error.message });
  }
});

export default router;
