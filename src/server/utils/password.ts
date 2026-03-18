import argon2 from 'argon2';
import { env } from '../config/env.js';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  const peppered = password + env.PEPPER_SECRET;
  return argon2.hash(peppered, ARGON2_OPTIONS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const peppered = password + env.PEPPER_SECRET;
  try {
    return await argon2.verify(hash, peppered);
  } catch {
    return false;
  }
}
