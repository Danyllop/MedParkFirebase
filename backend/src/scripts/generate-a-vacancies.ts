import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏗️  Iniciando geração de vagas para o Pátio A...');

  try {
    const vacancies = [];
    
    for (let i = 1; i <= 90; i++) {
        const number = `A-${i.toString().padStart(3, '0')}`;
        let type: 'PNE' | 'IDOSO' | 'COMUM' | 'DIRETORIA' = 'COMUM';
        let locality: 'EXTERNA' | 'SUBSOLO_1' | 'SUBSOLO_2' = 'EXTERNA';

        // Setorização baseada no GateA.tsx original:
        // 1-15: EXTERNA / COMUM
        // 16-45: SUBSOLO 1 (39-44: DIRETORIA, 45: IDOSO)
        // 46-90: SUBSOLO 2 (84-85: PNE, 86-87: IDOSO)
        
        if (i <= 15) {
            locality = 'EXTERNA';
            type = 'COMUM';
        } else if (i <= 45) {
            locality = 'SUBSOLO_1';
            if (i >= 39 && i <= 44) type = 'DIRETORIA';
            else if (i === 45) type = 'IDOSO';
        } else {
            locality = 'SUBSOLO_2';
            if (i === 84 || i === 85) type = 'PNE';
            else if (i === 86 || i === 87) type = 'IDOSO';
        }

        vacancies.push({
            gate: 'A',
            number,
            type,
            locality,
            currentStatus: 'LIVRE'
        });
    }

    console.log(`📊 Preparadas ${vacancies.length} vagas. Verificando duplicatas...`);

    let createdCount = 0;
    for (const v of vacancies) {
        const existing = await prisma.vacancy.findUnique({
            where: {
                gate_number: {
                    gate: 'A',
                    number: v.number
                }
            }
        });

        if (!existing) {
            await prisma.vacancy.create({
                data: v as any
            });
            createdCount++;
        }
    }

    console.log(`\n✨ Geração concluída!`);
    console.log(`✅ Novas vagas criadas: ${createdCount}`);
    console.log(`ℹ️  Vagas existentes puladas: ${vacancies.length - createdCount}`);
    
  } catch (error) {
    console.error('❌ Erro durante a geração de vagas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
