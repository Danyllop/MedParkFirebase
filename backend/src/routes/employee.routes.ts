import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /v1/employees
router.get('/', async (req, res) => {
  try {
    const { status, registrationType, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (registrationType) where.registrationType = registrationType;
    if (search) {
      const term = (search as string).toUpperCase();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { cpf: { contains: term } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: { vehicles: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar funcionários.', details: error.message });
  }
});

// GET /v1/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: { vehicles: true },
    });

    if (!employee) {
      res.status(404).json({ error: 'Funcionário não encontrado.' });
      return;
    }

    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar funcionário.', details: error.message });
  }
});

// POST /v1/employees
router.post('/', async (req, res) => {
  try {
    const { name, cpf, position, unit, bond, phone, registrationType, expirationDate } = req.body;

    const employee = await prisma.employee.create({
      data: {
        name: name.toUpperCase(),
        cpf,
        position: position.toUpperCase(),
        unit: unit.toUpperCase(),
        bond: bond.toUpperCase(),
        phone,
        registrationType,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });

    res.status(201).json(employee);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'CPF já cadastrado para outro funcionário.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar funcionário.', details: error.message });
  }
});

// PATCH /v1/employees/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.name) data.name = data.name.toUpperCase();
    if (data.position) data.position = data.position.toUpperCase();
    if (data.unit) data.unit = data.unit.toUpperCase();
    if (data.bond) data.bond = data.bond.toUpperCase();
    if (data.expirationDate) data.expirationDate = new Date(data.expirationDate);

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: { vehicles: true },
    });

    res.json(employee);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Funcionário não encontrado.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao atualizar funcionário.', details: error.message });
  }
});

// DELETE /v1/employees/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.employee.update({ where: { id: req.params.id }, data: { status: 'INATIVO' } });
    res.json({ message: 'Funcionário inativado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao inativar funcionário.', details: error.message });
  }
});

export default router;
