import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = new Hono();
router.use(authMiddleware);
// GET /v1/contractors
router.get('/', async (c) => {
    try {
        const { search, companyId } = c.req.query();
        const where = {};
        if (companyId)
            where.companyId = companyId;
        if (search) {
            const term = search.toUpperCase();
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
        return c.json(contractors);
    }
    catch (error) {
        return c.json({ error: 'Erro ao listar prestadores.', details: error.message }, 500);
    }
});
// POST /v1/contractors
router.post('/', async (c) => {
    try {
        const { companyId, name, cpf, role, phone, manager } = await c.req.json();
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
        return c.json(contractor, 201);
    }
    catch (error) {
        return c.json({ error: 'Erro ao cadastrar prestador.', details: error.message }, 500);
    }
});
// PATCH /v1/contractors/:id
router.patch('/:id', async (c) => {
    try {
        const data = { ...(await c.req.json()) };
        if (data.name)
            data.name = data.name.toUpperCase();
        if (data.role)
            data.role = data.role.toUpperCase();
        const contractor = await prisma.contractor.update({ where: { id: c.req.param('id') }, data });
        return c.json(contractor);
    }
    catch (error) {
        return c.json({ error: 'Erro ao atualizar prestador.', details: error.message }, 500);
    }
});
// POST /v1/contractors/:id/vehicles
router.post('/:id/vehicles', async (c) => {
    try {
        const { plate, model, color, companyId } = await c.req.json();
        const vehicle = await prisma.contractorVehicle.create({
            data: {
                contractorId: c.req.param('id'),
                companyId,
                plate: plate.toUpperCase(),
                model: model.toUpperCase(),
                color: color.toUpperCase(),
            },
        });
        return c.json(vehicle, 201);
    }
    catch (error) {
        return c.json({ error: 'Erro ao cadastrar veículo do prestador.', details: error.message }, 500);
    }
});
// DELETE /v1/contractors/:id
router.delete('/:id', async (c) => {
    try {
        await prisma.contractor.update({ where: { id: c.req.param('id') }, data: { status: 'INATIVO' } });
        return c.json({ message: 'Prestador inativado.' });
    }
    catch (error) {
        return c.json({ error: 'Erro ao inativar prestador.', details: error.message }, 500);
    }
});
export default router;
