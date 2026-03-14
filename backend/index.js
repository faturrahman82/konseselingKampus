require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== SWAGGER DOCS ====================
setupSwagger(app);

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
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

// Health Check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Konseling Kampus API is running',
        docs: `http://localhost:${PORT}/api-docs`,
    });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs\n`);
});
