import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import { env } from './env.js';

let prismaInstance: PrismaClient | null = null;

/**
 * Gets the Prisma client instance.
 * In Cloudflare Workers, we initialize this lazily to ensure environment variables 
 * (process.env) are populated before access.
 */
export function getPrisma(): PrismaClient {
  if (prismaInstance) return prismaInstance;

  const url = env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not defined in the environment.');
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaNeon(pool as any);
  
  prismaInstance = new PrismaClient({ adapter });
  return prismaInstance;
}

// Export a proxy as default for easier migration of existing code
const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const instance = getPrisma();
    return (instance as any)[prop];
  }
});

export default prisma;
