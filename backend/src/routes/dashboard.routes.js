const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API untuk mengambil semua data ringkasan dashboard sesuai role
 */

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard routes are available.',
        endpoints: [
            'GET /api/dashboard/student (student)',
            'GET /api/dashboard/counselor (counselor)',
            'GET /api/dashboard/admin (admin)',
        ],
        note: 'All endpoints require Authorization: Bearer <token>.',
    });
});

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Ambil data dashboard Mahasiswa
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard berhasil diambil
 */
router.get('/student', verifyToken, requireRole(['student']), dashboardController.getStudentDashboard);

/**
 * @swagger
 * /api/dashboard/counselor:
 *   get:
 *     summary: Ambil data dashboard Konselor
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard berhasil diambil
 */
router.get('/counselor', verifyToken, requireRole(['counselor']), dashboardController.getCounselorDashboard);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Ambil data dashboard Admin
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard berhasil diambil
 */
router.get('/admin', verifyToken, requireRole(['admin']), dashboardController.getAdminDashboard);

module.exports = router;
