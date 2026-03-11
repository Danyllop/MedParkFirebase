import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /v1/companies
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where: any = {};

    if (search) {
      const term = (search as string).toUpperCase();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { taxId: { contains: term } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      include: { _count: { select: { contractors: true } } },
      orderBy: { name: 'asc' },
    });

    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar empresas.', details: error.message });
  }
});

// POST /v1/companies
router.post('/', async (req, res) => {
  try {
    const { name, taxId, segment, contact } = req.body;

    const company = await prisma.company.create({
      data: { name: name.toUpperCase(), taxId, segment: segment.toUpperCase(), contact },
    });

    res.status(201).json(company);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'CNPJ/CPF já cadastrado.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar empresa.', details: error.message });
  }
});

// PATCH /v1/companies/:id
router.patch('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.name) data.name = data.name.toUpperCase();
    if (data.segment) data.segment = data.segment.toUpperCase();

    const company = await prisma.company.update({ where: { id: req.params.id }, data });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar empresa.', details: error.message });
  }
});

// DELETE /v1/companies/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.company.update({ where: { id: req.params.id }, data: { status: 'INATIVO' } });
    res.json({ message: 'Empresa inativada.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao inativar empresa.', details: error.message });
  }
});

export default router;
