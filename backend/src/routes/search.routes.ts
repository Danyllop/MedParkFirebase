import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /v1/search/universal?q=<term>
router.get('/universal', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      res.status(400).json({ error: 'Termo de busca deve ter pelo menos 2 caracteres.' });
      return;
    }

    const term = (q as string).toUpperCase();

    const [employees, vehicles, contractors, contractorVehicles] = await Promise.all([
      prisma.employee.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { cpf: { contains: term } },
          ],
          status: 'ATIVO',
        },
        include: { vehicles: { where: { status: 'ATIVO' } } },
        take: 10,
      }),
      prisma.vehicle.findMany({
        where: {
          OR: [
            { plate: { contains: term, mode: 'insensitive' } },
            { stickerNumber: !isNaN(parseInt(term)) ? parseInt(term) : undefined },
          ],
          status: 'ATIVO',
        },
        include: { employee: { select: { id: true, name: true, cpf: true } } },
        take: 10,
      }),
      prisma.contractor.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { cpf: { contains: term } },
          ],
          status: 'ATIVO',
        },
        include: { company: { select: { id: true, name: true } }, vehicles: true },
        take: 10,
      }),
      prisma.contractorVehicle.findMany({
        where: { plate: { contains: term, mode: 'insensitive' }, status: 'ATIVO' },
        include: {
          contractor: { select: { id: true, name: true } },
          company: { select: { id: true, name: true } },
        },
        take: 10,
      }),
    ]);

    res.json({
      employees: employees.map(e => ({ ...e, _type: 'FUNCIONARIO' })),
      vehicles: vehicles.map(v => ({ ...v, _type: 'VEICULO_FUNC' })),
      contractors: contractors.map(c => ({ ...c, _type: 'PRESTADOR' })),
      contractorVehicles: contractorVehicles.map(cv => ({ ...cv, _type: 'VEICULO_PREST' })),
      totalResults: employees.length + vehicles.length + contractors.length + contractorVehicles.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro na busca universal.', details: error.message });
  }
});

export default router;
