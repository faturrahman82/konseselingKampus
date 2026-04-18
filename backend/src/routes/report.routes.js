const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Pelaporan data admin
 */

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Reports routes are available.',
        endpoints: ['GET /api/reports/generate?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD (admin)'],
        note: 'Endpoint requires Authorization: Bearer <token>.',
    });
});

/**
 * @swagger
 * /api/reports/generate:
 *   get:
 *     summary: Generate laporan konsultasi (Admin Only)
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-12-31"
 *     responses:
 *       200:
 *         description: Laporan berhasil di-generate (summary + detail)
 *       400:
 *         description: Parameter startDate/endDate tidak lengkap
 */
router.get('/generate', verifyToken, requireRole(['admin']), reportController.generateReport);

module.exports = router;
