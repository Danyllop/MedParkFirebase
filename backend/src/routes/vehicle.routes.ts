import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware, AuthVariables } from '../middleware/auth.js';

const router = new Hono<{ Variables: AuthVariables }>();
router.use(authMiddleware);

// GET /v1/vehicles
router.get('/', async (c) => {
  try {
    const { search } = c.req.query();
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

    return c.json(vehicles);
  } catch (error: any) {
    return c.json({ error: 'Erro ao listar veículos.', details: error.message }, 500);
  }
});

// GET /v1/vehicles/next-sticker
router.get('/next-sticker', async (c) => {
  try {
    const maxSticker = await prisma.vehicle.aggregate({ _max: { stickerNumber: true } });
    const current = maxSticker._max.stickerNumber || 0;
    const next = current < 11000 ? 11000 : current + 1;
    return c.json({ nextSticker: next });
  } catch (error: any) {
    return c.json({ error: 'Erro ao gerar adesivo.', details: error.message }, 500);
  }
});

// POST /v1/vehicles
router.post('/', async (c) => {
  try {
    const { employeeId, plate, stickerNumber, model, color, isPrimary } = await c.req.json();

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

    return c.json(vehicle, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ error: 'Placa ou número de adesivo já cadastrado.' }, 409);
      }
    return c.json({ error: 'Erro ao cadastrar veículo.', details: error.message }, 500);
  }
});

// PATCH /v1/vehicles/:id
router.patch('/:id', async (c) => {
  try {
    const data = { ...(await c.req.json()) };
    if (data.plate) data.plate = data.plate.toUpperCase();
    if (data.model) data.model = data.model.toUpperCase();
    if (data.color) data.color = data.color.toUpperCase();

    const vehicle = await prisma.vehicle.update({
      where: { id: c.req.param('id') },
      data,
    });

    return c.json(vehicle);
  } catch (error: any) {
    return c.json({ error: 'Erro ao atualizar veículo.', details: error.message }, 500);
  }
});

// DELETE /v1/vehicles/:id
router.delete('/:id', async (c) => {
  try {
    await prisma.vehicle.update({ where: { id: c.req.param('id') }, data: { status: 'INATIVO' } });
    return c.json({ message: 'Veículo inativado.' });
  } catch (error: any) {
    return c.json({ error: 'Erro ao inativar veículo.', details: error.message }, 500);
  }
});

export default router;
