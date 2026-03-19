import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        status: true,
        role: true,
        fullName: true,
        mustChangePassword: true
      }
    });
    console.log('Users in DB:');
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Failed to list users:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
