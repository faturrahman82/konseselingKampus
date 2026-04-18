const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, requireRole(['admin']), (_req, res) => {
    res.json({
        success: true,
        message: 'Admin routes OK',
        endpoints: [
            'POST /counselors',
            'PATCH /counselors/:id',
            'DELETE /counselors/:id',
            'GET /settings',
            'PATCH /settings',
            'GET /reports/analytics',
        ],
    });
});

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Manajemen pengguna dan sistem oleh Admin
 */

/**
 * @swagger
 * /api/admin/counselors:
 *   post:
 *     summary: Daftarkan konselor baru (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, fullName, specialization]
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               specialization:
 *                 type: string
 *               experienceYears:
 *                 type: integer
 *               bioDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Konselor berhasil didaftarkan
 */
router.post('/counselors', verifyToken, requireRole(['admin']), adminController.createCounselor);

/**
 * @swagger
 * /api/admin/counselors/{id}:
 *   patch:
 *     summary: Update data/status konselor (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               specialization:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Konselor berhasil diupdate
 */
router.patch('/counselors/:id', verifyToken, requireRole(['admin']), adminController.updateCounselor);

/**
 * @swagger
 * /api/admin/counselors/{id}:
 *   delete:
 *     summary: Hapus akun konselor (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Konselor berhasil dihapus
 */
router.delete('/counselors/:id', verifyToken, requireRole(['admin']), adminController.deleteCounselor);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Ambil konfigurasi sistem (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil pengaturan
 */
router.get('/settings', verifyToken, requireRole(['admin']), adminController.getSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   patch:
 *     summary: Update konfigurasi sistem (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               universityName:
 *                 type: string
 *               supportEmail:
 *                 type: string
 *               autoApproveAppointments:
 *                 type: boolean
 *               emailNotifications:
 *                 type: boolean
 *               counselorAlerts:
 *                 type: boolean
 *               twoFactorAuth:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pengaturan berhasil disimpan
 */
router.patch('/settings', verifyToken, requireRole(['admin']), adminController.updateSettings);

/**
 * @swagger
 * /api/admin/reports/analytics:
 *   get:
 *     summary: Ambil laporan analitik institusi (Admin Only)
 *     tags: [Admin]
 */
router.get('/reports/analytics', verifyToken, requireRole(['admin']), adminController.getAnalytics);

module.exports = router;
