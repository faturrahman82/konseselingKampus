if (process.env.NODE_ENV !== 'production') require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('FATAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION:', reason);
});

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./src/config/swagger');
const { errorHandler } = require('./src/utils/error.handler');

function routeLoadFailureRouter(modulePath, err) {
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

// Import Routes (wrapped so a single bad module doesn't crash serverless boot)
let authRoutes; try { authRoutes = require('./src/routes/auth.routes'); } catch (e) { authRoutes = routeLoadFailureRouter('./src/routes/auth.routes', e); }
let scheduleRoutes; try { scheduleRoutes = require('./src/routes/schedule.routes'); } catch (e) { scheduleRoutes = routeLoadFailureRouter('./src/routes/schedule.routes', e); }
let appointmentRoutes; try { appointmentRoutes = require('./src/routes/appointment.routes'); } catch (e) { appointmentRoutes = routeLoadFailureRouter('./src/routes/appointment.routes', e); }
let reportRoutes; try { reportRoutes = require('./src/routes/report.routes'); } catch (e) { reportRoutes = routeLoadFailureRouter('./src/routes/report.routes', e); }
let wellbeingRoutes; try { wellbeingRoutes = require('./src/routes/wellbeing.routes'); } catch (e) { wellbeingRoutes = routeLoadFailureRouter('./src/routes/wellbeing.routes', e); }
let dashboardRoutes; try { dashboardRoutes = require('./src/routes/dashboard.routes'); } catch (e) { dashboardRoutes = routeLoadFailureRouter('./src/routes/dashboard.routes', e); }
let adminRoutes; try { adminRoutes = require('./src/routes/admin.routes'); } catch (e) { adminRoutes = routeLoadFailureRouter('./src/routes/admin.routes', e); }
let notificationRoutes; try { notificationRoutes = require('./src/routes/notification.routes'); } catch (e) { notificationRoutes = routeLoadFailureRouter('./src/routes/notification.routes', e); }
let chatRoutes; try { chatRoutes = require('./src/routes/chat.routes'); } catch (e) { chatRoutes = routeLoadFailureRouter('./src/routes/chat.routes', e); }
let counselorRoutes; try { counselorRoutes = require('./src/routes/counselor.routes'); } catch (e) { counselorRoutes = routeLoadFailureRouter('./src/routes/counselor.routes', e); }
let studentRoutes; try { studentRoutes = require('./src/routes/student.routes'); } catch (e) { studentRoutes = routeLoadFailureRouter('./src/routes/student.routes', e); }
let reviewRoutes; try { reviewRoutes = require('./src/routes/review.routes'); } catch (e) { reviewRoutes = routeLoadFailureRouter('./src/routes/review.routes', e); }
let articleRoutes; try { articleRoutes = require('./src/routes/article.routes'); } catch (e) { articleRoutes = routeLoadFailureRouter('./src/routes/article.routes', e); }
let chatbotRoutes; try { chatbotRoutes = require('./src/routes/chatbot.routes'); } catch (e) { chatbotRoutes = routeLoadFailureRouter('./src/routes/chatbot.routes', e); }

const app = express();
const server = http.createServer(app);
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
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        const error = new Error('Origin tidak diizinkan oleh CORS.');
        error.statusCode = 403;
        return callback(error);
    },
    credentials: true,
};
app.use(cors(corsOptions));

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
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { success: false, message: 'Terlalu banyak aktivitas pesan. Coba lagi sebentar.' },
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
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/counselors', counselorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/chatbot', chatbotLimiter, chatbotRoutes);

// Aliases to tolerate singular/plural mismatches (keeps older FE/manual tests working)
app.use('/api/schedule', scheduleRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/counselor', counselorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/article', articleRoutes);

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
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT} and Accessible over network!`);
        if (!isProd) console.log(`📚 API Docs: http://localhost:${PORT}/api-docs\n`);
    });
}

const io = new Server(server, { cors: corsOptions });
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required.'));
        socket.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return next();
    } catch {
        return next(new Error('Invalid or expired token.'));
    }
});
io.on('connection', (socket) => {
    socket.join(`user:${socket.user.userId}`);
});
app.set('io', io);
global.realtimeIo = io;

module.exports = app;
