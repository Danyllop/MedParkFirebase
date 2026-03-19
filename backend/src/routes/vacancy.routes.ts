import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware, requireRole, AuthVariables } from '../middleware/auth.js';

const router = new Hono<{ Variables: AuthVariables }>();
router.use(authMiddleware);

// /v1/vacancies/next-number
router.get('/next-number', async (c) => {
  try {
    const { gate } = c.req.query();
    if (!gate) {
      return c.json({ error: 'Parâmetro gate é obrigatório.' }, 400);
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

    return c.json({ nextNumber });
  } catch (error: any) {
    return c.json({ error: 'Erro ao calcular próximo número.', details: error.message }, 500);
  }
});


// GET /v1/vacancies
router.get('/', async (c) => {
  try {
    const { gate, status, type } = c.req.query();
    const where: any = {};

    if (gate) where.gate = gate as string;
    if (status) where.currentStatus = status as string;
    if (type) where.type = type as string;

    const vacancies = await (prisma.vacancy as any).findMany({
      where,
      orderBy: { number: 'asc' },
    });

    return c.json(vacancies);
  } catch (error: any) {
    return c.json({ error: 'Erro ao listar vagas.', details: error.message }, 500);
  }
});

// POST /v1/vacancies
router.post('/', requireRole('ADMIN', 'SUPERVISOR'), async (c) => {
  try {
    const { gate, number, type, locality } = await c.req.json();

    const vacancy = await (prisma.vacancy as any).create({
      data: { gate, number, type, locality },
    });

    return c.json(vacancy, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'Vaga já existe para este portão.' }, 409);
      }
    return c.json({ error: 'Erro ao criar vaga.', details: error.message }, 500);
  }
});

// POST /v1/vacancies/batch - Criação em lote
router.post('/batch', requireRole('ADMIN'), async (c) => {
  try {
    const { vacancies } = await c.req.json(); // Array de { gate, number, type, locality }

    const result = await (prisma.vacancy as any).createMany({
      data: vacancies,
      skipDuplicates: true,
    });

    return c.json({ message: `${result.count} vagas criadas com sucesso.` }, 201);
  } catch (error: any) {
    return c.json({ error: 'Erro ao criar vagas em lote.', details: error.message }, 500);
  }
});

// PATCH /v1/vacancies/:id/status
router.patch('/:id/status', async (c) => {
  try {
    const id = c.req.param('id') as string;
    const { currentStatus, occupantName, occupantPlate, occupantVehicle } = await c.req.json();

    const vacancy = await (prisma.vacancy as any).update({
      where: { id },
      data: {
        currentStatus,
        occupantName: currentStatus === 'DISPONIVEL' ? null : occupantName,
        occupantPlate: currentStatus === 'DISPONIVEL' ? null : occupantPlate,
        occupantVehicle: currentStatus === 'DISPONIVEL' ? null : occupantVehicle,
      },
    });

    return c.json(vacancy);
  } catch (error: any) {
    return c.json({ error: 'Erro ao atualizar status da vaga.', details: error.message }, 500);
  }
});

// PATCH /v1/vacancies/:id
router.patch('/:id', requireRole('ADMIN'), async (c) => {
  try {
    const id = String(c.req.param('id'));
    const vacancy = await (prisma.vacancy as any).update({
      where: { id: id },
      data: (await c.req.json()),
    });
    return c.json(vacancy);
  } catch (error: any) {
    return c.json({ error: 'Erro ao atualizar vaga.', details: error.message }, 500);
  }
});

// DELETE /v1/vacancies/:id
router.delete('/:id', requireRole('ADMIN'), async (c) => {
  try {
    const id = c.req.param('id') as string;
    
    const vacancy = await (prisma.vacancy as any).findUnique({ where: { id: id } });
    
    if (!vacancy) {
      return c.json({ error: 'Vaga não encontrada.' }, 404);
      }

    if (vacancy.currentStatus !== 'DISPONIVEL') {
      return c.json({ error: 'Não é possível excluir uma vaga ocupada ou reservada.' }, 400);
      }

    await (prisma.vacancy as any).delete({ where: { id: id } });
    return c.json({ message: 'Vaga excluída com sucesso.' });
  } catch (error: any) {
    return c.json({ error: 'Erro ao excluir vaga.', details: error.message }, 500);
  }
});

// PATCH /v1/vacancies/:id/reserve - Alternar reserva
router.patch('/:id/reserve', async (c) => {
  try {
    const id = c.req.param('id') as string;
    
    const vacancy = await (prisma.vacancy as any).findUnique({ where: { id: id } });
    
    if (!vacancy) {
      return c.json({ error: 'Vaga não encontrada.' }, 404);
      }

    if (vacancy.currentStatus === 'OCUPADA') {
      return c.json({ error: 'Não é possível reservar uma vaga ocupada.' }, 400);
      }

    const newStatus = vacancy.currentStatus === 'RESERVADA' ? 'DISPONIVEL' : 'RESERVADA';
    
    const updated = await (prisma.vacancy as any).update({
      where: { id: id },
      data: { currentStatus: newStatus }
    });

    // Registrar no histórico de auditoria
    const eventType = newStatus === 'RESERVADA' ? 'RESERVA' : 'LIBERACAO';
    await (prisma.accessLog as any).create({
      data: {
        vacancyId: vacancy.id,
        operatorId: c.get('user').userId,
        event: eventType,
        spot: vacancy.number,
        ownerName: 'SISTEMA', // Usar 'SISTEMA' como nome fica melhor no relatório
        ownerRole: 'RESERVA/LIBERAÇÃO', // Fica mais claro na coluna Cargo/Função
        createdAt: new Date(),
      }
    });

    return c.json(updated);
  } catch (error: any) {
    return c.json({ error: 'Erro ao processar reserva.', details: error.message }, 500);
  }
});

export default router;
