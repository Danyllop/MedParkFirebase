import { sign, verify } from 'hono/jwt';
import { env } from '../config/env.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
  [key: string]: unknown; // Allow for other fields
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  // Hono uses Web Crypto, which requires 'HS256' or similar.
  return await sign(payload, env.JWT_SECRET, 'HS256');
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const decoded = await verify(token, env.JWT_SECRET, 'HS256');
  return decoded as unknown as TokenPayload;
}
