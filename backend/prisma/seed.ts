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
  
  // Criar Funcionários baseados no mockData.ts
  console.log('👥 Criando funcionários de teste...');
  const alan = await prisma.employee.upsert({
    where: { cpf: '353.791.447-48' },
    update: {},
    create: {
      name: 'ALAN FERNANDES DA SILVA',
      cpf: '353.791.447-48',
      position: 'ENCARREGADO',
      unit: 'ED DE INTERNAÇÃO 2 ANDAR',
      bond: 'EBSERH',
      phone: '(62) 98420-5689',
      registrationType: 'PERMANENTE',
      status: 'ATIVO',
    },
  });

  const danyllo = await prisma.employee.upsert({
    where: { cpf: '025.756.941-32' },
    update: {},
    create: {
      name: 'DANYLLO PEREIRA',
      cpf: '025.756.941-32',
      position: 'ENCARREGADO',
      unit: 'ED DE INTERNAÇÃO 2 ANDAR',
      bond: 'EBSERH',
      phone: '(62) 98420-5663',
      registrationType: 'PROVISORIO',
      status: 'ATIVO',
    },
  });

  // Criar veículos para os funcionários
  await prisma.vehicle.upsert({
    where: { plate: 'KDC-1234' },
    update: {},
    create: {
      employeeId: alan.id,
      plate: 'KDC-1234',
      model: 'TOYOTA COROLLA',
      color: 'PRATA',
      isPrimary: true,
      status: 'ATIVO',
    },
  });

  await prisma.vehicle.upsert({
    where: { plate: 'ABC-5E21' },
    update: {},
    create: {
      employeeId: danyllo.id,
      plate: 'ABC-5E21',
      model: 'HONDA CIVIC',
      color: 'PRETO',
      isPrimary: true,
      status: 'ATIVO',
    },
  });

  console.log('✅ Funcionários e veículos criados.');
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
