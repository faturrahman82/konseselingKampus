const express = require('express');
const router = express.Router();
const counselorController = require('../controllers/counselor.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Counselor
 *   description: Manajemen profil konselor (Self)
 */

/**
 * @swagger
 * /api/counselors/me:
 *   get:
 *     summary: Ambil profil saya (Counselor Only)
 *     tags: [Counselor]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', verifyToken, requireRole(['counselor']), counselorController.getMyProfile);

/**
 * @swagger
 * /api/counselors/me:
 *   patch:
 *     summary: Update profil saya (Counselor Only)
 *     tags: [Counselor]
 *     security:
 *       - bearerAuth: []
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
 *               bioDescription:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 */
router.patch('/me', verifyToken, requireRole(['counselor']), counselorController.updateProfile);

module.exports = router;
