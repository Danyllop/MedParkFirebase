import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = new Hono();
router.use(authMiddleware);
// GET /v1/employees
router.get('/', async (c) => {
    try {
        const { status, registrationType, search } = c.req.query();
        const where = {};
        if (status)
            where.status = status;
        if (registrationType)
            where.registrationType = registrationType;
        if (search) {
            const term = search.toUpperCase();
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
        return c.json(employees);
    }
    catch (error) {
        return c.json({ error: 'Erro ao listar funcionários.', details: error.message }, 500);
    }
});
// GET /v1/employees/:id
router.get('/:id', async (c) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: c.req.param('id') },
            include: { vehicles: true },
        });
        if (!employee) {
            return c.json({ error: 'Funcionário não encontrado.' }, 404);
        }
        return c.json(employee);
    }
    catch (error) {
        return c.json({ error: 'Erro ao buscar funcionário.', details: error.message }, 500);
    }
});
// POST /v1/employees
router.post('/', async (c) => {
    try {
        const { name, cpf, position, unit, bond, phone, registrationType, expirationDate } = await c.req.json();
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
        return c.json(employee, 201);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return c.json({ error: 'CPF já cadastrado para outro funcionário.' }, 409);
        }
        return c.json({ error: 'Erro ao criar funcionário.', details: error.message }, 500);
    }
});
// PATCH /v1/employees/:id
router.patch('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = { ...(await c.req.json()) };
        if (data.name)
            data.name = data.name.toUpperCase();
        if (data.position)
            data.position = data.position.toUpperCase();
        if (data.unit)
            data.unit = data.unit.toUpperCase();
        if (data.bond)
            data.bond = data.bond.toUpperCase();
        if (data.expirationDate)
            data.expirationDate = new Date(data.expirationDate);
        const employee = await prisma.employee.update({
            where: { id },
            data,
            include: { vehicles: true },
        });
        return c.json(employee);
    }
    catch (error) {
        if (error.code === 'P2025') {
            return c.json({ error: 'Funcionário não encontrado.' }, 404);
        }
        return c.json({ error: 'Erro ao atualizar funcionário.', details: error.message }, 500);
    }
});
// DELETE /v1/employees/:id (soft delete)
router.delete('/:id', async (c) => {
    try {
        await prisma.employee.update({ where: { id: c.req.param('id') }, data: { status: 'INATIVO' } });
        return c.json({ message: 'Funcionário inativado com sucesso.' });
    }
    catch (error) {
        return c.json({ error: 'Erro ao inativar funcionário.', details: error.message }, 500);
    }
});
export default router;
