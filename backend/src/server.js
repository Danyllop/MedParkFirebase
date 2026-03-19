import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
    origin: (origin) => {
        // Permitir localhost para desenvolvimento
        if (origin.includes('localhost') || origin.includes('127.0.0.1'))
            return origin;
        // Permitir domínios da Cloudflare (Pages e Workers)
        if (origin.endsWith('.pages.dev') || origin.endsWith('.workers.dev'))
            return origin;
        // Fallback para domínios específicos conhecidos
        const allowed = [
            'https://medpark.pages.dev',
            'https://medpark-saas.pages.dev',
            'https://medpark-frontend.pages.dev'
        ];
        return allowed.includes(origin) ? origin : allowed[0];
    },
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
