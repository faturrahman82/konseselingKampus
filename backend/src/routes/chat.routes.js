const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Sistem chatting antar pengguna
 */

/**
 * @swagger
 * /api/chat/inbox:
 *   get:
 *     summary: Ambil daftar kontak chat (Inbox)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/inbox', verifyToken, chatController.getInbox);

/**
 * @swagger
 * /api/chat/{otherUserId}:
 *   get:
 *     summary: Ambil riwayat chat dengan pengguna tertentu
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:otherUserId', verifyToken, chatController.getChatHistory);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Kirim pesan baru
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId, content]
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 */
router.post('/', verifyToken, chatController.sendMessage);

module.exports = router;
