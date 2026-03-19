import { env } from '../config/env.js';

/**
 * Converte um buffer para string hexadecimal
 */
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Gera um hash PBKDF2-HMAC-SHA256 compatível com Cloudflare Edge
 */
async function pbkdf2(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password + env.PEPPER_SECRET),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  return bufToHex(derivedBits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  const hash = await pbkdf2(password, salt);
  return `${salt}:${hash}`;
}

export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    
    const [salt, hash] = parts;
    const newHash = await pbkdf2(password, salt);
    return newHash === hash;
  } catch (error) {
    console.error('[AUTH] Erro ao comparar senhas:', error);
    return false;
  }
}

