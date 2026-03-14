const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Manajemen profil mahasiswa (Self)
 */

/**
 * @swagger
 * /api/students/profile:
 *   patch:
 *     summary: Update profil saya (Student Only)
 *     tags: [Student]
 */
router.patch('/profile', verifyToken, requireRole(['student']), studentController.updateProfile);

/**
 * @swagger
 * /api/students/change-password:
 *   post:
 *     summary: Ganti password akun (Student Only)
 *     tags: [Student]
 */
router.post('/change-password', verifyToken, requireRole(['student']), studentController.changePassword);

module.exports = router;
