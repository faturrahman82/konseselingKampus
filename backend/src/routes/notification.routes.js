const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Sistem notifikasi internal
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Ambil daftar notifikasi (Pesan Masuk)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Tandai notifikasi sebagai sudah dibaca
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/read', verifyToken, notificationController.markRead);

/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     summary: Kirim notifikasi ke SEMUA pengguna (Admin Only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 */
router.post('/broadcast', verifyToken, requireRole(['admin']), notificationController.broadcastNotif);

module.exports = router;
