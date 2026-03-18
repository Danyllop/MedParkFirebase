import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    console.log('Testing connection...');
    await prisma.$connect();
    console.log('Database connected successfully');
    const usersCount = await prisma.user.count();
    console.log('Users count:', usersCount);
  } catch (e) {
    console.error('Database connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
