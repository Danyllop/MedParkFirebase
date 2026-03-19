import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware, AuthVariables } from '../middleware/auth.js';

const router = new Hono<{ Variables: AuthVariables }>();
router.use(authMiddleware);

// GET /v1/infractions
router.get('/', async (c) => {
  try {
    const { severity, status, search, limit = '50', offset = '0' } = c.req.query();
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

    return c.json({ data: infractions, total });
  } catch (error: any) {
    return c.json({ error: 'Erro ao listar infrações.', details: error.message }, 500);
  }
});

// POST /v1/infractions
router.post('/', async (c) => {
  try {
    const { plate, type, location, severity, description, vacancyId } = await c.req.json();

    const infraction = await prisma.infraction.create({
      data: {
        plate: plate.toUpperCase(),
        type,
        location,
        severity,
        description,
        vacancyId,
        registeredById: c.get('user').userId,
      },
    });

    return c.json(infraction, 201);
  } catch (error: any) {
    return c.json({ error: 'Erro ao registrar infração.', details: error.message }, 500);
  }
});

// PATCH /v1/infractions/:id
router.patch('/:id', async (c) => {
  try {
    const infraction = await prisma.infraction.update({
      where: { id: c.req.param('id') },
      data: (await c.req.json()),
    });
    return c.json(infraction);
  } catch (error: any) {
    return c.json({ error: 'Erro ao atualizar infração.', details: error.message }, 500);
  }
});

export default router;
