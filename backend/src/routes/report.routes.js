const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, requireRole(['admin']), (_req, res) => {
    res.json({
        success: true,
        message: 'Reports routes OK',
        endpoints: ['GET /generate?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD'],
    });
});

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Pelaporan data admin
 */

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
