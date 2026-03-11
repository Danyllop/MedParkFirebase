import { Router } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { hashPassword } from '../utils/password';
import { env } from '../config/env';

const router = Router();
router.use(authMiddleware);

// GET /v1/users
router.get('/', requireRole('ADMIN', 'SUPERVISOR'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, cpf: true, role: true, status: true, phone: true, mustChangePassword: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar usuários.', details: error.message });
  }
});

// POST /v1/users
router.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const { fullName, email, cpf, role, phone } = req.body;
    const passwordHash = await hashPassword(env.DEFAULT_PASSWORD);

    const user = await prisma.user.create({
      data: { fullName, email: email.toLowerCase(), cpf, role, phone, passwordHash, mustChangePassword: true },
      select: { id: true, fullName: true, email: true, cpf: true, role: true, status: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email ou CPF já cadastrado.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar usuário.', details: error.message });
  }
});

// PATCH /v1/users/:id
router.patch('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, cpf, role, phone, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { fullName, email: email?.toLowerCase(), cpf, role, phone, status },
      select: { id: true, fullName: true, email: true, cpf: true, role: true, status: true, createdAt: true },
    });

    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao atualizar usuário.', details: error.message });
  }
});

// PATCH /v1/users/:id/reset-password
router.patch('/:id/reset-password', requireRole('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const passwordHash = await hashPassword(env.DEFAULT_PASSWORD);

    await prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });

    res.json({ message: `Senha resetada para "${env.DEFAULT_PASSWORD}". O usuário deverá alterá-la no próximo login.` });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    res.status(500).json({ error: 'Erro ao resetar senha.', details: error.message });
  }
});

// DELETE /v1/users/:id (soft delete - inativar)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.update({ where: { id }, data: { status: 'INATIVO' } });
    res.json({ message: 'Usuário inativado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao inativar usuário.', details: error.message });
  }
});

export default router;
