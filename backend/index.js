require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./src/config/swagger');
const { errorHandler } = require('./src/utils/error.handler');

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const scheduleRoutes = require('./src/routes/schedule.routes');
const appointmentRoutes = require('./src/routes/appointment.routes');
const reportRoutes = require('./src/routes/report.routes');
const wellbeingRoutes = require('./src/routes/wellbeing.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const adminRoutes = require('./src/routes/admin.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const chatRoutes = require('./src/routes/chat.routes');
const counselorRoutes = require('./src/routes/counselor.routes');
const studentRoutes = require('./src/routes/student.routes');
const reviewRoutes = require('./src/routes/review.routes');
const articleRoutes = require('./src/routes/article.routes');
const chatbotRoutes = require('./src/routes/chatbot.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ==================== SECURITY MIDDLEWARE ====================

// Helmet: Set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow /uploads access
}));

// Compression: Gzip semua response → lebih cepat & hemat bandwidth
app.use(compression());

// CORS: Di production hanya izinkan dari domain FE
const allowedOrigins = isProd
    ? (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Izinkan request tanpa origin (Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
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

// Health Check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'UniCounsel API is running',
        version: '1.0.0',
        env: isProd ? 'production' : 'development',
    });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        if (!isProd) console.log(`📚 API Docs: http://localhost:${PORT}/api-docs\n`);
    });
}

module.exports = app;
