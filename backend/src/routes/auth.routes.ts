import { Router } from 'express';
import prisma from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// POST /v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || user.status !== 'ATIVO') {
      res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
      return;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao realizar login.', details: error.message });
  }
});

// PATCH /v1/auth/change-password
router.patch('/change-password', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    // Se não for troca obrigatória, validar senha atual
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Senha atual é obrigatória.' });
        return;
      }
      const isValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: 'Senha atual incorreta.' });
        return;
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });

    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao alterar senha.', details: error.message });
  }
});

// POST /v1/auth/reset-password (PUBLIC)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.status !== 'ATIVO') {
      res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
      return;
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Senha atual incorreta.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    });

    // MOCK EMAIL SENDING
    console.log(`[EMAIL] Enviando confirmação de troca de senha para: ${user.email}`);

    res.json({ message: 'Senha alterada com sucesso. Um e-mail de confirmação foi enviado.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao processar solicitação.', details: error.message });
  }
});

export default router;
