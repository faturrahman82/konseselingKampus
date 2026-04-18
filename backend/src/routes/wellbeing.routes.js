const express = require('express');
const router = express.Router();
const wellbeingController = require('../controllers/wellbeing.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Wellbeing
 *   description: Fitur Skor Kesejahteraan & Mood Tracker
 */

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Wellbeing routes are available.',
        endpoints: [
            'GET /api/wellbeing/status (student)',
            'POST /api/wellbeing/check-in (student)',
            'GET /api/wellbeing/history (student)',
        ],
        note: 'All endpoints require Authorization: Bearer <token>.',
    });
});

/**
 * @swagger
 * /api/wellbeing/status:
 *   get:
 *     summary: Ambil skor kesejahteraan & status check-in hari ini
 *     tags: [Wellbeing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get('/status', verifyToken, requireRole(['student']), wellbeingController.getMyStatus);

/**
 * @swagger
 * /api/wellbeing/check-in:
 *   post:
 *     summary: Submit mood harian (Sangat Baik 4, Biasa 1, Kurang -2)
 *     tags: [Wellbeing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moodValue]
 *             properties:
 *               moodValue:
 *                 type: integer
 *                 enum: [4, 1, -2]
 *                 example: 4
 *     responses:
 *       200:
 *         description: Check-in berhasil
 *       400:
 *         description: Sudah check-in hari ini atau value salah
 */
router.post('/check-in', verifyToken, requireRole(['student']), wellbeingController.checkIn);

/**
 * @swagger
 * /api/wellbeing/history:
 *   get:
 *     summary: Ambil riwayat mood 30 hari terakhir (Student Only)
 *     tags: [Wellbeing]
 */
router.get('/history', verifyToken, requireRole(['student']), wellbeingController.getHistory);

module.exports = router;
