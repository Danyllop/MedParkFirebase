import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const vacancy = await prisma.vacancy.findFirst();
    if (!vacancy) return console.log('No vacancy found');
    const user = await prisma.user.findFirst();

    console.log('Testing create access log for vacancy:', vacancy.id);
    const log = await prisma.accessLog.create({
      data: {
        vacancyId: vacancy.id,
        operatorId: user?.id,
        event: 'RESERVA',
        spot: `${vacancy.gate}-${vacancy.number}`,
        ownerName: 'N/A',
        ownerRole: 'SISTEMA',
        createdAt: new Date(),
      }
    });
    console.log('Success:', log);
  } catch (err: any) {
    console.error('Failed to create:', err.message);
  }
}

run().finally(() => prisma.$disconnect());
