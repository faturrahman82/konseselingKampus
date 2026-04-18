const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi pengguna (Login & Register)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi mahasiswa baru (Akun Dasar)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, fullName]
 *             properties:
 *               email:
 *                 type: string
 *                 example: mahasiswa@kampus.ac.id
 *               username:
 *                 type: string
 *                 example: mahasiswa01
 *               password:
 *                 type: string
 *                 example: password123
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Email/Username sudah terdaftar
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/complete-profile:
 *   patch:
 *     summary: Lengkapi profil mahasiswa (Data Akademik)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nim:
 *                 type: string
 *                 example: "2024001"
 *               faculty:
 *                 type: string
 *                 example: Fakultas Ilmu Komputer
 *               major:
 *                 type: string
 *                 example: Teknik Informatika
 *               semester:
 *                 type: integer
 *                 example: 4
 *               university:
 *                 type: string
 *                 example: Universitas Indonesia
 *               phoneNumber:
 *                 type: string
 *                 example: "081234567890"
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       404:
 *         description: Profil tidak ditemukan
 */
router.patch('/complete-profile', verifyToken, authController.completeProfile);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil data user yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 */
router.get('/me', verifyToken, authController.getMe);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request link atur ulang kata sandi (Lupa Sandi)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: mahasiswa@kampus.ac.id
 *     responses:
 *       200:
 *         description: Link reset berhasil dibuat
 *       404:
 *         description: Email tidak terdaftar
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Atur ulang kata sandi menggunakan token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token yang didapat dari email/link
 *               newPassword:
 *                 type: string
 *                 example: passwordBaru123
 *     responses:
 *       200:
 *         description: Kata sandi berhasil diperbarui
 *       400:
 *         description: Token tidak valid atau kadaluarsa
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna (semua role)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: mahasiswa@kampus.ac.id
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan JWT token
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', authController.login);

module.exports = router;
