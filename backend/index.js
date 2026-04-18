if (process.env.NODE_ENV !== 'production') require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('FATAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION:', reason);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./src/config/swagger');
const { errorHandler } = require('./src/utils/error.handler');

function safeRequireRoute(modulePath) {
    try {
        const resolved = path.resolve(__dirname, modulePath);
        // eslint-disable-next-line import/no-dynamic-require, global-require
        return require(resolved);
    } catch (err) {
        console.error(`[BOOT] Failed to load route module: ${modulePath}`);
        console.error(err);
        const router = express.Router();
        router.use((_req, res) => {
            res.status(500).json({
                success: false,
                message: `Route module failed to load: ${modulePath}`,
                error: err.message,
                ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
            });
        });
        return router;
    }
}

// Import Routes (wrapped so a single bad module doesn't crash serverless boot)
const authRoutes = safeRequireRoute('src/routes/auth.routes.js');
const scheduleRoutes = safeRequireRoute('src/routes/schedule.routes.js');
const appointmentRoutes = safeRequireRoute('src/routes/appointment.routes.js');
const reportRoutes = safeRequireRoute('src/routes/report.routes.js');
const wellbeingRoutes = safeRequireRoute('src/routes/wellbeing.routes.js');
const dashboardRoutes = safeRequireRoute('src/routes/dashboard.routes.js');
const adminRoutes = safeRequireRoute('src/routes/admin.routes.js');
const notificationRoutes = safeRequireRoute('src/routes/notification.routes.js');
const chatRoutes = safeRequireRoute('src/routes/chat.routes.js');
const counselorRoutes = safeRequireRoute('src/routes/counselor.routes.js');
const studentRoutes = safeRequireRoute('src/routes/student.routes.js');
const reviewRoutes = safeRequireRoute('src/routes/review.routes.js');
const articleRoutes = safeRequireRoute('src/routes/article.routes.js');
const chatbotRoutes = safeRequireRoute('src/routes/chatbot.routes.js');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Ignore favicon requests to clean up logs
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());

// ==================== SECURITY MIDDLEWARE ====================

// Helmet: Set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow /uploads access
}));

// Compression: Gzip semua response → lebih cepat & hemat bandwidth
app.use(compression());

// CORS: Production dikunci via env, tapi tetap support domain Vercel (preview/prod).
const allowedOrigins = isProd
    ? (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];

function isAllowedOrigin(origin) {
    if (!origin) return true; // non-browser / same-origin
    if (!isProd) return allowedOrigins.includes(origin);

    if (allowedOrigins.includes(origin)) return true;

    // Allow Vercel-hosted frontends (Preview + Production) by default.
    // Keep this intentionally narrow: only https and only *.vercel.app hosts.
    try {
        const { protocol, hostname } = new URL(origin);
        if (protocol === 'https:' && hostname.endsWith('.vercel.app')) return true;
    } catch (_) {
        // ignore invalid Origin header
    }
    return false;
}

app.use(cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
}));

// Rate Limiting: Cegah spam/brute-force
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 300,                   // max 300 request per 15 menit
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak request. Coba lagi nanti.' },
});

// Rate limit lebih ketat untuk auth (cegah brute-force password)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi 15 menit lagi.' },
});

// Rate limit untuk chatbot (hemat quota Gemini)
const chatbotLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 10,
    message: { success: false, message: 'Terlalu banyak pesan. Tunggu sebentar ya! 😊' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== SWAGGER DOCS ====================
if (!isProd) setupSwagger(app); // Sembunyikan API docs di production

// ==================== ROUTES ====================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/wellbeing', wellbeingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/counselors', counselorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/chatbot', chatbotLimiter, chatbotRoutes);

// API Health Check (handy when everything is under /api on Vercel)
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'UniCounsel API is running',
        version: '1.0.0',
        env: isProd ? 'production' : 'development',
    });
});

// Health Check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'UniCounsel API is running',
        version: '1.0.0',
        env: isProd ? 'production' : 'development',
    });
});

// 404 for unknown API routes (avoid returning HTML / generic crash pages)
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found',
        path: req.originalUrl,
    });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT} and Accessible over network!`);
        if (!isProd) console.log(`📚 API Docs: http://localhost:${PORT}/api-docs\n`);
    });
}

module.exports = app;
