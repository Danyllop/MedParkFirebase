import { Hono } from 'hono';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = new Hono();
router.use(authMiddleware);
// GET /v1/reports/summary
router.get('/summary', async (c) => {
    try {
        const { dateStart, dateEnd } = c.req.query();
        const dateFilter = {};
        if (dateStart)
            dateFilter.gte = new Date(dateStart);
        if (dateEnd)
            dateFilter.lte = new Date(dateEnd);
        const whereDate = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
        const [totalAccesses, totalInfractions, vacancyStatsA, vacancyStatsE, recentLogs,] = await Promise.all([
            prisma.accessLog.count({ where: whereDate }),
            prisma.infraction.count({ where: whereDate }),
            prisma.vacancy.groupBy({
                by: ['currentStatus'],
                where: { gate: 'A' },
                _count: true,
            }),
            prisma.vacancy.groupBy({
                by: ['currentStatus'],
                where: { gate: 'E' },
                _count: true,
            }),
            prisma.accessLog.findMany({
                where: whereDate,
                include: {
                    operator: { select: { fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);
        const totalVagasA = await prisma.vacancy.count({ where: { gate: 'A' } });
        const totalVagasE = await prisma.vacancy.count({ where: { gate: 'E' } });
        const ocupadasA = vacancyStatsA.find(s => s.currentStatus === 'OCUPADA')?._count || 0;
        const ocupadasE = vacancyStatsE.find(s => s.currentStatus === 'OCUPADA')?._count || 0;
        return c.json({
            totalAccesses,
            totalInfractions,
            gateA: {
                total: totalVagasA,
                occupied: ocupadasA,
                occupancyRate: totalVagasA > 0 ? Math.round((ocupadasA / totalVagasA) * 100) : 0,
                breakdown: vacancyStatsA,
            },
            gateE: {
                total: totalVagasE,
                occupied: ocupadasE,
                occupancyRate: totalVagasE > 0 ? Math.round((ocupadasE / totalVagasE) * 100) : 0,
                breakdown: vacancyStatsE,
            },
            recentActivity: recentLogs,
        });
    }
    catch (error) {
        return c.json({ error: 'Erro ao gerar relatório.', details: error.message }, 500);
    }
});
export default router;
