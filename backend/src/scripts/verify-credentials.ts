import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/password.js';

const prisma = new PrismaClient();

async function verify(email: string, password: string) {
    try {
        console.log(`\n🔍 Verificando credenciais para: ${email}...`);
        
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            console.error('❌ Resultado: Usuário não encontrado no banco de dados.');
            return;
        }

        console.log(`✅ Usuário encontrado: ${user.fullName}`);
        console.log(`📊 Status: ${user.status}`);
        console.log(`🎭 Role: ${user.role}`);

        const isValid = await comparePassword(password, user.passwordHash);
        
        if (isValid) {
            console.log('✨ Resultado: SENHA CORRETA! As credenciais são válidas.');
        } else {
            console.error('❌ Resultado: SENHA INCORRETA!');
        }

    } catch (error) {
        console.error('💥 Erro durante a verificação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Pega argumentos da linha de comando
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Uso: npx ts-node src/scripts/verify-credentials.ts <email> <senha>');
    process.exit(1);
}

verify(email, password);
