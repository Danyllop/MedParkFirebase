import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../utils/jwt.js';
export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Token não fornecido.' }, 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        c.set('user', decoded);
        await next();
    }
    catch {
        return c.json({ error: 'Token inválido ou expirado.' }, 401);
    }
});
export function requireRole(...roles) {
    return createMiddleware(async (c, next) => {
        const user = c.get('user');
        if (!user || !roles.includes(user.role)) {
            return c.json({ error: 'Acesso negado. Permissão insuficiente.' }, 403);
        }
        await next();
    });
}
