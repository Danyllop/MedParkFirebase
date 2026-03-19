import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';
import { env } from '../config/env.js';
const router = new Hono();
router.use(authMiddleware);
// GET /v1/users
router.get('/', requireRole('ADMIN', 'SUPERVISOR'), async (c) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, fullName: true, email: true, cpf: true, role: true, status: true, phone: true, mustChangePassword: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        return c.json(users);
    }
    catch (error) {
        return c.json({ error: 'Erro ao listar usuários.', details: error.message }, 500);
    }
});
// POST /v1/users
router.post('/', requireRole('ADMIN'), async (c) => {
    try {
        const { fullName, email, cpf, role, phone } = await c.req.json();
        const passwordHash = await hashPassword(env.DEFAULT_PASSWORD);
        const user = await prisma.user.create({
            data: { fullName, email: email.toLowerCase(), cpf, role, phone, passwordHash, mustChangePassword: true },
            select: { id: true, fullName: true, email: true, cpf: true, role: true, status: true, createdAt: true },
        });
        return c.json(user, 201);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return c.json({ error: 'Email ou CPF já cadastrado.' }, 409);
        }
        return c.json({ error: 'Erro ao criar usuário.', details: error.message }, 500);
    }
});
// PATCH /v1/users/:id
router.patch('/:id', requireRole('ADMIN'), async (c) => {
    try {
        const id = c.req.param('id');
        const { fullName, email, cpf, role, phone, status } = await c.req.json();
        const user = await prisma.user.update({
            where: { id: String(id) },
            data: { fullName, email: email?.toLowerCase(), cpf, role, phone, status },
            select: { id: true, fullName: true, email: true, cpf: true, role: true, status: true, createdAt: true },
        });
        return c.json(user);
    }
    catch (error) {
        if (error.code === 'P2025') {
            return c.json({ error: 'Usuário não encontrado.' }, 404);
        }
        return c.json({ error: 'Erro ao atualizar usuário.', details: error.message }, 500);
    }
});
// PATCH /v1/users/:id/reset-password
router.patch('/:id/reset-password', requireRole('ADMIN', 'SUPERVISOR'), async (c) => {
    try {
        const id = c.req.param('id');
        const passwordHash = await hashPassword(env.DEFAULT_PASSWORD);
        await prisma.user.update({
            where: { id: String(id) },
            data: { passwordHash, mustChangePassword: true },
        });
        return c.json({ message: `Senha resetada para "${env.DEFAULT_PASSWORD}". O usuário deverá alterá-la no próximo login.` });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return c.json({ error: 'Usuário não encontrado.' }, 404);
        }
        return c.json({ error: 'Erro ao resetar senha.', details: error.message }, 500);
    }
});
// DELETE /v1/users/:id (soft delete - inativar)
router.delete('/:id', requireRole('ADMIN'), async (c) => {
    try {
        const id = c.req.param('id');
        await prisma.user.update({ where: { id: String(id) }, data: { status: 'INATIVO' } });
        return c.json({ message: 'Usuário inativado com sucesso.' });
    }
    catch (error) {
        return c.json({ error: 'Erro ao inativar usuário.', details: error.message }, 500);
    }
});
export default router;
