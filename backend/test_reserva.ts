import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const logs = await prisma.accessLog.findMany({
    where: { event: { in: ['RESERVA', 'LIBERACAO'] } }
  });
  console.dir(logs, { depth: null });
}
run().finally(() => prisma.$disconnect());
