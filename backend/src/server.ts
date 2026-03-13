import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import prisma from './config/prisma';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import employeeRoutes from './routes/employee.routes';
import vehicleRoutes from './routes/vehicle.routes';
import companyRoutes from './routes/company.routes';
import contractorRoutes from './routes/contractor.routes';
import vacancyRoutes from './routes/vacancy.routes';
import accessRoutes from './routes/access.routes';
import infractionRoutes from './routes/infraction.routes';
import reportRoutes from './routes/report.routes';
import searchRoutes from './routes/search.routes';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://medpark-saas.pages.dev'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes (v1)
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/employees', employeeRoutes);
app.use('/v1/vehicles', vehicleRoutes);
app.use('/v1/companies', companyRoutes);
app.use('/v1/contractors', contractorRoutes);
app.use('/v1/vacancies', vacancyRoutes);
app.use('/v1/access', accessRoutes);
app.use('/v1/infractions', infractionRoutes);
app.use('/v1/reports', reportRoutes);
app.use('/v1/search', searchRoutes);

// Error handler
app.use(errorHandler);

// 30-Day Data Retention Policy: Auto-cleanup task
const cleanupOldLogs = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await prisma.accessLog.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo }
      }
    });
    
    if (deleted.count > 0) {
      console.log(`[CLEANUP] Removidos ${deleted.count} logs de acesso antigos (>30 dias).`);
    }
  } catch (error) {
    console.error('[CLEANUP ERROR] Erro ao limpar logs antigos:', error);
  }
};

// Start server
app.listen(env.PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     🏥 MEDPARK SaaS - Backend API           ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  🚀 Server running on port ${env.PORT}            ║`);
  console.log(`║  📡 API Base: http://localhost:${env.PORT}/v1      ║`);
  console.log('║  🔒 JWT Auth: Enabled                       ║');
  console.log('║  🐘 Database: Neon PostgreSQL                ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // Executar limpeza inicial e agendar a cada 24 horas
  cleanupOldLogs();
  setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);
});

export default app;
