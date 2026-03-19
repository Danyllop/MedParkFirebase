import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './config/env.js';
import prisma from './config/prisma.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import companyRoutes from './routes/company.routes.js';
import contractorRoutes from './routes/contractor.routes.js';
import vacancyRoutes from './routes/vacancy.routes.js';
import accessRoutes from './routes/access.routes.js';
import infractionRoutes from './routes/infraction.routes.js';
import reportRoutes from './routes/report.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = new Hono().basePath('/v1');

// Middleware
app.use('*', cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://medpark.pages.dev',
    'https://medpark-saas.pages.dev'
  ],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    version: '1.0.0-edge' 
  });
});

// API Routes
app.route('/auth', authRoutes);
app.route('/users', userRoutes);
app.route('/employees', employeeRoutes);
app.route('/vehicles', vehicleRoutes);
app.route('/companies', companyRoutes);
app.route('/contractors', contractorRoutes);
app.route('/vacancies', vacancyRoutes);
app.route('/access', accessRoutes);
app.route('/infractions', infractionRoutes);
app.route('/reports', reportRoutes);
app.route('/search', searchRoutes);

// Error and 404 handler can be added with app.onError and app.notFound
// Background tasks (like cleanupOldLogs) should be moved to Cloudflare Cron Triggers.

export default app;

