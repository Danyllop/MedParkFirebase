import { PrismaClient, UserRole } from '@prisma/client/edge';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Admin padrão (Argon2id + Pepper)
  const adminEmail = 'admin@medpark.com';
  const adminPassword = 'Admin@0502';
  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
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

  console.log(`✅ Admin criado/atualizado: ${admin.email} (${admin.role})`);
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
