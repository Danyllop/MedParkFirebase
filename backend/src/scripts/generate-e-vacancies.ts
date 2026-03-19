import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏗️  Iniciando geração de vagas para o Pátio E (com divisão em áreas)...');

  try {
    const vacancies = [];
    
    for (let i = 1; i <= 200; i++) {
        const number = `E-${i.toString().padStart(3, '0')}`;
        let type: 'PNE' | 'IDOSO' | 'COMUM' = 'COMUM';
        let locality: 'AREA_1' | 'AREA_2' | 'AREA_3' | 'AREA_4' | 'AREA_5' = 'AREA_1';

        // Setorização de Tipos (conforme GateE original):
        // 5 PNE (E-001 a E-005)
        // 5 IDOSO (E-006 a E-010)
        // 190 COMUM (E-011 a E-200)
        if (i <= 5) {
            type = 'PNE';
        } else if (i <= 10) {
            type = 'IDOSO';
        }

        // Distribuição em 5 Áreas (40 vagas cada):
        if (i <= 40) locality = 'AREA_1';
        else if (i <= 80) locality = 'AREA_2';
        else if (i <= 120) locality = 'AREA_3';
        else if (i <= 160) locality = 'AREA_4';
        else locality = 'AREA_5';

        vacancies.push({
            gate: 'E',
            number,
            type,
            locality,
            currentStatus: 'DISPONIVEL'
        });
    }

    console.log(`📊 Preparadas ${vacancies.length} vagas. Verificando duplicatas...`);

    let createdCount = 0;
    for (const v of vacancies) {
        const existing = await prisma.vacancy.findUnique({
            where: {
                gate_number: {
                    gate: 'E',
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
