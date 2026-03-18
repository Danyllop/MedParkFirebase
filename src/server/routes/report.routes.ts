import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /v1/reports/summary
router.get('/summary', async (req, res) => {
  try {
    const { dateStart, dateEnd } = req.query;

    const dateFilter: any = {};
    if (dateStart) dateFilter.gte = new Date(dateStart as string);
    if (dateEnd) dateFilter.lte = new Date(dateEnd as string);
    const whereDate = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const [
      totalAccesses,
      totalInfractions,
      vacancyStatsA,
      vacancyStatsE,
      recentLogs,
    ] = await Promise.all([
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

    res.json({
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
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao gerar relatório.', details: error.message });
  }
});

export default router;
