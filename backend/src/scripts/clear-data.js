import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('⚠️  Iniciando limpeza de dados (preservando usuários)...');
    try {
        // Ordem sugerida para evitar problemas de FK:
        // 1. Logs de acesso e Infrações (dependem de tudo)
        // 2. Veículos e Vagas
        // 3. Prestadores e Empresas
        // 4. Funcionários
        const tables = [
            'access_logs',
            'infractions',
            'contractor_vehicles',
            'contractors',
            'companies',
            'vehicles',
            'employees',
            'vacancies'
        ];
        for (const table of tables) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
            console.log(`✅ Tabela "${table}" limpa.`);
        }
        console.log('\n✨ Limpeza concluída com sucesso!');
        console.log('ℹ️  A tabela "users" foi preservada conforme solicitado.');
    }
    catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
