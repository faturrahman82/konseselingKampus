const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Manajemen jadwal konselor
 */

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Tambah jadwal ketersediaan konselor (Counselor Only)
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [availableDate, startTime, endTime]
 *             properties:
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               startTime:
 *                 type: string
 *                 example: "09:00:00"
 *               endTime:
 *                 type: string
 *                 example: "10:00:00"
 *     responses:
 *       201:
 *         description: Jadwal berhasil dibuat
 *       409:
 *         description: Jadwal bentrok
 */
router.post('/', verifyToken, requireRole(['counselor']), scheduleController.createSchedule);

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Lihat semua jadwal kosong (untuk mahasiswa)
 *     tags: [Schedules]
 *     security: []
 *     responses:
 *       200:
 *         description: Daftar jadwal tersedia
 */
router.get('/', scheduleController.getAvailableSchedules);

/**
 * @swagger
 * /api/schedules/mine:
 *   get:
 *     summary: Lihat jadwal milik konselor yang login
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: Daftar jadwal konselor
 */
router.get('/mine', verifyToken, requireRole(['counselor']), scheduleController.getMySchedules);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Hapus jadwal (Counselor Only, jika belum di-book)
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jadwal berhasil dihapus
 *       400:
 *         description: Jadwal sudah di-book, tidak bisa dihapus
 */
router.delete('/:id', verifyToken, requireRole(['counselor']), scheduleController.deleteSchedule);

module.exports = router;
