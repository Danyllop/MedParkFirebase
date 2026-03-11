import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Admin padrão
  const adminEmail = 'admin@medpark.com';
  const adminPassword = 'Admin@0502';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: 'ADMINISTRADOR MEDPARK',
      email: adminEmail,
      cpf: '000.000.000-00',
      passwordHash,
      role: UserRole.ADMIN,
      mustChangePassword: false,
      status: 'ATIVO',
    },
  });

  console.log(`✅ Admin criado: ${admin.email} (${admin.role})`);
  console.log('🏁 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
