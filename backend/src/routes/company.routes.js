import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = new Hono();
router.use(authMiddleware);
// GET /v1/companies
router.get('/', async (c) => {
    try {
        const { search } = c.req.query();
        const where = {};
        if (search) {
            const term = search.toUpperCase();
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
        return c.json(companies);
    }
    catch (error) {
        return c.json({ error: 'Erro ao listar empresas.', details: error.message }, 500);
    }
});
// POST /v1/companies
router.post('/', async (c) => {
    try {
        const { name, taxId, segment, contact } = await c.req.json();
        const company = await prisma.company.create({
            data: { name: name.toUpperCase(), taxId, segment: segment.toUpperCase(), contact },
        });
        return c.json(company, 201);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return c.json({ error: 'CNPJ/CPF já cadastrado.' }, 409);
        }
        return c.json({ error: 'Erro ao criar empresa.', details: error.message }, 500);
    }
});
// PATCH /v1/companies/:id
router.patch('/:id', async (c) => {
    try {
        const data = { ...(await c.req.json()) };
        if (data.name)
            data.name = data.name.toUpperCase();
        if (data.segment)
            data.segment = data.segment.toUpperCase();
        const company = await prisma.company.update({ where: { id: c.req.param('id') }, data });
        return c.json(company);
    }
    catch (error) {
        return c.json({ error: 'Erro ao atualizar empresa.', details: error.message }, 500);
    }
});
// DELETE /v1/companies/:id
router.delete('/:id', async (c) => {
    try {
        await prisma.company.update({ where: { id: c.req.param('id') }, data: { status: 'INATIVO' } });
        return c.json({ message: 'Empresa inativada.' });
    }
    catch (error) {
        return c.json({ error: 'Erro ao inativar empresa.', details: error.message }, 500);
    }
});
export default router;
