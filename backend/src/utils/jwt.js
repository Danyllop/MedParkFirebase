import { sign, verify } from 'hono/jwt';
import { env } from '../config/env.js';
export async function generateToken(payload) {
    // Hono uses Web Crypto, which requires 'HS256' or similar.
    return await sign(payload, env.JWT_SECRET, 'HS256');
}
export async function verifyToken(token) {
    const decoded = await verify(token, env.JWT_SECRET, 'HS256');
    return decoded;
}
