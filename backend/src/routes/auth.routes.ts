import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { authMiddleware, AuthVariables } from '../middleware/auth.js';
import { loginSchema, changePasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';

const router = new Hono<{ Variables: AuthVariables }>();

// POST /v1/auth/login
router.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      console.warn(`[AUTH] Login falhou: Usuário não encontrado - ${email}`);
      return c.json({ error: 'Credenciais inválidas ou usuário inativo.' }, 401);
    }

    if (user.status !== 'ATIVO') {
      console.warn(`[AUTH] Login falhou: Usuário inativo - ${email}`);
      return c.json({ error: 'Credenciais inválidas ou usuário inativo.' }, 401);
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      console.warn(`[AUTH] Login falhou: Senha incorreta - ${email}`);
      return c.json({ error: 'Credenciais inválidas.' }, 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({
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
    return c.json({ error: 'Erro ao realizar login.', details: error.message }, 500);
  }
});

// PATCH /v1/auth/change-password
router.patch('/change-password', authMiddleware, zValidator('json', changePasswordSchema), async (c) => {
  try {
    const { currentPassword, newPassword } = c.req.valid('json');
    const userPayload = c.get('user');
    const userId = userPayload.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return c.json({ error: 'Usuário não encontrado.' }, 404);
    }

    // Se não for troca obrigatória, validar senha atual
    if (!user.mustChangePassword) {
      const isValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return c.json({ error: 'Senha atual incorreta.' }, 401);
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });

    return c.json({ message: 'Senha alterada com sucesso.' });
  } catch (error: any) {
    return c.json({ error: 'Erro ao alterar senha.', details: error.message }, 500);
  }
});

// POST /v1/auth/reset-password (PUBLIC)
router.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  try {
    const { email, currentPassword, newPassword } = c.req.valid('json');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.status !== 'ATIVO') {
      return c.json({ error: 'Usuário não encontrado ou inativo.' }, 401);
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return c.json({ error: 'Senha atual incorreta.' }, 401);
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    });

    // MOCK EMAIL SENDING
    console.log(`[EMAIL] Enviando confirmação de troca de senha para: ${user.email}`);

    return c.json({ message: 'Senha alterada com sucesso. Um e-mail de confirmação foi enviado.' });
  } catch (error: any) {
    return c.json({ error: 'Erro ao processar solicitação.', details: error.message }, 500);
  }
});

export default router;

